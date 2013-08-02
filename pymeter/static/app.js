window.onload = function(){
	// Setup gauges
	window.gaugeup = new JustGage({
		id: "gup", 
		value: 0, 
		min: 0,
		max: 1000,
		title: "Up",
		label: "Mbps",
		levelColors: ["#99FFFF","#9900FF"],
		levelColorsGradient: true
	});
	window.gaugedown = new JustGage({
		id: "gdown", 
		value: 0, 
		min: 0,
		max: 1000,
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

	window.spinTarget = document.getElementById('spinner');
	window.spinner = new Spinner(opts).spin(window.spinTarget);
	window.spinner.stop();

	(function getAndSetBw(){
		$('#spinner').show();
		window.spinner.spin(window.spinTarget);
		$.getJSON('/bw', function(data){
			window.gaugeup.refresh(Math.floor(data.out/1000000)*8);
			window.gaugedown.refresh(Math.floor(data.in/1000000)*8);
			$('#spinner').fadeOut('slow', function(){window.spinner.stop();});
			setTimeout(getAndSetBw, 5000);
		});
	})();


	// Graph history data
	var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%Y%m%d").parse;

	var x = d3.time.scale()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var upLine = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x(d.time); })
	    .y(function(d) { return y(d.out); });

	 var downLine = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x(d.time); })
	    .y(function(d) { return y(d.in); });

	var svg = d3.select("#history").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom).append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Format date and data
	d3.json("/history", function(error, data){

		data.forEach(function(d){
			d.time = parseDate(moment.unix(d.time).toDate());
			d.out = Math.floor(d.out/1000000)*8;
			d.in = Math.floor(d.in/1000000)*8;
		});
		console.log(data[0], data[data.length - 1]);

		// Scale the range of the data
	    x.domain(d3.extent(data, function(d) { return d.time; }));
	    y.domain([0, d3.max(data, function(d) { return Math.max(d.in, d.out); })]);

		console.log('Finished formatting data');

		//Added lines for up and down bw
		//svg.append('path').attr('d', upLine(data));
		//svg.append('path').attr('d', downLine(data));

		//Add Axis
		svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
		svg.append("g").attr("class", "y axis").call(yAxis);
	});
};