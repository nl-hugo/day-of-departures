
console.log(d3.version);

//import {helloWorld} from 'thecarriers';

  //TODO: mouseover on station
  //TODO: draw circle for station, size=type of station?
  //TODO: MORE DATA!!
  //TODO: center/reposition map
  //TODO: group by carrier/train type
  //TODO: add NL map boundaries
  //TODO: show top 10 stations?
  //TODO: show 'your station'
  //TODO: delays?
  //TODO: load message

//TODO: better timer /w start, stop, pause, speed
//TODO: voronoi
//TODO: better mouseover
//TODO: filters in text


//import thecarriers from './thecarriers';

var minuteFormat = d3.timeFormat('%H%M');

var speed = 1.0,
    opacity = [0.0, 0.5],
    num = 0,
    count = 0;


var _timetable;

// Define the div for the tooltip
var div = d3.select('body').append('div') 
    .attr('class', 'tooltip')       
    .style('opacity', 0);

var carriers = d3.scaleOrdinal(d3.schemeCategory10);
//    .domain(['NS International', 'NS', 'Arriva', 'U-OV']);
//var carriers = d3.scaleOrdinal(['#fcc917','#300']).domain(['NS', 'NS International']);

var types = d3.scaleOrdinal()
    .domain(['ICE International', 'Intercity direct', 'Thalys', 'Intercity', 'Sneltrein', 'Sprinter', 'stoptrein'])
    .range([12,12,12,8,6,4,4]);


//var x = d3.scaleTime()
//    .domain([new Date(2016, 6, 28, 13), new Date(2016, 6, 28, 18)])
//    .range([0, width - 100]);

//var y = d3.scaleLinear()
//    .range([height, 0]);

//var xAxis = d3.axisBottom(x);

//var yAxis = d3.axisLeft(y);
/*    .scale(y)
    .orient('left')
    .ticks(5);*/

//var line = d3.line()
//    .interpolate('basis')
//    .x(function(d) { return x(d.time); })
//    .y(function(d) { return y(d.code); });


var activeStations = {
  'UT': true
};

queue()
    .defer(d3.csv, '../data/stations.csv')
    .defer(d3.csv, '../data/timetable.csv')
    .defer(d3.json, '../data/gemeente.json')
    .await(ready);

function addSvg(id, w, h /*, m*/) {
  var m = {top:10, left:10, right:10, bottom:10};
  d3.select('#' + id).append('svg')
    .attr('width', w + m.left + m.right)
    .attr('height', h + m.top + m.bottom)
  .append('g')
    .attr('class', 'g-' + id)
    .attr('transform', 'translate(' + m.left + ',' + m.top + ')');
}


