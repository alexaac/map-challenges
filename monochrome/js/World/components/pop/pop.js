import {
  Object3D,
  Vector3,
  BoxBufferGeometry,
  MeshBasicMaterial,
  Mesh,
} from '../../../three.module.js';
import { popColorScale } from '../../../helpers.js';

// https://observablehq.com/@sdl60660/threejs-3d-globe-earthquake-plot
const loadBars = async () => {
  const [data] = await Promise.all([
    d3.json('./data/ne_10m_populated_places.geojson'),
  ]);

  // Add bars to scene
  const popHeightScale = d3
    .scaleLinear()
    .domain(d3.extent(data.features, (a) => +a.properties.POP_MAX))
    .range([0, 200]);

  const bars = new Object3D();

  data.features.forEach((place) => {
    const pop = parseFloat(place.properties.POP_MAX);

    const bar = getBar({
      lat: parseFloat(place.properties.LATITUDE),
      lng: -parseFloat(place.properties.LONGITUDE),
      height: popHeightScale(pop),
      barWidth: 0.1,
      color: popColorScale(pop),
    });

    bar.lookAt(new Vector3());
    bars.add(bar);
  });

  bars.name = 'Population Bars';

  return bars;
};

function getBar({ lat, lng, height, barWidth, color }) {
  const globeRadius = 30;

  const geometry = new BoxBufferGeometry(barWidth, barWidth, height);
  const material = new MeshBasicMaterial({ color });
  const bar = new Mesh(geometry, material);

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (180 - lng) * (Math.PI / 180);

  bar.position.x = -(globeRadius * Math.sin(phi) * Math.cos(theta));
  bar.position.y = globeRadius * Math.cos(phi);
  bar.position.z = globeRadius * Math.sin(phi) * Math.sin(theta);

  return bar;
}

export { loadBars };
