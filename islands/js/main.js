const configuration = {
  // Minimum distance camera can approach scene
  minDistance: 1000,
  // Maximum distance camera can move from scene
  maxDistance: 100000,
  // Maximum distance camera target can move from scene
  maxBounds: 175000,
  // Minimum polar angle of camera
  minPolarAngle: 0.25 * Math.PI,
  // Maximum polar angle of camera
  maxPolarAngle: 0.8 * Math.PI,
  // Set to true to disable panning
  noPan: false,
  // Set to true to disable rotating
  noRotate: false,
  // Set to true to disable zooming
  noZoom: false,
};

Procedural.configureControls(configuration);

// Initialize the engine with a location and inject into page
const container = document.getElementById('container');

// Define API Keys (replace these with your own!)
const NASADEM_APIKEY = '19ad1cc0559c24d74bc9170da29471726';
if (!NASADEM_APIKEY) {
  const error = Error('Modify index.html to include API keys');
  container.innerHTML = error;
  throw error;
}

const datasource = {
  elevation: {
    apiKey: NASADEM_APIKEY,
  },
  imagery: {
    apiKey: 'wSVUkjoWKTD8fUSyzJd5',
    urlFormat:
      'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key={apiKey}',
    attribution:
      '<a href="https://www.maptiler.com/copyright/">Maptiler</a> <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 15,
  },
};
Procedural.init({ container, datasource });
const env = {
  title: 'monochrome',
  parameters: {
    turbidity: 7.6,
    reileigh: 0,
    mieCoefficient: 0.039,
    mieDirectionalG: 0.47,
    inclination: 0.53,
    azimuth: 0.375,
  },
};

// Configure buttons for UI
Procedural.setCompassVisible(false);

// Define function for loading a given island
function loadPeak(feature) {
  const { name, pop, id } = feature.properties;
  const [longitude, latitude] = feature.geometry.coordinates;
  Procedural.displayLocation({ latitude, longitude });
  Procedural.setEnvironment(env);

  const overlay = {
    name: 'island',
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          name: `${name} - ${pop}M`,
          borderRadius: 32,
          background: 'rgba(35,46,50,1)',
          fontSize: 18,
          padding: 10,
          anchorOffset: { y: 86, x: 0 },
        },
      },
      {
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          name: id,
          image: '_',
          background: 'rgba(255, 255, 255, 0.5)',
          width: 0,
          height: 30,
          padding: 1,
          anchor: 'bottom',
          anchorOffset: { y: 39, x: 0 },
        },
      },
    ],
  };

  Procedural.addOverlay(overlay);
  // setTimeout(() => Procedural.orbitTarget(), 1000);
}

// Fetch island list and populate UI
const getCoords = async (location) => {
  const url = `https://secure.geonames.org/searchJSON?username=wetravel&name=${location}&maxRows=100`;

  const res = await d3.json(url);

  return res.geonames[0] ? [+res.geonames[0].lat, +res.geonames[0].lng] : [];
};

Promise.all([d3.csv('./data/islands.csv')])
  .then(async ([islandData]) => {
    const data = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [],
          },
        },
      ],
    };

    const addLatLon = async () => {
      const promises = islandData.map(async (elem) => {
        const [latitude, longitude] = await getCoords(elem.name);

        const feat = {
          type: 'Feature',
          properties: { name: elem.name, pop: elem.pop, id: elem.id },
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        };

        return feat;
      });

      return Promise.all(promises)
        .then((data) => {
          return data;
        })
        .catch((error) => console.log(error));
    };

    const addedGeom = await addLatLon();

    data.features = [...addedGeom];

    // Add overlay showing all islands
    const overlay = {
      name: 'dots',
      type: 'FeatureCollection',
      features: data.features.map((feature, i) => ({
        id: i,
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          name: '',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 16,
          padding: 4,
        },
      })),
    };

    Procedural.addOverlay(overlay);

    // Display first island
    const island = data.features[0];
    if (island) {
      loadPeak(island);
    }

    let index = 0;
    const displayNextIsland = async () => {
      index++;
      if (index > data.features.length) {
        index = 0;
      }

      const island = data.features[index];
      if (island) {
        loadPeak(island);
      }
    };

    const findBtn = document.getElementById('find');
    findBtn.addEventListener('click', async function (e) {
      e.preventDefault();

      try {
        displayNextIsland();
      } catch (error) {
        console.error('error', error);
      }
    });
  })
  .catch((err) => {
    console.error(err);
  });
