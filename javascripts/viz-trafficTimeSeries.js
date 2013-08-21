// Traffic and energy area plot
function TrafficChart(svg, trafficDataModel, rilDataModel) {
    var margin = {top: 200, right: 50, bottom: 30, left: 50},  // main graph
        margin2 = {top: 30, right: 50, bottom: 30, left: 50},   // zoomable chart
        width = svg[0][0].clientWidth / 2 - margin.left - margin.right,
        width2 = svg[0][0].clientWidth - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom,  // main graph
        height2 = 150 - margin2.top - margin2.bottom;   // zoomable chart

    var parseDate = d3.time.format("%b %Y").parse;

    var x = d3.time.scale().range([0, width]),
        x2 = d3.time.scale().range([0, width2]),         // zoomable area
        y = d3.scale.linear().range([height, 0]),       // main traffic chart
        y2 = d3.scale.log().range([height2, 0]),        // zoomable area
        y3 = d3.scale.linear().range([height/2, 0]);    // RNC states chart

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left"),
        yAxis3 = d3.svg.axis().scale(y3).orient("right");

    var brush = d3.svg.brush()
        .x(x2)
        .on("brush", brushed);

    var area = d3.svg.area()
        .interpolate("step")
        .x(function(d) { return x(d.key); })
        .y0(height)
        .y1(function(d) { return y(d.values.volume); });

    var area2 = d3.svg.area()
        .interpolate("step")
        .x(function(d) { return x2(d.key); })
        .y0(height2)
        .y1(function(d) { return y2(d.values.volume); });

    var area3 = d3.svg.line()
        .interpolate("step")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y3(d.rncValue); });

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "center")
        .attr("y", height2 + margin2.top + height/2 + 20)
        .attr("x", width+20)
        .attr("dy", "1.25em")
        .text("RNC State");

    // Y axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "center")
        .attr("dy", "1.25em")
        .attr("x", 20)
        .attr("y", margin.top-40)
        .text("Data Volume")
        .append("tspan")
        .attr("dy", "1.25em")
        .attr("x", 20)
        .text("(bytes)");

    yAxis3.tickValues([1, 40, 100]).tickFormat(function(d, i){
        if (d ===  40)
            return "FACH";
        if (d === 100)
            return "DCH";
        if (d === 1)
            return "IDLE";
        return d;
    });

    focus.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + "," + height/2 + ")")
        .call(yAxis3);

    function useTrafficData(data) {
        x.domain(d3.extent(data.map(function(d) { return d.key; })));
        y.domain([1, d3.max(data.map(function(d) { return d.values.volume; }))]);
        x2.domain(x.domain());
        y2.domain(y.domain());

        focus.append("path")
            .datum(data)
            .attr("id", "dataChart")
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
    }

    function useRilData(rilData) {
        console.log("use ril data", rilData)
        y3.domain([0, d3.max(rilData.map(function(d) { return d.rncValue; }))]);

        focus.append("path")
            .datum(rilData)
            .attr("id", "rncChart")
            .attr("clip-path", "url(#clip)")
            .attr("d", area3)
            .attr("transform", "translate(0," + height/2 + ")")
            .style("fill", "none")
            .style("stroke", "orange");
    }

    var anotherChart = undefined;

    this.bindChartTimeframe =  function(chart) {
        console.log("binding");
        console.log(this);
        anotherChart = chart;
    }

    function brushed() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        if (! _.isUndefined(anotherChart)) {
            anotherChart.adjustTimeframe(x.domain());
        }
        focus.select("#dataChart").attr("d", area);
        focus.select("#rncChart").attr("d", area3);
        focus.select(".x.axis").call(xAxis);
    }

    useTrafficData(trafficDataModel.getTrafficData());
    useRilData(rilDataModel.getRilData());
}


