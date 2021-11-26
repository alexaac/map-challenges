const center = L.CRS.EPSG3857.unproject(
  L.point([2788389.80955081, 5757268.5438732])
);
const zoom = 6.3;
const bounds = [
  L.CRS.EPSG3857.unproject(
    L.point([1953115.2665830773767084, 4945249.5623335754498839])
  ),
  L.CRS.EPSG3857.unproject(
    L.point([3600408.7910904106684029, 6652322.5333504881709814])
  ),
];

// map
const map = L.map('chart', {
  attributionControl: false,
  minZoom: 2,
  zoomDelta: 0.25,
  zoomSnap: 0,
  zoomControl: false,
}).setView(center, zoom);

// elev
const ghsPop = L.imageOverlay('data/ghs_pop.png', bounds, {}).addTo(map);
