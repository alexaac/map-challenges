import { drawLegend } from './helpers.js';

/* Map Legend */
drawLegend();

const center = [45.959, 24.77];
const zoom = 7;
const bounds = L.latLngBounds([
  [42.8556641141826091, 19.8926419505805505],
  [49.0083638936841339, 30.6858084990024977],
]);

// map
const map = L.map('chart', {
  attributionControl: false,
  minZoom: 5,
}).setView(center, zoom);

// land
const land = L.imageOverlay('data/corine_alpha.png', bounds, {
  opacity: 0.7,
});
land.addTo(map);

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

const esri_WorldTerrain = L.tileLayer(
  'http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
  {
    attribution:
      'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
    maxZoom: 13,
  }
).addTo(map);

const osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c'],
});

// Create base layers group object
const baseLayers = {
  'MapTiler Pastel': maptiler_Pastel,
  'ESRI Terrain': esri_WorldTerrain,
  OSM: osm,
};

const overlays = {
  Land: land,
};
// Add baseLayers to the map
L.control.layers(baseLayers, overlays).addTo(map);
