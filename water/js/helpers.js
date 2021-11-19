/* Scales */

const drawLegend = async () => {
  const legendData = await Promise.all([d3.csv('data/legend.csv')]);

  const codes = legendData[0].map((item) => item.code);
  const colors = legendData[0].map(
    (item) => `rgba(${item.r},${item.g},${item.b},${item.a})`
  );

  console.log(legendData);
  console.log(colors);
  console.log(codes);

  // Color scale
  const colorScale = d3.scaleOrdinal().domain(codes).range(colors);

  console.log(colorScale);
  const svg = d3
    .select('#legend')
    .append('svg')
    .attr('width', 100)
    .attr('height', 500);

  let mapLegend = svg
    .append('g')
    .attr('class', 'map-legend')
    .attr('transform', `translate(20, 50)`);

  mapLegend
    .append('rect')
    .attr('x', 0)
    .attr('y', -20)
    .attr('width', 100)
    .attr('height', 500)
    .style('fill', '#f7f2f2')
    .style('stroke', '#f7f2f2');

  mapLegend
    .append('text')
    .attr('x', 10)
    .attr('y', 20)
    .style('fill', '#757575')
    .html('Temp °C');

  const landLegend = mapLegend
    .append('g')
    .attr('class', 'map-legend')
    .attr('transform', `translate(10, 40)`);

  landLegend
    .selectAll('rect')
    .data(legendData[0])
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', (d, i) => i * 30)
    .attr('width', 10)
    .attr('height', 5)
    .attr('fill', (d) => colorScale(d.code));

  landLegend
    .selectAll('text')
    .data(legendData[0])
    .enter()
    .append('text')
    .attr('y', (d, i) => i * 30 + 5)
    .attr('x', 20)
    .style('fill', '#757575')
    .style('font-size', '9px')
    .html((d) => d.label);
};

export { drawLegend };
