// TODO: Fix pan, add search

import {
  getCoords,
  getbb,
  getDataFromOSM,
  highlight,
  showInfo,
} from './helpers.js';

/* Global variables */

const width =
    window.innerWidth <= 560 ? 400 : window.innerWidth <= 960 ? 800 : 1100,
  height =
    window.innerWidth <= 560 ? 400 : window.innerWidth <= 960 ? 600 : 800;

// const coords = await getCoords('Cluj-Napoca'); //[23.58964, 46.76999]
const coords = await getCoords('Bucuresti'); //[23.58964, 46.76999]
const bb = getbb(coords, 0.05, 0.1);

const mapZoom = 22;

/* Info popup */

const tooltip_div = d3
  .select('body')
  .append('tooltip_div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0)
  .style('display', 'none');

tooltip_div.append('div').classed('tooltip__text', true);
tooltip_div
  .append('div')
  .append('button')
  .classed('tooltip__remove', true)
  .on('click', function () {
    tooltip_div.transition().duration(200).style('opacity', 0);
  })
  .text('x');

/* Draw basemap */

/* Map projection */
const projection = d3
  .geoMercator()
  .center(coords)
  .scale(Math.pow(2, mapZoom) / (2 * Math.PI))
  .translate([width / 2, height / 2]);
// const b = bb,
//   s =
//     0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);

// projection.scale(s);

// Define OSM tile
const tile = d3
  .tile()
  .size([width, height])
  .scale(projection.scale() * 2 * Math.PI)
  .translate(projection([0, 0]));

let tiles = tile();

// Define OSM url
const url = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png	`;

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', [0, 0, width, height])
  .attr('width', width)
  .attr('height', height);

// Append zoomable group
const zoomableGroup = svg
  .append('g')
  .attr('class', 'zoomable-group')
  .attr('transform', `translate(0, 0)`);

let imagesGroup = zoomableGroup.append('g').attr('class', 'images-group');

let image = imagesGroup
  .selectAll('image')
  .data(tile())
  .join('image')
  .attr('xlink:href', (d) => url(d[0], d[1], d[2]))
  .attr('x', (d) => Math.round((d[0] + tile().translate[0]) * tile().scale))
  .attr('y', (d) => Math.round((d[1] + tile().translate[1]) * tile().scale))
  .attr('width', tile().scale)
  .attr('height', tile().scale);

// OSM attribution
svg
  .append('text')
  .attr('x', width - 10)
  .attr('y', height - 10)
  .style('font-family', 'sans-serif')
  .style('font-size', '12px')
  .style('paint-order', 'stroke fill')
  .style('stroke', 'white')
  .style('stroke-linecap', 'round')
  .style('stroke-linejoin', 'round')
  .style('stroke-opacity', 0.8)
  .style('stroke-width', 4)
  .style('text-anchor', 'end')
  .html(
    '<a href="https://www.openstreetmap.org/copyright">©  OpenStreetMap contributors</a>'
  );

/* Load the data */

const pointsOfInterest = await getDataFromOSM(bb, 1);

projection.fitExtent(
  [
    [10, 10],
    [width - 10, height - 10],
  ],
  pointsOfInterest
);

/* Color scale */
const colorScale = d3
  .scaleOrdinal(d3.schemeSpectral[11])
  .domain(
    d3.extent(pointsOfInterest.features, (d) => d.properties.tags.amenity)
  );

// Draw the OSM nodes
let nodesGroup = zoomableGroup.append('g').attr('class', 'nodes-group');

const nodes = nodesGroup
  .selectAll('.node')
  .data(pointsOfInterest.features)
  .enter()
  .append('g')
  .attr('class', 'node');

nodes
  .append('circle')
  .classed('node', true)
  .attr('r', 5)
  .attr('fill', (d) => colorScale(d.properties.tags.amenity))
  .attr('opacity', 0.2)
  .attr('stroke', '#555')
  .attr('stroke-width', 0.35)
  .attr('stroke-opacity', 0.5)
  .style('cursor', 'pointer')
  .attr('cx', (d) => projection(d.geometry.coordinates)[0])
  .attr('cy', (d) => projection(d.geometry.coordinates)[1])
  .on('click', (event, d) => {
    highlight(event, d);
    showInfo(event, d);
  })
  .on('mouseover', (event, d) => showInfo(event, d));

nodes.exit().remove();

/* Draw the scale bar */

let scaleGroup = zoomableGroup
  .append('g')
  .attr('class', 'scale-group')
  .attr('transform', `translate(400,400)`);

const scaleBar = d3
  .geoScaleBar()
  .projection(projection)
  .size([width, height])
  .left(0.01)
  .top(0.98)
  .distance(1) // Sets the distance represented by the bar to 1000 km
  .tickFormat(d3.format(',')); // A formatter function adds a comma to "1,000"

const scaleLocation = scaleGroup.call(scaleBar);

const zoomed = (event) => {
  const transform = event.transform;

  const tr = projection([0, 0]);

  tile
    .scale(projection.scale() * Math.PI * 2 * transform.k)
    .translate([
      transform.k * tr[0] + transform.x,
      transform.k * tr[1] + transform.y,
    ]);

  tiles = tile();

  image = image
    .data(tiles, (d) => d)
    .join('image')
    .attr('xlink:href', (d) => url(d[0], d[1], d[2]))
    .attr('x', (d) => Math.round((d[0] + tiles.translate[0]) * tiles.scale))
    .attr('y', (d) => Math.round((d[1] + tiles.translate[1]) * tiles.scale))
    .attr('width', tiles.scale)
    .attr('height', tiles.scale)
    .style('opacity', 1);

  zoomableGroup.attr('transform', transform);

  scaleBar.zoomFactor(transform.k);

  scaleLocation.call(scaleBar);
};

// d3.zoom
const zoom = d3
  .zoom()
  .scaleExtent([1, 20])
  .translateExtent([
    [0, 0],
    [width, height],
  ])
  .on('zoom', zoomed);

// Call d3.zoom on your SVG element
svg.call(zoom);
svg.call(zoom.scaleTo, 1);
zoom.on('zoom', null); // Disable zoom until I fix it :D
