/* Global variables */
const catName = 'Pippin';
const catPnt = [23.555, 46.39091];

const center = [23.05676, 46.4088];
const zoom = 16;

let bounds = [
  [23.56148, 46.39091],
  [23.62406, 46.36622],
];

const points = [
  [23.56148, 46.39091],
  [23.56148, 46.39091],
];

/* Map */
const map = new maplibregl.Map({
  container: 'graph',
  // raster tiles
  style: `https://api.maptiler.com/maps/bright/style.json?key=${'NmDVsZUfeF9WqIvqVlrF'}`,
  center: center,
  zoom: zoom,
  scrollZoom: false,
  pitch: 80,
});

boundsOptions = {
  padding: { top: 25, bottom: 55, left: 55, right: 0, linear: true },
};

map.fitBounds(bounds, boundsOptions);

/* Intermediary route points */
const stopPoints = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Boromir' },
      geometry: {
        type: 'Point',
        coordinates: [23.56303, 46.38731],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Eowyn' },
      geometry: {
        type: 'Point',
        coordinates: [23.57973, 46.38292],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Gimli' },
      geometry: {
        type: 'Point',
        coordinates: [23.58653, 46.37278],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Blossom' },
      geometry: {
        type: 'Point',
        coordinates: [23.59392, 46.36668],
      },
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [23.60406, 46.36622],
      },
    },
  ],
};

/* Popup containing random cats images */
const addPopup = (coordinates, index, name) => {
  index = index || 0;
  // random number from 1 to 10
  // const randomNo = Math.floor(Math.random() * 10 + 1);
  // const iconSize = [50 + randomNo, 50 + randomNo];
  const iconSize = [53 + index, 53 + index];

  // create a DOM element for the marker
  const el = document.createElement('div');

  const img = document.createElement('div');
  el.appendChild(img);
  img.className = 'popup';
  img.style.backgroundImage = `url(https://placekitten.com/g/${iconSize.join(
    '/'
  )}/)`;
  img.style.width = iconSize[0] + 'px';
  img.style.height = iconSize[1] + 'px';

  const text = document.createElement('div');
  el.appendChild(text);
  text.style.textAlign = 'center';
  text.innerHTML = name;

  const popup = new maplibregl.Popup({
    offset: 25,
    closeOnClick: false,
    closeButton: false,
    className: 'popup-outer',
  })
    .setHTML(el.outerHTML)
    .setLngLat(coordinates)
    .addTo(map);
};

/* Marker */
const addMarker = (coordinates) => {
  const el = document.createElement('div');
  el.className = 'marker';

  // add marker to map
  new maplibregl.Marker().setLngLat(coordinates).addTo(map);
};

/* Pan to a point, shift right on large screen to avoid text overlapping */
const panToPnt = (coordinates) => {
  const x = innerWidth <= 925 ? coordinates[0] : coordinates[0] - 0.01; // move a bit to the right of the text

  const animationOptions = {
    duration: parseInt(3, 10),
    linear: true,
  };

  map.panTo([x, coordinates[1]], animationOptions);
};

/* Rerender on resize*/
let oldWidth = 0;

function render() {
  if (oldWidth == innerWidth) return;
  oldWidth = innerWidth;

  let width = window.innerWidth;
  let height = window.innerHeight;

  d3.select('#graph')
    .attrs({ width: '200px', height: height })
    .style({ display: 'inline-block' });

  // force map resize
  map.resize();

  /* Load map */
  map.on('style.load', async function () {
    map.resize();

    /* Load a simplified geojson of points from a bycicle route */
    d3.json('./data/aiud_sm.geojson', function (tdata) {
      // make list of points to add to the map
      morepoints = tdata.features[0].geometry.coordinates[0];

      // display the main cat popup
      addPopup(catPnt, 0, catName);
      panToPnt(bounds[0]);

      // display the first and the last route point
      addMarker(morepoints[0]);
      addMarker(morepoints[morepoints.length - 1]);

      // data to add to the map
      const data = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: points,
            },
          },
        ],
      };

      map.addSource('route', {
        type: 'geojson',
        data: data,
      });
      const source = map.getSource('route');

      // generator function that holds the route points, and gives the next point as we need it
      const generator = morepoints.entries();

      // flag to check the points generator gives points that are before each stop
      let beforeStop;

      // Draw subroute when reaching a new stop
      const drawSubRoute = (pointAlong, stopPoint) => {
        if (pointAlong === undefined || stopPoint === undefined) {
          beforeStop = false;
          return;
        }

        const i = pointAlong[0];
        const point = pointAlong[1];
        const reachedStop =
          JSON.stringify(point.slice(0, 2)) ===
          JSON.stringify(stopPoint.geometry.coordinates);
        const isLastPoint =
          JSON.stringify(point.slice(0, 2)) ===
          JSON.stringify(morepoints[morepoints.length - 1].slice(0, 2));

        if (reachedStop) {
          beforeStop = false;
        }

        setTimeout(function () {
          // new maplibregl.Marker().setLngLat(point).addTo(map);
          if (reachedStop && !isLastPoint) {
            // panToPnt(stopPoint.geometry.coordinates);
            addPopup(
              stopPoint.geometry.coordinates,
              i,
              stopPoint.properties.name
            );
          }

          points.push(point);
          source.setData(data);

          panToPnt(point);

          if (isLastPoint) {
            setTimeout(function () {
              map.fitBounds(bounds, boundsOptions);
            }, 1000);
          }
        }, 100 + i * 180);
      };

      // add the route layer
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3fb1ce',
          'line-width': 8,
        },
      });

      const gs = d3
        .graphScroll()
        .container(d3.select('.container1'))
        .graph(d3.selectAll('container1 #graph'))
        .eventId('uniqueId1') // namespace for scroll and resize events
        .sections(d3.selectAll('.container1 #sections > .step'))
        // .offset(innerWidth < 900 ? innerHeight - 30 : 200)
        .on('active', function (i) {
          if (i > 0) {
            beforeStop = true;

            while (beforeStop) {
              drawSubRoute(generator.next().value, stopPoints.features[i - 1]);
            }
          }
        });
    });
  });
}

render();

d3.select(window).on('resize', render);
