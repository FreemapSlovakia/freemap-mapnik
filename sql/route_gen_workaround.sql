-- There seems to be a bug in imposm3. Simple workaround is to run this regulary, but for better one create a trigger.
-- https://github.com/omniscale/imposm3/issues/293
INSERT INTO
  osm_route_members_gen1 (osm_id, member, role, type, geometry)
SELECT
  osm.osm_id,
  osm.member,
  osm.role,
  osm.type,
  ST_SimplifyPreserveTopology(osm.geometry, 50) AS geometry
FROM
  osm_route_members osm
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      osm_route_members_gen1 osm_gen1
    WHERE
      osm_gen1.osm_id = osm.osm_id
      AND osm_gen1.type = osm.type
  );

INSERT INTO
  osm_route_members_gen0 (osm_id, member, role, type, geometry)
SELECT
  osm.osm_id,
  osm.member,
  osm.role,
  osm.type,
  ST_SimplifyPreserveTopology(osm.geometry, 200) AS geometry
FROM
  osm_route_members osm
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      osm_route_members_gen0 osm_gen0
    WHERE
      osm_gen0.osm_id = osm.osm_id
      AND osm_gen0.type = osm.type
  );
