import { CharStreams, CommonTokenStream } from "antlr4ts";
import { CourantLexer } from "./grammar/CourantLexer";
import {
  CourantParser,
  ProgContext,
  AssignmentContext,
  IfStmtContext,
  WhileStmtContext,
  VarExprContext,
  ParensExprContext,
  BlockStmtContext,
  BinExprContext,
  BooleanLitExprContext,
  NumLitExprContext,
  UnaryExprContext,
  FunctionDeclExprContext,
  FunctionCallExprContext,
  RaiseExprContext,
  ReturnStmtContext,
  FunctionBodyContext,
  ThrowStmtContext,
  TryCatchStmtContext,
} from "./grammar/CourantParser";
import { CourantVisitor } from "./grammar/CourantVisitor";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { Memory } from "./state";
import { Label } from "./label";
import { checkType, CourantLabeledValue, CourantValue } from "./types";
import {
  CourantIllegalInformationFlow,
  CourantUnknownIdentifierError,
} from "./error";
import { CourantClosure } from "./closure";
import { ProgramContext as Context } from "./ProgramContext";

type BinOp = (left: CourantValue, right: CourantValue) => CourantValue;
type UnaryOP = (val: CourantValue) => CourantValue;

class InternalReturn {
  value: CourantLabeledValue;
  constructor(value: CourantLabeledValue) {
    this.value = value;
  }
}

class InternalThrow {
  value: CourantLabeledValue;
  pc: Label;
  constructor(value: CourantLabeledValue, pc: Label) {
    this.value = value;
    this.pc = pc;
  }
}

