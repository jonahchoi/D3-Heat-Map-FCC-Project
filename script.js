let monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//dimensions of svg
let h = 560;
let w = 1000;
let padding = 60;
//create svg
let svg = d3.select('#svg').
append('svg').
attr('height', h).
attr('width', w);
let tooltip = d3.select('#svg').
append('div').
attr('id', 'tooltip').
style('opacity', 0);

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json').
then(function (data) {
  //default arrays of data
  let baseTemp = data.baseTemperature;
  let monthlyVar = data.monthlyVariance;

  //setup different time arrays for year, month number, and month name
  let years = monthlyVar.map(d => d.year);
  let monthNumbers = monthlyVar.map(d => d.month);
  let monthNames = monthNumbers.map(d => monthArr[d - 1]);
  let temps = monthlyVar.map(d => baseTemp + d.variance);

  //X axis
  let xScale = d3.scaleLinear().
  domain([d3.min(years), d3.max(years)]).
  range([padding, w - padding]);

  let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

  svg.append('g').
  attr('transform', 'translate(0,' + (h - padding) + ')').
  call(xAxis).
  attr('id', 'x-axis');

  //Y axis
  let yScale = d3.scaleLinear().
  domain([0.5, 12.5]).
  range([padding, h - padding]);

  let yAxis = d3.axisLeft(yScale).tickFormat((d, i) => monthArr[i]);

  svg.append('g').
  attr('transform', 'translate(' + padding + ',0)').
  call(yAxis).
  attr('id', 'y-axis');

  //Colors
  let colors = ['#a50026',
  '#d73027',
  '#f46d43',
  '#fdae61',
  '#fee090',
  '#ffffbf',
  '#e0f3f8',
  '#abd9e9',
  '#74add1',
  '#4575b4',
  '#313695'].reverse();

  let threshold = [];
  let step = (d3.max(temps) - d3.min(temps)) / colors.length;

  for (let i = 1; i < colors.length; i++) {
    threshold.push(d3.min(temps) + i * step);
  }
  threshold = threshold.map(d => Math.round(d * 10) / 10);

  let myColor = d3.scaleThreshold().
  domain(threshold).
  range(colors);

  //Legend
  let lWidth = 500;
  let lHeight = 150;
  let pad = 10;
  let legend = d3.select('#legendContainer').
  append('svg').
  attr('height', lHeight).
  attr('width', lWidth).
  attr('id', 'legend');



  let legendAxisScale = d3.scaleLinear().
  domain([d3.min(temps), d3.max(temps)]).
  range([pad, lWidth]);

  let legendAxis = d3.axisBottom(legendAxisScale).tickSize(10, 0).tickValues(threshold).tickFormat(d3.format('.1f'));
  let legendThreshold = [...threshold];
  legendThreshold.unshift(1.7);
  legend.selectAll('rect').
  data(legendThreshold).
  enter().
  append('rect').
  attr('width', (lWidth - 2 * pad) / 10).
  attr('height', 50).
  attr('x', (d, i) => legendAxisScale(d)).
  attr('y', pad).
  attr('fill', d => myColor(d)).
  attr('stroke', 'black');


  legend.append('g').
  attr('transform', "translate(0,60)").
  call(legendAxis);
  legend.append('text').
  text('Temp (°C)').
  attr('transform', 'translate(215,100)');

  //Heat map rects
  svg.selectAll('rect').
  data(monthlyVar).
  enter().
  append('rect').
  attr('width', (w - 2 * padding) / 262).
  attr('height', (h - 2 * padding) / 12).
  attr('x', (d, i) => xScale(years[i])).
  attr('y', (d, i) => yScale(monthNumbers[i] - 0.5)).
  style('fill', (d, i) => myColor(temps[i])).
  attr('class', 'cell').
  attr('data-month', (d, i) => monthNumbers[i] - 1).
  attr('data-year', (d, i) => years[i]).
  attr('data-temp', (d, i) => temps[i]).
  attr('index', (d, i) => i).
  on('mouseover', (e, d) => {

    tooltip.style('opacity', 0.9).
    style('left', e.pageX - 55 + 'px').
    style('top', e.pageY - 90 + 'px');

    tooltip.html(`${d.year}-${monthArr[d.month - 1]} <br> ${d3.format('.1f')(d.variance + baseTemp)}°C <br> ${d3.format('+.1f')(d.variance)}°C`).
    attr('data-year', d.year);

  }).
  on('mouseout', (e, d) => {
    tooltip.style('opacity', 0);
  });


});