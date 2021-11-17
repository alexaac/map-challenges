import { PerspectiveCamera } from '../../three.module.js';

function createCamera() {
  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    200
  );

  camera.position.y = 30;
  camera.position.z = 170;

  return camera;
}

export { createCamera };