// Custom visitor to evaluate program
export class EvalVisitor
  extends AbstractParseTreeVisitor<any>
  implements CourantVisitor<any>
{
  memory: Memory;
  pc: Context;
  returnContext: Context;
  exceptionContext: Context;

  constructor(
    memory: Memory,
    pc: Context,
    returnContext: Context,
    exceptionContext: Context,
  ) {
    super();
    this.memory = memory;
    this.pc = pc;
    this.returnContext = returnContext;
    this.exceptionContext = exceptionContext;
  }

  protected defaultResult() {}

  visitProgram(ctx: ProgContext) {
    for (const stmt of ctx.stmt()) {
      this.visit(stmt);
    }
  }

  visitAssignment(ctx: AssignmentContext) {
    let varName = ctx.IDENT().text;
    let labeledRes: CourantLabeledValue = this.visit(ctx.expr());
    let newLabel = this.pc.currentContext.union(labeledRes.label);
    let destinationLabel = this.memory.getValue(varName)?.label;
    if (
      destinationLabel &&
      !this.pc.currentContext.securityOrdering(destinationLabel)
    ) {
      // No sensitive upgrade
      // If the variable doesn't exist, its existence encodes private data, information is leaked
      throw new CourantIllegalInformationFlow(
        newLabel.val,
        destinationLabel.val,
        this.pc.currentContext.val,
      );
    }
    let newValue = {
      label: newLabel,
      value: labeledRes.value,
    };
    this.memory.setValue(varName, newValue);
  }

  visitBlockStmt(ctx: BlockStmtContext) {
    this.memory.pushBlock();
    try {
      for (const stmt of ctx.stmt()) {
        this.visit(stmt);
      }
    } finally {
      // A return or throw should close block
      this.memory.popBlock();
    }
  }

  visitReturnStmt(ctx: ReturnStmtContext) {
    // Check that we are authorized to return
    if (
      !this.pc.currentContext.securityOrdering(
        this.returnContext.currentContext,
      )
    ) {
      // If we are in a pc higher that the return label that return can create unauthorized flow
      throw new CourantIllegalInformationFlow(
        this.pc.currentContext.val,
        this.returnContext.currentContext.val,
        this.pc.currentContext.val,
      );
    }

    let val: CourantLabeledValue = this.visit(ctx.expr());
    // Throw used for control flow... not good but easy
    throw new InternalReturn(val);
  }

  visitThrowStmt(ctx: ThrowStmtContext) {
    // Check that we are authorized to throw
    if (
      !this.pc.currentContext.securityOrdering(
        this.exceptionContext.currentContext,
      )
    ) {
      // If we are in a pc higher that the return label that return can create unauthorized flow
      throw new CourantIllegalInformationFlow(
        this.pc.currentContext.val,
        this.exceptionContext.currentContext.val,
        this.pc.currentContext.val,
      );
    }

    let val: CourantLabeledValue = this.visit(ctx.expr());
    // Throwing inside a pc should throw a value of label > pc
    let newLabel = this.pc.currentContext.union(val.label);
    let newValue = {
      label: newLabel,
      value: val.value,
    };
    // Throw used for control flow... not good but easy
    throw new InternalThrow(newValue, this.pc.currentContext);
  }

  visitTryCatchStmt(ctx: TryCatchStmtContext) {
    try {
      this.exceptionContext.pushLabel(this.pc.currentContext);
      try {
        this.visit(ctx.stmt(0));
      } finally {
        this.exceptionContext.popLabel();
      }
    } catch (e) {
      if (e instanceof InternalThrow) {
        // We create an implicit block to store the exception in even if there is no explicit block written in the code
        this.memory.pushBlock();
        this.memory.blocks[0].set(ctx.IDENT().text, e.value);
        // The catch block should have the same pc as the throw
        this.pc.enterLabeledContext(e.pc);
        try {
          this.visit(ctx.stmt(1));
        } finally {
          // A return or throw should close block
          this.memory.popBlock();
          // A return or throw thould pop the pc
          this.pc.popLabel();
        }
      } else {
        throw e;
      }
    }
  }

  visitIfStmt(ctx: IfStmtContext) {
    const labeledRes: CourantLabeledValue = this.visit(ctx.expr());
    const res = labeledRes.value;

    checkType(res, "boolean");
    this.pc.enterLabeledContext(labeledRes.label);
    try {
      if (res.value) {
        this.visit(ctx.stmt(0));
      } else if (ctx.stmt().length == 2) {
        this.visit(ctx.stmt(1));
      }
    } finally {
      // The pc should be popped even if we exit the statement with a throw or a return
      this.pc.popLabel();
    }
  }

  visitWhileStmt(ctx: WhileStmtContext) {
    let labeledRes: CourantLabeledValue = this.visit(ctx.expr());
    let res = labeledRes.value;
    checkType(res, "boolean");
    while (res.value) {
      this.pc.enterLabeledContext(labeledRes.label);
      try {
        this.visit(ctx.stmt());
      } finally {
        // The pc should be popped even if we exit the statement with a throw or a return
        this.pc.popLabel();
      }

      // Condition check
      labeledRes = this.visit(ctx.expr());
      res = labeledRes.value;
      checkType(res, "boolean");
    }
  }

  visitVarExpr(ctx: VarExprContext): CourantLabeledValue {
    let val = this.memory.getValue(ctx.IDENT().text);
    if (val == undefined) {
      throw new CourantUnknownIdentifierError(ctx.IDENT().text);
    }
    return val;
  }

  visitNumLitExpr(ctx: NumLitExprContext): CourantLabeledValue {
    let val = parseFloat(ctx.NUM().text);
    return { label: Label.bottom(), value: { type: "number", value: val } };
  }

  visitBooleanLitExpr(ctx: BooleanLitExprContext): CourantLabeledValue {
    let val = ctx.text === "true";
    return { label: Label.bottom(), value: { type: "boolean", value: val } };
  }

  visitRaiseExpr(ctx: RaiseExprContext): CourantLabeledValue {
    let labeledValue: CourantLabeledValue = this.visit(ctx.expr());
    return {
      label: Label.top(),
      value: labeledValue.value,
    };
  }

  visitFunctionDeclExpr(ctx: FunctionDeclExprContext): CourantLabeledValue {
    let params: string[] = [];
    for (let i = 0; i < (ctx.paramList()?.IDENT().length ?? 0); i++) {
      params.push(ctx.paramList()?.IDENT(i).text!);
    }
    let fn = new CourantClosure(ctx.functionBody(), this.memory, params);
    return { label: Label.bottom(), value: { type: "function", value: fn } };
  }

  visitUnaryExpr(ctx: UnaryExprContext): CourantLabeledValue {
    let op: UnaryOP;
    if (ctx._op.text === "+") {
      op = (val) => {
        checkType(val, "number");
        return val;
      };
    } else if (ctx._op.text === "-") {
      op = (val) => {
        checkType(val, "number");
        return { type: val.type, value: -val.value };
      };
    } else {
      // Not operator
      op = (val) => {
        checkType(val, "boolean");
        return { type: val.type, value: !val };
      };
    }
    let val: CourantLabeledValue = this.visit(ctx.expr());
    let res = op(val.value);
    return { label: val.label, value: res };
  }

  visitBinExpr(ctx: BinExprContext): CourantLabeledValue {
    let opa = ctx.opa();
    let opm = ctx.opm();
    let opc = ctx.opc();
    let opb = ctx.opb();
    let op: BinOp;
    if (opa != undefined) {
      op = this.visit(opa);
    } else if (opm != undefined) {
      op = this.visit(opm);
    } else if (opc != undefined) {
      op = this.visit(opc);
    } else {
      // We know that at least one of the ops is not null
      op = this.visit(opb!);
    }
    let left: CourantLabeledValue = this.visit(ctx.expr(0));
    let right: CourantLabeledValue = this.visit(ctx.expr(1));
    let res = op(left.value, right.value);
    if (res.type == "boolean") {
    }
    return { value: res, label: left.label.union(right.label) };
  }

  visitParensExpr(ctx: ParensExprContext): CourantLabeledValue {
    return this.visit(ctx.expr());
  }

  visitFunctionCallExpr(ctx: FunctionCallExprContext): CourantLabeledValue {
    let fn: CourantLabeledValue = this.visit(ctx.expr(0));
    checkType(fn.value, "function");
    let params: CourantLabeledValue[] = [];
    for (let i = 1; i < ctx.expr().length; i++) {
      params.push(this.visit(ctx.expr(i)));
    }

    // The returnContext should be set as the context in which the function is called
    // this prevents leaks from early returns
    this.returnContext.enterLabeledContext(this.pc.currentContext);

    // The body of the function must be run in a security context that is at least as secret as the security label of the function.
    this.pc.enterLabeledContext(fn.label);
    const res = fn.value.value.evaluate(this, params);
    this.pc.popLabel();
    this.returnContext.popLabel();
    return res;
  }

  visitFunctionBody(ctx: FunctionBodyContext): CourantLabeledValue {
    let val: CourantLabeledValue;
    let expr = ctx.expr();
    if (expr != undefined) {
      val = this.visit(expr);
    } else {
      val = { label: Label.bottom(), value: { type: "undefined" } };
      try {
        for (const stmt of ctx.stmt()) this.visit(stmt);
      } catch (e) {
        if (e instanceof InternalReturn) {
          val = e.value;
        } else {
          throw e;
        }
      }
    }
    val = val!; // Force because we know that val will always have a value
    // Returning inside a pc should return a value of label > pc
    let newLabel = this.pc.currentContext.union(val.label);
    let newValue = {
      label: newLabel,
      value: val.value,
    };
    return newValue!;
  }

  visitMul(): BinOp {
    return (a, b) => {
      checkType(a, "number");
      checkType(b, "number");
      return {
        type: "number",
        value: a.value * b.value,
      };
    };
  }

  visitDiv(): BinOp {
    return (a, b) => {
      checkType(a, "number");
      checkType(b, "number");
      return {
        type: "number",
        value: a.value / b.value,
      };
    };
  }

  visitPlus(): BinOp {
    return (a, b) => {
      checkType(a, "number");
      checkType(b, "number");
      return {
        type: "number",
        value: a.value + b.value,
      };
    };
  }

  visitMinus(): BinOp {
    return (a, b) => {
      checkType(a, "number");
      checkType(b, "number");
      return {
        type: "number",
        value: a.value - b.value,
      };
    };
  }

  visitAnd(): BinOp {
    return (a, b) => {
      checkType(a, "boolean");
      checkType(b, "boolean");
      return {
        type: "boolean",
        value: a.value && b.value,
      };
    };
  }

  visitOr(): BinOp {
    return (a, b) => {
      checkType(a, "boolean");
      checkType(b, "boolean");
      return {
        type: "boolean",
        value: a.value || b.value,
      };
    };
  }

  visitLt(): BinOp {
    return (a, b) => {
      checkType(a, "number");
      checkType(b, "number");
      return {
        type: "boolean",
        value: a.value < b.value,
      };
    };
  }

  visitLeq(): BinOp {
    return (a, b) => {
      checkType(a, "number");
      checkType(b, "number");
      return {
        type: "boolean",
        value: a.value <= b.value,
      };
    };
  }

  visitEq(): BinOp {
    return (a, b) => {
      if (a.type !== b.type) {
        return {
          type: "boolean",
          value: false,
        };
      }
      if (b.type === "undefined") {
        return {
          type: "boolean",
          value: true,
        };
      }
      if (a.type === "number" || a.type === "boolean") {
        return {
          type: "boolean",
          value: a.value == b.value,
        };
      }
      if (a.type === "function") {
        return {
          type: "boolean",
          value: Object.is(a.value, b.value),
        };
      }
      throw new Error(`Equality for type ${a.type} not defined`);
    };
  }

  visitNeq(): BinOp {
    return (a, b) => {
      if (a.type !== b.type) {
        return {
          type: "boolean",
          value: true,
        };
      }
      if (b.type === "undefined") {
        return {
          type: "boolean",
          value: false,
        };
      }
      if (a.type === "number" || a.type === "boolean") {
        return {
          type: "boolean",
          value: a.value != b.value,
        };
      }
      if (a.type === "function") {
        return {
          type: "boolean",
          value: !Object.is(a.value, b.value),
        };
      }
      throw new Error(`Inequality for type ${a.type} not defined`);
    };
  }

  visitGt(): BinOp {
    return (a, b) => {
      checkType(a, "number");
      checkType(b, "number");
      return {
        type: "boolean",
        value: a.value > b.value,
      };
    };
  }

  visitGeq(): BinOp {
    return (a, b) => {
      checkType(a, "number");
      checkType(b, "number");
      return {
        type: "boolean",
        value: a.value >= b.value,
      };
    };
  }
}

