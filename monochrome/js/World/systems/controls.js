import { OrbitControls } from '../../OrbitControls.js';

function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);

  controls.enablePan = false;

  return controls;
}

export { createControls };
