const getCoords = async (location) => {
  const url = `https://nominatim.openstreetmap.org/search.php?city=${location}&format=jsonv2`;

  const res = await d3.json(url);
  return [+res[0].lon, +res[0].lat];
};

const getbb = (coords, dlat, dlon) => {
  return [
    [coords[1] - dlat, coords[0] - dlon],
    [coords[1] + dlat, coords[0] + dlon],
  ];
};

async function overpass(query) {
  const encodedQuery = encodeURIComponent(query);

  let overpass_api_url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

  const promises = [d3.json(overpass_api_url)];

  return Promise.all(promises)
    .then(([r]) => r)
    .catch((error) => {
      return { error: error };
    });
}

const getDataFromOSM = async (bb, fetch) => {
  const bbox = `${bb[0][0]},${bb[0][1]},${bb[1][0]},${bb[1][1]}`;

  if (fetch) {
    const query = `
    [out:json]
    ;
    (
      node
        ["amenity"]
        (${bbox});

    );
    out;
    >;
    out skel qt;
    `;

    try {
      const pointsOfInterestOsm = await overpass(query);

      if (pointsOfInterestOsm.error) {
        return getDataFromOSM(bb, 0);
      } else {
        return await osmtogeojson(pointsOfInterestOsm);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    const promises = [d3.json('./data/points.json')];

    return Promise.all(promises)
      .then(([r]) => {
        return { type: 'FeatureCollection', features: r };
      })
      .catch((error) => console.log(error));
  }
};

const highlight = (event, d) => {
  const tooltip_div = d3.select('#tooltip');

  tooltip_div.transition().duration(200).style('opacity', 0.9);
};

const showInfo = (event, d) => {
  const tooltip_div = d3.select('#tooltip');

  const properties = d && d.properties && d.properties.tags;

  event.preventDefault();

  let left = event.pageX / 1.5;
  let top = event.pageY / 1.5;

  if (window.innerWidth - left < 150) {
    left = d3.event.pageX - 40;
  }

  tooltip_div.transition().duration(200).style('opacity', 0.9);

  tooltip_div.select('.tooltip__text').html(
    () => `
    ${properties['amenity'] ? properties['amenity'] + ', <br/>' : ''}
    ${properties['access'] ? 'access: ' + properties['access'] + ', <br/>' : ''}
    ${
      properties['addr:city']
        ? 'addr:city: ' + properties['addr:city'] + ', <br/>'
        : ''
    }
    ${
      properties['addr:country']
        ? 'addr:country: ' + properties['addr:country'] + ', <br/>'
        : ''
    }
    ${
      properties['addr:housenumber']
        ? 'addr:housenumber: ' + properties['addr:housenumber'] + ', <br/>'
        : ''
    }
    ${
      properties['addr:postcode']
        ? 'addr:postcode: ' + properties['addr:postcode'] + ', <br/>'
        : ''
    }
    ${
      properties['addr:street']
        ? 'addr:street: ' + properties['addr:street'] + ', <br/>'
        : ''
    }
  ${
    properties['name'] && properties['name'] !== ''
      ? 'name: ' + properties['name']
      : ''
  }
`
  );

  tooltip_div
    .style('left', left + 'px')
    .style('top', top + 'px')
    .style('display', null);
};

export { getCoords, getbb, getDataFromOSM, highlight, showInfo };
