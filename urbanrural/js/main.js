const center = [46.7752, 23.5953];
const zoom = 13;
const bounds = L.latLngBounds([
  [46.6734678051917484, 23.3117119861988833],
  [46.8765495158483745, 23.8741016351926874],
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

// urbanr
const urbanr = L.imageOverlay('data/urb_alpha.png', bounds, {
  opacity: 0.8,
});
urbanr.addTo(map);

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

const maptiler_Satellite = L.tileLayer(
  'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=wSVUkjoWKTD8fUSyzJd5',
  {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    crossOrigin: true,
  }
);

// Create base layers group object
const baseLayers = {
  'MapTiler Pastel': maptiler_Pastel,
  'MapTiler Satellite': maptiler_Satellite,
};

const overlays = {
  Footprint: urbanr,
};

// Add baseLayers to the map
L.control.layers(baseLayers, overlays).addTo(map);
