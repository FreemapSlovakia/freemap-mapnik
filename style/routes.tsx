import { LinePatternSymbolizer, LineSymbolizer, Rule, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { RuleEx } from "./RuleEx";
import { tmpdir } from "os";
import path from "path";
import fs from "fs/promises";
import { SqlLayer } from "./SqlLayer";
import { font } from "./fontFactory";

export type RouteProps = {
  hikingTrails: boolean;
  bicycleTrails: boolean;
  skiTrails: boolean;
  horseTrails: boolean;
};

const colorMap: Record<string, string> = {
  none: "#ff00ff",
  purple: "#c000c0",
  orange: "#ff8000",
  white: "white",
  black: "black",
  yellow: "#f0f000",
  green: "#00a000",
  blue: "#5050ff",
  red: "#ff3030",
};

const colorSql = `
  CASE
    WHEN "osmc:symbol" LIKE 'red:%' THEN 0
    WHEN "osmc:symbol" LIKE 'blue:%' THEN 1
    WHEN "osmc:symbol" LIKE 'green:%' THEN 2
    WHEN "osmc:symbol" LIKE 'yellow:%' THEN 3
    WHEN "osmc:symbol" LIKE 'black:%' THEN 4
    WHEN "osmc:symbol" LIKE 'white:%' THEN 5
    WHEN "osmc:symbol" LIKE 'orange:%' THEN 6
    WHEN "osmc:symbol" LIKE 'violet:%' THEN 7
    WHEN "osmc:symbol" LIKE 'purple:%' THEN 7
    WHEN colour = 'red' THEN 0
    WHEN colour = 'blue' THEN 1
    WHEN colour = 'green' THEN 2
    WHEN colour = 'yellow' THEN 3
    WHEN colour = 'black' THEN 4
    WHEN colour = 'white' THEN 5
    WHEN colour = 'orange' THEN 6
    WHEN colour = 'violet' THEN 7
    WHEN colour = 'purple' THEN 7
    ELSE 8
  END
`;

const getRoutesQuery = (
  { hikingTrails, horseTrails, bicycleTrails, skiTrails }: RouteProps,
  includeNetworks?: string[]
) => {
  const lefts: string[] = [];

  const rights: string[] = [];

  if (hikingTrails) {
    lefts.push("hiking", "foot");
  }

  if (horseTrails) {
    lefts.push("horse");
  }

  if (bicycleTrails) {
    rights.push("bicycle", "mtb");
  }

  if (skiTrails) {
    rights.push("ski", "piste");
  }

  const [leftsIn, rightsIn] = [lefts, rights].map((side) => side.map((item) => `'${item}'`).join(",") || "'_x_'");

  return `
    SELECT
      ST_LineMerge(ST_Collect(geometry)) AS geometry,
      idx(arr1, 0) AS h_red,
      idx(arr1, 1) AS h_blue,
      idx(arr1, 2) AS h_green,
      idx(arr1, 3) AS h_yellow,
      idx(arr1, 4) AS h_black,
      idx(arr1, 5) AS h_white,
      idx(arr1, 6) AS h_orange,
      idx(arr1, 7) AS h_purple,
      idx(arr1, 8) AS h_none,
      idx(arr1, 10) AS h_red_loc,
      idx(arr1, 11) AS h_blue_loc,
      idx(arr1, 12) AS h_green_loc,
      idx(arr1, 13) AS h_yellow_loc,
      idx(arr1, 14) AS h_black_loc,
      idx(arr1, 15) AS h_white_loc,
      idx(arr1, 16) AS h_orange_loc,
      idx(arr1, 17) AS h_purple_loc,
      idx(arr1, 18) AS h_none_loc,
      idx(arr2, 20) AS b_red,
      idx(arr2, 21) AS b_blue,
      idx(arr2, 22) AS b_green,
      idx(arr2, 23) AS b_yellow,
      idx(arr2, 24) AS b_black,
      idx(arr2, 25) AS b_white,
      idx(arr2, 26) AS b_orange,
      idx(arr2, 27) AS b_purple,
      idx(arr2, 28) AS b_none,
      idx(arr2, 30) AS s_red,
      idx(arr2, 31) AS s_blue,
      idx(arr2, 32) AS s_green,
      idx(arr2, 33) AS s_yellow,
      idx(arr2, 34) AS s_black,
      idx(arr2, 35) AS s_white,
      idx(arr2, 36) AS s_orange,
      idx(arr2, 37) AS s_purple,
      idx(arr2, 38) AS s_none,
      idx(arr1, 40) AS r_red,
      idx(arr1, 41) AS r_blue,
      idx(arr1, 42) AS r_green,
      idx(arr1, 43) AS r_yellow,
      idx(arr1, 44) AS r_black,
      idx(arr1, 45) AS r_white,
      idx(arr1, 46) AS r_orange,
      idx(arr1, 47) AS r_purple,
      idx(arr1, 48) AS r_none,
      refs1,
      refs2,
      icount(arr1 - array[1000, 1010, 1020, 1030, 1040]) AS off1,
      icount(arr2 - array[1000, 1010, 1020, 1030, 1040]) AS off2
    FROM (
      SELECT
        array_to_string(
          array(
            SELECT distinct itm FROM unnest(
              array_agg(
                CASE
                  WHEN
                    osm_routes.type IN (${leftsIn})
                  THEN
                    CASE
                      WHEN name <> '' AND ref <> ''
                      THEN name || ' (' || ref || ')'
                      ELSE COALESCE(NULLIF(name, ''), NULLIF(ref, '')) END
                  ELSE
                    null
                  END
              )
            ) AS itm ORDER BY itm
          ),
          ', '
        ) AS refs1,
        array_to_string(
          array(
            SELECT distinct itm FROM unnest(
              array_agg(
                CASE
                  WHEN
                    osm_routes.type IN (${rightsIn})
                  THEN
                    CASE
                      WHEN name <> '' AND ref <> ''
                      THEN name || ' (' || ref || ')'
                      ELSE COALESCE(NULLIF(name, ''), NULLIF(ref, '')) END
                  ELSE
                    null
                  END
              )
            ) AS itm ORDER BY itm
          ),
          ', '
        ) AS refs2,
        first(geometry) AS geometry,
        uniq(sort(array_agg(
          CASE
            WHEN osm_routes.type IN (${leftsIn}) THEN
              CASE
                WHEN ${!!horseTrails} AND osm_routes.type = 'horse' THEN 40
                WHEN ${!!hikingTrails} AND osm_routes.type IN ('hiking', 'foot') THEN (CASE WHEN network IN ('iwn', 'nwn', 'rwn') THEN 0 ELSE 10 END)
                ELSE 1000
              END +
              ${colorSql}
            ELSE 1000
          END
        ))) AS arr1,
        uniq(sort(array_agg(
          CASE
            WHEN osm_routes.type IN (${rightsIn}) THEN
              CASE
                WHEN ${!!bicycleTrails} AND osm_routes.type IN ('bicycle', 'mtb') THEN 20
                WHEN ${!!skiTrails} AND osm_routes.type IN ('ski', 'piste') THEN 30
                ELSE 1000
              END +
              ${colorSql}
            ELSE
              1000
            END
        ))) AS arr2
      FROM osm_route_members JOIN osm_routes ON (osm_route_members.osm_id = osm_routes.osm_id AND state <> 'proposed')
      WHERE ${
        !includeNetworks ? "" : `network IN (${includeNetworks.map((n) => `'${n}'`).join(",")}) AND `
      }geometry && !bbox!
      GROUP BY member
    ) AS aaa
    GROUP BY
      h_red, h_blue, h_green, h_yellow, h_black, h_white, h_orange, h_purple, h_none,
      h_red_loc, h_blue_loc, h_green_loc, h_yellow_loc, h_black_loc, h_white_loc, h_orange_loc, h_purple_loc, h_none_loc,
      b_red, b_blue, b_green, b_yellow, b_black, b_white, b_orange, b_purple, b_none,
      s_red, s_blue, s_green, s_yellow, s_black, s_white, s_orange, s_purple, s_none,
      r_red, r_blue, r_green, r_yellow, r_black, r_white, r_orange, r_purple, r_none,
      off1, off2, refs1, refs2
  `;
};

export async function initIcons() {
  const [horseSvg, skiSvg] = await Promise.all([
    fs.readFile("images/horse.svg", { encoding: "utf8" }),
    fs.readFile("images/ski.svg", { encoding: "utf8" }),
  ]);

  return Promise.all(
    Object.entries(colorMap).map(([color, colorValue]) =>
      Promise.all([
        // TODO u
        fs.writeFile(path.resolve(tmpdir(), `ski-${color}.svg`), String(skiSvg).replaceAll("#ff00ff", colorValue)),
        fs.writeFile(path.resolve(tmpdir(), `horse-${color}.svg`), String(horseSvg).replaceAll("#ff00ff", colorValue)),
      ])
    )
  );
}

type Props = {
  glows: boolean;
  types: string[]; // 'hiking' or combination of ['bicycle', 'ski']
};

function RouteStyles({ glows, types }: Props) {
  const isHiking = types.includes("hiking");
  const isBicycle = types.includes("bicycle");
  const isSki = types.includes("ski");
  const isHorse = types.includes("horse");

  return [0, 1, 2].flatMap((zoomVar) => {
    const zoomParams = zoomVar === 0 ? { maxZoom: 11 } : zoomVar === 1 ? { minZoom: 12, maxZoom: 12 } : { minZoom: 13 };
    const zo = [1, 2, 3][zoomVar];
    const wf = [1.5, 1.5, 2][zoomVar];

    const df = 1.25;

    const glowStyle = {
      stroke: "white" as const,
      strokeLinejoin: "round" as const,
      strokeLinecap: "butt" as const,
      strokeOpacity: 0.33,
    };

    return (
      <>
        {Object.entries(colorMap).map(([color, colorValue]) => {
          const elements: JSX.Element[] = [];

          // (maybe) order of route types influences drawing order (last = highest prio)

          if (isHorse) {
            const offset = `(${zo} + ([r_${color}] - 1) * ${wf} * ${df}) + 0.5`;

            elements.push(
              <RuleEx filter={`[r_${color}] > 0`} {...zoomParams}>
                {
                  glows ? (
                    <LineSymbolizer {...glowStyle} strokeWidth={wf + 1} offset={offset} />
                  ) : (
                    <LinePatternSymbolizer
                      file={`/tmp/horse-${color}.svg`}
                      offset={offset}
                      transform={`scale(${wf / 2})`}
                    />
                  )

                  // <LineSymbolizer
                  //   stroke={colorValue}
                  //   strokeWidth={wf}
                  //   strokeLinejoin="round"
                  //   strokeLinecap="butt"
                  //   offset={offset}
                  //   strokeDasharray={`${wf * 3},${wf * 2}`}
                  // />
                }
              </RuleEx>
            );
          }

          if (isSki) {
            const offset = `-(${zo} + ([s_${color}] - 1) * ${wf * 2}) - 1`;

            elements.push(
              <RuleEx filter={`[s_${color}] > 0`} {...zoomParams}>
                {
                  glows ? (
                    <LineSymbolizer {...glowStyle} strokeWidth={wf * 1.5 + 1} offset={offset} />
                  ) : (
                    <LinePatternSymbolizer
                      file={`/tmp/ski-${color}.svg`}
                      offset={offset}
                      transform={`scale(${wf / 2})`}
                    />
                  )

                  // <LineSymbolizer
                  //   stroke={colorValue}
                  //   strokeWidth={wf}
                  //   strokeLinejoin="round"
                  //   strokeLinecap="butt"
                  //   offset,
                  //   strokeDasharray={`${wf * 3},${wf * 2}`}
                  // />
                }
              </RuleEx>
            );
          }

          if (isBicycle && !glows) {
            elements.push(
              <RuleEx filter={`[b_${color}] > 0`} {...zoomParams}>
                <LineSymbolizer
                  stroke={colorValue}
                  strokeWidth={wf * 2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  offset={`-(${zo} + ([b_${color}] - 1) * ${wf * 2}) - 1`}
                  strokeDasharray={`0.001,${wf * 3}`}
                />
              </RuleEx>
            );
          }

          if (isHiking) {
            const o1 = `${zo} + ([h_${color}] - 1) * ${wf} * ${df} + 0.5`;

            // major hiking
            elements.push(
              <RuleEx filter={`[h_${color}] > 0`} {...zoomParams}>
                {glows ? (
                  <LineSymbolizer {...glowStyle} strokeWidth={wf + 2} offset={o1} />
                ) : (
                  <LineSymbolizer
                    stroke={colorValue}
                    strokeWidth={wf}
                    strokeLinejoin="round"
                    strokeLinecap="butt"
                    offset={o1}
                  />
                )}
              </RuleEx>
            );

            const o2 = `${zo} + ([h_${color}_loc] - 1) * ${wf} * ${df} + 0.5`;

            // local hiking
            elements.push(
              <RuleEx filter={`[h_${color}_loc] > 0`} {...zoomParams}>
                {glows ? (
                  <LineSymbolizer {...glowStyle} strokeWidth={wf + 2} offset={o2} />
                ) : (
                  <LineSymbolizer
                    stroke={colorValue}
                    strokeWidth={wf}
                    strokeLinejoin="round"
                    strokeLinecap="butt"
                    offset={o2}
                    strokeDasharray={`${wf * 3},${wf * 1}`}
                  />
                )}
              </RuleEx>
            );

            return elements;
          }
        })}
      </>
    );
  });
}

export function RoutesLayer(routeProps: RouteProps) {
  return (
    <>
      {(() => {
        const x: string[] = [];

        if (routeProps.hikingTrails) {
          x.push("hiking");
        }

        if (routeProps.bicycleTrails) {
          x.push("bicycle");
        }

        if (routeProps.skiTrails) {
          x.push("ski");
        }

        if (routeProps.horseTrails) {
          x.push("horse");
        }

        return x.length > 0 ? (
          <>
            <Style name="routeGlows">
              <RouteStyles glows types={x} />
            </Style>

            <Style name="routes">
              <RouteStyles glows={false} types={x} />
            </Style>
          </>
        ) : undefined;
      })()}

      <SqlLayer
        styleName="routes"
        minZoom={9}
        maxZoom={9}
        bufferSize={512}
        sql={getRoutesQuery(routeProps, ["iwn", "icn"])}
      />

      <SqlLayer
        styleName="routes"
        minZoom={10}
        maxZoom={10}
        bufferSize={512}
        sql={getRoutesQuery(routeProps, ["iwn", "nwn", "icn", "ncn"])}
      />

      <SqlLayer
        styleName="routes"
        sql={getRoutesQuery(routeProps, ["iwn", "nwn", "rwn", "icn", "ncn", "rcn"])}
        minZoom={11}
        maxZoom={11}
        bufferSize={512}
      />

      <SqlLayer styleName="routes" minZoom={12} maxZoom={13} bufferSize={512} sql={getRoutesQuery(routeProps)} />

      <SqlLayer
        styleName="routes"
        minZoom={14}
        // NOTE clearing cache because of contour elevation labels
        clearLabelCache
        bufferSize={2048}
        sql={getRoutesQuery(routeProps)}
      />
    </>
  );
}

export function RouteNames(routeProps: RouteProps) {
  return (
    <>
      <Style name="route_names">
        <Rule>
          <TextSymbolizer
            {...font()
              .line(500)
              .end({ fill: "black", size: 11, haloRadius: 1.5, haloOpacity: 0.2, dy: "4 + [off1] * 2.5" })}
          >
            [refs1]
          </TextSymbolizer>

          <TextSymbolizer
            {...font()
              .line(500)
              .end({ fill: "black", size: 11, haloRadius: 1.5, haloOpacity: 0.2, dy: "-4 - [off2] * 4" })}
          >
            [refs2]
          </TextSymbolizer>
        </Rule>
      </Style>

      <SqlLayer
        styleName="route_names"
        minZoom={14}
        bufferSize={2048} // NOTE probably must be same bufferSize AS routes
        sql={getRoutesQuery(routeProps)}
      />
    </>
  );
}