function AppBubbleChart(svg, dataModel) {
    // Various accessors that specify the four dimensions of data to visualize.
    function x(d) { return d.values.volume; }
    function y(d) { return d.values.packets; }
    function radius(d) { return d.values.promotions; }
    function color(d) { return d.key; }
    function key(d) { return d.key; }

    // Chart dimensions.
    var margin = {top: 200, right: 50, bottom: 30, left: 50},
        width = svg[0][0].clientWidth / 2 - margin.right*2,
        height = 550 - margin.top - margin.bottom;

    // Various scales. Need to set domain after loading data
    var xScale = d3.scale.log().range([0, width]),
        yScale = d3.scale.log().range([height, 0]),
        radiusScale = d3.scale.sqrt().range([0, 60]),
        // ordinal scale with a range of ten categorical colors
        colorScale = d3.scale.category10();

    // The x & y axes.
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format("d"));
  
    var area = svg.append("g")
        .attr("transform", "translate(" + (margin.left*2 + margin.right + width) + "," + margin.top + ")");

    // Add an x-axis label.
    area.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("dx", width)
        .attr("dy", height - 10)
        .text("Data volume per app (bytes)");

    // Add a y-axis label.
    area.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "center")
        .attr("dx", 10)
        .attr("dy", 10)
        .text("Number of packets sent");

    area.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "center")
        .attr("dx", width/2-margin.left)
        .attr("dy", -10)
        .text("Promotions (radius) per app");

    var dotCanvas = area.append("g").attr("class", "dots");
    var labelCanvas = area.append("g");

    initTrafficData(dataModel.getAppData());

    function initTrafficData(appData) {
        console.log("appData - useTrafficData", appData);
        xScale.domain( [d3.min(appData.map(function(d) { return d.values.volume; })) / 2, d3.max(appData.map(function(d) { return d.values.volume; }))] );
        yScale.domain( [1, d3.max(appData.map(function(d) { return d.values.packets; }))] );
        radiusScale.domain([0, d3.max(appData.map(function(d) { return d.values.promotions; }))])

        // Add the x-axis.
        area.append("g")
            .attr("class", "x axis rotate")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the y-axis.
        area.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        xAxis.tickFormat(d3.format("d"));
        useTrafficData(appData);
        console.log("asd");
    }

    function useTrafficData(appData) {
        // Add a dot per app
        var dot = dotCanvas.selectAll(".dot")
                .data(appData, function(d) { return d.key+d.values.volume+d.values.packets+d.values.promotions; })

        dot.enter().append("circle")
                .attr("class", "dot")
                .style("fill", function(d) { return colorScale(color(d)); })
                .style("fill-opacity", "0.7")
                .call(position)
                .sort(order)
                

        dot.exit().remove();

        // Add a title.
        var text = labelCanvas.selectAll(".dotLabel")
                .data(appData, function(d) { return d.key+d.values.volume+d.values.packets+d.values.promotions; });

        text.enter().append("text")
                .attr("class", "dotLabel")
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("dy", "1.25em")
                .attr("x", function(d) { return xScale(x(d)) })
                .attr("y", function(d) { return yScale(y(d)) })
                .text(function(d) { return d.key; })
                .append("tspan")
                .attr("dy", "1.25em")
                .attr("x", function(d) { return xScale(x(d)) })
                .text(function(d) { return "(" + d.values.promotions.toString() + ")"; });

        text.exit().remove();

        // Positions the dots based on data.
        function position(dot) {
            dot.attr("cx", function(d) { return xScale(x(d)); })
                .attr("cy", function(d) { return yScale(y(d)); })
                .attr("r", function(d) { return radiusScale(radius(d)); });
        }

        // Defines a sort order so that the smallest dots are drawn on top.
        function order(a, b) {
            return radius(b) - radius(a);
        }
    }



    this.adjustTimeframe = function(timeframe){
        console.log("adjusting bubblechart to", timeframe);
        var timeStart = Date.parse(timeframe[0]);
        var timeEnd = Date.parse(timeframe[1]);
        useTrafficData(dataModel.getAppData(timeStart, timeEnd));
        // dataModel.getAppData(timeStart, timeEnd);
    }
}

