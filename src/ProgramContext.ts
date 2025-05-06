import { Label } from "./label";
import { CourantLabeledValue } from "./types";

export class ProgramContext {
  pc: Label[];

  constructor(pc: Label[]) {
    this.pc = pc;
  }

  setLabel(val: CourantLabeledValue): CourantLabeledValue {
    return {
      label: val.label.union(this.currentContext),
      value: val.value,
    };
  }

  get currentContext() {
    return this.pc[this.pc.length - 1];
  }

  enterLabeledContext(label: Label) {
    this.pushLabel(this.currentContext.union(label));
  }

  pushLabel(l: Label) {
    this.pc.push(l);
  }

  popLabel() {
    return this.pc.pop();
  }
}
