const center = [23.5968, 46.7773]; // Bengaluru
const zoom = 8;
const boundaries = [
  [22.901083836, 45.955777778],
  [24.07247172, 47.116666667],
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

const im2017B123 = L.imageOverlay('data/N47E023_17_B123.png', boundaries, {
  opacity: 1,
});
const im2017B657 = L.imageOverlay('data/N47E023_17_B657.png', boundaries, {
  opacity: 1,
});
const sentinel1 = L.imageOverlay(
  'data/sentinel1_S1A_IW_GRDH_1SDV_2021103.png',
  boundaries,
  {
    opacity: 1,
  }
);

im2017B123.addTo(after);
im2017B657.addTo(before);

sentinel1.addTo(syncTo);

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
