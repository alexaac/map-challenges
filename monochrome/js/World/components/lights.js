import {
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
} from '../../three.module.js';

function createLights() {
  // add AmbientLight
  const ambientLight = new AmbientLight(0xffffff);
  ambientLight.intensity = 0.1;

  const hemisphereLight = new HemisphereLight('white', 'darkslategrey', 1);
  hemisphereLight.position.set(0, 0, 0);

  const dirLight = new DirectionalLight(0xffffff, 1);
  dirLight.position.set(-100, 10, 50);
  dirLight.castShadow = true;
  dirLight.intensity = 5;

  return { ambientLight, hemisphereLight, dirLight };
}

export { createLights };
