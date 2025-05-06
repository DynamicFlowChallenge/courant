import { CourantClosure } from "./closure";
import { CourantTypeError } from "./error";
import { Label } from "./label";

export interface CourantLabeledValue {
  label: Label;
  value: CourantValue;
}

export type CourantValue =
  | CourantNumber
  | CourantBoolean
  | CourantUndefined
  | CourantFunction;

export type CourantType = CourantValue["type"];

interface CourantNumber {
  type: "number";
  value: number;
}

interface CourantBoolean {
  type: "boolean";
  value: boolean;
}

interface CourantUndefined {
  type: "undefined";
}

interface CourantFunction {
  type: "function";
  value: CourantClosure;
}

type ExtractCourantValues<T extends CourantType> = Extract<CourantValue, { type: T }>;

export function checkType<T extends CourantType>(
  value: CourantValue,
  ...expectedTypes: T[]
): asserts value is ExtractCourantValues<T> {
  if (!expectedTypes.includes(value.type as T)) {
    const error = new CourantTypeError();
    error.realType = value.type;
    error.expectedTypes = expectedTypes;
    throw error;
  }
}
