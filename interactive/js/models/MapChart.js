import * as Config from '../Config.js';
import * as Tooltip from '../Tooltip.js';

// MapChart Class
export default class MapChart {
  constructor(_parentElement, geoCounties, geojsonFeatures) {
    this.parentElement = _parentElement;
    this.geoCounties = geoCounties;
    this.geojsonFeatures = geojsonFeatures;

    this.initViz();
  }

  initViz() {
    var viz = this;

    viz.height = Config.height;
    viz.width = Config.width;

    viz.g = d3
      .select(viz.parentElement)
      .append('g')
      .attr('class', 'map-features')
      .attr('opacity', 1);

    viz.setupData();
  }

  setupData() {
    var viz = this;

    viz.dataFiltered = viz.geoCounties;

    viz.updateViz();
  }

  updateViz() {
    var viz = this;

    if (viz.dataFiltered !== undefined) {
      const thisMapPath = d3
        .geoPath()
        .projection(
          Config.projection.fitSize(
            [viz.width, viz.height],
            viz.geojsonFeatures
          )
        );

      const mapFeatures = viz.g
        .selectAll('path')
        .data(viz.dataFiltered)
        .enter()
        .append('path')
        .attr('d', thisMapPath)
        .attr('class', 'land')
        .on('touchstart click', () => Tooltip.hideTooltip());

      mapFeatures.append('title').text((d) => d.id);
    }
  }
}
