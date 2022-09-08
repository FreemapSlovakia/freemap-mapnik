import { Font, FontSet } from "jsxnik/mapnikConfig";

export function FontSets() {
  return (
    <>
      <FontSet name="regular">
        <Font faceName="PT Sans Regular" />
        <Font faceName="Fira Sans Condensed Regular" />
        <Font faceName="Noto Sans Regular" />
      </FontSet>

      <FontSet name="italic">
        <Font faceName="PT Sans Italic" />
        <Font faceName="Fira Sans Condensed Italic" />
        <Font faceName="Noto Sans Italic" />
      </FontSet>

      <FontSet name="bold">
        <Font faceName="PT Sans Bold" />
        <Font faceName="Fira Sans Condensed Bold" />
        <Font faceName="Noto Sans Bold" />
      </FontSet>

      <FontSet name="narrow bold">
        <Font faceName="PT Sans Narrow Bold" />
        <Font faceName="Fira Sans Extra Condensed Bold" />
        <Font faceName="Noto Sans Bold" />
      </FontSet>
    </>
  );
}
