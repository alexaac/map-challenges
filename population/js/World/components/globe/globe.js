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
} from '../../../three.module.js';

const textureLoader = new TextureLoader();

async function loadGlobe() {
  const globeRadius = 30;

  // Globe
  const earthGeometry = new SphereGeometry(globeRadius, 32, 32);

  const earthMap = textureLoader.load(
    './assets/textures/BlackMarble_2016_01deg.jpg' // https://svs.gsfc.nasa.gov/3895
  );
  earthMap.mapping = EquirectangularReflectionMapping;
  earthMap.encoding = sRGBEncoding;

  const earthMaterial = new MeshPhongMaterial({
    map: textureLoader.load(
      './assets/textures/BlackMarble_2016_01deg.jpg' // https://svs.gsfc.nasa.gov/3895
    ),
    bumpMap: textureLoader.load('./assets/textures/earthbump1k.jpg'), // http://planetpixelemporium.com/earth.html
    bumpScale: 0.6,
    specularMap: textureLoader.load('./assets/textures/earthspec1k.jpg'),
    specular: new Color('grey'),
    shininess: 1,
    normalMap: textureLoader.load('./assets/textures/EarthNormal.png'),
    normalScale: new Vector2(6, 6),
  });

  const globeMesh = new Mesh(earthGeometry, earthMaterial);
  globeMesh.position.set(0, 0, 0);
  globeMesh.rotation.y = (1 / 6) * Math.PI;

  // Clouds
  const cloudsGeometry = new SphereGeometry(globeRadius + 0.5, 32, 32);

  const cloudsMaterial = new MeshPhongMaterial({
    map: textureLoader.load('./assets/textures/clouds.png'),
    side: DoubleSide,
    opacity: 0.2,
    transparent: true,
    depthWrite: false,
    shininess: 1,
  });

  const cloudMesh = new Mesh(cloudsGeometry, cloudsMaterial);
  const earthMesh = new Mesh(cloudsGeometry, earthMaterial);
  earthMesh.add(cloudMesh);
  earthMesh.position.set(0, 0, 0);

  return { globeMesh, earthMesh };
}

export { loadGlobe };
