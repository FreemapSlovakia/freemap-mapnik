import { Placement, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

export function ValleysRidges() {
  return (
    <>
      <Style name="valleys_ridges">
        {seq(13, 17).map((z) => {
          const opacity = 0.5 - (z - 13) / 10;
          const cs = 3 + Math.pow(2.5, z - 12);
          const size = 10 + Math.pow(2.5, z - 12);
          return (
            <RuleEx minZoom={z} maxZoom={z}>
              <TextSymbolizerEx
                nature
                line={200}
                size={size}
                characterSpacing={cs * 3}
                haloRadius={1.5}
                haloOpacity={opacity * 0.9}
                opacity={opacity}
                lineSpacing={`[offset_factor] * ${6 + 3 * Math.pow(2.5, z - 12)}`} // this is to simulate dy adjusted to text orientation
                placementType="list"
                smooth={0.2}
                maxCharAngleDelta={180}
                margin={5}
                // horizontalAlignment="adjust"
              >
                {'[name] + "\n "'}
                <Placement characterSpacing={cs * 2} />
                <Placement characterSpacing={cs * 1.5} />
                <Placement characterSpacing={cs} />
                <Placement characterSpacing={(cs / 3) * 2} />
                <Placement characterSpacing={cs / 3} />
                <Placement characterSpacing={0} />

                {z > 13 && <Placement characterSpacing={0} size={size * 0.75} />}
                {z > 14 && <Placement characterSpacing={0} size={size * 0.5} />}
              </TextSymbolizerEx>
            </RuleEx>
          );
        })}
      </Style>

      <SqlLayer
        styleName="valleys_ridges"
        minZoom={13}
        clearLabelCache
        bufferSize={1024}
        sql="
          SELECT
            geometry, name, LEAST(1.2, ST_Length(geometry) / 5000) AS offset_factor
          FROM
            osm_feature_lines
          WHERE
            type = 'valley' AND name <> ''
          ORDER BY
            ST_Length(geometry) DESC
        "
      />

      <SqlLayer
        styleName="valleys_ridges"
        minZoom={13}
        clearLabelCache
        bufferSize={1024}
        sql="
          SELECT
            geometry, name, 0 AS offset_factor
          FROM
            osm_feature_lines
          WHERE
            type = 'ridge' AND name <> ''
          ORDER BY
            ST_Length(geometry) DESC
        "
      />
    </>
  );
}
