// TODO: Create tiles and zoom level details

import { drag } from './helpers.js';

/* Global variables */
const padding = 10;
const width =
    window.innerWidth <= 360 ? 300 : window.innerWidth <= 960 ? 600 : 800,
  height = width;
let context, colorScale, rivers;
let transform = d3.zoomIdentity;

// Color scale
colorScale = d3
  .scaleQuantile()
  .domain([0, 1, 2, 3, 4, 5, 6, 7])
  .range([
    '#1b251d',
    '#403310',
    '#8e6035',
    '#99700a',
    '#ad8a38',
    '#be903b',
    '#feef8b',
  ]);

/* Map Legend */
const drawLegend = (rivers) => {
  const svg = d3
    .select('#legend')
    .append('svg')
    .attr('width', 150)
    .attr('height', height);

  let mapLegend = svg
    .append('g')
    .attr('class', 'map-legend')
    .attr('transform', `translate(50, 250)`);

  // Add sky gradient
  const defs = svg.append('defs');

  const gradient = defs
    .append('radialGradient')
    .attr('id', 'svgGradient')
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('r', '50%')
    .attr('y1', '0%');

  // gradient
  //   .append('stop')
  //   .attr('offset', '0%')
  //   .attr('style', 'stop-color:rgb(103,175,238);stop-opacity:1.00');
  gradient
    .append('stop')
    .attr('offset', '0%')
    .attr('style', 'stop-color:rgb(21,143,194);stop-opacity:1.00');
  gradient
    .append('stop')
    .attr('offset', '50%')
    .attr('style', 'stop-color:rgb(40,140,226);stop-opacity:1.00');
  // gradient
  //   .append('stop')
  //   .attr('offset', '100%')
  //   .attr('style', 'stop-color:rgb(9,108,196);stop-opacity:1.00');
  // gradient
  //   .append('stop')
  //   .attr('offset', '100%')
  //   .attr('style', 'stop-color:rgb(18,98,173);stop-opacity:1.00');

  mapLegend
    .append('rect')
    .attr('x', 0)
    .attr('y', -20)
    .attr('width', 150)
    .attr('height', 300)
    .style('fill', 'url(#svgGradient)')
    .style('stroke', '#dddddd');

  mapLegend
    .append('text')
    .attr('x', 10)
    .attr('y', 0)
    .style('fill', '#fff')
    .html('Order');

  const riversLegend = mapLegend
    .append('g')
    .attr('class', 'map-legend')
    .attr('transform', `translate(20, 30)`);

  const orderValues = rivers
    ? [...Array(d3.max(rivers.features, (d) => d.properties.ORDER)).keys()]
    : [0, 1, 2, 3, 4, 5, 6, 7];

  riversLegend
    .selectAll('circle')
    .data(orderValues)
    .enter()
    .append('circle')
    .attr('cy', (d, i) => i * 30)
    .attr('r', 5)
    .attr('fill', (d) => colorScale(d));

  riversLegend
    .selectAll('text')
    .data(orderValues)
    .enter()
    .append('text')
    .attr('y', (d, i) => i * 30 + 5)
    .attr('x', 20)
    .style('fill', '#fff')
    .style('font-size', '9px')
    .html((d) => d);
};

// Let sample legend for now, until faster rendering
drawLegend(rivers);

/* Load the data */
const promises = [
  d3.json('https://maptheclouds.com/data/rivers_channels_basin4326.geojson'),
];

Promise.all(promises)
  .then(([rivers]) => {
    // Legend
    drawLegend(rivers);

    // Let sample image for now, until faster rendering
    // drawGraph(rivers);
  })
  .catch((error) => console.log(error));

/* Render the canvas elements */
const render = ({ riverPath, rivers }) => {
  //Current transform properties
  transform = (d3.event && d3.event.transform) || transform;

  // Clean
  context.clearRect(0, 0, width, height);

  // Save
  context.save();

  // Move to current zoom
  context.translate(transform.x, transform.y);
  context.scale(transform.k, transform.k);

  // Background
  const grad = context.createRadialGradient(408, 216, 0, 408, 216, 427.8);

  grad.addColorStop(0, 'rgba(103, 175, 238, 1)');
  grad.addColorStop(0.25, 'rgba(21, 143, 194, 1)');
  grad.addColorStop(0.5, 'rgba(40, 140, 226, 1)');
  grad.addColorStop(0.75, 'rgba(9, 108, 196, 1)');
  grad.addColorStop(1, 'rgba(18, 98, 173, 1)');

  context.fillStyle = grad;
  context.fillRect(0, 0, width, height);

  // Draw the rivers
  rivers.features.forEach((river) => {
    context.beginPath();

    riverPath(river);

    context.lineWidth = 0.5 / (transform.k < 1 ? 1 : transform.k);
    context.strokeStyle = '#181e1d';
    context.stroke();

    if (river.properties.ORDER > 1) {
      context.fillStyle = colorScale(river.properties.ORDER);
      context.fill();
    }
  });

  // Restore
  context.restore();
};

/* Render geometries and set mouse and zoom actions */
const drawGraph = (rivers) => {
  // Color scale
  colorScale = d3
    .scaleQuantile()
    .domain(d3.extent(rivers.features, (d) => d.properties.ORDER))
    .range([
      '#1b251d',
      '#403310',
      '#8e6035',
      '#99700a',
      '#ad8a38',
      '#be903b',
      '#feef8b',
    ]);

  // Projection
  const projection = d3.geoMercator().fitSize([width, width], rivers);

  /* Set canvas context */
  context = d3
    .select('#chart')
    .append('canvas')
    .attr('width', width)
    .attr('height', height)
    .style('cursor', 'pointer')
    .node()
    .getContext('2d');

  projection.fitExtent(
    [
      [10, 10],
      [width - padding, height - padding],
    ],
    rivers
  );

  const riverPath = d3.geoPath(projection, context);

  const renderArgs = {
    riverPath,
    rivers,
  };

  d3.select(context.canvas)
    .call(
      drag(projection)
        .on('drag.render', () => render(renderArgs))
        .on('end.render', () => render(renderArgs))
    )
    .call(() => render(renderArgs));

  // d3.zoom
  let zoom = d3
    .zoom()
    .scaleExtent([0.1, 15])
    .on('zoom', () => render(renderArgs));

  // d3.select(context.canvas).call(zoom);
  d3.select(context.canvas).call(zoom.scaleTo, 6);
};
