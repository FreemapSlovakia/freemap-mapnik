CREATE TABLE IF NOT EXISTS isolations (
  osm_id BIGINT PRIMARY KEY,
  lon FLOAT,
  lat FLOAT,
  isolation INT NOT NULL
);

-- not sure if those indexes help ;-)
--
CREATE INDEX idx_colour ON osm_routes (colour);

CREATE INDEX idx_symbol ON osm_routes ("osmc:symbol");

CREATE INDEX idx_network ON osm_routes (network);

CREATE INDEX idx_type ON osm_routes (type);

CREATE INDEX osm_features_osm_id ON osm_features (osm_id);

CREATE INDEX osm_features_type ON osm_features (type);

CREATE INDEX osm_places_type ON osm_places (type);

CREATE INDEX osm_route_members_idx1 ON osm_route_members (member);

CREATE INDEX osm_route_members_idx2 ON osm_route_members (type);

create index osm_route_members_idx1_g1 on osm_route_members_gen1(member);

create index osm_route_members_idx2_g1 on osm_route_members_gen1(type);

create index osm_route_members_idx1_g0 on osm_route_members_gen0(member);

create index osm_route_members_idx2_g0 on osm_route_members_gen0(type);

-- There seems to be a bug in imposm3. Workaround by using a trigger.
-- https://github.com/omniscale/imposm3/issues/293

CREATE OR REPLACE FUNCTION osm_route_members_insert_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO osm_route_members_gen1 (osm_id, member, role, type, geometry)
    VALUES (NEW.osm_id, NEW.member, NEW.role, NEW.type, ST_SimplifyPreserveTopology(NEW.geometry, 50));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION osm_route_members_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE osm_route_members_gen1
    SET member = NEW.member,
        role = NEW.role,
        type = NEW.type,
        geometry = ST_SimplifyPreserveTopology(NEW.geometry, 50)
    WHERE osm_id = NEW.osm_id AND type = NEW.type;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION osm_route_members_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM osm_route_members_gen1
    WHERE osm_id = OLD.osm_id AND type = OLD.type;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER osm_route_members_after_insert
AFTER INSERT ON osm_route_members
FOR EACH ROW
EXECUTE FUNCTION osm_route_members_insert_trigger();

CREATE TRIGGER osm_route_members_after_update
AFTER UPDATE ON osm_route_members
FOR EACH ROW
EXECUTE FUNCTION osm_route_members_update_trigger();

CREATE TRIGGER osm_route_members_after_delete
AFTER DELETE ON osm_route_members
FOR EACH ROW
EXECUTE FUNCTION osm_route_members_delete_trigger();


CREATE OR REPLACE FUNCTION osm_route_members_gen0_insert_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO osm_route_members_gen0 (osm_id, member, role, type, geometry)
    VALUES (NEW.osm_id, NEW.member, NEW.role, NEW.type, ST_SimplifyPreserveTopology(NEW.geometry, 200));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION osm_route_members_gen0_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE osm_route_members_gen0
    SET member = NEW.member,
        role = NEW.role,
        type = NEW.type,
        geometry = ST_SimplifyPreserveTopology(NEW.geometry, 200)
    WHERE osm_id = NEW.osm_id AND type = NEW.type;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION osm_route_members_gen0_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM osm_route_members_gen0
    WHERE osm_id = OLD.osm_id AND type = OLD.type;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER osm_route_members_gen0_after_insert
AFTER INSERT ON osm_route_members
FOR EACH ROW
EXECUTE FUNCTION osm_route_members_gen0_insert_trigger();

CREATE TRIGGER osm_route_members_gen0_after_update
AFTER UPDATE ON osm_route_members
FOR EACH ROW
EXECUTE FUNCTION osm_route_members_gen0_update_trigger();

CREATE TRIGGER osm_route_members_gen0_after_delete
AFTER DELETE ON osm_route_members
FOR EACH ROW
EXECUTE FUNCTION osm_route_members_gen0_delete_trigger();

-- z-order
--
DROP TABLE IF EXISTS z_order_poi;

CREATE TABLE z_order_poi (type VARCHAR PRIMARY KEY, z_order SERIAL);

INSERT INTO
  z_order_poi (type)
