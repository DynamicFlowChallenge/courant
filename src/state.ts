import { Label } from "./label";
import { CourantLabeledValue } from "./types";

export class Memory {
  blocks: Array<Map<string, CourantLabeledValue>>;
  public constructor() {
    this.blocks = [new Map()];
  }

  public pushBlock() {
    this.blocks.unshift(new Map());
  }

  public popBlock() {
    this.blocks.shift();
  }

  public getValue(name: string): CourantLabeledValue | undefined {
    for (const block of this.blocks) {
      const val = block.get(name);
      if (val) {
        return val;
      }
    }
    return undefined;
  }

  public setValue(name: string, value: CourantLabeledValue) {
    for (const block of this.blocks) {
      const val = block.get(name);
      if (val) {
        block.set(name, value);
        return;
      }
    }
    this.blocks[0].set(name, value);
  }

  public clone(): Memory {
    const clone = new Memory();
    clone.blocks = [...this.blocks];
    return clone;
  }
}
