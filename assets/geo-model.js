// GeoJSON uses [longitude, latitude]; Leaflet marker coordinates use [latitude, longitude].
export function isArea(area) {
  if (!area || !['Polygon', 'MultiPolygon'].includes(area.type) || !Array.isArray(area.coordinates))
    return false;
  const polygons = area.type === 'Polygon' ? [area.coordinates] : area.coordinates;
  let count = 0;
  return (
    polygons.length > 0 &&
    polygons.length <= 40 &&
    polygons.every(
      (p) =>
        Array.isArray(p) &&
        p.length > 0 &&
        p.length <= 20 &&
        p.every((r) => {
          if (!Array.isArray(r) || r.length < 4) return false;
          count += r.length;
          if (count > 2500) return false;
          if (
            !r.every(
              (c) =>
                Array.isArray(c) &&
                c.length === 2 &&
                c.every(Number.isFinite) &&
                Math.abs(c[0]) <= 180 &&
                Math.abs(c[1]) <= 90,
            )
          )
            return false;
          return r[0][0] === r.at(-1)[0] && r[0][1] === r.at(-1)[1];
        }),
    )
  );
}
export const wrapLongitude = (x) => ((((x + 180) % 360) + 360) % 360) - 180;
