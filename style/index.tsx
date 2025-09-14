import config from "config";
import { Map } from "jsxnik/mapnikConfig";
import { serialize } from "jsxnik/serialize";
import { AerialwayNames } from "./AerialwayNames.js";
import { Aerialways } from "./Aerialways.js";
import { Aeroways } from "./Aeroways.js";
import { Barrierways } from "./Barrierways.js";
import { Borders } from "./Borders.js";
import { BuildingNames } from "./BuildingNames.js";
import { Buildings } from "./Buildings.js";
import { colors } from "./colors.js";
import { CountryNames } from "./CountryNames.js";
import { Crop } from "./Crop.js";
import { Custom } from "./Custom.js";
import { Cutlines } from "./Cutlines.js";
import { DatasourceEx } from "./DatasourceEx.js";
import { Embankments } from "./Embankments.js";
import { FeatureLines } from "./FeatureLines.js";
import { FeatureLinesMaskable } from "./FeatureLinesMaskable.js";
import { FeatureNames, Features } from "./features.js";
import { Fixmes } from "./Fixmes.js";
import { FontSets } from "./FontSets.js";
import { Geonames } from "./Geonames.js";
import { HighwayNames } from "./HighwayNames.js";
import { Highways } from "./Highways.js";
import { Housenumbers } from "./Housenumbers.js";
import { Landcover } from "./Landcover.js";
import { LandcoverNames } from "./LandcoverNames.js";
import { Legend, Props as LegendProps } from "./Legend.js";
import { LocalityNames } from "./LocalityNames.js";
import { MilitaryAreas } from "./MilitaryAreas.js";
import { NationalParkNames } from "./NationalParkNames.js";
import { Pipelines } from "./Pipelines.js";
import { PlaceNames1, PlaceNames2 } from "./Placenames.js";
import { PowerLines } from "./PowerLines.js";
import { ProtectedAreaNames } from "./ProtectedAreaNames.js";
import { ProtectedAreas } from "./ProtectedAreas.js";
import { RouteNames, Routes } from "./routes.js";
import { Sea } from "./Sea.js";
import { ShadingAndCountours } from "./ShadingAndContours.js";
import { SolarPowerPlants } from "./SolarPowerPlants.js";
import { setLayersEnabled } from "./StyledLayer.js";
import { Trees } from "./Trees.js";
import { ValleysRidges } from "./ValleysRidges.js";
import { WaterArea } from "./WaterArea.js";
import { WaterAreaNames } from "./WaterAreaNames.js";
import { WaterLine } from "./WaterLine.js";
import { WaterLineNames } from "./WaterLineNames.js";

const dbParams = config.get("db") as Record<string, string>;
const contoursCfg = config.get("mapFeatures.contours") as boolean;
const shadingCfg = config.get("mapFeatures.shading") as boolean;
const hikingTrailsCfg = config.get("mapFeatures.hikingTrails") as boolean;
const bicycleTrailsCfg = config.get("mapFeatures.bicycleTrails") as boolean;
const horseTrailsCfg = config.get("mapFeatures.horseTrails") as boolean;
const skiTrailsCfg = config.get("mapFeatures.skiTrails") as boolean;
const dumpXml = config.get("dumpXml") as boolean;

type Params = {
  features?: {
    shading: boolean;
    contours: boolean;
    hikingTrails: boolean;
    bicycleTrails: boolean;
    skiTrails: boolean;
    horseTrails: boolean;
  };
  custom?: {
    styles: string[];
    layers: { styles: string[]; geojson: string }[];
  };
  legendLayers?: LegendProps["legendLayers"];
  format?: string;
};

export function generateFreemapStyle(params0?: unknown) {
  const params = params0 as Parameters<typeof generateFreemapStyleInt>[0];

  if (params?.legendLayers) {
    try {
      setLayersEnabled(false);

      return generateFreemapStyleInt(params);
    } finally {
      setLayersEnabled(true);
    }
  }

  return generateFreemapStyleInt(params);
}

function generateFreemapStyleInt({
  features: { shading, contours, ...routeProps } = {
    shading: shadingCfg,
    contours: contoursCfg,
    hikingTrails: hikingTrailsCfg,
    bicycleTrails: bicycleTrailsCfg,
    skiTrails: skiTrailsCfg,
    horseTrails: horseTrailsCfg,
  },
  custom,
  legendLayers,
  format,
}: Params = {}) {
  return serialize(
    <Map backgroundColor={legendLayers ? undefined : colors.water} srs="epsg:3857">
      <FontSets />

      {!legendLayers && <DatasourceEx name="db" params={dbParams} />}

      <Sea />

      <Landcover />

      <Cutlines />

      <WaterLine />

      <WaterArea />

      <Trees />

      <Pipelines />

      <FeatureLines />

      <FeatureLinesMaskable shading={shading} />

      <Embankments />

      <Highways />

      {(shading || contours) && <ShadingAndCountours shading={shading} contours={contours} />}

      <Aeroways />

      <SolarPowerPlants />

      <Buildings />

      <Barrierways />

      <Aerialways />

      <PowerLines />

      <ProtectedAreas />

      <Borders />

      <MilitaryAreas />

      <Routes {...routeProps} />

      <Geonames />

      <PlaceNames1 />

      <NationalParkNames />

      <Features />

      <FeatureNames />

      <WaterAreaNames />

      <BuildingNames />

      <ProtectedAreaNames />

      <LandcoverNames />

      <LocalityNames />

      <Housenumbers />

      <HighwayNames />

      <RouteNames {...routeProps} />

      <AerialwayNames />

      <WaterLineNames />

      <Fixmes />

      <ValleysRidges />

      <PlaceNames2 />

      <CountryNames />

      {!legendLayers && format !== "svg" && format !== "pdf" && <Crop />}

      {custom && <Custom {...custom} />}

      {legendLayers && <Legend legendLayers={legendLayers} />}
    </Map>,
  );
}

export const mapnikConfig = generateFreemapStyle();

if (dumpXml) {
  console.log("Mapnik config:", mapnikConfig);
}