function drawStations(map, stations) {

  var margin = {top: 0, right: 0, bottom: 10, left: 0},
      width = 645 - margin.left - margin.right,
      height = 900 - margin.top - margin.bottom;

  var projection = d3.geoMercator()
      .center([5.4, 52.088]) // Utrecht city center
      .translate([width / 2, height / 2])
      .scale(width * 12);

  var path = d3.geoPath()
      .projection(projection);
      
  d3.selectAll('.g-the-map').append('g')
      .attr('class', 'g-map')
    .append('path')
      .datum(topojson.mesh(map, map.objects.area, function(a, b) { return a === b; }))
      .attr('class', 'country')
      .attr('d', path);

//      mareyContainer = d3.select('.g-the-map').classed('loading', false);

  var g = d3.select('.g-the-map').append('g')
    .attr('class', 'g-stations');

  var station = g.selectAll('.g-station')
      .data(stations, function(d) { return d.code; });

  station
      .enter()
    .append('circle')
      .attr('class', function (d) { return 'station hoverable dimmable highlightable ' + d.code + ' ' + d.type; })
      .classed('active', function (d) { return activeStations[d.code]; })
//      .classed('dimmable', function (d) { return ['megastation'].indexOf(d.type) < 0; })
      .attr('cx', function(d) { return projection([d.lon, d.lat])[0]; })
      .attr('cy', function(d) { return projection([d.lon, d.lat])[1]; })
      .attr('r', 1.5);
 
// TODO: the departures
      carriers.domain(d3.map(_timetable, function(d){ return d.carrier; }).keys());

    var g = d3.select('.g-the-map').append('g')
        .attr('class', 'g-departures');

    var circle = g.selectAll('.g-departure')
        .data(_timetable);

    circle.enter().append('g')
        .attr('class', 'g-departure')
      .append('circle')
        .attr('class', function(d) { return 'departure dimmable ' + d.station + ' ' + d.carrier + ' g-' + minuteFormat(d.time);})
//        .classed('dimmed', true)
        .attr('fill', function(d) { return carriers(d.carrier); })
        .attr('r', function(d){ return types(d.type); } || 2)
//        .attr('r', 0)
        .attr('transform', function(d) { return 'translate(' + projection([d.lon, d.lat]) + ')';})
        .style('opacity', opacity[0]);


  var voronoi = d3.voronoi()
    .x(function (d) { return projection([d.lon, d.lat])[0]; })
    .y(function (d) { return projection([d.lon, d.lat])[1]; })
    .extent([[0, 0], [width, height]]);

  var polygon = g.append('g').attr('class', 'polygons').selectAll('path')
      .data(voronoi.polygons(stations)).enter()
    .append('path').attr('d', function(d) { return d ? 'M' + d.join('L') + 'Z' : null; })
      .style('fill', 'none')
//      .style('stroke', '#2074A0') //If you want to look at the cells
      .style('pointer-events', 'all')
      .on('mouseover', function(d) {
        div.transition()    
            .duration(200)
            .style('opacity', .9);
        div.html(d.data.lang)
            .attr('class', 'tooltip')  
            .style('left', (projection([d.data.lon, d.data.lat])[0] + 120) + 'px')
            .style('top', (projection([d.data.lon, d.data.lat])[1] + 100) + 'px');
        highlightStations([d.data.code]);
      })           
      .on('mouseout', function() {
        div.transition()    
          .duration(500)    
          .style('opacity', 0); 
        unHighlightStations();
      })
      .on('click', function(d) { toggleStations([d.data.code]); });

}


function drawBusyStations(stations) {


//little heatmaps


  console.log(stations);


  var margin = {top: 5, right: 10, bottom: 5, left: 10},
      width = (6*6 + 20) - margin.left - margin.right,
      height = 40 - margin.top - margin.bottom;


//  var barWidth = width / (24*60);

  var x = d3.scaleTime()
   //   .domain([new Date(2016, 6, 28, 13), new Date(2016, 6, 28, 18)])
      .range([0, width]);

var clr = d3.scaleSequential(d3.interpolatePiYG);
console.log(clr);

//https://github.com/d3/d3-scale/blob/master/README.md#interpolateViridis
var clr2 = d3.scaleSequential(d3.interpolateViridis).domain([0,45]);
console.log(clr2);
console.log(clr2.domain());
//console.log(clr2.range());
console.log(clr2(10));

var colorRange = d3.scaleQuantize()
.domain([-1,50])
.range([0,1]);

        ;

console.log(x.domain());
console.log(x.range());

console.log(d3.schemeCategory20c);


  var xAxis = d3.axisBottom(x);

  x.domain([
    d3.min(stations, function(d) { return d.values[0].key; }),
    d3.max(stations, function(d) { return d.values[d.values.length - 1].key; })
  ]);



  console.log(x.domain());


console.log(colorRange.domain());
console.log(colorRange.range());
console.log(colorRange(1));
console.log(colorRange(10));
console.log(colorRange(30));
console.log(colorRange(40));
console.log(colorRange(50));


  var g = d3.select('.g-the-stations');

  var svg = g.selectAll('g')
    .data(stations).enter()
  .append('g')
    .attr('class', 'carrier')
    .attr('id', function(d) { return 'carrier-' + d.key; })
    .attr('transform', function(d,i) { return 'translate(' + 0 + ',' + i * height * 1.5 + ')'; })
      .classed('active', function (d) { return activeStations[d.key]; });

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  svg.selectAll('rect').data(function(d) { console.log(d); return d.values; } ).enter().append('rect')
      .attr('class', 'rect')
                  .attr("width", 5)
            .attr("height", 10)
            .attr("x", function(d) { return x(d.key); })
            .attr("y", 10)
//      .attr('transform', 'translate(0,' + height + ')')
      .attr('fill', function(d) { return (clr2(d.value)) || '#ccc'; })
//      .append('text').text(function(d) { return d.value;} );
;

  svg.append('text')
      .attr('x', width - 6)
      .attr('y', height - 6)
      .attr('fill', '#aaa')
      .text(function(d) { return d.key; });

  g.append('line')
      .attr('x1', x('15'))
      .attr('x2', x('15'))
      .attr('y1', 0)
      .attr('y2', 100)
      .attr('stroke', 'red');
      
}



