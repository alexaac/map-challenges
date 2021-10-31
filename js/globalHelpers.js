export const responsivefy = (svg) => {
  if (svg.node()) {
    // https://brendansudol.com/writing/responsive-d3
    const container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style('width'), 10),
      height = parseInt(svg.style('height'), 10),
      aspect = width / height;

    const resize = () => {
      const targetWidth = parseInt(container.style('width'));
      svg.attr('width', targetWidth);
      svg.attr('height', Math.round(targetWidth / aspect));
    };

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMid')
      .call(resize);

    d3.select(window).on('resize.' + container.attr('id'), resize);
  }
};

export const tooltip_div = d3
  .select('body')
  .append('tooltip_div')
  .attr('class', 'tooltip')
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

export const highlight = (d) => {
  let mapId = d.data.key;

  d3.selectAll('.link').style('stroke', '#d6d6d6');

  d3.select('#CO-' + mapId).attr('r', (d) => 10);
  d3.selectAll('.CO-links-' + mapId)
    .style('stroke', 'firebrick')
    .transition()
    .duration(200)
    .attr('stroke-dashoffset', 0)
    .style('opacity', 1);
};

export const showInfo = (d) => {
  let left = d3.event.pageX - 20;
  let top = d3.event.pageY + 20;

  if (window.innerWidth - left < 150) {
    left = d3.event.pageX - 40;
  }

  tooltip_div.transition().duration(200).style('opacity', 0.9);

  tooltip_div.select('.tooltip__text').html(() => {
    let examples = d.data.examples
      ? `${d.data.examples
          .map(
            (example) => `<a href="${example}" target="_blank">${example}</a>`
          )
          .join('<br />')}`
      : '';
    return `<strong>${d.data.title}</strong> <br />
          ${
            d.data.description
              ? d.data.description.replace(/\n/g, '<br />')
              : ''
          } <br />
          ${examples}`;
  });
  tooltip_div
    .style('left', left + 'px')
    .style('top', top + 'px')
    .style('display', null);
};

export const zoomed = (event) => {
  const zoomableGroup = d3.select('.zoomable-group');

  zoomableGroup.attr('transform', event.transform);

  let scale = event.transform.k;

  if (scale > 1.3) {
    zoomableGroup
      .selectAll('.node-labels > text')
      .attr('transform', 'scale(' + 1 / scale + ')');
    zoomableGroup
      .selectAll('.node-icons')
      .attr('width', `${50 / scale}`)
      .attr('height', `${50 / scale}`);
  }
  if (scale > 2) {
    zoomableGroup
      .selectAll('.node-labels > text')
      .attr('transform', 'scale(' + 2 / scale + ')');
    zoomableGroup
      .attr('width', `${200 / scale}`)
      .attr('height', `${200 / scale}`);
  }
};

export const zoomGraph = d3
  .zoom()
  .scaleExtent([0.001, 20])
  .on('zoom', (event) => zoomed(event));
