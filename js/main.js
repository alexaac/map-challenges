import { responsivefy } from './globalHelpers.js';

// set the dimensions and margins of the diagram
const margin = { top: 0, right: 0, bottom: 0, left: 0 },
  width = 1000 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('class', 'chart-group')
  .attr('width', width)
  .attr('height', height)
  .call(responsivefy);

const chartGroup = svg
  .append('g')
  .attr('class', 'zoomable-group')
  .attr('transform', (d) => `translate(${[width / 2, height / 2]})`);

const zoom = d3.zoom().on('zoom', function (event) {
  const currentZoom = `translate(${width / 2 + event.transform.x} ${
    height / 2 + event.transform.y
  }) scale(${event.transform.k})`;

  // rescale positions and dots
  chartGroup.attr('transform', currentZoom); // transform view
});

svg.call(zoom);

const tree = d3
  .tree()
  .size([width / 3, height / 3]) // angle in degrees
  .separation((a, b) => (a.parent == b.parent ? 1 : 2) / (a.depth * a.depth));

// Get the data
d3.json('data/categories.json').then(function (data) {
  // generates hierarchy data
  let root = d3
    .stratify()
    .id(function (d) {
      return d.name;
    })
    .parentId(function (d) {
      return d.parent;
    })(data);

  root = tree(root).count(); // add value

  drawHierarchy(root);
});

const drawHierarchy = (root) => {
  const nodes = root.descendants();
  const links = root.links();

  const colorScale = d3
    .scaleOrdinal(d3.schemeCategory10)
    .domain(d3.extent(nodes, (n) => n.height));

  const radialLink = d3
    .linkRadial()
    .angle((d) => (d.x * Math.PI) / 180 + Math.PI / 2)
    .radius((d) => d.y);

  drawLinks();
  drawNodes();
  drawLabels();

  function highlightPath(event, node) {
    const steps = node.path(root); // could also be ancestors()

    const links = root.links().filter((d) => steps.indexOf(d.target) >= 0);

    d3.selectAll('.node').classed('highlighted', (d) => steps.indexOf(d) >= 0);
    d3.selectAll('.node').classed('faded', (d) => steps.indexOf(d) < 0);

    d3.selectAll('.link').classed('faded', (d) => steps.indexOf(d.target) < 0);
    d3.selectAll('.link').classed(
      'highlighted',
      (d) => steps.indexOf(d.target) >= 0
    );
  }

  function reset() {
    d3.selectAll('.node, .link').classed('faded highlighted', false);
  }

  function drawLinks() {
    chartGroup
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('d', radialLink)
      .style('stroke', '#d6d6d6')
      .style('fill', 'none')
      .style('cursor', 'pointer')
      .style(
        'stroke-width',
        (d) => (d.target.height + 1) * (d.target.height + 1)
      )
      .style('opacity', (d) => d.target.depth * 0.25 * 0.6 + 0.4);
  }

  function drawNodes() {
    chartGroup
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `rotate(${d.x}) translate(${d.y})`)
      .append('circle')
      .attr('r', (d) => (d.height + 3) * 5)
      .style('fill', (d) => colorScale(d.height))
      .style('stroke-linecap', 'round')
      .style('stroke-linejoin', 'round')
      .style('stroke', (d) => (d.data.finished ? 'green' : 'grey'))
      .style('stroke-width', (d) => (d.data.finished ? '6px' : '1px'))
      .style('pointer-events', (d) => (d.data.finished ? 'all' : 'none'))
      .on('mouseover', (event, d) => highlightPath(event, d))
      .on('mouseout', reset)
      .on('click', (event, d) =>
        d.data.finished ? window.open(`./${d.data.name}`) : ''
      );
  }

  function drawLabels() {
    chartGroup
      .selectAll('g.node')
      .append('text')
      .text((d) => d.data.title)
      .attr('fill', 'black')
      .attr('transform', (d) =>
        d.height == 0
          ? `rotate(0) translate(19,5)`
          : `rotate(${-d.x}) translate(0,5)`
      )
      .style('text-anchor', (d) => (d.height != 0 ? 'middle' : 'start'))
      .style('font-size', (d) => 14 + d.height * d.height)
      .style('color', '#d6d6d6')
      .style('pointer-events', 'none');
  }
};
