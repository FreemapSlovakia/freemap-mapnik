import { Placement } from "jsxnik/mapnikConfig";

export function Placements() {
  return (
    <>
      {[3, -3, 6, -6, 9, -9].map((off) => (
        <Placement dy={off} />
      ))}
    </>
  );
}
