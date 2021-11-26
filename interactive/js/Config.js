// set the dimensions and margins of the graph
export const margin = { top: 20, left: 20, bottom: 20, right: 20 },
  width =
    window.innerWidth <= 360
      ? 600 - margin.left - margin.right
      : window.innerWidth <= 960
      ? 1000 - margin.left - margin.right
      : 1200 - margin.left - margin.right,
  height = (2 / 3) * width,
  svg_width = width + margin.left + margin.right,
  svg_height = height + margin.top + margin.bottom;

export const projection = d3
  .geoAlbers()
  .center([24.7731, 45.7909])
  .rotate([-14, 3.3, -10])
  .parallels([37, 54])
  .scale(5000);

export const path = d3.geoPath().projection(projection);

const locale = d3.timeFormatLocale({
  dateTime: '%A, %e %B %Y г. %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'],
  shortDays: ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'],
  months: [
    'Ianuarie',
    'Februarie',
    'Martie',
    'Aprilie',
    'Mai',
    'Iunie',
    'Iulie',
    'August',
    'Septembrie',
    'Octombrie',
    'Noiembrie',
    'Decembrie',
  ],
  shortMonths: [
    'Ian',
    'Feb',
    'Mart',
    'Apr',
    'Mai',
    'Iun',
    'Iul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ],
});

const formatMillisecond = locale.format('.%L'),
  formatSecond = locale.format(':%S'),
  formatMinute = locale.format('%I:%M'),
  formatHour = locale.format('%I %p'),
  formatDay = locale.format('%a %d'),
  formatWeek = locale.format('%b %d'),
  formatMonth = locale.format('%B'),
  formatYear = locale.format('%Y');

export const multiFormat = (date) => {
  return (
    d3.timeSecond(date) < date
      ? formatMillisecond
      : d3.timeMinute(date) < date
      ? formatSecond
      : d3.timeHour(date) < date
      ? formatMinute
      : d3.timeDay(date) < date
      ? formatHour
      : d3.timeMonth(date) < date
      ? d3.timeWeek(date) < date
        ? formatDay
        : formatWeek
      : d3.timeYear(date) < date
      ? formatMonth
      : formatYear
  )(date);
};
