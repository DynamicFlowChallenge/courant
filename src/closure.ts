import { CourantWrongFunctionArguments } from "./error";
import { EvalVisitor } from "./eval";
import { FunctionBodyContext } from "./grammar/CourantParser";
import { Memory } from "./state";
import type { CourantLabeledValue } from "./types";

export class CourantClosure {
  body: FunctionBodyContext;
  environment: Memory;
  params: string[];

  constructor(
    body: FunctionBodyContext,
    environment: Memory,
    params: string[],
  ) {
    this.body = body;
    this.environment = environment.clone();
    this.params = params;
  }

  evaluate(
    visitor: EvalVisitor,
    params: CourantLabeledValue[],
  ): CourantLabeledValue {
    if (params.length != this.params.length) {
      throw new CourantWrongFunctionArguments(
        this.params.length,
        params.length,
      );
    }
    const saved_memory = visitor.memory;
    visitor.memory = this.environment;
    this.environment.pushBlock();
    for (let i = 0; i < params.length; i++) {
      this.environment.blocks[0].set(this.params[i], params[i]);
    }
    let val = visitor.visit(this.body);
    this.environment.popBlock();
    visitor.memory = saved_memory;
    return val;
  }
}