function drawBusyStations2(stations) {

// little area charts

  console.log(stations);


  var margin = {top: 5, right: 10, bottom: 5, left: 10},
      width = 200 - margin.left - margin.right,
      height = 40 - margin.top - margin.bottom;


//  var barWidth = width / (24*60);

  var x = d3.scaleTime()
   //   .domain([new Date(2016, 6, 28, 13), new Date(2016, 6, 28, 18)])
      .range([0, width]);

console.log(x.domain());
console.log(x.range());

  var xAxis = d3.axisBottom(x);

  x.domain([
    d3.min(stations, function(d) { return d.values[0].key; }),
    d3.max(stations, function(d) { return d.values[d.values.length - 1].key; })
  ]);


  console.log(x.domain());

  var y = d3.local();
  var area = d3.local();
  var line = d3.local();

  var g = d3.select('.g-the-stations');

//  var svg = d3.select('#the-stations').selectAll('svg')
  var svg = g.selectAll('g')
    .data(stations).enter()
//  .append('svg')
//    .attr('width', width + margin.left + margin.right)
//    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('class', 'carrier')
    .attr('id', function(d) { return 'carrier-' + d.key; })
    .attr('transform', function(d,i) { return 'translate(' + 0 + ',' + i * height * 1.5 + ')'; })
      .classed('active', function (d) { return activeStations[d.key]; })
    .each(function(d) {
        var ty = y.set(this, d3.scaleLinear()
            .domain([0, d3.max(d.values, function(d) { return d.value; })])
            .range([height, 0]));

        area.set(this, d3.area()
            .x(function(d) { return x(d.key); })
            .y0(height)
            .y1(function(d) { return ty(d.value); }));

        line.set(this, d3.line()
            .x(function(d) { return x(d.key); })
            .y(function(d) { return ty(d.value); }));
      });

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  svg.append('path')
      .attr('class', 'area')
      .attr('d', function(d) { return area.get(this)(d.values); });

  svg.append('path')
      .attr('class', 'line')
      .attr('d', function(d) { return line.get(this)(d.values); });

  svg.append('text')
      .attr('x', width - 6)
      .attr('y', height - 6)
      .attr('fill', '#aaa')
      .text(function(d) { return d.key; });

  g.append('line')
      .attr('x1', x('15'))
      .attr('x2', x('15'))
      .attr('y1', 0)
      .attr('y2', 100)
      .attr('stroke', 'red');
}



