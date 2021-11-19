import { drawLegend } from './helpers.js';

/* Map Legend */
drawLegend();

const center = [39.21, 18.51];
const zoom = 4.5;
const bounds = L.latLngBounds([
  [26.7873805452889648, -6.7443582525385146],
  [50.0314384069672045, 44.0426584946982445],
]);

// map
const map = L.map('chart', {
  attributionControl: false,
  minZoom: 2,
  zoomDelta: 0.25,
  zoomSnap: 0,
}).setView(center, zoom);

// scale
L.control.scale().addTo(map);

// sea_green
const sea_green = L.imageOverlay('data/sea_alpha.png', bounds, {
  opacity: 1,
});
sea_green.addTo(map);

// sea_red
const sea_red = L.imageOverlay('data/sear_alpha.png', bounds, {
  opacity: 1,
});
sea_red.addTo(map);

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
);

const esri_NatGeo = L.tileLayer(
  'http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
  {
    attribution:
      'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
    maxZoom: 16,
  }
);

// Create base layers group object
const baseLayers = {
  'MapTiler Pastel': maptiler_Pastel,
  'ESRI Terrain': esri_WorldTerrain,
  'ESRI National Geographic': esri_NatGeo,
};

const overlays = {
  'Sea green': sea_green,
  'Sea red': sea_red,
};

// Add baseLayers to the map
L.control.layers(baseLayers, overlays).addTo(map);
