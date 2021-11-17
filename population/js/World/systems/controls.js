import { OrbitControls } from '../../OrbitControls.js';

function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);

  controls.enableDamping = true;
  controls.minDistance = 50;
  controls.maxDistance = 1500;

  return controls;
}

export { createControls };
