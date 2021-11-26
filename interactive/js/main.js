import * as Config from './Config.js';
import * as Tooltip from './Tooltip.js';
import * as Draw from './Draw.js';
import * as Layout from './Layout.js';

import MapChart from './models/MapChart.js';
import PackChart from './models/PackChart.js';

let graph = { nodes: [], links: [] };
let svg, casesData, geoData, layer, geoCounties, geojsonFeatures;

let legendStatus = false,
  infoStatus = true,
  searchStatus = true;

// Switch the language to english/romanian
let language = d3.select('#language').node().value;
let countiesSource =
  language === 'ro' ? 'data/judete_wgs84.json' : 'data/judete_wgs84.json';

let mapChart, packChart;

const responsivefy = (svg) => {
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
};

(() => {
  // Options for loading spinner
  let opts = {
      lines: 9,
      length: 4,
      width: 5,
      radius: 12,
      scale: 1,
      corners: 1,
      color: '#f40000',
      opacity: 0.25,
      rotate: 0,
      direction: 1,
      speed: 1,
      trail: 30,
      fps: 20,
      zIndex: 2e9,
      className: 'spinner',
      shadow: false,
      hwaccel: false,
      position: 'absolute',
    },
    target = document.getElementById('spinner'),
    spinner;

  spinner = new Spinner(opts).spin(target);

  // Load data
  const promises = [
    d3.json(countiesSource),
    d3.json('./data/cases_relations.json'),
    // d3.json('https://covid19.geo-spatial.org/api/statistics/getCaseRelations'),
  ];

  Promise.all(promises)
    .then((data) => {
      geoData = data[0];
      casesData = data[1];

      setupGraph();
      drawGraph();
      spinner.stop();
      setActions();
    })
    .catch((error) => console.log(error));

  const setupGraph = () => {
    graph.nodes = casesData.data.nodes;

    layer = 'judete_wgs84';
    geoCounties = topojson.feature(geoData, geoData.objects[layer]).features;
    geojsonFeatures = topojson.feature(geoData, {
      type: 'GeometryCollection',
      geometries: geoData.objects[layer].geometries,
    });

    let fit = Config.projection.fitSize(
      [Config.width, Config.height],
      geojsonFeatures
    );

    geoCounties.forEach((d) => {
      let county = d.properties.county;
      d.id = county;
      d.centroid = fit([d.properties.lon, d.properties.lat]);
      // Set force for group by county
      d.force = {};
      d.force.x = d.centroid[0];
      d.force.y = d.centroid[1];
      d.force.foc_x = d.centroid[0];
      d.force.foc_y = d.centroid[1];
    });
  };

  const drawGraph = () => {
    // Append the svg object to the chart div
    svg = d3
      .select('#chart')
      .append('svg')
      .attr('class', 'chart-group')
      // .attr('preserveAspectRatio', 'xMinYMin')
      .attr('width', Config.svg_width)
      .attr('height', Config.svg_height)
      // .attr('viewBox', '0, 0 ' + Config.width + ' ' + Config.height);
      .call(responsivefy);

    // Append zoomable group
    svg
      .append('g')
      .attr('class', 'zoomable-group')
      .attr(
        'transform',
        `translate(${Config.margin.left}, ${Config.margin.top})`
      );

    // Set object for map
    mapChart = new MapChart('.zoomable-group', geoCounties, geojsonFeatures);

    // Set object for clusters
    packChart = new PackChart('.zoomable-group', geoCounties, graph.nodes);
  };

  const setActions = () => {
    // Add legends
    Layout.createLegend(
      Layout.countyColor,
      900,
      1100,
      'county-legend',
      language === 'ro' ? 'Județ' : 'County'
    );

    // Zoom by scroll
    d3.select('#zoom-in').on('click', () =>
      svg.transition().call(Layout.zoom.scaleBy, 2)
    );
    d3.select('#zoom-out').on('click', () =>
      svg.transition().call(Layout.zoom.scaleBy, 0.5)
    );
    d3.select('#reset-zoom').on('click', () => Layout.resetZoom());

    // Apply zoom handler and zoom out
    svg.call(Layout.zoom);
    Layout.resetZoom();

    // Toggle between map clusters and pack
    Layout.showMapClusters(graph);
    Draw.MapCirclesPack();
    d3.select('#show-map-clusters').on('click', () => {
      d3.selectAll('.land').attr('opacity', 1);
      Draw.MapCirclesPack();
    });
    d3.select('#show-clusters').on('click', () => {
      d3.selectAll('.land').attr('opacity', 0.5);
      Draw.GroupCirclesPack();
    });

    // Change colors from status to counties and vice versa
    d3.select('#color-counties').on('click', () => Layout.colorCounties());

    // Toggle the legend
    const toggleLegend = () => {
      if (legendStatus === true) {
        d3.select('#legend-div').classed('hide', true);
        legendStatus = false;
      } else {
        d3.select('#legend-div').classed('hide', false);
        legendStatus = true;
      }
    };
    d3.select('#legend-div').classed('hide', true);
    d3.select('#toggle-legend').on('click', () => toggleLegend());

    // Highlight and pan to searched Id
    d3.select('#search-case').on('click', () => {
      if (searchStatus === true) {
        d3.select('#search-input').classed('hide', false);
        searchStatus = false;
      } else {
        d3.select('#search-input').classed('hide', true);
        searchStatus = true;
      }
    });

    // General page info
    d3.select('#show-info').on(
      'click',
      () => (infoStatus = Tooltip.toggleInfo(infoStatus, language))
    );
    // d3.select('#show-info').dispatch('click');

    // Draw counties map
    mapChart.setupData();

    // Define the secondary simulation, for county groups
    packChart.setupData();

    d3.select('tooltip_div').classed('tooltip-abs', true);
  };
}).call(this);
