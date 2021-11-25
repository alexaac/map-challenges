// field meaning for the elections data
export const COL_LEGEND = {
  a: 'Numărul total al alegătorilor prevăzut în lista electorală permanentă existentă în secția de votare',
  b: 'Numărul total al alegătorilor care s-au prezentat la urne',
  b1: 'Numărul total al alegătorilor care s-au prezentat la urne, înscriși în lista electorală permanentă',
  b2: 'Numărul total al alegătorilor care s-au prezentat la urne și nu sunt cuprinși în lista electorală permanentă, înscriși în lista electorală suplimentară',
  b3: 'Numărul total al alegătorilor care au votat utilizând urna specială, înscriși în extrasul din listele electorale',
  c: 'Numărul total al voturilor valabil exprimate',
  d: 'Numărul voturilor nule',
  e: 'Numărul buletinelor de vot primite',
  f: 'Numărul buletinelor de vot neîntrebuințate și anulate',
};

// field meaning for votes for each candidate, round 1
export const CANDIDATES_2019 = {
  g1: { name: 'KLAUS-WERNER IOHANNIS', color: '#2171b5' },
  g2: { name: 'THEODOR PALEOLOGU', color: '#7fc6bc' },
  g3: { name: 'ILIE-DAN BARNA', color: '#22ace4' },
  g4: { name: 'HUNOR KELEMEN', color: '#aac52e' },
  g5: { name: 'VASILICA-VIORICA DĂNCILĂ', color: '#fa8376' },
  g6: { name: 'CĂTĂLIN-SORIN IVAN', color: '#4182e4' },
  g7: { name: 'NINEL PEIA', color: '#2a5c70' },
  g8: { name: 'SEBASTIAN-CONSTANTIN POPESCU', color: '#18533d' },
  g9: { name: 'JOHN-ION BANU', color: '#345f4f' },
  g10: { name: 'MIRCEA DIACONU', color: '#9379da' },
  g11: { name: 'BOGDAN-DRAGOS-AURELIU MARIAN-STANOEVICI', color: '#bde67c' },
  g12: { name: 'RAMONA-IOANA BRUYNSEELS', color: '#bf7ce6' },
  g13: { name: 'VIOREL CATARAMĂ', color: '#7a344b' },
  g14: { name: 'ALEXANDRU CUMPĂNAŞU', color: '#888622' },
};

// field meaning for votes for each candidate, round 2
export const CANDIDATES_2019_2 = {
  g1: { name: 'KLAUS-WERNER IOHANNIS', color: '#2171b5' },
  g2: { name: 'VASILICA-VIORICA DĂNCILĂ', color: '#fa8376' },
};

export const CANDIDATES_2014 = {};

// the list of geographic data layers - same data, different shapes
export const LAYERLIST = [
  'counties_wgs84', // counties with district id data
  'counties_cart_wgs84', // same counties as cartogram
  'counties_cart_hex_10000_wgs84', // hexagons from the cartogram
  'counties_cart_hex_10000d_wgs84', // dissolved hexagons by county
];

export const width = 620,
  height = 660;

export const viewport_width = 740,
  viewport_height = 680;

//color scales showing which candidate had the most influence per county
export const colorScaleRed = d3
  .scaleThreshold()
  .domain([0, 10, 20, 30, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100])
  .range(d3.schemeReds[9]);

export const colorScaleBlue = d3
  .scaleThreshold()
  .domain([0, 10, 20, 30, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100])
  .range(d3.schemeBlues[9]);

export const colorScaleRed2 = d3
  .scaleQuantize()
  .domain([0, 100])
  .range(d3.schemeReds[9]);

export const colorScaleBlue2 = d3
  .scaleQuantize()
  .domain([0, 100])
  .range(d3.schemeBlues[9]);

export const projection = d3
  .geoAlbers()
  .center([24.7731, 45.7909])
  .rotate([-14, 3.3, -10])
  .parallels([37, 54])
  .scale(5000);

export const path = d3.geoPath().projection(projection);

export const roundToNearestMultipleOf = (m) => (n) =>
  Math.ceil(Math.round(n / m) * m);

/* normalize the elections data fields for both rounds, and 2014 elections
 and group them by district code */
export const fieldMap = (d) => {
  return {
    code: {
      2014: d['Cod Birou Electoral'],
      '2019-11-10': d['Cod birou electoral'],
      '2019-11-24': d['Cod birou electoral'],
    },
    totValidVotes: {
      2014: d['Numărul total al voturilor valabil exprimate'],
      '2019-11-10': d['c'],
      '2019-11-24': d['c'],
    },
    vote1: {
      2014: d['VICTOR-VIOREL PONTA'],
      '2019-11-10': d['g5'],
      '2019-11-24': d['g2'],
    },
    candidate1: {
      2014: CANDIDATES_2014['g5'],
      '2019-11-10': CANDIDATES_2019['g5'].name,
      '2019-11-24': CANDIDATES_2019_2['g2'].name,
    },
    vote2: {
      2014: d['KLAUS-WERNER IOHANNIS'],
      '2019-11-10': d['g1'],
      '2019-11-24': d['g1'],
    },
    candidate2: {
      2014: CANDIDATES_2014['g1'],
      '2019-11-10': CANDIDATES_2019['g1'].name,
      '2019-11-24': CANDIDATES_2019_2['g1'].name,
    },
    electoralDistrict: {
      2014: d['Nume Judet'],
      '2019-11-10': d['Județ'],
      '2019-11-24': d['Județ'],
    },
    rate1: {
      2014:
        (d['VICTOR-VIOREL PONTA'] /
          d['Numărul total al voturilor valabil exprimate']) *
        100,
      '2019-11-10': (d.g5 / d.c) * 100,
      '2019-11-24': (d.g2 / d.c) * 100,
    },
    rate1Color: {
      2014: roundToNearestMultipleOf(5)(
        (d['VICTOR-VIOREL PONTA'] /
          d['Numărul total al voturilor valabil exprimate']) *
          100
      ),
      '2019-11-10': roundToNearestMultipleOf(5)((d.g5 / d.c) * 100),
      '2019-11-24': roundToNearestMultipleOf(5)((d.g2 / d.c) * 100),
    },
    rate2: {
      2014:
        (d['KLAUS-WERNER IOHANNIS'] /
          d['Numărul total al voturilor valabil exprimate']) *
        100,
      '2019-11-10': (d.g1 / d.c) * 100,
      '2019-11-24': (d.g1 / d.c) * 100,
    },
    rate2Color: {
      2014: roundToNearestMultipleOf(5)(
        (d['KLAUS-WERNER IOHANNIS'] /
          d['Numărul total al voturilor valabil exprimate']) *
          100
      ),
      '2019-11-10': roundToNearestMultipleOf(5)((d.g1 / d.c) * 100),
      '2019-11-24': roundToNearestMultipleOf(5)((d.g1 / d.c) * 100),
    },
  };
};
