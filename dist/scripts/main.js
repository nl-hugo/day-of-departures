"use strict";function addSvg(t,e,n){var a={top:10,left:10,right:10,bottom:10};d3.select("#"+t).append("svg").attr("width",e+a.left+a.right).attr("height",n+a.top+a.bottom).append("g").attr("class","g-"+t).attr("transform","translate("+a.left+","+a.top+")")}function drawStations(t,e){var n={top:0,right:0,bottom:10,left:0},a=645-n.left-n.right,o=900-n.top-n.bottom,r=d3.geoMercator().center([5.4,52.088]).translate([a/2,o/2]).scale(12*a),i=d3.geoPath().projection(r);d3.selectAll(".g-the-map").append("g").attr("class","g-map").append("path").datum(topojson.mesh(t,t.objects.area,function(t,e){return t===e})).attr("class","country").attr("d",i);var l=d3.select(".g-the-map").append("g").attr("class","g-stations"),s=l.selectAll(".g-station").data(e,function(t){return t.code});s.enter().append("circle").attr("class",function(t){return"station hoverable dimmable highlightable "+t.code+" "+t.type}).classed("active",function(t){return activeStations[t.code]}).attr("cx",function(t){return r([t.lon,t.lat])[0]}).attr("cy",function(t){return r([t.lon,t.lat])[1]}).attr("r",1.5),carriers.domain(d3.map(_timetable,function(t){return t.carrier}).keys());var l=d3.select(".g-the-map").append("g").attr("class","g-departures"),c=l.selectAll(".g-departure").data(_timetable);c.enter().append("g").attr("class","g-departure").append("circle").attr("class",function(t){return"departure dimmable "+t.station+" "+t.carrier+" g-"+minuteFormat(t.time)}).attr("fill",function(t){return carriers(t.carrier)}).attr("r",function(t){return types(t.type)}||2).attr("transform",function(t){return"translate("+r([t.lon,t.lat])+")"}).style("opacity",opacity[0]);var d=d3.voronoi().x(function(t){return r([t.lon,t.lat])[0]}).y(function(t){return r([t.lon,t.lat])[1]}).extent([[0,0],[a,o]]);l.append("g").attr("class","polygons").selectAll("path").data(d.polygons(e)).enter().append("path").attr("d",function(t){return t?"M"+t.join("L")+"Z":null}).style("fill","none").style("pointer-events","all").on("mouseover",function(t){div.transition().duration(200).style("opacity",.9),div.html(t.data.lang).attr("class","tooltip").style("left",r([t.data.lon,t.data.lat])[0]+120+"px").style("top",r([t.data.lon,t.data.lat])[1]+100+"px"),highlightStations([t.data.code])}).on("mouseout",function(){div.transition().duration(500).style("opacity",0),unHighlightStations()}).on("click",function(t){toggleStations([t.data.code])})}function drawBusyStations(t){console.log(t);var e={top:5,right:10,bottom:5,left:10},n=56-e.left-e.right,a=40-e.top-e.bottom,o=d3.scaleTime().range([0,n]),r=d3.scaleSequential(d3.interpolatePiYG);console.log(r);var i=d3.scaleSequential(d3.interpolateViridis).domain([0,45]);console.log(i),console.log(i.domain()),console.log(i(10));var l=d3.scaleQuantize().domain([-1,50]).range([0,1]);console.log(o.domain()),console.log(o.range()),console.log(d3.schemeCategory20c);var s=d3.axisBottom(o);o.domain([d3.min(t,function(t){return t.values[0].key}),d3.max(t,function(t){return t.values[t.values.length-1].key})]),console.log(o.domain()),console.log(l.domain()),console.log(l.range()),console.log(l(1)),console.log(l(10)),console.log(l(30)),console.log(l(40)),console.log(l(50));var c=d3.select(".g-the-stations"),d=c.selectAll("g").data(t).enter().append("g").attr("class","carrier").attr("id",function(t){return"carrier-"+t.key}).attr("transform",function(t,e){return"translate(0,"+e*a*1.5+")"}).classed("active",function(t){return activeStations[t.key]});d.append("g").attr("class","x axis").attr("transform","translate(0,"+a+")").call(s),d.selectAll("rect").data(function(t){return console.log(t),t.values}).enter().append("rect").attr("class","rect").attr("width",5).attr("height",10).attr("x",function(t){return o(t.key)}).attr("y",10).attr("fill",function(t){return i(t.value)||"#ccc"}),d.append("text").attr("x",n-6).attr("y",a-6).attr("fill","#aaa").text(function(t){return t.key}),c.append("line").attr("x1",o("15")).attr("x2",o("15")).attr("y1",0).attr("y2",100).attr("stroke","red")}function drawBusyStations2(t){console.log(t);var e={top:5,right:10,bottom:5,left:10},n=200-e.left-e.right,a=40-e.top-e.bottom,o=d3.scaleTime().range([0,n]);console.log(o.domain()),console.log(o.range());var r=d3.axisBottom(o);o.domain([d3.min(t,function(t){return t.values[0].key}),d3.max(t,function(t){return t.values[t.values.length-1].key})]),console.log(o.domain());var i=d3.local(),l=d3.local(),s=d3.local(),c=d3.select(".g-the-stations"),d=c.selectAll("g").data(t).enter().append("g").attr("class","carrier").attr("id",function(t){return"carrier-"+t.key}).attr("transform",function(t,e){return"translate(0,"+e*a*1.5+")"}).classed("active",function(t){return activeStations[t.key]}).each(function(t){var e=i.set(this,d3.scaleLinear().domain([0,d3.max(t.values,function(t){return t.value})]).range([a,0]));l.set(this,d3.area().x(function(t){return o(t.key)}).y0(a).y1(function(t){return e(t.value)})),s.set(this,d3.line().x(function(t){return o(t.key)}).y(function(t){return e(t.value)}))});d.append("g").attr("class","x axis").attr("transform","translate(0,"+a+")").call(r),d.append("path").attr("class","area").attr("d",function(t){return l.get(this)(t.values)}),d.append("path").attr("class","line").attr("d",function(t){return s.get(this)(t.values)}),d.append("text").attr("x",n-6).attr("y",a-6).attr("fill","#aaa").text(function(t){return t.key}),c.append("line").attr("x1",o("15")).attr("x2",o("15")).attr("y1",0).attr("y2",100).attr("stroke","red")}function ready(t,e,n,a){if(t)return console.error(t);e.forEach(function(t){t.lat=+t.lat,t.lon=+t.lon}),_timetable=n.filter(function(t){return"Stopbus i.p.v. trein"!==t.type&&"Snelbus"!==t.type}),_timetable.forEach(function(t){var n=e.filter(function(e){return e.code===t.station})[0];t.time=d3.isoParse(t.time),t.lat=n.lat,t.lon=n.lon}),d3.selectAll("div.chart")._groups[0].forEach(function(t){addSvg(t.id,+t.dataset.width,+t.dataset.height)}),drawControls(),drawStations(a,e);var o=(d3.nest().key(function(t){return t.carrier}).key(function(t){return t.time}).rollup(function(t){return t.length}).entries(_timetable),d3.timeFormat("%H")),r=d3.nest().key(function(t){return t.station}).key(function(t){return o(t.time)}).sortKeys(d3.ascending).rollup(function(t){return t.length}).entries(_timetable);console.log(r),drawBusyStations(r)}function drawControls(){var t=[1,2,4,8],e=d3.select(".g-the-controls").selectAll("text").data(t,function(t){return t});e.enter().append("text").attr("x",function(t,e){return 20*e}).attr("dy",".35em").on("click",setSpeed).text(function(t){return t})}function setSpeed(t){console.log("set speed to: "+t),stopTimer(),speed=t,startTimer()}function updateClock(t){var e=d3.select(".g-the-clock").selectAll("text").data([t],function(t){return t});console.log(t),e.enter().append("text").attr("x",100).attr("dy",".35em").text(function(t){return t}),e.exit().remove()}function updateTime(t){var e=Math.floor(t/60),n=t%60,a=("00"+e).slice(-2)+":"+("00"+n).slice(-2);console.log(("0000"+t).slice(-4)+"] departure time: "+a),updateClock(a),d3.select(".g-the-map").selectAll(".g-"+("00"+e).slice(-2)+("00"+n).slice(-2)).transition().duration(500/speed).style("opacity",opacity[1]).transition().delay(1e3/speed).duration(500/speed).style("opacity",opacity[0])}function stopTimer(){console.log("stopping"),running?(clearInterval(interval),running=!1,console.log("stopped")):console.log("not running")}function startTimer(){running||startTimer2(i)}function startTimer2(t){console.log("starting"),running||(running=!0,console.log("started"),i=t,interval=setInterval(function(){i<n?updateTime(i):i=-1,i++},1e3/speed))}function restartTimer(){console.log("restart..."),stopTimer(),i=805,startTimer()}function highlightStations(t){d3.selectAll(".station.dimmable").classed("dimmed",function(e){return t.indexOf(e.code)<0}),d3.selectAll(".station.highlightable").classed("highlighted",function(e){return t.indexOf(e.code)>=0})}function unHighlightStations(){d3.selectAll(".station.highlighted").classed("highlighted",!1),d3.selectAll(".station.dimmed").classed("dimmed",!1)}function toggleStations(t){t.forEach(function(t){activeStations[t]=!activeStations[t]}),updateActiveStations()}function updateActiveStations(){d3.selectAll(".station").classed("active",function(t){return activeStations[t.code]||!1}),d3.selectAll(".carrier").classed("active",function(t){return activeStations[t.code]||!1})}function highlightDepartures(t){d3.selectAll(".departure.dimmable").style("opacity",function(e){return t.indexOf(e.carrier)<0?opacity[0]:opacity[1]})}function unHighlightDepartures(){d3.selectAll(".departure.dimmable").style("opacity",opacity[0])}function showTooltip(t){var e=d3.selectAll(".station."+t.data.code)._groups[0][0];projection([t.data.lon,t.data.lat]);console.log(t.data.code),$(e).tooltip({placement:"auto top",container:"#the-map",trigger:"manual",html:!0,content:function(){return"<span style=font-size: 9px; text-align: center;>"+t.data.lang+"</span>"}}),$(e).popover("show"),e.style.opacity=1}function removeTooltip(t){var e=d3.selectAll(".station."+t.data.code)._groups[0][0];$(".popover").each(function(){}),e.style.opacity=.5}console.log(d3.version);var minuteFormat=d3.timeFormat("%H%M"),speed=1,opacity=[0,.5],num=0,count=0,_timetable,div=d3.select("body").append("div").attr("class","tooltip").style("opacity",0),carriers=d3.scaleOrdinal(d3.schemeCategory10),types=d3.scaleOrdinal().domain(["ICE International","Intercity direct","Thalys","Intercity","Sneltrein","Sprinter","stoptrein"]).range([12,12,12,8,6,4,4]),activeStations={UT:!0};queue().defer(d3.csv,"../data/stations.csv").defer(d3.csv,"../data/timetable.csv").defer(d3.json,"../data/gemeente.json").await(ready);var n=1440,i=805,running=!1,interval;d3.selectAll(".section-stations .highlight-stops").on("click",function(){d3.event.preventDefault();var t=d3.select(this).attr("data-stops").split(",");console.log("click! "+t),toggleStations(t)}).on("mouseover",function(){var t=d3.select(this).attr("data-stops").split(",");console.log("mouseover! "+t),highlightStations(t)}).on("mouseout",unHighlightStations),d3.selectAll(".section-carriers .highlight-carriers").on("click",function(){d3.event.preventDefault();var t=d3.select(this).attr("data-carriers").split(",");console.log("click! "+t)}).on("mouseover",function(){var t=d3.select(this).attr("data-carriers").split(",");highlightDepartures(t)}).on("mouseout",unHighlightDepartures);