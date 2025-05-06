type LabelValue = "high" | "low";

export class Label {
  public val: LabelValue;

  public constructor(val: LabelValue) {
    this.val = val;
  }

  public securityOrdering(o: Label): boolean {
    if (this.val === "high" && o.val === "low") {
      return false;
    } else {
      return true;
    }
  }

  public union(o: Label): Label {
    if (this.val == o.val && this.val == "low") {
      return new Label("low");
    } else {
      return new Label("high");
    }
  }

  public static bottom(): Label {
    return new Label("low");
  }

  public static top(): Label {
    return new Label("high");
  }
}
