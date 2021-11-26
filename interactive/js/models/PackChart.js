import * as Config from '../Config.js';
import * as Layout from '../Layout.js';
import * as Tooltip from '../Tooltip.js';

// PackChart Class
export default class PackChart {
  constructor(_parentElement, geoCounties, graphNodes) {
    this.parentElement = _parentElement;
    this.geoCounties = geoCounties;
    this.graphNodes = graphNodes;

    this.initViz();
  }

  initViz() {
    var viz = this;

    viz.height = Config.height;
    viz.width = Config.width;

    viz.g = d3
      .select(viz.parentElement)
      .append('g')
      .attr('class', 'pack-group')
      .attr('opacity', 0);

    viz.setupData();
  }

  setupData() {
    var viz = this;

    let counties_list = {},
      countyCasesData = [];

    const groupedByCountySource = d3
      .nest()
      .key((d) => d.properties && d.properties.county)
      .key((d) => d.properties && d.properties.source_no)
      .entries(viz.graphNodes);
    groupedByCountySource.forEach((key) => (counties_list[key.key] = 1));

    // Create a list containing the counties, the cases and root
    countyCasesData.push({
      id: 'root',
      parent: '',
    });

    viz.geoCounties.forEach((d) => {
      if (counties_list[d.id] !== undefined) {
        return countyCasesData.push({
          id: d.id,
          parent: 'root',
          d: d,
        });
      }
    });

    let dict = {};
    viz.graphNodes.forEach((d) => (dict[d.name] = d));

    groupedByCountySource.forEach((key) => {
      if (key.key !== 'undefined') {
        let valuesArr = [...key['values']]
          .filter((d) => d.key !== 'null')
          .sort((a, b) => a.name - b.name);
        valuesArr.forEach((d) => {
          countyCasesData.push({
            id: d.key,
            parent: key.key,
            source_case: d,
            properties: dict[d.key].properties,
            value: d.values.length,
          });
        });
      }
    });

    // Stratify the list
    const root = d3
      .stratify()
      .id((d) => d.id)
      .parentId((d) => d.parent)(countyCasesData);
    root.sum((d) => d.value).sort((a, b) => b.value - a.value);

    // Pack
    const pack = d3
      .pack()
      .size([viz.width / 2, viz.height / 2])
      .padding(8);
    pack(root);

    // Define circles relations
    root.eachBefore((d) => {
      if (d.parent != null) {
        d.relx = d.x - d.parent.x;
        return (d.rely = d.y - d.parent.y);
      } else {
        d.relx = d.x;
        return (d.rely = d.y);
      }
    });
    root.eachBefore((d) => {
      if (d.parent != null && d.parent.id === 'root') {
        return (d.data.d.force.r = d.r);
      }
    });

    viz.dataFiltered = root;

    viz.updateViz();
  }

  updateViz() {
    var viz = this;

    if (viz.dataFiltered !== undefined) {
      let bubbles, en_bubbles, bubble_labels, en_bubble_labels;
      let language = d3.select('#language').node().value;

      viz.simulation = d3
        .forceSimulation()
        .force(
          'collision',
          d3
            .forceCollide()
            .radius((d) => d.radius)
            .strength(0.01)
        )
        .force(
          'attract',
          d3
            .forceAttract()
            .target((d) => [d.foc_x, d.foc_y])
            .strength(0.5)
        );

      // Draw the circle packs
      bubbles = viz.g
        .selectAll('.bubble')
        .data(viz.dataFiltered.descendants())
        .enter()
        .append('g')
        .each(function (d) {
          d.node = this;
        })
        .on('touchstart mouseover', Tooltip.hovered(true))
        .on('touchend mouseout', Tooltip.hovered(false));
      en_bubbles = bubbles
        .append('circle')
        .attr('class', 'bubble')
        .attr('r', (d) => d.r)
        .on('touchmove mouseover', (d) => Tooltip.highlight(d))
        .attr('fill', (d) =>
          d.parent && d.parent.id !== 'root'
            ? Layout.countyColor(d.parent.id)
            : '#E8E8E8'
        );
      bubble_labels = viz.g
        .selectAll('.labels')
        .data(viz.dataFiltered.leaves());
      en_bubble_labels = bubble_labels
        .enter()
        .append('g')
        .attr('class', 'labels');

      en_bubble_labels
        .append('text')
        .text((d) => d.value)
        .attr('dy', '0.35em');
      Layout.hideLabels(1);

      // Move the circles to their place
      viz.simulation.nodes(viz.geoCounties.map((d) => d.force)).stop();
      let i, j, ref;
      for (
        i = j = 0,
          ref = Math.ceil(
            Math.log(viz.simulation.alphaMin()) /
              Math.log(1 - viz.simulation.alphaDecay())
          );
        0 <= ref ? j < ref : j > ref;
        i = 0 <= ref ? ++j : --j
      ) {
        viz.simulation.tick();
      }
    }
  }
}
