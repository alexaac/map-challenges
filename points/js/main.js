import {
  formatNumber,
  findCityAtMapClick,
  drawLegend,
  popScale,
  colorScale,
  drag,
} from './helpers.js';

/* Global variables */
let context, width, height, selected;
let transform = d3.zoomIdentity;

// Constants
const PROJECTIONNAME = 'geoOrthographic';
const SPHERE = { type: 'Sphere' };

/* Map Legend */
drawLegend();

/* Load the data */
const promises = [
  d3.json('../data/ne_50m_admin_0_countries.json'),
  d3.json('data/ne_10m_populated_places_simple.geojson'),
];

Promise.all(promises)
  .then((data) => {
    const countriesData = data[0];
    const citiesData = data[1];

    // Projection
    const projection = d3[PROJECTIONNAME]().precision(0.1);

    // Set dimensions
    const padding = 10;
    width = 800;
    const getHeight = () => {
      const [[x0, y0], [x1, y1]] = d3
        .geoPath(projection.fitWidth(width, SPHERE))
        .bounds(SPHERE);

      const dy = Math.ceil(y1 - y0),
        l = Math.min(Math.ceil(x1 - x0), dy);

      projection.scale((projection.scale() * (l - 1)) / l).precision(0.2);

      return dy;
    };
    height = getHeight();

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
      citiesData
    );

    const path = d3.geoPath(projection, context);

    drawGraph(projection, path, countriesData, citiesData);
  })
  .catch((error) => console.log(error));

/* Render the canvas elements */
const render = ({
  projection,
  path,
  cityPath,
  graticule,
  graticulePath,
  countries,
  citiesData,
}) => {
  //Current transform properties
  transform = (d3.event && d3.event.transform) || transform;

  // City path
  cityPath.pointRadius(
    (d) => popScale(d.properties.pop_max) / (transform.k < 1 ? 1 : transform.k)
  );

  // Clean
  context.clearRect(0, 0, width, height);

  // Save
  context.save();

  // Move to current zoom
  context.translate(transform.x, transform.y);
  context.scale(transform.k, transform.k);

  // // Background
  // context.fillStyle = '#000';
  // context.fillRect(0, 0, width, height);

  // Sphere fill
  context.beginPath(),
    path(SPHERE),
    (context.fillStyle = '#000'),
    context.fill();

  // Draw the Sea
  context.lineWidth = 1.5;
  context.fillStyle = '#000';
  context.beginPath(),
    context.arc(400, 400, 400, 0, 2 * Math.PI),
    context.fill(),
    context.stroke();

  // Draw the Graticule
  context.lineWidth = 1 / (transform.k < 1 ? 1 : transform.k);
  context.beginPath(),
    graticulePath(graticule),
    (context.strokeStyle = '#023333'),
    context.stroke();

  // Draw the countries
  context.lineWidth = 0.35 / (transform.k < 1 ? 1 : transform.k);
  context.fillStyle = '#1e2b42';
  context.strokeStyle = '#164db3';
  context.beginPath(), path(countries), context.fill(), context.stroke();

  // Draw the cities
  citiesData.features.forEach((city) => {
    context.beginPath();

    cityPath(city);

    context.lineWidth = 0.5 / (transform.k < 1 ? 1 : transform.k);
    context.strokeStyle = '#000';
    context.stroke();

    context.fillStyle = colorScale(city.properties.pop_max);
    context.fill();
  });

  // Sphere boundary
  context.lineWidth = 0.35 / (transform.k < 1 ? 1 : transform.k);
  context.beginPath(), path(SPHERE), context.stroke();

  // Highlight selected city
  if (selected && transform.k === 1) {
    // city
    context.beginPath();

    cityPath(selected);

    context.fillStyle = '#00ffff';

    context.fill();

    // label
    context.beginPath();

    context.font = 'bold 12px serif';

    const labelXY = projection(selected.geometry.coordinates);
    const labelOffset = 10;
    const name = `${selected.properties.name}, ${
      selected.properties.adm0name
    } - ${formatNumber(selected.properties.pop_max)}`;

    context.lineWidth = 4 / (transform.k < 1 ? 1 : transform.k);
    context.lineJoin = 'round';
    context.strokeText(
      name,
      labelXY[0] + labelOffset,
      labelXY[1] - labelOffset
    );
    context.globalCompositeOperation = 'source-over';
    context.fillText(name, labelXY[0] + labelOffset, labelXY[1] - labelOffset);
  }

  // Restore
  context.restore();
};

/* Rotate and center map to the selected city */
const transition = (p, renderArgs) => {
  // Mutates projection
  const {
    projection,
    path,
    cityPath,
    graticule,
    graticulePath,
    countries,
    citiesData,
  } = renderArgs;

  d3.transition()
    .duration(850)
    .tween('rotate', function () {
      var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);

      return function (t) {
        projection.rotate(r(t));

        projection.clipAngle(180);

        projection.clipAngle(90);

        render({
          projection,
          path,
          cityPath,
          graticule,
          graticulePath,
          countries,
          citiesData,
        });
      };
    })
    .transition();
};

/* Render geometries and set mouse and zoom actions */
const drawGraph = (projection, path, countriesData, citiesData) => {
  const cityPath = d3.geoPath(projection, context);
  const graticule = d3.geoGraticule10();
  const graticulePath = d3.geoPath(projection, context);
  const countries = topojson.feature(countriesData, {
    type: 'GeometryCollection',
    geometries: countriesData.objects['ne_50m_admin_0_countries'].geometries,
  });

  const renderArgs = {
    projection,
    path,
    cityPath,
    graticule,
    graticulePath,
    countries,
    citiesData,
  };

  d3.select(context.canvas)
    .call(
      drag(projection)
        .on('start.render', mapClick)
        .on('drag.render', () => render(renderArgs))
        .on('end.render', () => render(renderArgs))
    )
    .call(() => render(renderArgs));

  // // d3.zoom - TODO remove at some point
  // let zoom = d3
  //   .zoom()
  //   .scaleExtent([0.1, 15])
  //   .on('zoom', () => render(projection));
  // d3.select(context.canvas).call(zoom);
  // d3.select(context.canvas).call(zoom.scaleTo, 2);

  // Use d3.geoZoom to zoom
  d3
    .geoZoom()
    .projection(projection)
    .onMove(() => render(renderArgs))(context.canvas);

  /* Get coordinates at mouse click, transform them into 
     geographic coordinates and search nearest cities */
  function mapClick() {
    // Can't apply transformations unless scale 1
    if (transform.k !== 1) return;

    var mousePos = d3.mouse(this);
    var p = projection.invert(mousePos);

    if (p == undefined || !p[0] || !p[1]) {
      return false;
    }

    const city = findCityAtMapClick(mousePos, width, height, renderArgs);

    if (city) {
      selected = city;

      // Mutates projection - TODO try to use pure functions
      transition(city.geometry.coordinates, renderArgs);
    }
  }
};