function ready(error, stations, timetable, map) {
  if (error) return console.error(error);

  stations.forEach(function(d) {
    d.lat = +d.lat,
    d.lon = +d.lon
  });

  _timetable = timetable.filter(function(d) { return d.type !== 'Stopbus i.p.v. trein' && d.type !== 'Snelbus'; });

  _timetable.forEach(function(d) {
    var s = stations.filter(function(e) { return e.code === d.station; })[0];
    //d.code = d.station;
    d.time = d3.isoParse(d.time);
    d.lat = s.lat,
    d.lon = s.lon
  });

  d3.selectAll('div.chart')._groups[0].forEach(function(c) {
    addSvg(c.id, +c.dataset.width, +c.dataset.height /*, JSON.parse(c.dataset.margin)*/);
  });

  // carrier types
  //console.log(d3.map(timetable, function(d){ return d.type; }).keys());
  //console.log(timetable);

  drawControls();

  //drawMap(map);

// TEST
  //stations = stations.filter(function(d) { return ['MRN','MTR','NML','UTM','UT','ASS','ASD','MRN'].indexOf(d.code) >= 0; });
  //_timetable = _timetable.filter(function(d) { return ['MRN','MTR','NML','UTM','UT','ASS','ASD','MRN'].indexOf(d.station) >= 0; });


  drawStations(map, stations);

//  drawTimetable(timetable);

  var carrierCount = d3.nest()
    .key(function(d) { return d.carrier; })
    .key(function(d) { return d.time; })
    .rollup(function(leaves) { return leaves.length; })
    .entries(_timetable);

  //console.log(carrierCount);




var formatHour = d3.timeFormat('%H');

//console.log(d3.map(stations, function(d){ return d.station; }).keys());

  var busiestStations = d3.nest()
    .key(function(d) { return d.station; })
    .key(function(d) { return formatHour(d.time); }).sortKeys(d3.ascending)
    .rollup(function(v) { return v.length; })
    .entries(_timetable);

//console.log(nested);
//console.log(d3.keys(nested));

 // var stationCount = d3.nest()
  //  .key(function(d) { return d.station; })
   // .rollup(function(leaves) { return leaves.length; })
   // .entries(timetable)
//    .sort(function(a,b) { return b.value - a.value; })
//    .slice(0, 5);
;

  console.log(busiestStations);

  //var busiestStations = d3.map(stationCount, function(d){ return d.key; }).keys();
  //console.log(busiestStations);

  //var busyStations = timetable.filter(function(d) { return busiestStations.indexOf(d.station) >= 0; });
  //console.log(busyStations);

  drawBusyStations(busiestStations);


}


function drawControls() {

  var speedy = [1,2,4,8];

  var speeds = d3.select('.g-the-controls').selectAll('text')
      .data(speedy, function(d) { return d; });

  speeds.enter().append('text')
      .attr('x', function(d, i) { return i * 20; })
      .attr('dy', '.35em')
      .on('click', setSpeed)
      .text(function(d) { return d; });

}

//TODO
function setSpeed(s) {
  console.log('set speed to: ' + s);
  stopTimer();
  speed = s;
  startTimer();
}

function updateClock(t) {
  var clock = d3.select('.g-the-clock').selectAll('text')
      .data([t], function(d) { return d; });

console.log(t);

  clock.enter().append('text')
      .attr('x', 100)
      .attr('dy', '.35em')//.transition().ease(d3.easeCubicIn).duration(2000).delay(0)
//          .transition()
//      .duration(500 / speed)
      .text(function(d) { return d; });

  clock.exit().remove();
}

function updateTime(i) {

  var h = Math.floor(i / 60),
      m = i % 60;

  var timeStr = ('00' + h).slice(-2) + ':' + ('00' + m).slice(-2);

 console.log(('0000' + i).slice(-4) + '] departure time: '+ timeStr);

  updateClock(timeStr);

  // fade in and out
  d3.select('.g-the-map').selectAll('.g-' + ('00' + h).slice(-2) + '' + ('00' + m).slice(-2))
    .transition()
      .duration(500 / speed)
      .style('opacity', opacity[1])
    .transition()
      .delay(1000 / speed)
      .duration(500 / speed)
      .style('opacity', opacity[0]);

  // update mini charts
  // ...
}

//https://github.com/d3/d3-timer
var n = 24*60,
    i = 13*60 + 25,
    running = false,
    interval; 

function stopTimer() {
  console.log('stopping');
  //console.log(interval);
  if (running) {
    clearInterval(interval);
    running = false;
    console.log('stopped');
  } else {
    console.log('not running');
  }
}

function startTimer() {
  if (running) {
    return;
  }
  startTimer2(i);
}

function startTimer2(ii) {
  console.log('starting');

  if (running) {
    return;
  }

  running = true;
  console.log('started');

  i = ii;

  interval = setInterval(function() {

    if(i < n) {

      updateTime(i);
      //console.log(i);

    } else {
  //      clearInterval(interval);
      i = -1;
    }
    // update counter
    i++;
  }, 1000 / speed);

}


function restartTimer() {
  console.log('restart...');
  stopTimer();
  i = 13*60 + 25;
  startTimer();
}

//restartTimer();




