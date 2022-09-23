import { TextSymbolizer } from "jsxnik/mapnikConfig";
import { colors } from "./colors";

type Props = {
  wrap?: boolean;
  nature?: boolean;
  water?: boolean;
  line?: boolean | number;
  children: JSX.Element;
} & Partial<Parameters<typeof TextSymbolizer>[0]>;

export const defaultFontSize = 12;

export function TextSymbolizerEx({ wrap, nature, water, line, ...rest }: Props) {
  const props: Parameters<typeof TextSymbolizer>[0] = {
    ...rest,
  };

  if (wrap) {
    props.wrapWidth = 100;

    props.wrapBefore = true;
  }

  if (water) {
    props.fill = colors.waterLabel;

    props.haloFill = colors.waterLabelHalo;
  }

  if (line !== undefined) {
    props.placement = "line";

    if (props.spacing === undefined) {
      props.spacing = typeof line === "number" ? line : 200;
    }
  }

  return (
    <TextSymbolizer
      // margin={2}
      fontsetName={nature || water ? "italic" : "regular"}
      fill="black"
      haloFill="white"
      haloRadius={1.5}
      haloOpacity={0.75}
      size={defaultFontSize}
      lineSpacing={-4}
      {...props}
    />
  );
}
