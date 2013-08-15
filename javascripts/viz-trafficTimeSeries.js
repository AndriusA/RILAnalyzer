var margin = {top: 10, right: 10, bottom: 100, left: 40},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = 860 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

var parseDate = d3.time.format("%b %Y").parse;

var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.length); });

var area2 = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d.length); });

var svg = d3.select("#traffic-timeSeries").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("networklog.txt", function(error, data) {

  data.forEach(function(d) {
    d.date = new Date(d.date);
    d.length = +d.length;
  });

  x.domain(d3.extent(data.map(function(d) { return d.date; })));
  y.domain([0, d3.max(data.map(function(d) { return d.length; }))]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus.append("path")
      .datum(data)
      .attr("clip-path", "url(#clip)")
      .attr("d", area);

  focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  context.append("path")
      .datum(data)
      .attr("d", area2);

  context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);
});

function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.select("path").attr("d", area);
  focus.select(".x.axis").call(xAxis);
}

// var context = cubism.context()
//     .serverDelay(1 * 1000) // allow 30 seconds of collection lag
//     .step(1 * 60 * 1000) // five minutes per value
//     .size(840);

// var horizon = context.horizon(); // a default horizon chart

// var cube = context.cube("http://rilanalyzer.smart-e.org:1081");

// var metrics = [
//   cube.metric("sum(cube_request)"),
//   cube.metric("sum(cube_compute)"),
//   cube.metric("sum(random)"),
// ];

// d3.select("#traffic-timeSeries").call(function(div) {

//   div.append("div")
//       .attr("class", "axis")
//       .call(context.axis().orient("top"));

//   div.selectAll(".horizon")
//       .data(metrics)
//     .enter().append("div")
//       .attr("class", "horizon")
//       .call(context.horizon().extent([-200, 200]));

//   div.append("div")
//       .attr("class", "rule")
//       .call(context.rule());

// });