export function run(input: string): Memory {
  const chars = CharStreams.fromString(input); // replace this with a FileStream as required
  const lexer = new CourantLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new CourantParser(tokens);
  const tree = parser.prog();
  if (parser.numberOfSyntaxErrors != 0) {
    throw new Error("Parsing error");
  }
  const visitor = new EvalVisitor(
    new Memory(),
    new Context([Label.bottom()]),
    new Context([Label.bottom()]),
    new Context([Label.bottom()]),
  );
  visitor.visit(tree);
  return visitor.memory;
}

// try {
//   // console.dir(test(`
//   // a := 0;
//   // b := 2;
//   // c := -.5;
//   // # this should be ignored
//   // if a + 2 then c:=1 else d:=2
//   // `), {depth: null});
//   console.dir(
//     run(`
//   # b := () => {d:=7};
//   # a := 3;
//   # c := b();
//   # fib := (n) => {
//   #   if n<=1 then {
//   #     return n
//   #   } else {
//   #     return fib(n-1)+fib(n-2)
//   #   }
//   # };
//   # a := fib(25)
//   # a := () => {return 1}
//   # b := 0;
//   # try {
//   #   a := () => {
//   #     throw 3
//   #   };
//   #   c := a()
//   # } catch ( e ) {
//   #   b := e
//   # }
//   # a := true = false
//   # a := a + 1;
//   # this should be ignored
//   # while a!=0 do {b:= b+1; a:= a+ -1}
//   `),
//     { depth: 5 },
//   );
// } catch (e) {
//   if (e instanceof WhileError) {
//     console.error("Error while processing program :\n", e.message);
//   } else if (e instanceof InternalReturn) {
//     console.error("While runtime error : return outside of a function");
//   }
// }
