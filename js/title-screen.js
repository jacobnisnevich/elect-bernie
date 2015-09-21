$(document).ready(function() {
	$("#new-game-button").click(function() {
		$.getJSON("js/initial-game-state.json", function(gameState) {
			game = new Game(gameState);
			$("#title-screen").hide();
			$("#main-game-screen").show();
		});
	});

	$("#donate-button").click(function() {
		window.open("https://secure.actblue.com/contribute/page/reddit-for-bernie", "_blank");
	});

	// Game buttons

	$("#play-button").click(function() {
		game.playGame();
		$("#play-button i").css("color", "rgb(245, 91, 91)");
		$("#ff-button i").css("color", "rgb(255, 255, 255)");
		$("#pause-button i").css("color", "rgb(255, 255, 255)");
		showMessage("Game speed set to 1");
	});

	$("#pause-button").click(function() {
		game.pauseGame();
		$("#pause-button i").css("color", "rgb(245, 91, 91)");
		$("#ff-button i").css("color", "rgb(255, 255, 255)");
		$("#play-button i").css("color", "rgb(255, 255, 255)");
		showMessage("Game speed set to 0");
	});

	$("#ff-button").click(function() {
		game.fastForwardGame();
		$("#ff-button i").css("color", "rgb(245, 91, 91)");
		$("#pause-button i").css("color", "rgb(255, 255, 255)");
		$("#play-button i").css("color", "rgb(255, 255, 255)");
		showMessage("Game speed set to 2");
	});

	$("#us-map").on("click", "#states path", function() {
		alert("You clicked on " + $(this).data("state"));
	});

	$("#settings-button").click(function() {
		$("#pause-button").click();
		$("#game-cover").show();
		$("#settings-popup").fadeIn("fast");
	});

	$("#finance-button").click(function() {
		$("#pause-button").click();
		$("#game-cover").show();
		$("#finance-popup").fadeIn("fast");
	});

	$(".popup-close").click(function() {
		$("#play-button").click();
		$("#game-cover").hide();
		$($(this).closest(".popup")[0]).fadeOut("fast");
	});


	// Draw map

	width = 600;
	height = 400;

	var projection = d3.geo.albersUsa()
		.scale(600)
		.translate([width / 2, height / 2]);

	path = d3.geo.path()
			
	var svg = d3.select("#main-game-screen").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "us-map");

	svg.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height)
		.on("click", clicked);

	g = svg.append("g")
		.attr("transform", "scale(0.7, 0.7)");

	d3.json("js/us.json", function(error, us) {
		var data = topojson.feature(us, us.objects.states).features;
		d3.tsv("js/us-state-names.tsv", function(tsv) {
			var names = {};
			var codes = {};

			tsv.forEach(function(d, i){
				names[d.id] = d.name;
				codes[d.id] = d.code;
			});

			g.append("g")
				.attr("id", "states")
				.selectAll("path")
				.data(topojson.feature(us, us.objects.states).features)
				.enter().append("path")
				.attr("d", path)
				.on("click", clicked)
				.attr("data-state", function(d) {
					return names[d.id]
				})
				.attr("id", function(d) {
					return codes[d.id]
				})

			g.append("path")
				.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
				.attr("id", "state-borders")
				.attr("d", path);
		});
	});

});

var game, centered, path, g, width, height;

function showMessage(message) {
	$("#message-area").fadeIn();
	$("#message-area").text(message);
	setTimeout(function() {
		$("#message-area").fadeOut();
	}, 3000);
};

function clicked(d) {
	var x, y, k, scale;

	d3.tsv("js/us-state-names.tsv", function(tsv) {
		var names = {};
		var codes = {};
		
		tsv.forEach(function(d, i){
			names[d.id] = d.name;
			codes[d.id] = d.code;
		});

		if (d && centered !== d) {
			var centroid = path.centroid(d);
			x = centroid[0];
			y = centroid[1];
			k = 4;
			scale = 4;
			centered = d;
			g.transition()
				.duration(750)
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
				.style("stroke-width", 1.5 / k + "px");
		} else {
			x = width / 2;
			y = height / 2;
			k = 1;
			scale = 0.7;
			centered = null;
			g.transition()
				.duration(750)
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + scale + ")translate(" + -x/scale + "," + -y/scale + ")")
				.style("stroke-width", 1.5 / k + "px");
		}

		g.selectAll("path")
			.classed("active", centered && function(d) { return d === centered; });

		game.stateClicked({
			"code": codes[d.id],
			"name": names[d.id]
		});
	});
};