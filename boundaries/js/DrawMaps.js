import * as Config from './Config.js';
import * as Utils from './Utils.js';

// draw the Non-Contiguous cartogram based on number of votes from the geographic data
export const drawNonCont = (votesStats, layer, svg) => {
  // https://strongriley.github.io/d3/ex/cartogram.html

  const geoData = votesStats.formattedData;
  var geojsonFeatures = topojson.feature(geoData, {
    type: 'GeometryCollection',
    geometries: geoData.objects[layer].geometries,
  });
  const thisMapPath = d3
    .geoPath()
    .projection(
      Config.projection.fitSize([Config.width, Config.height], geojsonFeatures)
    );

  const nodes = topojson.feature(geoData, geoData.objects[layer]).features;
  nodes.forEach((d) => {
    d.properties.joined.totalValidVotesScale = Math.sqrt(
      d.properties.joined.totValidVotes / 300000
    );
    d.properties.joined.totValidVotes_rate =
      Math.ceil(
        d.properties.joined.totValidVotes /
          d.properties.joined.totalValidVotesScale
      ) || 0;
  });

  svg
    .append('g')
    .attr('class', 'black')
    .selectAll('path')
    .data(nodes)
    .enter()
    .append('path')
    .attr('d', thisMapPath);
  svg
    .append('g')
    .attr('class', 'land')
    .selectAll('path')
    .data(nodes)
    .enter()
    .append('path')
    .attr('d', thisMapPath);

  svg
    .append('g')
    .attr('class', 'white')
    .selectAll('path')
    .data(nodes)
    .enter()
    .append('path')
    .attr('fill', (d) => Utils.colorLayers(d))
    .attr('transform', (d) => {
      const centroid = thisMapPath.centroid(d),
        x = centroid[0],
        y = centroid[1];
      return (
        `translate(${x},${y})` +
        `scale(${d.properties.joined.totalValidVotesScale || 0.6})` +
        `translate(${-x},${-y})`
      );
    })
    .attr('d', thisMapPath)
    .attr('class', (d) => `CO-${d.properties.joined.code}`)
    .on('mouseover', (d) => Utils.highlight(d))
    .on('mouseout', (d) => Utils.unHighlight(d));

  const labels = svg
    .selectAll('.feature-label')
    .data(nodes)
    .enter()
    .append('text')
    .attr('class', 'feature-label')
    .attr('transform', (d) => `translate(${thisMapPath.centroid(d)})`)
    .attr('dy', '.35em')
    .text((d) => d.properties.joined.districtAbbr);
};
