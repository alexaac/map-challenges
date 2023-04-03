/* Scales */

const isMobile = window.innerWidth < 703;

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
    .attr('width', isMobile ? window.innerWidth - 20 : 250)
    .attr('height', isMobile ? 350 : 710);

  let mapLegend = svg
    .append('g')
    .attr('class', 'map-legend')
    .attr('transform', `translate(0, 10)`);

  mapLegend
    .append('rect')
    .attr('x', 0)
    .attr('y', -20)
    .attr('width', isMobile ? window.innerWidth : 250)
    .attr('height', isMobile ? 350 : 710)
    .style('fill', '#f9fbfa')
    .style('stroke', '#f9fbfa');

  // mapLegend
  //   .append('text')
  //   .attr('x', 10)
  //   .attr('y', 20)
  //   .style('fill', '#757575')
  //   .html('Land use');

  const firstColumnData = legendData[0].slice(0, legendData[0].length / 2);
  const secondColumnData = legendData[0].slice(legendData[0].length / 2);

  console.log(legendData[0]);
  console.log(firstColumnData);
  console.log(secondColumnData);

  if (isMobile) {
    const landLegend = mapLegend
      .append('g')
      .attr('class', 'map-legend')
      .attr('transform', `translate(10, 0)`);

    landLegend
      .selectAll('rect')
      .data(firstColumnData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 15)
      .attr('width', 10)
      .attr('height', 5)
      .attr('fill', (d) => colorScale(d.code));

    landLegend
      .selectAll('text')
      .data(firstColumnData)
      .enter()
      .append('text')
      .attr('y', (d, i) => i * 15 + 5)
      .attr('x', 20)
      .style('fill', '#757575')
      .style('font-size', '9px')
      .html((d) => d.label);

    const landLegend2 = mapLegend
      .append('g')
      .attr('class', 'map-legend')
      .attr('transform', `translate(250, 0)`);

    landLegend2
      .selectAll('rect')
      .data(secondColumnData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 15)
      .attr('width', 10)
      .attr('height', 5)
      .attr('fill', (d) => colorScale(d.code));

    landLegend2
      .selectAll('text')
      .data(secondColumnData)
      .enter()
      .append('text')
      .attr('y', (d, i) => i * 15 + 5)
      .attr('x', 20)
      .style('fill', '#757575')
      .style('font-size', '9px')
      .html((d) => d.label);
  } else {
    const landLegend = mapLegend
      .append('g')
      .attr('class', 'map-legend')
      .attr('transform', `translate(10, 20)`);

    landLegend
      .selectAll('rect')
      .data(legendData[0])
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 15)
      .attr('width', 10)
      .attr('height', 5)
      .attr('fill', (d) => colorScale(d.code));

    landLegend
      .selectAll('text')
      .data(legendData[0])
      .enter()
      .append('text')
      .attr('y', (d, i) => i * 15 + 5)
      .attr('x', 20)
      .style('fill', '#757575')
      .style('font-size', '9px')
      .html((d) => d.label);
  }
};

export { drawLegend };
