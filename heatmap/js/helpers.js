/* Scales */
const citiesScales = [
  {
    popScale: -100,
    popRange: 1,
    colorRange: 'rgba(100, 149, 237, 0.8)',
    label: '> 0',
  },
  {
    popScale: 623997,
    popRange: 3,
    colorRange: 'rgba(255, 255, 255, 0.8)',
  },
  {
    popScale: 2362000,
    popRange: 4,
    colorRange: 'rgba(252, 255, 108, 0.8)',
  },
  {
    popScale: 7243000,
    popRange: 7,
    colorRange: 'rgba(255, 180, 57, 0.8)',
  },
  {
    popScale: 19040000,
    popRange: 9,
    colorRange: 'rgba(255, 64, 57, 0.8)',
  },
];

// Population scale - intervals taken from QGIS symbology - natural jenks
const popScale = d3
  .scaleLinear()
  .domain(citiesScales.map((scale) => scale.popScale))
  // .domain(d3.extent(citiesData.features, (d) => d.properties.pop_max))
  .range(citiesScales.map((scale) => scale.popRange));

// Color scale
const colorScale = d3
  .scaleLinear()
  .domain(citiesScales.map((scale) => scale.popScale))
  .range(citiesScales.map((scale) => scale.colorRange));

const drawLegend = () => {
  const svg = d3
    .select('#legend')
    .append('svg')
    .attr('width', 150)
    .attr('height', 800);

  let mapLegend = svg
    .append('g')
    .attr('class', 'map-legend')
    .attr('transform', `translate(50, 250)`);

  mapLegend
    .append('rect')
    .attr('x', 0)
    .attr('y', -20)
    .attr('width', 150)
    .attr('height', 300)
    .style('fill', '#1e2b42')
    .style('stroke', '#dddddd');

  mapLegend
    .append('text')
    .attr('x', 10)
    .attr('y', 0)
    .style('fill', '#fff')
    .html('Population');

  const citiesLegend = mapLegend
    .append('g')
    .attr('class', 'map-legend')
    .attr('transform', `translate(20, 30)`);

  citiesLegend
    .selectAll('circle')
    .data(citiesScales)
    .enter()
    .append('circle')
    .attr('cy', (d, i) => i * 50)
    .attr('r', (d) => popScale(d.popScale))
    .attr('fill', (d) => colorScale(d.popScale));

  citiesLegend
    .selectAll('text')
    .data(citiesScales)
    .enter()
    .append('text')
    .attr('y', (d, i) => i * 50 + 5)
    .attr('x', 20)
    .style('fill', '#fff')
    .style('font-size', '9px')
    .html((d) => d.label);
};

export { drawLegend };
