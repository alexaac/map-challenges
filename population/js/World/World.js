import { loadGlobe } from './components/globe/globe.js';
import { loadBars } from './components/pop/pop.js';
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

class World {
  constructor(
    { containerId, autoRotate, autoRotateSpeed } = {
      containerId: 'chart',
      autoRotate: true,
      autoRotateSpeed: 15,
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

    scene.add(ambientLight, hemisphereLight);

    const resizer = new Resizer(container, camera, renderer);
  }

  render() {
    const render = () => {
      requestAnimationFrame(render);
      controls.update();

      renderer.render(scene, camera);
    };
    render();
  }

  async init() {
    const { globeMesh, earthMesh } = await loadGlobe();

    const bars = await loadBars();

    scene.add(globeMesh, earthMesh, bars);
  }
}

export { World };
