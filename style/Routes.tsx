import { LinePatternSymbolizer, LineSymbolizer } from "jsxnik/mapnikConfig";
import { RuleEx } from "./RuleEx";
import { tmpdir } from "os";
import path from "path";
import fs from "fs/promises";

const routeColors = ["none", "purple", "orange", "white", "black", "yellow", "green", "blue", "red"];

export async function initIcons() {
  const [horseSvg, skiSvg] = await Promise.all([
    fs.readFile("images/horse.svg", { encoding: "utf8" }),
    fs.readFile("images/ski.svg", { encoding: "utf8" }),
  ]);

  return Promise.all(
    routeColors.map((color) =>
      Promise.all([
        // TODO u
        fs.writeFile(path.resolve(tmpdir(), `ski-${color}.svg`), String(skiSvg).replaceAll("#ff00ff", mapColor(color))),
        fs.writeFile(
          path.resolve(tmpdir(), `horse-${color}.svg`),
          String(horseSvg).replaceAll("#ff00ff", mapColor(color))
        ),
      ])
    )
  );
}

type Props = {
  glows: boolean;
  types: string[]; // 'hiking' or combination of ['bicycle', 'ski']
};

export function Routes({ glows, types }: Props) {
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
        {routeColors.map((color) => {
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
                  //   stroke={mapColor(color)}
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
                  //   stroke={mapColor(color)}
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
                  stroke={mapColor(color)}
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
                    stroke={mapColor(color)}
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
                    stroke={mapColor(color)}
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

const colorMap: Record<string, string> = {
  red: "#ff3030",
  blue: "#5050ff",
  green: "#00a000",
  yellow: "#f0f000",
  orange: "#ff8000",
  black: "black",
  white: "white",
  purple: "#c000c0",
  none: "#ff00ff",
};

function mapColor(color: string) {
  return colorMap[color] || color;
}
