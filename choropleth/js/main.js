/* Global variables */
const width = 1000;
const height = 600;
let countries;

let i = 0,
  playNow;

// Projection and path
const projection = d3
  .geoEquirectangular()
  .translate([width / 2, height / 2])
  .scale(width / 7);

const path = d3.geoPath().projection(projection);

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('preserveAspectRatio', 'xMinYMin')
  .attr('viewBox', '0, 0 ' + width + ' ' + height);

const promises = [
  d3.csv('data/annual-change-fossil-fuels.csv'),
  d3.json('./data/ne_110m_admin_0_countries.json'),
];

Promise.all(promises)
  .then(([windEnergy, countries]) => {
    countries = topojson.feature(
      countries,
      countries.objects.ne_110m_admin_0_countries
    );

    // Reduce properties
    countries.features = countries.features.map(function (el) {
      return {
        geometry: el.geometry,
        type: el.type,
        properties: {
          name: el.properties.ADMIN,
          adm0_a3: el.properties.ADM0_A3,
          pop_est: el.properties.POP_EST,
        },
      };
    });

    countries.features = countries.features;

    draw(countries, windEnergy);
  })
  .catch((err) => {
    console.error(err);
  });

function draw(countries, windEnergy) {
  // windEnergy = windEnergy.filter((elem) => elem.year > 1980);

  const data = new Map([
    ...d3.rollup(
      windEnergy,
      (v) => d3.sum(v, (d) => d['Fossil fuels (TWh growth – sub method)']),
      (d) => d.Year,
      (d) => d.Entity
    ),
  ]);

  let date = '2007';
  const yearData = data.get(date);
  const years = [...data.keys()];

  // Color scale
  const extent = d3.extent(
    windEnergy,
    (d) => d['Fossil fuels (TWh growth – sub method)']
  );

  const color = d3
    .scaleDiverging()
    .domain([extent[1], 0, extent[0]])
    .interpolator(d3.interpolateBrBG)
    .unknown('#ccc');

  const legend_height = 15;

  const legend_svg = svg
    .append('g')
    .attr('transform', `translate(${0}, ${height - 30})`);

  const defs = legend_svg.append('defs');

  const gradient = defs.append('linearGradient').attr('id', 'linear-gradient');

  const stops = [
    { offset: 0, value: extent[0] },
    { offset: 0.5, value: (extent[1] - extent[0]) / 2 },
    { offset: 1, value: extent[1] },
  ];

  gradient
    .selectAll('stop')
    .data(stops)
    .enter()
    .append('stop')
    .attr('offset', (d) => 100 * d.offset + '%')
    .attr('stop-color', (d) => color(d.value));

  legend_svg
    .append('rect')
    .attr('width', width)
    .attr('height', legend_height)
    .style('fill', 'url(#linear-gradient)');

  legend_svg
    .selectAll('text')
    .data(stops)
    .enter()
    .append('text')
    .attr('x', (d) => width * d.offset)
    .attr('dy', -3)
    .style('text-anchor', (d, i) =>
      i == 0 ? 'start' : i == 1 ? 'middle' : 'end'
    )
    .text((d, i) => d3.format(',')(d.value) + (i == 2 ? ' > 250 TWh' : ''));

  legend_svg
    .append('text')
    .classed('year-label', true)
    .attr('x', width * 0.5 - 20)
    .attr('y', -height + 60)
    .html('2019');

  // Initial map
  const polygonsGroup = svg.append('g').attr('class', 'map-features');

  const mapFeatures = polygonsGroup
    .selectAll('path.country')
    .data(countries.features)
    .join('path')
    .filter(function (d) {
      return d.properties.name != 'Antarctica';
    })
    .attr('fill', (d) => color(yearData.get(d.properties.name)))
    .classed('country', true)
    .attr('d', path)
    // tooltip
    .append('title')
    .text(
      (d) => `${d.properties.name}
${yearData.has(d.properties.name) ? yearData.get(d.properties.name) : 'N/A'}`
    );

  mapFeatures.exit().remove();

  const drawWindEnergy = (year) => {
    const yearData = data.get(year);
    console.log(year);

    svg
      .selectAll('path')
      .transition()
      .duration(50)
      .attr('fill', (d) => color(yearData.get(d.properties.name)));

    legend_svg.selectAll('.year-label').transition().duration(50).text(year);
  };

  drawWindEnergy('2019');

  /* Animate */

  const animateYears = () => {
    playNow = setInterval(() => {
      console.log(i);
      if (i >= years.length) {
        clearInterval(playNow);

        d3.select('#pause-ribbons').classed('hide', true);
        d3.select('#play-ribbons').classed('hide', false);
      }

      const currentYear = years[i];
      if (currentYear) {
        drawWindEnergy(currentYear);
      }

      i++;
    }, 400);
  };

  d3.select('#play-ribbons').on('click', () => {
    d3.select('#play-ribbons').classed('hide', true);
    d3.select('#pause-ribbons').classed('hide', false);

    i = 0;
    animateYears();
  });
  d3.select('#pause-ribbons').on('click', () => {
    d3.select('#pause-ribbons').classed('hide', true);
    d3.select('#play-ribbons').classed('hide', false);
    pauseAnimations();
  });

  const pauseAnimations = () => {
    clearInterval(playNow);
  };
}
