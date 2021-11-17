import { World } from './World/World.js';

// https://github.com/looeee/discoverthreejs-site
async function main() {
  // Get a reference to the container element
  const container = document.querySelector('#chart');

  // create a new world
  const world = new World(container);

  // complete async tasks
  await world.init();

  // render
  world.render();
}

main().catch((err) => {
  console.error(err);
});
