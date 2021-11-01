import { quadtree } from 'https://cdn.skypack.dev/d3-quadtree@3';

let transform = d3.zoomIdentity;

let worldData, label, citiesData, earth, path;

const projectionName = 'geoOrthographic';
const projection = d3[projectionName]().precision(0.1);

const sphere = { type: 'Sphere' };

const padding = 10;

const width = 800;
const getHeight = () => {
  const [[x0, y0], [x1, y1]] = d3
    .geoPath(projection.fitWidth(width, sphere))
    .bounds(sphere);

  const dy = Math.ceil(y1 - y0),
    l = Math.min(Math.ceil(x1 - x0), dy);

  projection.scale((projection.scale() * (l - 1)) / l).precision(0.2);

  return dy;
};

const height = getHeight();

// Canvas context
const context = d3
  .select('#chart')
  .append('canvas')
  .attr('width', width)
  .attr('height', height)
  .style('cursor', 'pointer')
  .node()
  .getContext('2d');

// Load data
const promises = [
  d3.json('../data/ne_50m_land.json'),
  d3.json('../data/ne_50m_geography_regions_points.geojson'),
  d3.json('data/ne_10m_populated_places_simple.geojson'),
];

Promise.all(promises)
  .then((data) => {
    worldData = data[0];
    citiesData = data[2];

    earth = topojson.feature(worldData, {
      type: 'GeometryCollection',
      geometries: worldData.objects['ne_50m_land'].geometries,
    });

    projection.fitExtent(
      [
        [10, 10],
        [width - padding, height - padding],
      ],
      citiesData
    );

    path = d3.geoPath(projection, context);

    drawGraph();
  })
  .catch((error) => console.log(error));

