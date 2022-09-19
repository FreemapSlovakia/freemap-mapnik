import { LinePatternSymbolizer, LineSymbolizer, MarkersSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors, hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { Rail } from "./Rail";
import { seq, types } from "./utils";
import { Road } from "./Road";
import { SqlLayer } from "./SqlLayer";

const glowDflt: Partial<Parameters<typeof LineSymbolizer>[0]> = {
  stroke: hsl(0, 33, 70),
  strokeLinejoin: "round" as const,
};

const highwayDflt: Partial<Parameters<typeof LineSymbolizer>[0]> = {
  stroke: colors.track,
  strokeLinejoin: "round" as const,
};

const highwayWidthFormula = "pow(1.5, max(8.6, @zoom) - 8)";

export function Highways() {
  return (
    <>
      <Style name="highways">
        <RuleEx minZoom={14} type="pier">
          <LineSymbolizer stroke="black" strokeWidth={2} />
        </RuleEx>

        <RuleEx
          minZoom={12}
          filter="[class] = 'railway' and [type] = 'rail' and ([service] = 'main' or [service] = '')"
        >
          <Rail color="black" weight={1.5} sleeperWeight={5} spacing={9.5} glowWidth={1} />
        </RuleEx>

        <RuleEx
          minZoom={13}
          filter={`[class] = 'railway' and ([type] = 'rail' and [service] != 'main' and [service] != '' or ${types(
            "light_rail",
            "tram"
          )})`}
        >
          <Rail color={hsl(0, 0, 20)} weight={1} sleeperWeight={4.5} spacing={9.5} glowWidth={1} />
        </RuleEx>

        <RuleEx
          minZoom={13}
          filter={`[class] = 'railway' and (${types("miniature", "monorail", "funicular", "narrow_gauge", "subway")})`}
        >
          <Rail color={hsl(0, 0, 20)} weight={1} sleeperWeight={4.5} spacing={7.5} glowWidth={1} />
        </RuleEx>

        <RuleEx minZoom={14} filter={`[class] = 'railway' and (${types("construction", "disused", "preserved")})`}>
          <Rail color={hsl(0, 0, 33)} weight={1} sleeperWeight={4.5} spacing={7.5} glowWidth={1} />
        </RuleEx>

        {seq(8, 11).map((z) => {
          const koef = 0.8 * Math.pow(1.15, z - 8);

          return (
            <RuleEx
              minZoom={z}
              maxZoom={z}
              filter="[class] = 'railway' and [type] = 'rail' and ([service] = 'main' or [service] = '')"
            >
              <Rail
                color="black"
                weight={koef}
                sleeperWeight={(10 / 3) * koef}
                spacing={(9.5 / 1.5) * koef}
                glowWidth={0.5 * koef}
              />
            </RuleEx>
          );
        })}

        <RuleEx minZoom={8} maxZoom={11} type={["motorway", "trunk", "motorway_link", "trunk_link"]}>
          <LineSymbolizer {...highwayDflt} strokeWidth={`0.8 * ${highwayWidthFormula}`} />
        </RuleEx>

        <RuleEx minZoom={8} maxZoom={11} type={["primary", "primary_link"]}>
          <LineSymbolizer {...highwayDflt} strokeWidth={`0.7 * ${highwayWidthFormula}`} />
        </RuleEx>

        <RuleEx minZoom={8} maxZoom={11} type={["secondary", "secondary_link"]}>
          <LineSymbolizer {...highwayDflt} strokeWidth={`0.6 * ${highwayWidthFormula}`} />
        </RuleEx>

        <RuleEx minZoom={8} maxZoom={11} type={["tertiary", "tertiary_link"]}>
          <LineSymbolizer {...highwayDflt} strokeWidth={`0.5 * ${highwayWidthFormula}`} />
        </RuleEx>

        <RuleEx minZoom={12} type={["motorway", "trunk"]}>
          <Road {...highwayDflt} stroke={colors.road} strokeWidth={2.5} />
        </RuleEx>

        <RuleEx minZoom={12} type={["motorway_link", "trunk_link", "primary"]}>
          <Road {...highwayDflt} stroke={colors.road} strokeWidth={1.5 + 2 / 3} />
        </RuleEx>

        <RuleEx minZoom={12} type={["primary_link", "secondary"]}>
          <Road {...highwayDflt} stroke={colors.road} strokeWidth={1.5 + 1 / 3} />
        </RuleEx>

        <RuleEx minZoom={12} type="construction">
          <Road {...highwayDflt} stroke="yellow" strokeWidth={1.5 + 1 / 3} strokeDasharray="5,5" />

          <Road {...highwayDflt} stroke="#666" strokeWidth={1.5 + 1 / 3} strokeDasharray="0,5,5,0" />
        </RuleEx>

        <RuleEx minZoom={12} type={["secondary_link", "tertiary", "tertiary_link"]}>
          <Road {...highwayDflt} stroke={colors.road} strokeWidth={1.5} />
        </RuleEx>

        <RuleEx minZoom={12} maxZoom={14} type={["living_street", "residential", "unclassified", "road"]}>
          <Road {...highwayDflt} strokeWidth={1} />
        </RuleEx>

        <RuleEx minZoom={14} type={["living_street", "residential", "unclassified", "road"]}>
          <Road {...highwayDflt} stroke={colors.road} strokeWidth={1} />
        </RuleEx>

        <RuleEx minZoom={14} type="water_slide">
          <Road {...highwayDflt} stroke={hsl(180, 50, 50)} strokeWidth={1.5} />
        </RuleEx>

        <RuleEx minZoom={14} filter="[type] = 'service' and [service] = 'parking_aisle'">
          <Road {...highwayDflt} strokeWidth={1} />
        </RuleEx>

        <RuleEx filter="[type] = 'raceway' or ([type] = 'track' and [class] = 'leisure')" minZoom={14}>
          <Road {...highwayDflt} strokeWidth={1.2} strokeDasharray="9.5,1.5" />
        </RuleEx>

        <RuleEx minZoom={14} type="piste">
          <Road {...highwayDflt} strokeWidth={1.2} stroke="white" />
        </RuleEx>

        <RuleEx minZoom={14} type={["footway", "pedestrian", "platform"]}>
          <Road {...highwayDflt} strokeWidth={1} strokeDasharray="4,2" />
        </RuleEx>

        <RuleEx minZoom={14} type="steps">
          <LinePatternSymbolizer file="images/steps.svg" />
        </RuleEx>

        {(
          [
            [[12, 12], 0.5],
            [[13, 13], 0.75],
            [[14], 1],
          ] as [number[], number][]
        ).map(([z, k], a) => (
          <>
            <RuleEx
              minZoom={z[0]}
              maxZoom={z[1]}
              filter="[type] = 'service' and [service] != 'parking_aisle' or [type] = 'escape' or [type] = 'corridor' or [type] = 'bus_guideway'"
            >
              <Road {...highwayDflt} strokeWidth={k * 1.2} />
            </RuleEx>

            <RuleEx minZoom={z[0]} maxZoom={z[1]} type="path">
              <Road {...highwayDflt} strokeWidth={k * 1} strokeDasharray="3,3" strokeOpacity="[trail_visibility]" />
            </RuleEx>

            <RuleEx minZoom={z[0]} maxZoom={z[1]} type="cycleway">
              <Road
                {...highwayDflt}
                strokeWidth={k * 1}
                strokeDasharray="6,3"
                stroke="#b400ff"
                strokeOpacity="[trail_visibility]"
              />
            </RuleEx>

            <RuleEx minZoom={z[0]} maxZoom={z[1]} type="bridleway">
              <Road
                {...highwayDflt}
                strokeWidth={k * 1}
                strokeDasharray="6,3"
                stroke={hsl(120, 50, 30)}
                strokeOpacity="[trail_visibility]"
              />
            </RuleEx>

            <RuleEx minZoom={z[0]} maxZoom={z[1]} type="via_ferrata">
              <Road {...highwayDflt} strokeWidth={k * 1} strokeDasharray="4,4" />
            </RuleEx>

            {[undefined, "8,2", "6,4", "4,6", "2,8", "3,7,7,3"].map((strokeDasharray, i) => (
              <RuleEx
                filter={`[class] = 'highway' and [type] = 'track' and [tracktype] = ${
                  i === 5 ? "''" : `'grade${i + 1}'`
                }`}
                minZoom={z[0]}
                maxZoom={z[1]}
              >
                <Road
                  {...highwayDflt}
                  strokeWidth={k * 1.2}
                  strokeDasharray={strokeDasharray}
                  strokeOpacity="[trail_visibility]"
                />
              </RuleEx>
            ))}
          </>
        ))}

        <RuleEx minZoom={14} filter="[oneway] <> 0">
          <MarkersSymbolizer
            file="images/highway-arrow.svg"
            spacing={100}
            placement="line"
            transform="rotate(90 - [oneway] * 90, 0, 0)"
          />
        </RuleEx>
      </Style>

      <Style name="higwayGlows">
        <RuleEx minZoom={14} type={["footway", "pedestrian", "platform", "steps"]}>
          <LineSymbolizer {...glowDflt} strokeWidth={1} />
        </RuleEx>

        <RuleEx minZoom={14} type="via_ferrata">
          <LineSymbolizer stroke="black" strokeWidth={3} strokeDasharray="0,4,4,0" />

          <LineSymbolizer {...glowDflt} strokeWidth={1} />
        </RuleEx>

        <RuleEx minZoom={12} type="path">
          <LineSymbolizer {...glowDflt} strokeWidth={1} strokeOpacity="[trail_visibility]" />
        </RuleEx>

        <RuleEx filter="[type] = 'track' and [class] = 'highway'" minZoom={12}>
          <LineSymbolizer {...glowDflt} strokeWidth={1.2} strokeOpacity="[trail_visibility]" />
        </RuleEx>

        <RuleEx filter="[type] = 'raceway' or ([type] = 'track' and [class] = 'leisure')" minZoom={14}>
          <LineSymbolizer {...glowDflt} strokeWidth={1.2} />
        </RuleEx>

        <RuleEx minZoom={14} type="bridleway">
          <LineSymbolizer
            {...glowDflt}
            strokeWidth={1.2}
            stroke={hsl(120, 50, 80)}
            strokeOpacity="[trail_visibility]"
          />
        </RuleEx>

        <RuleEx type={["motorway", "trunk"]}>
          <LineSymbolizer {...highwayDflt} strokeWidth={4} />
        </RuleEx>

        <RuleEx type={["primary", "motorway_link", "trunk_link"]}>
          <LineSymbolizer {...highwayDflt} strokeWidth={3 + 2 / 3} />
        </RuleEx>

        <RuleEx type={["primary_link", "secondary", "construction"]}>
          <LineSymbolizer {...highwayDflt} strokeWidth={3 + 1 / 3} />
        </RuleEx>

        <RuleEx type={["secondary_link", "tertiary", "tertiary_link"]}>
          <LineSymbolizer {...highwayDflt} strokeWidth={3} />
        </RuleEx>

        <RuleEx minZoom={14} type={["living_street", "residential", "unclassified", "road"]}>
          <LineSymbolizer {...highwayDflt} strokeWidth={2.5} />
        </RuleEx>

        <RuleEx minZoom={14} type="piste">
          <Road {...highwayDflt} strokeWidth={2.2} stroke="#a0a0a0" strokeDasharray="6,2" />
        </RuleEx>
      </Style>

      <Style name="accessRestrictions">
        <RuleEx filter="[no_bicycle] = 1">
          <MarkersSymbolizer
            file="images/no_bicycle.svg"
            spacing={48}
            placement="line"
            opacity={0.75}
            ignorePlacement
          />
        </RuleEx>

        <RuleEx filter="[no_foot] = 1">
          <MarkersSymbolizer
            file="images/no_foot.svg"
            spacing={48}
            spacingOffset={0.001}
            placement="line"
            opacity={0.75}
            ignorePlacement
          />
        </RuleEx>
      </Style>

      <SqlLayer styleName="highways" maxZoom={9} groupBy="tunnel" sql={getHighwaySql("osm_roads_gen0")} />

      <SqlLayer styleName="highways" minZoom={10} maxZoom={11} groupBy="tunnel" sql={getHighwaySql("osm_roads_gen1")} />

      <SqlLayer
        styleName={["higwayGlows", "highways"]}
        minZoom={12}
        cacheFeatures
        groupBy="tunnel"
        sql={getHighwaySql("osm_roads")}
      />

      <SqlLayer
        styleName="accessRestrictions"
        minZoom={14}
        sql="
          SELECT
            CASE
              WHEN bicycle NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              OR bicycle = '' AND vehicle NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              OR bicycle = '' AND vehicle = '' AND access NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              THEN 1 ELSE 0 END AS no_bicycle,
            CASE
              WHEN foot NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              OR foot = '' AND access NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              THEN 1 ELSE 0 END AS no_foot,
            geometry
          FROM osm_roads
          WHERE type NOT IN ('trunk', 'motorway', 'trunk_link', 'motorway_link') AND geometry && !bbox!
        "
      />
    </>
  );
}

function getHighwaySql(table: string) {
  return `
    SELECT geometry, type, tracktype, class, service, bridge, tunnel, oneway, power(0.666, greatest(0, trail_visibility - 1)) AS trail_visibility
    FROM ${table}
    WHERE geometry && !bbox!
    ORDER BY z_order, CASE WHEN type = 'rail' AND service IN ('', 'main') THEN 2 ELSE 1 END, osm_id
  `;
}