// Setup linked text to highlight particular stops
// <a href='#' class='highlight-stops' data-stops='comma separated list of stop names to show'>
d3.selectAll('.section-stations .highlight-stops')
  .on('click', function () {
    d3.event.preventDefault();
    var stops = d3.select(this).attr('data-stops').split(',');

    console.log('click! ' + stops);
    toggleStations(stops);
  })
  .on('mouseover', function () {
    var stops = d3.select(this).attr('data-stops').split(',');

    console.log('mouseover! ' + stops);
    highlightStations(stops);
  })
  .on('mouseout', unHighlightStations);


function highlightStations(stations) {
  d3.selectAll('.station.dimmable')
      .classed('dimmed', function (d) { return stations.indexOf(d.code) < 0; });
  d3.selectAll('.station.highlightable')
      .classed('highlighted', function (d) { return stations.indexOf(d.code) >= 0; });
}

function unHighlightStations() {
  d3.selectAll('.station.highlighted')
      .classed('highlighted', false);
  d3.selectAll('.station.dimmed')
      .classed('dimmed', false);
}

function toggleStations(stops) {
  stops.forEach(function (d) {
    activeStations[d] = !(activeStations[d] || false);
  });
  updateActiveStations();
}

function updateActiveStations() {
   d3.selectAll('.station')
      .classed('active', function (d) { return activeStations[d.code] || false; });

  //TODO: show detailed stats for these stations
  //FIXME
   d3.selectAll('.carrier')
      .classed('active', function (d) { return activeStations[d.code] || false; });
}
 


// Setup linked text to highlight particular carriers
// <a href='#' class='highlight-stops' data-stops='comma separated list of stop names to show'>
// <a href="#" class="hover-link-highlight" data-carrier="NS" >NS</a> |
d3.selectAll('.section-carriers .highlight-carriers')
  .on('click', function () {
    d3.event.preventDefault();
    var stops = d3.select(this).attr('data-carriers').split(',');
    console.log('click! ' + stops);
//    toggleCarriers(stops);
  })
  .on('mouseover', function () {
    var stops = d3.select(this).attr('data-carriers').split(',');
    highlightDepartures(stops);
  })
  .on('mouseout', unHighlightDepartures);  

function highlightDepartures(carriers) {
  d3.selectAll('.departure.dimmable')
      .style('opacity', function (d) { return carriers.indexOf(d.carrier) < 0 ? opacity[0] : opacity[1]; });
}

function unHighlightDepartures() {
  d3.selectAll('.departure.dimmable')
      .style('opacity', opacity[0]);
}









//Show the tooltip on the hovered over circle
function showTooltip(d) {
  
  //Save the circle element (so not the voronoi which is triggering the hover event)
  //in a variable by using the unique class of the voronoi (CountryCode)
  var element = d3.selectAll('.station.' + d.data.code)._groups[0][0];
  
  var proj = projection([d.data.lon, d.data.lat]);
  console.log(d.data.code);
  //console.log(proj);
  //console.log(element);

  //Define and show the tooltip using bootstrap popover
  //But you can use whatever you prefer
  $(element).tooltip(
  {
    placement: 'auto top', //place the tooltip above the item
    container: '#the-map', //the name (class or id) of the container
//       type: 'popover',
   trigger: 'manual',
    html : true,
  //  placement: 'fixed',
  //    gravity: 'right',
//    position: proj,
    content: function() { //the html content to show inside the tooltip
      return '<span style=font-size: 9px; text-align: center;>' + d.data.lang + '</span>'; 
    }
  });
  $(element).popover('show');

  //Make chosen circle more visible
  //element.style('opacity', 1);
  element.style.opacity = 1.0; // dit regelt de active/hover functie
          
}//function showTooltip


//Hide the tooltip when the mouse moves away
function removeTooltip(d) {

  //Save the circle element (so not the voronoi which is triggering the hover event)
  //in a variable by using the unique class of the voronoi (CountryCode)
  var element = d3.selectAll('.station.' + d.data.code)._groups[0][0];
  
  //Hide the tooltip
  $('.popover').each(function() {
 //   $(this).remove();
  }); 
  
  //Fade out the bright circle again
  element.style.opacity = 0.5; // dit regelt de active/hover functie
  
}//function removeTooltip

