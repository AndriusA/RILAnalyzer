var context = cubism.context()
    .serverDelay(30 * 1000) // allow 30 seconds of collection lag
    .step(5 * 60 * 1000) // five minutes per value
    .size(840);

var horizon = context.horizon(); // a default horizon chart

var cube = context.cube("http://rilanalyzer.smart-e.org:1080");

var metrics = [
  cube.metric("sum(request.eq(type,'random'))"),
];

d3.select("#traffic-timeSeries").call(function(div) {

  div.append("div")
      .attr("class", "axis")
      .call(context.axis().orient("top"));

  div.selectAll(".horizon")
      .data(metrics)
    .enter().append("div")
      .attr("class", "horizon")
      .call(context.horizon().extent([-20, 20]));

  div.append("div")
      .attr("class", "rule")
      .call(context.rule());

});