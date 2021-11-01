// Format population
const formatNumber = d3.format(',.0f');

/* Find closest city */
const findCityAtMapClick = (
  mousePos,
  width,
  height,
  {
    projection,
    path,
    cityPath,
    graticule,
    graticulePath,
    countries,
    citiesData,
  }
) => {
  // Create quadtree to make city search faster
  const tree = d3
    .quadtree()
    .extent([
      [-1, -1],
      [width + 1, height + 1],
    ])
    .x((d) => d.geometry.coordinates[0])
    .y((d) => d.geometry.coordinates[1])
    .addAll(citiesData.features);

  const found = search(projection, tree, mousePos);

  return found[0];
};

/* Quadtree search for city */
const search = (projection, quadtree, mousePos) => {
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
};

/* Drag mouse action */
const drag = (projection) => {
  let v0, q0, r0;

  const dragstarted = () => {
    v0 = versor.cartesian(projection.invert([d3.event.x, d3.event.y]));

    q0 = versor((r0 = projection.rotate()));
  };

  const dragged = () => {
    const v1 = versor.cartesian(
      projection.rotate(r0).invert([d3.event.x, d3.event.y])
    );

    const q1 = versor.multiply(q0, versor.delta(v0, v1));

    projection.rotate(versor.rotation(q1));
  };

  return d3.drag().on('start', dragstarted).on('drag', dragged);
};

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
    .html((d) => d.label || formatNumber(d.popScale));
};

export {
  formatNumber,
  findCityAtMapClick,
  drawLegend,
  popScale,
  colorScale,
  drag,
};
