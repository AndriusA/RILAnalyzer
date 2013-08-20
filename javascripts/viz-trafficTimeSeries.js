// Traffic and energy area plot
function TrafficChart() {
    var margin = {top: 150, right: 50, bottom: 30, left: 50},  // main graph
        margin2 = {top: 30, right: 50, bottom: 30, left: 50},   // zoomable chart
        width = $("#traffic-timeSeries").width() - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,  // main graph
        height2 = 150 - margin2.top - margin2.bottom;   // zoomable chart

    var parseDate = d3.time.format("%b %Y").parse;

    var x = d3.time.scale().range([0, width]),
        x2 = d3.time.scale().range([0, width]),         // zoomable area
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

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "center")
        .attr("y", 8)
        .attr("dy", "1.25em")
        .attr("transform", "translate(" + width*1.02 + ", " + height/2 + ")")
        .text("RNC State");

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

        // Y axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "center")
            .attr("y", 8)
            .attr("dy", "1.25em")
            .attr("transform", "translate(0)")
            .text("Data Volume");

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

    function brushed() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        focus.select("#dataChart").attr("d", area);
        focus.select("#rncChart").attr("d", area3);
        focus.select(".x.axis").call(xAxis);
    }

    this.bindTrafficData = useTrafficData;
    this.bindRilData = useRilData;
}


function AppBubbleChart() {
    // Various accessors that specify the four dimensions of data to visualize.
    function x(d) { return d.values.volume; }
    function y(d) { return d.values.packets; }
    function radius(d) { return d.values.promotions; }
    function color(d) { return d.key; }
    function key(d) { return d.key; }

    // Chart dimensions.
    var margin = {top: 30, right: 50, bottom: 30, left: 40},
        width =  $("#promotionsApps-bubble").width() - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Various scales. Need to set domain after loading data
    var xScale = d3.scale.log().range([0, width]),
        yScale = d3.scale.log().range([height, 0]),
        radiusScale = d3.scale.sqrt().range([0, 40]),
        // ordinal scale with a range of ten categorical colors
        colorScale = d3.scale.category10();

    // The x & y axes.
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format("d"));

    // Create the SVG container and set the origin.
    var svg = d3.select("#promotionsApps-bubble").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
  
    var area = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add an x-axis label.
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width + margin.left)
        .attr("y", height + margin.top - 10)
        .text("Data volume per app (bytes)");

    // Add a y-axis label.
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "center")
        .attr("y", margin.top + 10)
        .attr("x", margin.left + 10)
        .text("Number of packets sent");

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "center")
        .attr("x", width/2)
        .attr("y", margin.top+20)
        .text("Promotions (radius) per app");

    function useTrafficData(appData) {
        xScale.domain( d3.extent(appData.map(function(d) { return d.values.volume; })) );
        yScale.domain( d3.extent(appData.map(function(d) { return d.values.packets; })) );
        radiusScale.domain([0, d3.max(appData.map(function(d) { return d.values.promotions; }))])

        // xAxis.tickValues([1, 10, 100, 1000, 10000, 100000]).tickFormat(d3.format("d"));
        xAxis.tickFormat(d3.format("d"));

        // Add the x-axis.
        area.append("g")
            .attr("class", "x axis rotate")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the y-axis.
        area.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        // Add a dot per app
        var dot = area.append("g")
                .attr("class", "dots")
            .selectAll(".dot")
                .data(appData)
            .enter().append("circle")
                .attr("class", "dot")
                .style("fill", function(d) { return colorScale(color(d)); })
                .call(position)
                .sort(order);

        // Add a title.
        var text = area.append("g")
            .selectAll(".dotLabel")
                .data(appData)
            .enter().append("text")
                .attr("class", "dotLabel")
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("x", function(d) { console.log(d); return xScale(x(d)) })
                .attr("y", function(d) { return yScale(y(d)) })
                .text(function(d) { return d.key; });

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

    this.bindTrafficData = useTrafficData;
}

function bindData(trafficChart, appBubbleChart) {
    function sortByKey(a, b) {
        if (a.key < b.key)
            return -1;
        if (a.key > b.key)
            return 1;
        return 0;
    }

    d3.csv("data/trafficEvents.txt", function(error, csv) {
        var data=d3.nest()
            .key(function(d) {return d.TIME;})
            .sortKeys(d3.ascending)
            .rollup(function(d){
                return {
                    volume: d3.sum(d, function(g) { return +g.LENGTH;})
                }
            })
            .entries(csv)
            .filter(function(d) {return d.key !== "TIME"});

        var appData = d3.nest()
            .key(function(d) {return d.PACKAGE})
            .sortKeys(d3.ascending)
            .rollup(function(d){
                return {
                    volume: d3.sum(d, function(g) { return +g.LENGTH;}),
                    packets: d.length,
                    promotions: d3.set(_.pluck(d, "PROMOTIONID")).values().length
                }
            })
            .entries(csv)
            .filter(function(d) { return d.key !== "PACKAGE"; })
            .filter(function(d) { return d.values.packets > 0; });

        // Add points where traffic is zero for correct interpolation
        var newData = [];
        if (data.length > 0) {
            var previousdate = data[0].key;
            data.forEach(function(row) {
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
        
        data = data.concat(newData).sort(sortByKey);
        trafficChart.bindTrafficData(data);
        appBubbleChart.bindTrafficData(appData);
    });

    // Overlay the RNC state information over the area plot
    d3.csv("data/ril_log.csv", function(error, rilCsv) {
        var rilData = rilCsv;
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

        trafficChart.bindRilData(rilData);
    });
}

function drawStuff() {
    var trafficChart = new TrafficChart();
    var appBubbleChart = new AppBubbleChart();
    bindData(trafficChart, appBubbleChart);
}

drawStuff();