function TrafficDataModel() {
    var rawTrafficData = undefined;

    var appData = [];
    var trafficData = [];

    function sortByKey(a, b) {
        if (a.key < b.key)
            return -1;
        if (a.key > b.key)
            return 1;
        return 0;
    };

    this.readData = function(filename, continuation) {
        d3.csv(filename, function(error, csv) {
            rawTrafficData = csv;
            continuation();
        });
    }

    this.getTrafficData = function(timeStart, timeEnd) {
        //FIXME: implement timeframe selection logic

         trafficData = d3.nest()
            .key(function(d) { 
                return Math.round(parseInt(d.TIME)/1000)*1000;
            })
            .sortKeys(d3.ascending)
            .rollup(function(d){
                return {
                    volume: d3.sum(d, function(g) { return +g.LENGTH;})
                }
            })
            .entries(rawTrafficData)
            .filter(function(d) {return d.key !== "NaN"});
        // console.log(trafficData);

        // Add points where traffic is zero for correct interpolation
        var newData = [];
        if (trafficData.length > 0) {
            var previousdate = trafficData[0].key;
            trafficData.forEach(function(row) {
                if(row.key !== previousdate){
                    var newKeyStart = parseInt(previousdate) + 1000;
                    if (newKeyStart < parseInt(row.key)) {
                        newData.push({ 
                            key: newKeyStart.toString(),
                            values: {volume: 1},
                        });
                    }
                    var newKeyEnd = parseInt(row.key) - 1000;
                    if (newKeyEnd > parseInt(previousdate)) {
                        newData.push({ 
                            key: newKeyEnd.toString(),
                            values: {volume: 1},
                        });
                    }
                    previousdate = row.key;
                }
            });
        }

        trafficData = trafficData.concat(newData).sort(sortByKey);
        return trafficData;
    }


    this.getAppData = function(timeStart, timeEnd) {
        var filteredCsv = rawTrafficData;
        if (!_.isUndefined(timeStart) && !_.isUndefined(timeEnd))
            filteredCsv = rawTrafficData.filter(function(d){
                return d.TIME >= timeStart.toString() && d.TIME <= timeEnd.toString();
            })
        return d3.nest()
            .key(function(d) {return d.PACKAGE})
            .sortKeys(d3.ascending)
            .rollup(function(d){
                return {
                    volume: d3.sum(d, function(g) { return +g.LENGTH;}),
                    packets: d.length,
                    promotions: d3.set(_.pluck(d, "PROMOTIONID")).values().length
                }
            })
            .entries(filteredCsv)
            .filter(function(d) { return d.key !== "PACKAGE"; })
            .filter(function(d) { return d.values.packets > 0; });
    }
}

function RilDataModel() {
    var rilData = [];

    this.readData = function(filename, continuation) {
        d3.csv(filename, function(error, rilCsv) {
            rilData = rilCsv;
            rilData.forEach(function(d) {
                if (d.rncState == "IDLE" || d.rncState == "IDLE_CCCH")
                    d.rncValue = 1;
                else if (d.rncState == "PCH")
                    d.rncValue = 2;
                else if (d.rncState == "FACH")
                    d.rncValue = 40;
                else if (d.rncState == "DCH")
                    d.rncValue = 100;
                else
                    d.rncValue = 0;
            });
            console.log("read ril data", rilData);
            continuation();
        });
    }
    

    this.getRilData = function() {
        return rilData;
    }
}

function drawStuff() {
    var trafficDataFilename = "data/trafficEvents.txt";
    var rilDataFilename = "data/ril_log.csv";
    var trafficDataModel = new TrafficDataModel();
    var rilDataModel = new RilDataModel();

    var appBubbleChart, trafficChart;
    var width = $("#traffic-timeSeries").width();
    var height = 900;  // main graph
    var svg = d3.select("#graphs").append("svg")
        .attr("width", width)
        .attr("height", height);

    trafficDataModel.readData(trafficDataFilename, initTraffic);
    function initTraffic() {
        appBubbleChart = new AppBubbleChart(svg, trafficDataModel);
        rilDataModel.readData(rilDataFilename, initRil);
        function initRil() {
            trafficChart = new TrafficChart(svg, trafficDataModel, rilDataModel); 
            trafficChart.bindChartTimeframe(appBubbleChart);
        }
    }
}

drawStuff();