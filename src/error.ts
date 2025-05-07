import type { CourantType } from "./types";

export class CourantError extends Error {}

export class CourantSyntaxError extends CourantError {
  public line: number;
  public charPositionInLine: number;
  public msg: string;

  public constructor(line: number, charPositionInLine: number, msg: string) {
    super();
    this.line = line;
    this.charPositionInLine = charPositionInLine;
    this.msg = msg;
  }

  public get message() {
    return `Syntax error: line ${this.line}:${this.charPositionInLine} : ${this.msg}`;
  }
}

export class CourantWrongFunctionArguments extends CourantError {
  public expectedArgCount: number;
  public realArgCount: number;

  public constructor(expectedArgCount: number, realArgCount: number) {
    super();
    this.expectedArgCount = expectedArgCount;
    this.realArgCount = realArgCount;
  }

  public get message() {
    return `Wrong function arguments: function expected ${this.expectedArgCount} but ${this.realArgCount} were passed`;
  }
}

export class CourantUnknownIdentifierError extends CourantError {
  public identifier: string;

  public constructor(identifier: string) {
    super();
    this.identifier = identifier;
  }

  public get message() {
    return `Unknown identifier: unknow identifier '${this.identifier}'`;
  }
}

export class CourantTypeError extends CourantError {
  public realType?: CourantType;
  public expectedTypes?: CourantType[];

  public get message() {
    return `Type error: expected one of '${this.expectedTypes}' but got '${this.realType}'`;
  }
}

export class CourantIllegalInformationFlow extends CourantError {
  public startLabel: string;
  public targetLabel: string;
  public pc: string;

  public constructor(startLabel: string, targetLabel: string, pc: string) {
    super();
    this.startLabel = startLabel;
    this.targetLabel = targetLabel;
    this.pc = pc;
  }

  public get message() {
    return `Illegal information flow: illegal flow in program from ${this.startLabel} to ${this.targetLabel} at context ${this.pc}`;
  }
}

export class CourantIllegalReturn extends CourantError {
  public get message() {
    return `Illegal return: return outside of function`;
  }
}

export class CourantUncaughtValue extends CourantError {
  public get message() {
    return `Uncaught value: value was thrown but never caught`;
  }
}
