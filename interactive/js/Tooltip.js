import * as Config from './Config.js';

// use a tooltip to show node info
export const tooltip_div = d3
  .select('body')
  .append('tooltip_div')
  .attr('class', 'tooltip')
  .style('opacity', 0)
  .style('display', 'none');

tooltip_div.append('div').classed('tooltip__text', true);
tooltip_div
  .append('div')
  .append('button')
  .classed('tooltip__remove', true)
  .on('click', function () {
    tooltip_div
      .transition()
      .duration(300)
      .style('opacity', 0)
      .style('left', '-9999px');
  })
  .text('x');

export const highlight = (d) => {
  let left = d3.event.pageX - 20;
  let top = d3.event.pageY + 20;

  if (window.innerWidth - left < 150) {
    left = d3.event.pageX - 40;
  }

  tooltip_div
    .transition()
    .duration(200)
    .style('max-width', '320px')
    .style('opacity', 0.9);

  tooltip_div.select('.tooltip__text').html(tooltipHTML(d));
  tooltip_div
    .style('left', left + 'px')
    .style('top', top + 'px')
    .style('display', null);
};

export const tooltipHTML = (d) => {
  if (d.data.properties !== undefined) {
    let language = d3.select('#language').node().value;

    let labels = {
      valueLabel: { ro: 'cazuri legate', en: 'clustered cases' },
      cazulLabel: { ro: 'Cazul', en: 'Case' },
      maleLabel: { ro: 'Bărbat', en: 'Male' },
      femaleLabel: { ro: 'Femeie', en: 'Female' },
      unspecLabel: { ro: 'Gen nespecificat', en: 'Unspecified gender' },
      statusLabel: { ro: 'Stare', en: 'Status' },
      releasedLabel: { ro: 'vindecat', en: 'released' },
      confirmedLabel: { ro: 'confirmat', en: 'confirmed' },
      deceasedLabel: { ro: 'deces', en: 'deceased' },
      confdateLabel: { ro: 'Data confirmării', en: 'Confirmation date' },
      recoverydateLabel: { ro: 'Data recuperării', en: 'Recovery date' },
      infectionCountryLabel: {
        ro: 'Țara de infectare',
        en: 'Country of infection',
      },
      detailsLabel: { ro: 'Detalii', en: 'Details' },
      aiciLabel: { ro: 'aici', en: 'here' },
    };

    let cazuriInfo = d.value + ' ' + labels.valueLabel[language],
      genderInfo =
        d.data.properties.gender === 'Bărbat'
          ? labels.maleLabel[language]
          : d.data.properties.gender === 'Femeie'
          ? labels.femaleLabel[language]
          : labels.unspecLabel[language],
      ageInfo =
        d.data.properties.age != null && d.data.properties.age != 0
          ? ', ' + d.data.properties.age
          : '',
      countyInfo =
        d.data.properties.county != null && d.data.properties.county != ''
          ? ', ' + d.data.properties.county
          : '',
      statusInfo =
        d.data.properties.status != null
          ? labels.statusLabel[language] +
            ': ' +
            (d.data.properties.status === 'Vindecat'
              ? labels.releasedLabel[language]
              : d.data.properties.status === 'Confirmat'
              ? labels.confirmedLabel[language]
              : labels.deceasedLabel[language]) +
            '.<br />'
          : '',
      diagnosticDateInfo =
        d.data.properties.diagnostic_date !== null
          ? labels.confdateLabel[language] +
            ': ' +
            d.data.properties.diagnostic_date +
            '.<br />'
          : '',
      healingDateInfo =
        d.data.properties.healing_date !== null
          ? labels.recoverydateLabel[language] +
            ': ' +
            d.data.properties.healing_date +
            '.<br />'
          : '',
      countyOfInfectionInfo =
        d.data.properties.country_of_infection !== null &&
        d.data.properties.country_of_infection !== 'România' &&
        d.data.properties.country_of_infection !== 'Romania'
          ? labels.infectionCountryLabel[language] +
            ': ' +
            d.data.properties.country_of_infection +
            '.<br />'
          : '',
      referenceInfo =
        d.data.properties.reference !== null &&
        d.data.properties.reference !== ''
          ? labels.detailsLabel[language] +
            ': ' +
            '<a href="' +
            d.data.properties.reference +
            '" target= "_blank">' +
            labels.aiciLabel[language] +
            '</a>'
          : '';

    // return '<b>' + labels.cazulLabel[language] + ' ' + d.data.properties.case_no + '</b>' +
    return (
      '<b>' +
      labels.cazulLabel[language] +
      ' ' +
      'x' +
      '</b>' +
      // genderInfo + ageInfo +
      countyInfo +
      '.<br />' +
      cazuriInfo +
      '.<br />' +
      statusInfo +
      diagnosticDateInfo +
      healingDateInfo +
      countyOfInfectionInfo +
      referenceInfo
    );
  } else {
    return d.id;
  }
};

