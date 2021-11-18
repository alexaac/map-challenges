import { loadGlobe } from './components/globe/globe.js';
import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { createControls } from './systems/controls.js';
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';

let camera;
let controls;
let renderer;
let scene;
let moon, world;

class World {
  constructor(
    { containerId, autoRotate, autoRotateSpeed } = {
      containerId: 'chart',
      autoRotate: true,
      autoRotateSpeed: 5,
    }
  ) {
    // Get a reference to the container element
    const container = document.getElementById(containerId);

    camera = createCamera();
    renderer = createRenderer();
    scene = createScene();

    container.append(renderer.domElement);

    controls = createControls(camera, renderer.domElement);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = autoRotateSpeed;

    const { ambientLight, hemisphereLight, dirLight } = createLights();

    scene.add(ambientLight, hemisphereLight, dirLight);

    const resizer = new Resizer(container, camera, renderer);
  }

  render() {
    const render = () => {
      requestAnimationFrame(render);

      moon.rotation.y += 0.002;
      moon.rotation.x += 0.0001;
      world.rotation.y += 0.0001;
      world.rotation.x += 0.0005;

      controls.update();

      renderer.render(scene, camera);
    };
    render();
  }

  async init() {
    ({ moon, world } = await loadGlobe());

    scene.add(moon, world);
  }
}

export { World };
