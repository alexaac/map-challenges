import {
  TextureLoader,
  EquirectangularReflectionMapping,
  sRGBEncoding,
  Mesh,
  SphereGeometry,
  MeshPhongMaterial,
  ShaderMaterial,
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

  /*create a shader material with a standard vertexShader. Pass the */
  const shaderMaterial = new ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iChannel0: {
        value: textureLoader.load('https://i.imgur.com/cUHldcm.png'),
      },
      iChannel1: {
        value: textureLoader.load('https://i.imgur.com/JNF8Bqf.jpg'),
      },
    },
    vertexShader: `
    varying vec2 vUv;
        
    void main()
    {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

      vUv = uv;
    }
  `,
    fragmentShader: `
  
    //bring in your uniforms of time and the two textures to use in the shader
    uniform float iTime;
    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    
    //get the uv from the vertex shader above
    varying vec2 vUv;
    
    //https://math.fandom.com/wiki/Tau_(constant)
    #define TAU 6.283185307179586476925286766559
    
    void main() {
      vec2 uv = vUv;
        //get the pixel color from our textures at a uv coordinate offset by time
        //.r just takes the red value of the sampled pixel https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)#Swizzling
        float o = texture2D(iChannel1, uv * 0.25 + vec2(0.0, iTime * 0.025)).r;
        float d = (texture2D(iChannel0, uv * 0.25 - vec2(0.0, iTime * 0.02 + o * 0.02)).r * 2.0 - 1.0);

        float v = uv.y + d * 0.1;
        v = 1.0 - abs(v * 2.0 - 1.0);//abs() keeps things above zero. -1 will become 1, -9.5 will become 9.5
        v = pow(v, 2.0 + sin((iTime * 0.2 + d * 0.25) * TAU) * 0.5);

        vec3 color = vec3(0.0);

        float x = (1.0 - uv.x * 0.75);
        float y = 1.0 - abs(uv.y * 2.0 - 1.0);
        color += vec3(x * 0.5, y, x) * v;

        //this part adds random stars
        vec2 seed = uv;
        vec2 r;
        r.x = fract(sin((seed.x * 12.9898) + (seed.y * 78.2330)) * 43758.5453);
        r.y = fract(sin((seed.x * 53.7842) + (seed.y * 47.5134)) * 43758.5453);
        float s = mix(r.x, (sin((iTime * 2.5 + 60.0) * r.y) * 0.5 + 0.5) * ((r.y * r.y) * (r.y * r.y)), 0.04); 
        color += pow(s, 70.0) * (1.0 - v);

        //set the color RGB values
        gl_FragColor.rgb = color;
        //set the color Alpha value
        gl_FragColor.a = 1.0;
    }
  `,
    wireframe: false,
  });
  const lightsMesh = new Mesh(cloudsGeometry, shaderMaterial);
  // earthMesh.add(lightsMesh);

  return { globeMesh, earthMesh };
}

export { loadGlobe };
