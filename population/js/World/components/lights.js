import {
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
} from '../../three.module.js';

function createLights() {
  const ambientLight = new AmbientLight(0x444444);

  const hemisphereLight = new HemisphereLight('white', 'darkslategrey', 4);

  const dirLight = new DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(-10, 30, 40);

  return { ambientLight, hemisphereLight, dirLight };
}

export { createLights };