VALUES
  ('monument'),
  ('archaeological_site'),
  ('tower_observation'),
  ('cave_entrance'),
  ('arch'),
  ('office'),
  ('water_park'),
  ('hotel'),
  ('chalet'),
  ('hostel'),
  ('motel'),
  ('guest_house'),
  ('alpine_hut'),
  ('apartment'),
  ('wilderness_hut'),
  ('basic_hut'),
  ('camp_site'),
  ('castle'),
  ('manor'),
  ('forester''s_lodge'),
  ('guidepost'),
  ('cathedral'),
  ('temple'),
  ('basilica'),
  ('church'),
  ('chapel'),
  ('station'),
  ('halt'),
  ('bus_station'),
  ('museum'),
  ('cinema'),
  ('theatre'),
  ('climbing'),
  ('free_flying'),
  ('shooting'),
  ('bunker'),
  ('restaurant'),
  ('pub'),
  ('convenience'),
  ('supermarket'),
  ('fuel'),
  ('fast_food'),
  ('cafe'),
  ('bar'),
  ('pastry'),
  ('confectionery'),
  ('hospital'),
  ('pharmacy'),
  ('golf_course'),
  ('miniature_golf'),
  ('soccer'),
  ('tennis'),
  ('basketball'),
  ('waterfall'),
  ('dam'),
  ('weir'),
  ('refitted_drinking_spring'),
  ('drinking_spring'),
  ('refitted_spring'),
  ('spring'),
  ('refitted_not_drinking_spring'),
  ('not_drinking_spring'),
  ('drinking_water'),
  ('hot_spring'),
  ('water_point'),
  ('water_well'),
  ('viewpoint'),
  ('mine'),
  ('adit'),
  ('mineshaft'),
  ('disused_mine'),
  ('townhall'),
  ('memorial'),
  ('university'),
  ('college'),
  ('school'),
  ('kindergarten'),
  ('community_centre'),
  ('fire_station'),
  ('police'),
  ('post_office'),
  ('horse_riding'),
  ('picnic_shelter'),
  ('weather_shelter'),
  ('shelter'),
  ('lean_to'),
  ('hunting_stand'),
  ('taxi'),
  ('bus_stop'),
  ('public_transport'),
  ('tower_bell_tower'),
  ('tree_protected'),
  ('bicycle'),
  ('board'),
  ('map'),
  ('artwork'),
  ('fountain'),
  ('playground'),
  ('wayside_shrine'),
  ('cross'),
  ('wayside_cross'),
  ('tree_shrine'),
  ('rock'),
  ('stone'),
  ('sinkhole'),
  ('toilets'),
  ('post_box'),
  ('telephone'),
  ('chimney'),
  ('water_tower'),
  ('attraction'),
  ('sauna'),
  ('tower_communication'),
  ('mast_communication'),
  ('tower_other'),
  ('mast_other'),
  ('saddle'),
  ('peak1'),
  ('peak2'),
  ('peak3'),
  ('peak'),
  ('water_works'),
  ('reservoir_covered'),
  ('pumping_station'),
  ('wastewater_plant'),
  ('outdoor_seating'),
  ('parking'),
  ('firepit'),
  ('bench'),
  ('beehive'),
  ('apiary'),
  ('watering_place'),
  ('lift_gate'),
  ('swing_gate'),
  ('waste_disposal'),
  ('waste_basket'),
  ('feeding_place'),
  ('game_feeding'),
  ('shopping_cart'),
  ('ruins'),
  ('building'),
  ('tree'),
  ('gate'),
  ('ford'),
  ('route_marker');

DROP TABLE IF EXISTS z_order_landuse;

CREATE TABLE z_order_landuse (type VARCHAR PRIMARY KEY, z_order SERIAL);

INSERT INTO
  z_order_landuse (type)
VALUES
  ('farmland'),
  ('farm'),
  ('grassland'),
  ('golf_course'),
  ('forest'),
  ('wood'),
  ('meadow'),
  ('heath'),
  ('bare_rock'),
  ('fell'),
  ('industrial'),
  ('residential'),
  ('commercial'),
  ('retail'),
  ('farmyard'),
  ('zoo'),
  ('recreation_ground'),
  ('grass'),
  ('wetland'),
  ('village_green'),
  ('school'),
  ('university'),
  ('college'),
  ('allotments'),
  ('garden'),
  ('park'),
  ('railway'),
  ('quarry'),
  ('scree'),
  ('landfill'),
  ('vineyard'),
  ('orchard'),
  ('scrub'),
  ('clearcut'),
  ('place_of_worship'),
  ('cemetery'),
  ('parking'),
  ('baracks'),
  ('library'),
  ('pitch'),
  ('footway'),
  ('pedestrian');
