const center = L.CRS.EPSG3857.unproject(L.point([2762233, 5758247]));
const zoom = 7;
const bounds = [
  L.CRS.EPSG3857.unproject(
    L.point([2119863.5485999998636544, 5254326.4253000002354383])
  ),

  L.CRS.EPSG3857.unproject(
    L.point([3520264.694300000090152, 6301252.0845999997109175])
  ),
];

// map
const map = L.map('chart', {
  attributionControl: false,
  minZoom: 2,
  zoomDelta: 0.25,
  zoomSnap: 0,
}).setView(center, zoom);

// scale
L.control.scale().addTo(map);

// elev
const elevBlack = L.imageOverlay('data/elev_black.png', bounds, {
  opacity: 0.8,
});
elevBlack.addTo(map);
const elevWhite = L.imageOverlay('data/elev_white.png', bounds, {
  opacity: 0.8,
});

elevBlack.setOpacity(1);
elevWhite.setOpacity(1);

// base layers
const maptiler_Pastel = L.tileLayer(
  'https://api.maptiler.com/maps/pastel/{z}/{x}/{y}.png?key=wSVUkjoWKTD8fUSyzJd5',
  {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    crossOrigin: true,
  }
).addTo(map);

const osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

// Create base layers group object
const baseLayers = {
  'MapTiler Pastel': maptiler_Pastel,
  OSM: osm,
};

const overlays = {
  Dark: elevBlack,
  Light: elevWhite,
};

// Add baseLayers to the map
L.control.layers(baseLayers, overlays).addTo(map);

const slider = document.getElementById('slider');
slider.value = 1;

slider.addEventListener('change', function () {
  const value = slider.value;

  elevBlack.setOpacity(value);
  elevWhite.setOpacity(value);
});
