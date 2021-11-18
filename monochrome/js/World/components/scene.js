import {
  Scene,
  TextureLoader,
  EquirectangularReflectionMapping,
  sRGBEncoding,
} from '../../three.module.js';

const backgroundMap = () => {
  const textureLoader = new TextureLoader();
  // https://svs.gsfc.nasa.gov/3895
  const stars = './assets/textures/starmap_4k_mono.jpg';

  const backgroundMap = textureLoader.load(stars);
  backgroundMap.mapping = EquirectangularReflectionMapping;
  backgroundMap.encoding = sRGBEncoding;

  return backgroundMap;
};

function createScene() {
  const scene = new Scene();

  // scene.background = backgroundMap();

  return scene;
}

export { createScene };
