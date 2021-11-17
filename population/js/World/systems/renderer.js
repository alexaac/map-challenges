import { WebGLRenderer } from '../../three.module.js';

function createRenderer() {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });

  renderer.physicallyCorrectLights = true;
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  return renderer;
}

export { createRenderer };
