import { colors } from "./colors";

export function font() {
  return {
    // margin: 2,
    fontsetName: "regular",
    fill: "black",
    haloFill: "white",
    haloRadius: 1.5,
    haloOpacity: 0.75,
    size: 12,
    lineSpacing: -4,
    wrap() {
      return {
        ...this,
        wrapWidth: 100,
        wrapBefore: true,
      };
    },
    nature() {
      return {
        ...this,
        fontsetName: "italic",
      };
    },
    water() {
      return {
        ...this.nature(),
        fill: colors.waterLabel,
        haloFill: colors.waterLabelHalo,
      };
    },
    if(cond: boolean, then: any) {
      return cond ? then(this) : this;
    },
    line(spacing = 200) {
      return { ...this, placement: "line", spacing };
    },
    end(props = {}) {
      const i: Record<string, unknown> = { ...this, ...props };

      const o: Record<string, unknown> = {};

      for (const k of Object.keys(i)) {
        if (typeof i[k] !== "function") {
          o[k] = i[k];
        }
      }

      return o;
    },
  };
}
