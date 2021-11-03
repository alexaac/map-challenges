/* Global variables */
const width =
    window.innerWidth <= 560 ? 400 : window.innerWidth <= 960 ? 800 : 1100,
  height =
    window.innerWidth <= 560 ? 400 : window.innerWidth <= 960 ? 700 : 900;

// Buildings color
const buildingsFill = '#3288bd';
const roadsStroke = '#ff57ae';
// const roadsStroke = '#99d594';

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background-color', '#fff')
  .style('font', '10px sans-serif');

const g = svg
  .append('g')
  .attr('class', 'map-features')
  .attr('width', width)
  .attr('height', height)
  .attr('transform', `translate(0, 0)`);

// Map projection
const zoom = 23;
const center = [21.22886, 45.75619];
const projection = d3
  .geoMercator()
  .center(center)
  .scale(Math.pow(2, zoom) / (2 * Math.PI))
  .translate([width / 2, height / 2]);

// Path
const path = d3.geoPath(projection);

// Nextzen key
const key = '4urWvSQpT7S78YE5vAVTSA';

// Tiler
const tile = d3
  .tile()
  .tileSize(512)
  .size([width, height])
  .scale(projection.scale() * 2 * Math.PI)
  .translate(projection([0, 0]))
  .zoomDelta(2)
  .clampX(false);

// Draw Nextzen layers - roads, land, water
const renderBase = async () => {
  /* Load the data */
  const promises = tile().map(async ([x, y, z]) => {
    const tiles = await d3.json(
      `https://tile.nextzen.org/tilezen/vector/v1/256/all/${z}/${x}/${y}.json?api_key=${key}`
    ); // Sign up for an API key: https://www.nextzen.org

    if (tiles) {
      const background = g
        .selectAll('g.background')
        .append('rect')
        .style('fill', '#262626')
        .style('fill-opacity', 0.35)
        .attr('width', 100)
        .attr('height', 60);

      const water = g
        .selectAll('g.water')
        .data(tiles.water.features)
        .enter()
        .append('path')
        .style('fill', '#262626')
        .style('fill-opacity', 0.35)
        .attr('d', path)
        .style('stroke-width', 1)
        .style('stroke-opacity', 0.5);

      const earth = g
        .selectAll('g.earth')
        .data(tiles.earth.features)
        .enter()
        .append('path')
        .style('fill', '#090909')
        .style('fill-opacity', 1)
        .attr('d', path);

      const roads = g
        .selectAll('g.roads')
        .data(tiles.roads.features)
        .enter()
        .append('path')
        // .style('fill', '#2a2a2a')
        .attr('d', path)
        .style('fill', 'none')
        .style('stroke-width', 0.35)
        .style('stroke', roadsStroke);

      // const buildings = g
      //   .selectAll('g.buildings2')
      //   .data(tiles.buildings.features)
      //   .enter()
      //   .append('path')
      //   .style('fill', 'red')
      //   .attr('d', path)
      //   .style('stroke-width', 0.1)
      //   .style('stroke', '#fff');
    }

    return tiles;
  });

  return Promise.all(promises)
    .then((data) => {
      // Wait for the Nextzen tiles to complete, then render the OSM tiles
      renderBuildings();

      return data;
    })
    .catch((error) => console.log(error));
};

// Draw OSM Buildings layer - more detailed
const renderBuildings = () => {
  /* Load the data */
  tile().map(async ([x, y, z]) => {
    const tiles = await d3.json(
      `https://data.osmbuildings.org/0.2/anonymous/tile/${z}/${x}/${y}.json`
    );

    if (tiles) {
      const buildings = g
        .selectAll('g.buildings')
        .data(tiles.features)
        .enter()
        .append('path')
        .style('fill', '#3288bd')
        .style('fill-opacity', 1)
        .attr('d', path)
        .style('stroke-width', 0.1)
        .style('stroke', '#000');
    }
  });
};

renderBase();

// // Wait for the Nextzen tiles to complete, then render the OSM tiles
// const data = await renderBase();
// renderBuildings();
