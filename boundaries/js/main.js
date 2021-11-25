import * as Utils from './Utils.js';
import mapDataFactory from './MapFactory.js';
import * as DrawLegend from './DrawLegend.js';
import * as DrawMaps from './DrawMaps.js';

let geographicData, electionsData2019Round2;
let electionsDate = '2019-11-24';

// Load data
const promises = [
  d3.json('data/counties_bundle.json'),
  d3.csv('data/round1/pv_RO_PRSD_FINAL.csv'),
  d3.csv('data/round1/pv_SR_PRSD_FINAL.csv'),
  d3.csv('data/round1/pv_SR_PRSD-C_FINAL.csv'),
  d3.csv('data/round2/pv_RO_PRSD_FINAL.csv'),
  d3.csv('data/round2/pv_SR_PRSD_FINAL.csv'),
  d3.csv('data/round2/pv_SR_PRSD-C_FINAL.csv'),
];

Promise.all(promises)
  .then((data) => {
    geographicData = data[0];
    let electionsData2019RORound2 = data[4],
      electionsData2019SRRound2 = data[5],
      electionsData2019SRCRound2 = data[6];

    electionsData2019SRCRound2 = Utils.reMapFields(electionsData2019SRCRound2);

    electionsData2019Round2 = [
      ...electionsData2019RORound2,
      ...electionsData2019SRRound2,
      ...electionsData2019SRCRound2,
    ];

    changeView(electionsData2019Round2, electionsDate);
  })
  .catch((error) => console.log(error));

/* Display results from round 1 */
const changeView = (electionsData, electionsDate) => {
  /* call the function that takes as input the geographic and elections
       data and date, formats the data, then draw the legend, maps and
       charts using the same shared data: formattedData, votesByCounties,
       votesByCandidates, electionsDate */
  const mapVehicle = mapDataFactory(
    geographicData,
    electionsData,
    electionsDate
  );

  // completely swipe out the previous view
  const svgs = Utils.repaint();
  let svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9, svg10;
  [svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9, svg10] = [...svgs];

  /* call the function with a function as parameter and pass the data
       in the vehicle, for sharing and reuse */

  // legend based on the percentage of votes per the final candidates
  mapVehicle(DrawLegend.drawVotesPercentageLegend, 'counties_wgs84', svg8);

  // scalebar in miles and km, use geographic data to set extent
  mapVehicle(DrawLegend.drawScaleBar, 'counties_wgs84', svg8);

  // mapNon-Contiguous cartogram based on number of votes from the geographic data
  mapVehicle(DrawMaps.drawNonCont, 'counties_wgs84', svg8);
};
