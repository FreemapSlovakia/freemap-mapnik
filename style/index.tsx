import config from "config";
import { Map } from "jsxnik/mapnikConfig";
import { serialize } from "jsxnik/serialize";
import { AerialwayNames } from "./AerialwayNames";
import { Aerialways } from "./Aerialways";
import { Aeroways } from "./Aeroways";
import { Barrierways } from "./Barrierways";
import { Borders } from "./Borders";
import { BuildingNames } from "./BuildingNames";
import { Buildings } from "./Buildings";
import { colors } from "./colors";
import { CountryNames } from "./CountryNames";
import { Crop } from "./Crop";
import { Custom } from "./Custom";
import { Cutlines } from "./Cutlines";
import { DatasourceEx } from "./DatasourceEx";
import { Embankments } from "./Embankments";
import { FeatureLines } from "./FeatureLines";
import { FeatureLinesMaskable } from "./FeatureLinesMaskable";
import { FeatureNames, Features } from "./features";
import { Fixmes } from "./Fixmes";
import { FontSets } from "./FontSets";
import { Geonames } from "./Geonames";
import { HighwayNames } from "./HighwayNames";
import { Highways } from "./Highways";
import { Housenumbers } from "./Housenumbers";
import { Landcover } from "./Landcover";
import { LandcoverNames } from "./LandcoverNames";
import { Legend, Props as LegendProps } from "./Legend";
import { LocalityNames } from "./LocalityNames";
import { MilitaryAreas } from "./MilitaryAreas";
import { NationalParkNames } from "./NationalParkNames";
import { Pipelines } from "./Pipelines";
import { PlaceNames1, PlaceNames2 } from "./Placenames";
import { PowerLines } from "./PowerLines";
import { ProtectedAreaNames } from "./ProtectedAreaNames";
import { ProtectedAreas } from "./ProtectedAreas";
import { RouteNames, Routes } from "./routes";
import { Sea } from "./Sea";
import { ShadingAndCountours } from "./ShadingAndContours";
import { SolarPowerPlants } from "./SolarPowerPlants";
import { setLayersEnabled } from "./StyledLayer";
import { Trees } from "./Trees";
import { ValleysRidges } from "./ValleysRidges";
import { WaterArea } from "./WaterArea";
import { WaterAreaNames } from "./WaterAreaNames";
import { WaterLine } from "./WaterLine";
import { WaterLineNames } from "./WaterLineNames";

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

export function generateFreemapStyle(params?: Parameters<typeof generateFreemapStyleInt>[0]) {
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
    <Map
      backgroundColor={legendLayers ? undefined : colors.water}
      srs="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over"
    >
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
