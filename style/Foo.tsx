/**
CREATE OR REPLACE FUNCTION hsl2rvb_hexa(hue float, sat float, light float)
RETURNS text AS $$
declare
	c float := sat*light;
	tp float := (hue/60.0);
	x float := c*((1-abs(fmod(tp,2)-1))::float);
	m float := light-c;
	rp float;
	vp float;
	bp float;
	r int;
	v int;
	b int;
BEGIN
  case
	when (tp>=0 and tp<1) then
		rp=c;
		vp=x;
		bp=0.;
	when (tp>=1 and tp<2) then
		rp=x;
		vp=c;
		bp=0.;
	when (tp>=2 and tp<3) then
		rp=0.;
		vp=c;
		bp=x;
	when (tp>=3 and tp<4) then
		rp=0.;
		vp=x;
		bp=c;
	when (tp>=4 and tp<5) then
		rp=x;
		vp=0.;
		bp=c;
	when (tp>=5 and tp<6) then
		rp=c;
		vp=0.;
		bp=x;
	else
		rp=0.;
		vp=0.;
		bp=0.;
	end case;
	r=((rp+m)*255)::int;
	v=((vp+m)*255)::int;
	b=((bp+m)*255)::int;
  return format('#%02s%02s%02s',LPAD(to_hex(r),2,'0'),LPAD(to_hex(v),2,'0'),LPAD(to_hex(b),2,'0'));
END;
$$ LANGUAGE plpgsql;
 */

import { Datasource, LineSymbolizer, Parameter, PolygonSymbolizer, Rule, Style } from "jsxnik/mapnikConfig";
import { GdalLayer } from "./GdalLayer";
import { SqlLayer } from "./SqlLayer";
import { StyledLayer } from "./StyledLayer";

export function Foo() {
  return (
    <>
      {/* <SqlLayer styleName="water" maxZoom={9} sql="SELECT geometry FROM osm_waterareas_gen0" />

      <SqlLayer styleName="water" minZoom={10} maxZoom={11} sql="SELECT geometry FROM osm_waterareas_gen1" />

      <SqlLayer styleName="water" minZoom={12} sql="SELECT geometry FROM osm_waterareas" />

      <Style name="water">
        <Rule>
          <PolygonSymbolizer fill="gray" />
        </Rule>
      </Style> */}

      {/* <SqlLayer
        styleName="foo"
        sql="
          SELECT wkb_geometry, hsl2rvb_hexa(abs(hashtext(name)) % 360, 1, 1) AS color,
          CASE WHEN name = '' THEN 0.2 ELSE 1 END AS opacity FROM inspire_waterways WHERE wkb_geometry && !bbox!
        "
      /> */}

      <SqlLayer
        styleName="foo"
        sql="
          SELECT wkb_geometry, CASE persistance WHEN 'perennial' THEN '#080' WHEN 'ephemeral' THEN '#f00' ELSE '#888' END  AS color,
          1 AS opacity FROM inspire_waterways WHERE wkb_geometry && !bbox!
        "
      />

      {/* <SqlLayer
        styleName="foo"
        maxZoom={9}
        sql="
          SELECT wkb_geometry, hsl2rvb_hexa(abs(hashtext(inspire_waterways.name)) % 360, 1, 1) AS color, 1 AS opacity
          FROM inspire_waterways LEFT JOIN osm_waterways_gen0 ON osm_waterways_gen0.name = inspire_waterways.name
          WHERE wkb_geometry && !bbox! AND inspire_waterways.name <> '' AND osm_waterways_gen0.name IS NULL
        "
      /> */}

      {/* <SqlLayer
        styleName="foo"
        maxZoom={9}
        sql="
          SELECT geometry, hsl2rvb_hexa(abs(hashtext(name)) % 360, 1, 1) AS color, CASE WHEN name = '' THEN 0.2 ELSE 1 END AS opacity
          FROM osm_waterways_gen0
          WHERE geometry && !bbox!
        "
      />

      <SqlLayer
        styleName="foo"
        minZoom={10}
        maxZoom={11}
        sql="
          SELECT geometry, hsl2rvb_hexa(abs(hashtext(name)) % 360, 1, 1) AS color, CASE WHEN name = '' THEN 0.2 ELSE 1 END AS opacity
          FROM osm_waterways_gen1
          WHERE geometry && !bbox!"
      />

      <SqlLayer
        styleName="foo"
        minZoom={12}
        sql="
          SELECT geometry, hsl2rvb_hexa(abs(hashtext(name)) % 360, 1, 1) AS color, CASE WHEN name = '' THEN 0.2 ELSE 1 END AS opacity
          FROM osm_waterways
          WHERE geometry && !bbox!"
      /> */}

      <Style name="foo">
        <Rule>
          <LineSymbolizer stroke="[color]" strokeWidth={1} strokeOpacity="[opacity]" />
        </Rule>
      </Style>
    </>
  );
}
