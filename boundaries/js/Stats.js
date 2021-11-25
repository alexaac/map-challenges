import * as Config from './Config.js';

// group the elections data by counties
export const groupvotesByCounties = (data) => {
  let resultByCounty = [];
  data.reduce((res, data_row) => {
    /* aggregate by district code, keep the columns representing total votes
           and the votes per candidate, add district code and county name */
    const columns = [
      'c',
      'g1',
      'g2',
      'g3',
      'g4',
      'g5',
      'g6',
      'g7',
      'g8',
      'g9',
      'g10',
      'g11',
      'g12',
      'g13',
      'g14',
    ];
    const district_code = data_row['Cod birou electoral'];

    if (!res[district_code]) {
      res[district_code] = {
        'Cod birou electoral': district_code,
        Județ: data_row['Județ'],
      };
      columns.forEach((col) => {
        res[district_code][col] = 0;
      });

      resultByCounty.push(res[district_code]);
    }

    // make the total per county
    columns.forEach((col) => {
      res[district_code][col] += Number(data_row[col]);
    });

    return res;
  }, {});

  return resultByCounty;
};

// group the elections data by candidates
export const groupVotesByCandidates = (resultByCounty, electionsDate) => {
  /* aggregate by candidate name per county, then summarize for each
       candidate and calculate the percentage per total */
  const resultByCandidates = [];
  let columns = [];

  if (electionsDate === '2019-11-10') {
    columns = [
      'g1',
      'g2',
      'g3',
      'g4',
      'g5',
      'g6',
      'g7',
      'g8',
      'g9',
      'g10',
      'g11',
      'g12',
      'g13',
      'g14',
    ];
  } else {
    columns = ['g1', 'g2'];
  }

  columns.forEach((col) => {
    const result = resultByCounty.reduce((res, data_row) => {
      if (!res[data_row[col]]) {
        res[data_row['Județ']] = data_row[col];
      }

      return res;
    }, {});

    const keys = Object.keys(result);
    const votes = keys.map((v) => result[v]);
    const total = votes.reduce((a, b) => a + b, 0);
    result.total = total || 0;
    result.candidateId = col;

    const candidateName =
      electionsDate === '2019-11-10'
        ? Config.CANDIDATES_2019[col].name
        : Config.CANDIDATES_2019_2[col].name;
    resultByCandidates[candidateName] = result;
  });

  let keys = Object.keys(resultByCandidates);

  let totCountry = 0;
  keys.forEach((k) => (totCountry += resultByCandidates[k].total || 0));
  keys.forEach((k) => {
    resultByCandidates[k].totalCountry = totCountry;
    resultByCandidates[k].rateCountry = (
      (resultByCandidates[k].total / totCountry) *
      100
    ).toFixed(3);
  });

  return resultByCandidates;
};

/* normalize the elections data fields for both rounds
   and group them by district code; geographic data is at county level,
   we must aggregate elections data from precinct level to county level */
export const groupElectoralDataByDistrict = (data, electionsDate) => {
  let electoralDataByDistrict = d3.map();
  data.forEach((d) => {
    let fieldMap = Config.fieldMap(d);
    electoralDataByDistrict.set(fieldMap.code[electionsDate], {
      code: fieldMap.code[electionsDate],
      totValidVotes: fieldMap.totValidVotes[electionsDate],
      vote1: fieldMap.vote1[electionsDate],
      candidate1: fieldMap.candidate1[electionsDate],
      vote2: fieldMap.vote2[electionsDate],
      candidate2: fieldMap.candidate2[electionsDate],
      electoralDistrict: fieldMap.electoralDistrict[electionsDate],
      rate1: fieldMap.rate1[electionsDate],
      rate1Color: fieldMap.rate1Color[electionsDate],
      rate2: fieldMap.rate2[electionsDate],
      rate2Color: fieldMap.rate2Color[electionsDate],
    });
  });

  return electoralDataByDistrict;
};
