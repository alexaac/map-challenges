import * as Config from './Config.js';
import * as Stats from './Stats.js';

// join the geographic data with the elections data and keep specific fields
const formatCountyData = (data, votesByCounties, electionsDate) => {
  // normalize the elections data fields for both rounds
  const electoralDataByDistrict = Stats.groupElectoralDataByDistrict(
    votesByCounties,
    electionsDate
  );

  /* get the list of geographic data layers - same data, different shapes,
       and make the join with the elections data using district code */
  Config.LAYERLIST.forEach((layer) => {
    // take the geometries from topojson
    data.objects[layer].geometries = data.objects[layer].geometries.filter(
      (d) => {
        return d;
      }
    );
    /* put the elections data grouped by district code in 'joined' attribute,
           then add district code, votes per square kilometer and elections date */
    data.objects[layer].geometries.forEach((d) => {
      if (
        typeof electoralDataByDistrict.get(d.properties.cod_birou) ===
        'undefined'
      ) {
        d.properties.joined = {
          code: d.cod_birou,
          candidate1: '',
          candidate2: '',
          districtAbbr: '',
          electoralDistrict: '',
          rate1: 0,
          rate1Color: 0,
          rate2: 0,
          rate2Color: 0,
          totValidVotes: 0,
          totValidVotes_rate: 0,
          vote1: 0,
          vote2: 0,
          vvot_sqkm: 0,
          electionsDate: electionsDate,
        };
      } else {
        try {
          d.properties.joined = electoralDataByDistrict.get(
            d.properties.cod_birou
          );
          d.properties.joined.code = d.properties.cod_birou;
          d.properties.joined.districtAbbr = d.properties.abbr;
          d.properties.joined.vvot_sqkm = Math.ceil(
            d.properties.joined.totValidVotes / d.properties.area_sqkm
          );
          d.properties.joined.electionsDate = electionsDate;

          return d;
        } catch (error) {
          console.log(error);
        }
      }
    });
  });

  return data;
};

/* create a function that takes as input the geographic and elections
           data and date, formats the data, then draw the legend, maps and
           charts using the same shared data: formattedData, votesByCounties,
           votesByCandidates, electionsDate */

const mapDataFactory = (data, electionsData, electionsDate) => {
  // group the elections data by counties and by candidates
  const votesByCounties = Stats.groupvotesByCounties(electionsData),
    votesByCandidates = Stats.groupVotesByCandidates(
      votesByCounties,
      electionsDate
    );

  /* join the geographic data with the elections data and keep specific fields;
       geographic data is at county level, we must aggregate elections data from
       precinct level to county level first */
  const formattedData = formatCountyData(data, votesByCounties, electionsDate);

  // put all data in a vehicle, for sharing and reuse
  const votesStats = {
    formattedData: formattedData,
    votesByCounties: votesByCounties,
    votesByCandidates: votesByCandidates,
    electionsDate: electionsDate,
  };

  /* allow calling the function with a function as parameter
       and pass the data in the vehicle */
  return (callback, layer, svg) => {
    return callback(votesStats, layer, svg);
  };
};

export default mapDataFactory;
