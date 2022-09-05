import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { font } from "./fontFactory";
import { Placements } from "./Placements";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function ProtectedAreaNames() {
  return (
    <>
      <Style name="protected_area_names">
        {[8, 9, 10].map((z) => (
          <RuleEx minZoom={z} maxZoom={z} type="national_park">
            <TextSymbolizer
              {...font()
                .nature()
                .wrap()
                .end({
                  size: 9 + Math.pow(2, z - 7),
                  fill: hsl(120, 100, 25),
                  haloFill: "white",
                  haloRadius: 1.5,
                  placement: "interior",
                  placementType: "list",
                })}
            >
              [name]
              <Placements />
            </TextSymbolizer>
          </RuleEx>
        ))}

        <RuleEx minZoom={12} type={["protected_area", "nature_reserve"]}>
          <TextSymbolizer
            {...font()
              .nature()
              .wrap()
              .end({
                fill: hsl(120, 100, 25),
                haloFill: "white",
                haloRadius: 1.5,
                placement: "interior",
                placementType: "list",
              })}
          >
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="protected_area_names"
        bufferSize={1024}
        minZoom={8}
        sql="SELECT type, name, geometry FROM osm_protected_areas"
      />
    </>
  );
}
