import {
  TextureLoader,
  EquirectangularReflectionMapping,
  sRGBEncoding,
  Mesh,
  SphereGeometry,
  MeshPhongMaterial,
  Color,
  Vector2,
  DoubleSide,
  MeshBasicMaterial,
  BackSide,
} from '../../../three.module.js';

const textureLoader = new TextureLoader();

async function loadGlobe() {
  // Globe
  const moonGeometry = new SphereGeometry(2, 60, 60);

  const moonMap = textureLoader.load(
    './assets/textures/lroc_color_poles_2k.png' // https://svs.gsfc.nasa.gov/4720
  );
  moonMap.mapping = EquirectangularReflectionMapping;
  moonMap.encoding = sRGBEncoding;

  const displacementMap = textureLoader.load(
    './assets/textures/ldem_4_uint.png'
  ); // https://svs.gsfc.nasa.gov/4720

  const moonMaterial = new MeshPhongMaterial({
    map: moonMap,
    bumpMap: displacementMap,
    bumpScale: 0.06,
    displacementMap: displacementMap,
    displacementScale: 0.07,
    reflectivity: 0,
    shininess: 0,
  });

  const moon = new Mesh(moonGeometry, moonMaterial);
  // moon.rotation.x = -(1 / 6) * Math.PI;
  moon.rotation.y = (1 / 3) * Math.PI;

  // https://svs.gsfc.nasa.gov/3895
  const stars = './assets/textures/starmap_4k_mono.jpg';

  const worldTexture = textureLoader.load(
    './assets/textures/starmap_4k_mono.jpg'
  );
  worldTexture.mapping = EquirectangularReflectionMapping;
  worldTexture.encoding = sRGBEncoding;
  const worldGeometry = new SphereGeometry(900, 60, 60);
  const worldMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    map: worldTexture,
    side: BackSide,
  });
  const world = new Mesh(worldGeometry, worldMaterial);

  return { moon, world };
}

export { loadGlobe };
