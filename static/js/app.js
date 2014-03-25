var bwdata = [];
$(document).ready(function(){
	// Setup gauges
	window.gaugeup = new JustGage({
		id: "gup", 
		value: 0, 
		min: 0,
		max: maxBW,
		title: "Up",
		label: "Mbps",
		levelColors: ["#99FFFF","#9900FF"],
		levelColorsGradient: true
	});
	window.gaugedown = new JustGage({
		id: "gdown", 
		value: 0, 
		min: 0,
		max: maxBW,
		title: "Down",
		label: " Mbps",
		levelColors: ["#99FFFF","#9900FF"],
		levelColorsGradient: true
	});
	var opts = {
		lines: 13, // The number of lines to draw
		length: 20, // The length of each line
		width: 10, // The line thickness
		radius: 30, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};

	//Setup some random data
	for (var i = 0; i < 20; i++) {
		var up = Math.round(Math.random()*1000);
		var down = Math.round(Math.random()*1000);
		bwdata.splice(0, 0, {"timeDiff": 5, "in": (down*1000000*5)/8, "time": (((new Date).getTime()/1000)-(100))+(5*i), "out": (up*1000000*5)/8});
	};
	graphHistory($.extend(true, [], bwdata));

	window.spinTarget = document.getElementById('spinner');
	window.spinner = new Spinner(opts).spin(window.spinTarget);
	window.spinner.stop();

	function getAndSetBw(){
		var up = Math.round(Math.random()*1000);
		var down = Math.round(Math.random()*1000);
		window.gaugeup.refresh(up);
		window.gaugedown.refresh(down);
		//Generate some random data
		bwdata.splice(0, 0, {"timeDiff": 5, "in": (down*1000000*5)/8, "time": ((new Date).getTime()/1000), "out": (up*1000000*5)/8});
	}

	function graphHistory(data){
		//Setup chart size and margins
		var margin = {top: 20, right: 80, bottom: 30, left: 50},
    		width = $(window).width() * .8 - margin.left - margin.right,
    		height = 250 - margin.top - margin.bottom;

		//Graph scales
		var x = d3.time.scale().range([0, width]);
		//	Decide where we are from b/s to Gb/s
		//	Setup the orders of magnitudes we will use for the y scale
		var orders = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps']
		//	Find out our current max bandwidth
		var bps = d3.max(data, function(d){ return Math.ceil((Math.max(d.in, d.out)*8)/d.timeDiff); });
		//	Calc which order we want to use
		var orderIndex = Math.floor(bps.toString().length / 3);
		var y = d3.scale.linear().range([height, 0]);

		//Setup Axis
		var xAxis = d3.svg.axis().scale(x).orient("bottom");
		var yAxis = d3.svg.axis().scale(y).orient("left");

		//Line definition
		var line = d3.svg.line().interpolate("basis").x(function(d) { return x(d.time); }).y(function(d) { return y(d.bytes); });

		//Setup svg in dom
		$("#history").empty();
		var svg = d3.select("#history").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");		

		// Setup graph catagories
		var color = d3.scale.category10();
		color.domain(['in','out']);

		// Setup line colors
		var lineColor = {
			in: "#9900FF",
			out: "#0980EE"
		}

		// Reverse data array
		data = data.reverse();

		//Map data to arrays for each line
		var bytes = color.domain().map(function(name) {
			return {
				name: name,
				values: data.map(function(d) {
					return {time: Math.floor(d.time)*1000, bytes: (d[name] / (Math.pow(10, orderIndex * 3)) * 8)/d.timeDiff};
				})
			};
		});
		console.log(bytes);
		// Setup Domains for x and y scale
		x.domain([data[0].time*1000, data[data.length - 1].time*1000]);
		y.domain([0, d3.max(bytes, function(c) { 
				return d3.max(c.values, function(v) { 
					return v.bytes; 
				});
			})
		]);

		//Append x axis
		svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
		svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("y", 6).attr("dy", ".7em").text(orders[orderIndex]);

		//Setup data series
		var bytes = svg.selectAll(".bytes").data(bytes).enter().append("g");
		bytes.append("path").attr("class", "line").attr("d", function(d) { return line(d.values); }).style("stroke", function(d) { return lineColor[d.name]; }).style("fill","transparent").attr("id", function(d) { return d.name; });
		bytes.append("text").datum(function(d) { 
			if(d.name == "in"){
				return {name: "Down", value: d.values[d.values.length - 1]};
			} else{
				return {name: "Up", value: d.values[d.values.length - 1]};
			}
		}).attr("transform", function(d) {
			if(d.name == "Up"){
				return "translate(" + x(d.value.time) + "," + (y(d.value.bytes) - 10) + ")"; 
			} else{
				return "translate(" + x(d.value.time) + "," + (y(d.value.bytes) + 10) + ")"; 
			}
		}).attr("x", 15).attr("y", -10).attr("dy", "1em").text(function(d) { 
			return d.name; 
		});

		//Done updating kill spinner
		$('#spinner').fadeOut('slow', function(){window.spinner.stop();});
	}

	updateLoop();
	function updateLoop(){
		setTimeout(updateLoop, 5000);
		$('#spinner').show();
		window.spinner.spin(window.spinTarget);
		getAndSetBw();
		graphHistory($.extend(true, [], bwdata));
	}
});


