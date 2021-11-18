import { World } from './World/World.js';

/* Global variables */

// https://github.com/looeee/discoverthreejs-site
async function main() {
  const autoRotate = true;
  const autoRotateSpeed = 15;
  const containerId = 'chart';

  // create a new world
  const world = new World({
    containerId,
    autoRotate,
    autoRotateSpeed,
  });

  // complete async tasks
  await world.init();

  // render
  world.render();
}

main().catch((err) => {
  console.error(err);
});
