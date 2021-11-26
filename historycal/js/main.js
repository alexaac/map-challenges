const center = L.CRS.EPSG3857.unproject(L.point([2626176, 5904791]));
const zoom = 14;
const bounds = [
  L.CRS.EPSG3857.unproject(
    L.point([2619844.9692999999970198, 5901505.6487999996170402])
  ),

  L.CRS.EPSG3857.unproject(
    L.point([2632287.1653999998234212, 5908033.4206999996677041])
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

const cjOsm = L.imageOverlay('data/cj_osm.png', bounds, {});
const cjA200k = L.imageOverlay('data/cj_aus_200k.png', bounds, {});
const cjS200k = L.imageOverlay('data/cj_s_200k.png', bounds, {});
const cjS100k = L.imageOverlay('data/cj_s_100k.png', bounds, {});
const cjS50k = L.imageOverlay('data/cj_s_50k.png', bounds, {});
const cjTopo = L.imageOverlay('data/cj_topo.png', bounds, {}).addTo(map);

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
  OSM: osm,
  'MapTiler Pastel': maptiler_Pastel,
};

const overlays = {
  'Topo 20k': cjTopo,
  'Soviet 50k': cjS50k,
  'Soviet 100k': cjS100k,
  'Soviet 200k': cjS200k,
  'Austrian 200k': cjA200k,
  'OSM georef': cjOsm,
};

// Add baseLayers to the map
L.control.layers(baseLayers, overlays).addTo(map);

const slider = document.getElementById('slider');
slider.value = 1;

slider.addEventListener('change', function () {
  const value = slider.value;

  cjOsm.setOpacity(value);
  cjA200k.setOpacity(value);
  cjS200k.setOpacity(value);
  cjS100k.setOpacity(value);
  cjS50k.setOpacity(value);
  cjTopo.setOpacity(value);
});