export const toggleInfo = (infoStatus, language) => {
  if (infoStatus === true) {
    tooltip_div
      .transition()
      .duration(200)
      .style('max-width', '90vw')
      .style('opacity', 0.9);
    tooltip_div.select('.tooltip__text').html(
      language === 'ro'
        ? `<strong>Clusterele de cazuri grupate pe județ</strong><br/><br/>
          Vezi câţi oameni au fost infectaţi de fiecare persoană.</strong> În graficul de mai jos, fiecare cerc reprezintă o persoană, mărimea lui este proporţională cu câţi oameni a infectat 
        (= s-au aflat în zona unde virusul a fost răspândit de persoana infectată) iar culoarea reprezintă fie starea (confirmat, eliberat din spital, decedat),
        judeţul, genul sau vârsta.<br/>
        <strong>Vezi cum sunt legaţi unul de celălalt oamenii infectaţi.</strong> Când o persoană s-a infectat şi a fost cunoscută sursa, acest lucru a fost considerat drept conexiune,
        şi reprezentat cu aceeași culoare.<br/>
        <strong>Vezi unde ar putea apărea focare.</strong> Grupările de oameni, create pe baza conexiunilor, ar putea scoate la iveală posibile focare şi ne-ar putea ajuta să descoperim
        locurile şi circumstanţele care pot conduce la focare.<br/>
        <strong>Explorează.</strong> Treci pe deasupra fiecărei persoane pentru a vedea cu câţi oameni a intrat în contact, mai multe detalii, şi link-ul web către articolul original
        din media. Selectează altă temă pentru a colora toţi oamenii în funcţie de judeţ, gen, localizare sau stare. Zoom înăuntru pentru a afişa etichele, şi pan
        pentru a naviga. Schimbă limba (română sau engleză) după preferinţe.<br/><br/>
          <strong>Date</strong> de pe covid19.geo-spatial.org. Doar cazurile pentru care se cunoaște sursa de infectare.<br/>
          <strong>Ultima actualizare a datelor:</strong> 30 iulie 2020.`
        : `<strong>Case clusters grouped by county.<br/><br/>
          See how many people got infected by each person.</strong> In the visualization below, each circle represents
        a person, its size is proportional to how many people has infected (= were found in the area where the virus was spread by an infected person) and the color
        represents either status (confirmed, discharged from the hospital, deceased), county, gender or age.<br/>
          <strong>See how the infected people relate to each other.</strong> When a person was infected and the source was known, that was considered a connection, and was represented
        with the same colour.<br/>
        <strong>See where outbreaks could occur.</strong> The clusters of people, created based on the connections, could reveal possible hot spots and could help us discover the
      locations and the circumstances that can lead to outbreaks.<br/>
        <strong>Explore.</strong> Hover over each person to see how many people got in contact with,  more details, and the link to the original media article. Select another theme
      to color all people by county, gender, location or status. Zoom in to reveal labels, and pan to navigate. Switch the language (Romanian or English) as desired.<br/><br/>
        <strong>Data</strong> from covid19.geo-spatial.org. Only cases with known infection source.<br/>
        <strong>The last data update:</strong> 30th of July 2020.`
    );
    tooltip_div
      .style('left', '50px')
      .style('top', '20vw')
      .style('margin-left', 'auto')
      .style('margin-right', 'auto')
      .style('display', null);
    infoStatus = false;
  } else {
    tooltip_div
      .transition()
      .duration(300)
      .style('opacity', 0)
      .style('left', '-9999px');
    infoStatus = true;
  }

  return infoStatus;
};

export const hovered = (hover) => {
  return (d) => {
    d3.selectAll(d.ancestors().map((d) => d.node)).classed(
      'node--hover',
      hover
    );
  };
};

export const hideTooltip = () => {
  tooltip_div.transition().duration(200).style('opacity', 0);
};