const drawGraph = () => {
  const graticule = d3.geoGraticule10();

  const popScale = d3
    .scaleLinear()
    .domain([-100, 623997, 2362000, 7243000, 19040000, 35676000])
    // .domain(d3.extent(citiesData.features, (d) => d.properties.pop_max))
    .range([1, 3, 4, 5, 7, 9]);

  const colorScale = d3
    .scaleLinear()
    .domain([-100, 623997, 2362000, 7243000, 19040000, 35676000])
    .range(['#6495ed', '#fff', '#fcff6c', '#ffb439', 'ffe96c', '#ff4039']);

  const graticulePath = d3.geoPath(projection, context);
  const cityPath = d3.geoPath(projection, context);

  function render() {
    transform = (d3.event && d3.event.transform) || transform;

    cityPath.pointRadius(
      (d) =>
        popScale(d.properties.pop_max) / (transform.k < 1 ? 1 : transform.k)
    );

    context.clearRect(0, 0, width, height);

    context.save();
    context.translate(transform.x, transform.y);
    context.scale(transform.k, transform.k);

    // context.fillStyle = '#000';
    // context.fillRect(0, 0, width, height);

    // sphere fill
    context.beginPath(),
      path(sphere),
      (context.fillStyle = '#000'),
      context.fill();

    // draw the Sea
    context.lineWidth = 1.5;
    context.fillStyle = '#000';
    context.beginPath(),
      context.arc(400, 400, 400, 0, 2 * Math.PI),
      context.fill(),
      context.stroke();

    // graticule
    context.lineWidth = 1 / (transform.k < 1 ? 1 : transform.k);
    context.beginPath(),
      graticulePath(graticule),
      (context.strokeStyle = '#023333'),
      context.stroke();

    // draw the Land
    context.lineWidth = 0.35;
    context.fillStyle = '#1e2b42';
    context.beginPath(), path(earth), context.fill(), context.stroke();

    // cities
    citiesData.features.forEach((city) => {
      context.beginPath();

      cityPath(city);

      context.fillStyle = colorScale(city.properties.pop_max);

      context.fill();
    });

    // sphere boundary
    context.beginPath(), path(sphere), context.stroke();

    // current label

    if (label && transform.k === 1) {
      // city
      context.beginPath();

      cityPath(label);

      context.fillStyle = 'cyan';

      context.fill();

      // label
      context.beginPath();

      const labelXY = projection(label.geometry.coordinates);
      const labelOffset = 10;
      const name = `${label.properties.name}, ${label.properties.adm0name}`;
      // const name = `${label.properties.name}, ${label.properties.adm0name} - pop ${label.properties.pop_max}`;

      context.fillStyle = 'cyan';
      context.lineWidth = 2 / (transform.k < 1 ? 1 : transform.k);
      context.lineJoin = 'round';
      context.strokeText(
        name,
        labelXY[0] + labelOffset,
        labelXY[1] - labelOffset
      );
      context.globalCompositeOperation = 'source-over';
      context.fillText(
        name,
        labelXY[0] + labelOffset,
        labelXY[1] - labelOffset
      );
    }

    context.restore();
  }

  d3.select(context.canvas)
    .call(
      drag(projection)
        .on('start.render', onMapClick)
        .on('drag.render', () => render())
        .on('end.render', () => render())
    )
    .call(() => render());

  let zoom = d3
    .zoom()
    .scaleExtent([0.1, 15])
    .on('zoom', () => render());

  d3.select(context.canvas).call(zoom);

  function onMapClick() {
    // Can't apply transformations unless scale 1
    if (transform.k !== 1) return;

    var mousePos = d3.mouse(this);
    var p = projection.invert(mousePos);

    if (p == undefined || !p[0] || !p[1]) {
      return false;
    }

    showLabel(mousePos);
  }

  const showLabel = (mousePos) => {
    const tree = quadtree()
      .extent([
        [-1, -1],
        [width + 1, height + 1],
      ])
      .x((d) => d.geometry.coordinates[0])
      .y((d) => d.geometry.coordinates[1])
      .addAll(citiesData.features);

    const found = search(tree, mousePos);

    if (found[0]) {
      label = found[0];

      transition(found[0].geometry.coordinates);
      // d3.select(context.canvas).call(zoom.scaleTo, 2);
    }
  };

  function search(quadtree, mousePos) {
    const [xmin, xmax, ymin, ymax] = [
      projection.invert([mousePos[0], mousePos[1]])[0] - 0.5,
      projection.invert([mousePos[0], mousePos[1]])[0] + 0.5,
      projection.invert([mousePos[0], mousePos[1]])[1] - 0.5,
      projection.invert([mousePos[0], mousePos[1]])[1] + 0.5,
    ];

    const results = [];
    quadtree.visit((node, x1, y1, x2, y2) => {
      if (!node.length) {
        do {
          let d = node.data;

          if (
            d.geometry.coordinates[0] >= xmin &&
            d.geometry.coordinates[0] < xmax &&
            d.geometry.coordinates[1] >= ymin &&
            d.geometry.coordinates[1] < ymax
          ) {
            results.push(d);
          }
        } while ((node = node.next));
      }
      return x1 >= xmax || y1 >= ymax || x2 < xmin || y2 < ymin;
    });

    return results;
  }

  function transition(p) {
    d3.transition()
      .duration(850)
      .tween('rotate', function () {
        var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);

        return function (t) {
          projection.rotate(r(t));

          projection.clipAngle(180);

          projection.clipAngle(90);

          render();
        };
      })
      .transition();
  }

  function drag(projection) {
    let v0, q0, r0;

    function dragstarted() {
      v0 = versor.cartesian(projection.invert([d3.event.x, d3.event.y]));

      q0 = versor((r0 = projection.rotate()));
    }

    function dragged() {
      const v1 = versor.cartesian(
        projection.rotate(r0).invert([d3.event.x, d3.event.y])
      );

      const q1 = versor.multiply(q0, versor.delta(v0, v1));

      projection.rotate(versor.rotation(q1));
    }

    return d3.drag().on('start', dragstarted).on('drag', dragged);
  }
};
