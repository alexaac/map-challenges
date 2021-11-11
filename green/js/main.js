const center = [23.5968, 46.7773]; // Bengaluru
const zoom = 8;
const boundaries = [
  [22.970251938, 45.975],
  [24.029748062, 47.025],
];

const before = L.map('before', {
  attributionControl: false,
  minZoom: 5,
}).setView(center, zoom);

const after = L.map('after', {
  attributionControl: false,
  minZoom: 5,
}).setView(center, zoom);

const syncTo = L.map('sync', {
  attributionControl: false,
  minZoom: 5,
}).setView(center, zoom);

const im2017 = L.imageOverlay('data/N47E023_17_B657.png', boundaries, {
  opacity: 1,
});
const im2007 = L.imageOverlay('data/N47E023_07_B657.png', boundaries, {
  opacity: 1,
});
const imDif = L.imageOverlay('data/N47E023_07-17_B8.png', boundaries, {
  opacity: 1,
});

im2007.addTo(after);
im2017.addTo(before);

imDif.addTo(syncTo);

// Leaflet Before/After Map Comparison Slider
// https://github.com/apal21/Leaflet-Before-After-Map-Comparison-Slider
$('.container').beforeAfter(before, after, { changeOnResize: false });

// Leaflet.Sync
// https://github.com/jieter/Leaflet.Sync
before.sync(syncTo);
before.sync(after);

after.sync(before);
after.sync(syncTo);

syncTo.sync(before);
syncTo.sync(after);

// Override the plugin settings
$('.container').width('600px');
$('.container').height('600px');
$('.container').css('margin-left', '1rem');
$('#sync').width('600px');
