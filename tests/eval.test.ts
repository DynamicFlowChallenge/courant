import {
  CourantIllegalInformationFlow,
  CourantIllegalReturn,
  CourantSyntaxError,
  CourantTypeError,
  CourantUncaughtValue,
  CourantUnknownIdentifierError,
  CourantWrongFunctionArguments,
} from "../src/error";
import { run } from "../src/eval";
import { Label } from "../src/label";
import type { CourantLabeledValue } from "../src/types";

test("assign number", () => {
  const mem = run("a = 3;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 3,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("assign boolean", () => {
  const mem = run("a = true;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("assign float", () => {
  const mem = run("a = 1.25;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 1.25,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("assign float no 0", () => {
  const mem = run("a = .25;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 0.25,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("unary plus", () => {
  const mem = run("a = +2.5;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 2.5,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("unary minus", () => {
  const mem = run("a = -2.5;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: -2.5,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("unary not", () => {
  const mem = run("a = not true; b = not false;");
  const expectedAValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  const expectedBValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  // const expectedMemory = [new Map([["a", expectedAValue]])];
  expect(mem.getValue("a")).toStrictEqual(expectedAValue);
  expect(mem.getValue("b")).toStrictEqual(expectedBValue);
});

test("unary not strict typing", () => {
  expect(() => {
    run("a = not 5;");
  }).toThrow(CourantTypeError);
});

test("unary plus strict typing", () => {
  expect(() => {
    run("a = +false;");
  }).toThrow(CourantTypeError);
});

test("unary minus strict typing", () => {
  expect(() => {
    run("a = -false;");
  }).toThrow(CourantTypeError);
});

test("add", () => {
  const mem = run("a = 1 + 2;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 3,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("sub", () => {
  const mem = run("a = 1 - 2;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: -1,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("mul", () => {
  const mem = run("a = 2 * 3;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 6,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("div", () => {
  const mem = run("a = 3 / 2;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 1.5,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("or", () => {
  const mem = run("a = true or false;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("and", () => {
  const mem = run("a = true and false;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("eq number true", () => {
  const mem = run("a = 1 == 1;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("eq number false", () => {
  const mem = run("a = 1 == 3;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("eq boolean true", () => {
  const mem = run("a = true == true;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("eq boolean false", () => {
  const mem = run("a = true == false;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("eq undefined", () => {
  const mem = run("undef = () => {z=0;};a= undef() == undef();");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("eq functions true", () => {
  const mem = run("f = () => {z=0;}; g = f; a=f==g;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("eq functions false", () => {
  const mem = run("f = () => {z=0;}; g = () => {z=0;}; a=f==g;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("neq number false", () => {
  const mem = run("a = 1 != 1;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("neq number true", () => {
  const mem = run("a = 1 != 3;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("neq boolean false", () => {
  const mem = run("a = true != true;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("neq boolean true", () => {
  const mem = run("a = true != false;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("neq undefined", () => {
  const mem = run("undef = () => {z=0;};a= undef() != undef();");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("neq functions false", () => {
  const mem = run("f = () => {z=0;}; g = f; a=f!=g;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("neq functions true", () => {
  const mem = run("f = () => {z=0;}; g = () => {z=0;}; a=f!=g;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("lt", () => {
  const mem = run("a = 3 < 3;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("lte", () => {
  const mem = run("a = 3 <= 3;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("gt", () => {
  const mem = run("a = 3 > 3;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: false,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("gte", () => {
  const mem = run("a = 3 >= 3;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("arithmetic operator priority", () => {
  const mem = run("a = -5 + 3 / 2 * 5 - 1;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 1.5,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("arithmetic/comparison operator priority", () => {
  const mem = run("a = 2+3==5;");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  const expectedMemory = [new Map([["a", expectedValue]])];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("unknown identifier", () => {
  expect(() => run("b=a;")).toThrow(CourantUnknownIdentifierError);
});

test("scope inner", () => {
  expect(() => run("{a= 3;} b=a;")).toThrow(CourantUnknownIdentifierError);
});

test("scope outer", () => {
  const mem = run("a = 2; {a= 3;} b=a;");
  const expectedAValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 3,
    },
  };
  const expectedBValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 3,
    },
  };
  const expectedMemory = [
    new Map([
      ["a", expectedAValue],
      ["b", expectedBValue],
    ]),
  ];
  expect(mem.blocks).toStrictEqual(expectedMemory);
});

test("function parameter", () => {
  const mem = run("f = (a) => a+1; a=f(2);");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 3,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("function multiple parameters", () => {
  const mem = run("f = (a, b) => a+b ; a=f(1, 2);");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 3,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("function currying", () => {
  const mem = run("f = (a) => (b) => a+b ; a=f(1)(2);");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 3,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("function recursion", () => {
  const mem = run(`
      fib = (n) => {
        if (n<=1) {
          return n;
        } else {
          return fib(n-1)+fib(n-2);
        }
      };
      a = fib(20);
    `);
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 6765,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("function not enough arguments", () => {
  expect(() => run("f=(a, b) => a+b; a=f(1);")).toThrow(
    CourantWrongFunctionArguments,
  );
});

test("function too much arguments", () => {
  expect(() => run("f=(a, b) => a+b; a=f(1, 2, 3);")).toThrow(
    CourantWrongFunctionArguments,
  );
});

test("try catch basic", () => {
  const mem = run("a=0; try { throw 1;} catch (e) { a=e; }");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 1,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("try catch throw through function", () => {
  const mem = run(
    "a= 0; f = (a) => {throw a;}; try {b=f(5);} catch (e) {a=e;}",
  );
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 5,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("try catch rethrow", () => {
  const mem = run(`
    a= 0;
    b=0;
    f = (n) => {
      try {
        throw n;
      } catch (e) {
        a=e+1;
        throw e;
      }
    };
    try {
      c=f(5);
    } catch (e) {
      b=e;
    }`);
  const expectedAValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 6,
    },
  };
  const expectedBValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 5,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedAValue);
  expect(mem.blocks[0].get("b")).toStrictEqual(expectedBValue);
});

test("try catch throw stops execution", () => {
  const mem = run("a= 1; try {throw 3; a=2;} catch (e) { b = 1; }");
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 1,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("control flow run after scope", () => {
  const mem = run(`
      b = true;
      c = false;
      {
        c = b;
      }
      a = c;
    `);
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("control flow if/else", () => {
  const mem = run(`
      b = true;
      c = false;
      if (b) {
        c = true;
      } else {
        c = false;
      }
      a = c;
    `);
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("control flow while", () => {
  const mem = run(`a=5; b=0; while (a!=0) {b= b+1; a= a+ -1;}`);
  const expectedAValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 0,
    },
  };
  const expectedBValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 5,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedAValue);
  expect(mem.blocks[0].get("b")).toStrictEqual(expectedBValue);
});

test("control flow if not", () => {
  const mem = run(`b = 0; a=false; if(not a) {b=1;}`);
  const expectedValue: CourantLabeledValue = {
    label: Label.bottom(),
    value: {
      type: "number",
      value: 1,
    },
  };
  expect(mem.blocks[0].get("b")).toStrictEqual(expectedValue);
});

//==============// Invalid Programs //=================//

test("lexer error", () => {
  expect(() => run(`a := 3;`)).toThrow(CourantSyntaxError);
});

test("parser error", () => {
  expect(() => run(`a = () =>`)).toThrow(CourantSyntaxError);
});

test("Illegal return", () => {
  expect(() => run(`return 3;`)).toThrow(CourantIllegalReturn);
});

test("Uncaught value", () => {
  expect(() => run(`throw 3;`)).toThrow(CourantUncaughtValue);
});

//==============// Information Flow //=================//

test("IFC raise", () => {
  const mem = run("a= raise(1);");
  const expectedValue: CourantLabeledValue = {
    label: Label.top(),
    value: {
      type: "number",
      value: 1,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("IFC no sensitive upgrade invalid", () => {
  expect(() =>
    run("l=false; h=raise(true); if (h) l=true; else l=false;"),
  ).toThrow(CourantIllegalInformationFlow);
});

test("IFC no sensitive upgrade valid", () => {
  const mem = run(`
      h = raise(true);
      f = raise(false); # Temporary value
      if (h) {
        f = true;
      } else {
        f = false;
      }
      a = f;
    `);
  const expectedValue: CourantLabeledValue = {
    label: Label.top(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("IFC function leak", () => {
  const mem = run(`
      h = raise(true);
      f = raise(1); # Temporary value
      if (h) {
        f = () => true;
      } else {
        f = () => false;
      }
      a = f(); # At this point a should have top label
    `);
  const expectedValue: CourantLabeledValue = {
    label: Label.top(),
    value: {
      type: "boolean",
      value: true,
    },
  };
  expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
});

test("IFC return in high context", () => {
  expect(() =>
    run(`
      a = true;
      h = raise(true);
      f = () => {
        if (h) return 0;
        a = false;
      };
      f();
    `),
  ).toThrow(CourantIllegalInformationFlow);
});

test("IFC return in high context should be authorized in high context", () => {
  {
    const mem = run(`
      a = true;
      h = raise(true);
      f = () => {
        if (h) return 0;
        a = false;
      };
      if (raise(true)) {
        f();
      }
    `);
    const expectedValue: CourantLabeledValue = {
      label: Label.bottom(),
      value: {
        type: "boolean",
        value: true,
      },
    };
    expect(mem.blocks[0].get("a")).toStrictEqual(expectedValue);
  }
  {
    expect(() =>
      run(`
        a = true;
        h = raise(false);
        f = () => {
          if (h) return 0;
          a = false;
        };
        if (raise(true)) {
          ignore = f();
        }
      `),
    ).toThrow(CourantIllegalInformationFlow);
  }
});

test("IFC throw in high context", () => {
  expect(() =>
    run(`
      l = false;
      h = raise(true);
      try {
        if (h) throw 0;
        l = true;
      } catch (e) {}
    `),
  ).toThrow(CourantIllegalInformationFlow);
});

test("IFC mutate low variable in catch", () => {
  expect(() =>
    run(`
    l = false;
    h = raise(true);
    try {
      if (h) throw 0;
    } catch (e) {
      l = false;
    }
    `),
  ).toThrow(CourantIllegalInformationFlow);
});

test("IFC throw unauthorized in handler", () => {
  expect(() =>
    run(`
    h = raise(true);
    if (raise(true)) {
      try {
        if (h) throw 0;
      } catch (e) {
        throw 0;
      }
    }
    `),
  ).toThrow(CourantIllegalInformationFlow);
});

test("IFC throw authorized in handler if context authorizes high throw", () => {
  expect(() =>
    run(`
    h = raise(true);
    if (raise(true)) {
      try {
        try {
          if (h) throw 0;
        } catch (e) {
          throw 0;
        }
      } catch (e) {}
    }
    `),
  ).not.toThrow(CourantIllegalInformationFlow);
});

test("IFC throw in handler authorized if low context", () => {
  expect(() =>
    run(`
    try {
      throw 0;
    } catch (e) {
      throw 0;
    }
    `),
  ).not.toThrow(CourantIllegalInformationFlow);
});
