import { PerspectiveCamera } from '../../three.module.js';

function createCamera() {
  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  camera.position.z = 10;
  camera.lookAt(0, 0, 0);

  return camera;
}

export { createCamera };
