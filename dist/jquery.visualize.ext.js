/* --------------------------------------------------------------------
 * jQuery Visualize 'Extended' plugin
 *
 * Original Author: Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 *
 * Extended version
 * Author: Christophe Desguez, https://github.com/zipang
 * https://github.com/zipang/jQuery-Visualize
 * -------------------------------------------------------------------- */
(function ($) {
	$.visualize = {
		plugins:{} // additional chart scripts will load themself inside this namespace
	};

	// UTILITIES

	Array.max = function (arr) {
		if (!arr || arr.length == 0) return undefined;
		return Math.max.apply(Array, arr);
	};
	Array.min = function (arr) {
		if (!arr || arr.length == 0) return undefined;
		return Math.min.apply(Array, arr);
	};
	Array.sum = function (arr) {
		var len = (arr && arr.length ? arr.length : 0), sum = 0, val;
		for (var i = 0; i < len; i++) {
			val = parseFloat(arr[i]);
			sum += ((!arr[i] || isNaN(arr[i])) ? 0 : val);
		}
		return sum;
	};
	Array.avg = function (arr) {
		var len = (arr && arr.length ? arr.length : 0);
		return (len ? Array.sum(arr) / len : 0);
	};

	// unit of times durations (in ms)
	var ONE_HOUR = 1000*3600,
		ONE_DAY  = ONE_HOUR*24,
		ONE_WEEK = ONE_DAY*7,
		durations = {
			h: ONE_HOUR, hours: ONE_HOUR,
			d: ONE_DAY,  days:  ONE_DAY,
			w: ONE_WEEK, weeks: ONE_WEEK
		};

	/**
	 * Adds n units of time to date d
	 * @param d:{Date}
	 * @param n:{Number} (can be negative)
	 * @param unit:{String}
	 * @return {Date}
	 */
	Date.add = function(d, n, unit) {
		if (durations[unit]) { // units with constant durations are easy to deal with
			return new Date(d.getTime() + n * durations[unit]);
		} else if ((unit == "m") || (unit == "months")) {
			return new Date(Date.UTC(d.getFullYear(), d.getMonth() + n, d.getDate()));
		} else if ((unit == "y") || (unit == "years")) {
			return new Date(Date.UTC(d.getFullYear() + n, d.getMonth(), d.getDate()));
		}
	};
	/**
	 * Get the difference (duration) between two dates/times in one of the following units :
	 * 'h|hours', 'd|days', 'w|weeks', 'm|months', 'y|years'
	 */
	Date.elapsed = function(unit, d1, d2) {
		if (durations[unit]) { // units with constant durations are easy to calculate diff
			return (d2-d1)/durations[unit];
		} else if ((unit == "m") || (unit == "months")) {
			return (d1.getFullYear()+d1.getMonth()*12 - d2.getFullYear()+d2.getMonth()*12)/12;
		} else if ((unit == "y") || (unit == "years")) {
			return (d1.getFullYear() - d2.getFullYear());
		}
	};

	/**
	 * Get a regular serie of numbers from
	 * @param first to
	 * @param last
	 * @param ticks number of steps (ticks). Default to 5
	 * @return {Array}
	 */
	$.visualize.getRangeLabels = function (first, last, ticks) {
		var domain = last - first,
			ticks  = (ticks >= domain) ? (domain + 1) : ticks,
		    slices = ticks - 1,
		    val, labels = [];

		labels.push(first);

		for (var i = 1; i < slices; i++) {
			val = first + domain / slices * i;
			if (Math.abs(val) < 10) {
				labels.push((val % 1 == 0) ? val : Math.ceil(val * 100) / 100); // display 2 digits when precision needed
			} else {
				labels.push(Math.floor(val));
			}
		}

		labels.push(last);
		return labels;
	};

	/**
	 * Find the plugin to draw a specific chart
	 */
	function loadChart(type, next) {

		if ($.visualize.plugins[type]) {
			// Allready loaded chart plugin
			next($.visualize.plugins[type]);

		} else {
			// Try to dynamically load a new type of chart from external plugin
			var pluginUrl = "/plugins/jquery.visualize." + type.split(/[-_]/)[0] + ".js";
			$.ajax({
				url: pluginUrl,
				dataType: "script",
				async: false,
				success: function loaded() {
					if ($.visualize.plugins[type]) {
						next($.visualize.plugins[type]);
					} else {
						throw "Failed to load jquery.vizualize plugin " + type
						+ " in following location : " + this.url + "\n";
					}
				},
				error: function(xhr, b, err) {
					throw "Failed to load jquery.vizualize plugin " + type
					+ " in following location : " + this.url + "\n" + err.message;
				}

			});
		}
	}

	function defaultFormat(x) {
		return x;
	}

	/**-------------------------------------------------------------------- *
	 * DrawContext
	 * All chart plugins will inherit of this context properties
	 * and methods
 	 * -------------------------------------------------------------------- */
	function DrawContext(ctx) {
		$.extend(this, ctx); // copy the target, data and options attribute
	}

	/**
	 * The DrawContext prototype provides some common utility methods to all graph plugins
	 */
	DrawContext.prototype = {

		keys: function() {
			return this._keys || [];
		},

		/**
		 * Draw a serie of date along the X axis
		 */
		drawDateRange: function(dateStart, dateEnd, options) {
			var ctx = this.target.canvasContext,
				canvas = this.target.canvas,
				w = canvas.width(), h = canvas.height(),
				i = 0, nextDate = dateStart,
				monthName = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jui", "Aou", "Sep", "Oct", "Nov", "Dec"];

			var bands = ((dateEnd - dateStart) / ONE_DAY) + 1, // number of bands
				dayBandWidth = (bands == 0) ? w : w / bands;

			// prepare helper functions
			// type = 0 : day, type = 1 : month, type = 2 : year
			var drawDateLine = function(i, type) {
				ctx.beginPath();
				ctx.lineWidth = [0.1, 2, 3][type];
				ctx.moveTo(dayBandWidth * i, 0);
				ctx.lineTo(dayBandWidth * i, h);
				ctx.strokeStyle = options.lineColors[type];
				ctx.stroke();
				ctx.closePath();
			};
			var drawWeekend = function(i) {
				ctx.beginPath();
				ctx.lineWidth = dayBandWidth*2;
				ctx.moveTo(dayBandWidth * (i + 1), 0);
				ctx.lineTo(dayBandWidth * (i + 1), h);
				ctx.strokeStyle = options.lineColors[3];
				ctx.stroke();
				ctx.closePath();
			};

			// insert list to contain day labels
			var xlabelsUL = $("<ul>").addClass("visualize-labels-x")
				.width(w).height(h)
				.insertBefore(canvas);

			while (nextDate <= dateEnd) {
				var dayNumber = nextDate.getDate();
				var $label = $("<span>").addClass("label").html(dayNumber); // display the day number

				$("<li>").css('left', dayBandWidth * i).width(dayBandWidth)
					.append($label).appendTo(xlabelsUL);

				// if the day labels are too large keep only 5, 10, 15, 20 ..
				if (($label.width() > (dayBandWidth * (dayNumber < 10 ? 0.5 : 0.9))
						&& (dayNumber % 5) && (dayNumber != 1))
					|| (dayNumber == 30 && $label.width() > dayBandWidth * 1.9) ) {
					$label.remove();
				}

				if (nextDate.getDay() == 6) { // saturday starts a weekend
					drawWeekend(i);
 				}

				// Draw date line
				if (dayNumber == 1) { // new month or new year
					$label.append($("<br>")).append(monthName[nextDate.getMonth()]);
					if (nextDate.getMonth()) { // getMonth() > 0
						drawDateLine(i, 1);
					} else { // january = new year
						drawDateLine(i, 2);
						$label.append($("<br>")).append(nextDate.getFullYear());
					}
				} else { // ordinary
					drawDateLine(i, 0);
				}

				nextDate = new Date(nextDate.getTime() + ONE_DAY); i++;
			}
		},

		/**
		 * Available options :
		 * 	- centerLabels : use TRUE to center a categorie label in the middle of its region
		 * 	                 use FALSE to align numbers on their ticks
		 * 	- drawLines : TRUE of FALSE to draw the vertical line associated with the labels boundarie region
		 * 	- format : an optional format function to format numbers or dates
		 * @param xLabels the labels to write along the axis. numbers or texts
		 * @param options. when not passed, the method will try to figure by itself wether to center the label and to draw lines
		 */
		drawXAxis: function(xLabels, options) {

			var options = $.extend({}, options),
				ctx = this.target.canvasContext,
				canvas = this.target.canvas,
				w = canvas.width(), h = canvas.height(),
				centerLabels = (options.centerLabels !== undefined ? options.centerLabels : (isNaN(xLabels[0]))),
				drawLines = (options.drawLines !== undefined ? options.drawLines : !centerLabels),
				fmt = options.format || defaultFormat,
				bands = (xLabels.length - (centerLabels ? 0 : 1)),
				xBandWidth = (bands == 0) ? w : (w / bands);

			var xlabelsUL = $("<ul>")
					.addClass("visualize-labels visualize-labels-x")
					.width(w).height(h).insertBefore(canvas);

			if (centerLabels) {
				// Display centered labels
				$.each(xLabels, function(i, label) {
					var $label = $("<span>").addClass("label")
						.css({width: "100%", textAlign: "center"}).html(fmt(label));

					$("<li>").css('left', xBandWidth * i).width(xBandWidth)
						.append($label).appendTo(xlabelsUL);
				});

			} else { // Align labels on ticks
				$.each(xLabels, function(i, label) {
					var $label = $("<span>").addClass("label").html(fmt(label));

					$("<li>").css('left', xBandWidth * i).width(xBandWidth)
						.append($label).appendTo(xlabelsUL);

					if (i > 0) {
						$label.css("margin-left", -0.5 * $label.width());
					}
				});
			}

			if (drawLines) {
				ctx.beginPath();
				ctx.lineWidth = 0.1;

				$.each(xLabels, function(i, label) {
					ctx.moveTo(xBandWidth * (i + 1), 0);
					ctx.lineTo(xBandWidth * (i + 1), h);
				});

				ctx.strokeStyle = this.options.lineColors[0];
				ctx.stroke();
				ctx.closePath();
			}
		},

		/**
		 * Same options as drawXAxis.
		 * The Y labels are displayed from bottom to top.
		 */
		drawYAxis: function(yLabels, options) {

			var options = $.extend({}, options),
				ctx = this.target.canvasContext,
				canvas = this.target.canvas,
				w = canvas.width(), h = canvas.height(),
				centerLabels = (options.centerLabels !== undefined ? options.centerLabels : (isNaN(yLabels[0]))),
				drawLines = (options.drawLines !== undefined ? options.drawLines : !centerLabels),
				fmt = options.format || defaultFormat,
				bands = (yLabels.length - (centerLabels ? 0 : 1)),
				liHeight = (bands == 0) ? h : h / bands;

			var ylabelsUL = $("<ul>")
					.addClass("visualize-labels visualize-labels-y")
					.width(w).height(h).insertBefore(canvas);

			$.each(yLabels, function(i, label) {
				var $label = $("<span>").addClass("label").html(fmt(label));

				$("<li>").css(options.fromTop ? "top" : "bottom", liHeight*i + (centerLabels ? liHeight/2 : 0))
					.append($label).prependTo(ylabelsUL);

				// Slitghly reposition the label to center it on the median line
				$label.css('margin-top', -0.5 * $label.height());
			});

			if (drawLines) {
				ctx.beginPath();
				ctx.lineWidth = 0.1;

				$.each(yLabels, function(i, label) {
					ctx.moveTo(0, liHeight * (i + 1));
					ctx.lineTo(w, liHeight * (i + 1));
				});

				ctx.strokeStyle = this.options.lineColors[0];
				ctx.stroke();
				ctx.closePath();
			}
		}
	}; // DrawContext prototype


	/**-------------------------------------------------------------------- *
	 * Table scrapper object
	 * -------------------------------------------------------------------- */
	function TableData(table, options) {
		this.table = $(table);
		this.options = options;
		// private
		this.parse();
	}

	TableData.prototype = {

		parse: function() {
			var rowFilter = this.options.rowFilter,
			    colFilter = this.options.colFilter,
			    lines = [], lineHeaders = [], columnHeaders = [],
				cellParser = this.options.parser || parseFloat;

			$("tr", this.table).filter(rowFilter).each(function (i, tr) {
				var cells = [];
				$("th, td", $(tr)).filter(colFilter).each(function (j, td) {
					cells.push((i == 0) || (j == 0)? $(td).text() : cellParser($(td).text()));
				});
				if (i == 0) {
					cells.shift();
					columnHeaders = cells;
				} else {
					lineHeaders.push(cells.shift());
					lines.push(cells);
				}
			});

			var lcount = lines.length,
			    ccount = lines[0].length,
			    columns = [];

			for (var j = 0; j < ccount; j++) {
				var columnValues = [];
				for (var i = 0; i < lcount; i++) {
					columnValues.push(lines[i][j]);
				}
				columns.push(columnValues);
			}

			this.lineHeaders = lineHeaders;
			this.columnHeaders = columnHeaders;
			this.lines = lines;
			this.columns = columns;
		}
	}; // TableData prototype


	/**-------------------------------------------------------------------- *
	 * jQuery Visualize Plugin declaration
	 * Usage example :
	 * $("table.pie").visualize('pie', {percentage: true});
	 * -------------------------------------------------------------------- */

	var defaults = {
		type:'bar', //also available: area, pie, line
		appendTitle:true, //table caption text is added to chart
		title:null, //grabs from table caption if null
		appendKey:true, //color key is added to chart
		rowFilter:' ',
		colFilter:' ',
		colors:['#be1e2d', '#666699', '#92d5ea', '#ee8310', '#8d10ee', '#5a3b16', '#26a4ed', '#f45a90', '#e9e744'],
		lineColors:["#777", "#aaa", "#eee"],
		textColors:[], //corresponds with colors array. null/undefined items will fall back to CSS
		parseDirection:'x', //which direction to parse the table data

		pieMargin:20, //pie charts only - spacing around pie
		pieLabelsAsPercent:true,
		pieLabelPos:'inside',

		lineWeight:4, //for line and area - stroke weight
		barGroupMargin:10,
		barMargin:1, //space around bars in bar chart (added to both sides of bar)

		yLabelInterval:30 //distance between y labels
	};

 	$.fn.visualize = function(type, options, container) {

		if (typeof(type) != "string") { // Support for the old call form : visualize(options, container)
										// where options contains the type of the chart
			container = options;
			options = type || {};
			type = options.type || defaults.type;
		}

		var $tables = $(this); // we may have more  than one table in the selection

		loadChart( // loading may be asynchrone
			type,
			function visualize(chart) {

				//Merge configuration options
				var o = $.extend({}, defaults, chart.defaults, options);

				if (chart.parser) {
					// the chart plugin may redefine its own parser function
					o.parser = chart.parser;
				}

				$tables.each(function () {

					var $table = $(this);

					//reset width, height to numbers
					var w = o.width  = parseFloat(o.width  || $table.width());
					var h = o.height = parseFloat(o.height || $table.height());
					o.ticks = +o.ticks || Math.ceil(h / o.yLabelInterval);

					//create new canvas, set w&h attrs (not inline styles)
					var $canvas = $("<canvas>").attr("height", h).attr("width", w);
					//get title for chart
					var title = o.title || $table.find('caption').text();

					//create canvas wrapper div, set inline w&h, append
					var $canvasContainer = (container || $("<div>"))
						.addClass("visualize").addClass("visualize-" + type)
						.attr("role", "img").attr("aria-label", "Chart representing data from the table: " + title)
						.height(h).width(w)
						.append($canvas);

					//append new canvas to page
					if (!container) {
						$canvasContainer.insertAfter($table);
					}

					// excanvas initialization (IE only) see http://pipwerks.com/2009/03/12/lazy-loading-excanvasjs/
					if (typeof(G_vmlCanvasManager) != 'undefined') {
						G_vmlCanvasManager.init();
						G_vmlCanvasManager.initElement($canvas[0]);
					}

					// Scrap the table, set up the drawing context
					var tableData = new TableData($table, o),
						drawContext = new DrawContext({
							data: tableData,
							target:{
								container: $canvasContainer,
								canvas: $canvas,
								canvasContext: $canvas[0].getContext('2d')
							},
							options:o
						});

					// Apply (draw) chart to this context
					chart.apply(drawContext);

					//title/key container
					if (o.appendTitle || o.appendKey) {
						var $infoContainer = $("<div>").addClass("visualize-info").appendTo($canvasContainer);

						//append title
						if (o.appendTitle) {
							$("<div>").addClass("visualize-title").html(title).appendTo($infoContainer);
						}

						//append color keys of the series
						if (o.appendKey) {
							var $keys = $("<ul>").addClass("visualize-key");
							$.each(drawContext.keys(), function (i, key) {
								$("<li>")
									.append($("<span>").addClass("visualize-key-color").css("background", o.colors[i]))
									.append($("<span>").addClass("visualize-key-label").html(key))
									.appendTo($keys)
							});
							$keys.appendTo($infoContainer);
						}
					}

					if (!container) {
						//add event for updating
						$canvasContainer.bind('visualizeRefresh', function () {
							$table.visualize(o, $(this).empty());
						});
					}
				}); // $tables.each()
			}
		);

		return $tables; // Allow usual jQuery chainability on selector function

	};

})(jQuery);
/**
 * Vertical bars charts for the jquery Visualize plugin 2.0
 *
 * Data series are represented by group of vertical bars on the same axis.
 */
(function define() {
	var bar = $.visualize.plugins.bar = function () {

		var o = this.options,
			ctx = this.target.canvasContext,
			canvas = this.target.canvas,
			w = canvas.width(), h = canvas.height(),
			tableData = this.data,

			data = (o.parseDirection == 'x') ? tableData.lines : tableData.columns,
			max = Math.ceil(Array.max($.map(data, Array.max))),
			min = Math.floor(Array.min($.map(data, Array.min))),
			range = max - ((min > 0) ? (min = 0) : min),

			yLabels = $.visualize.getRangeLabels(min, max, o.ticks),
			xLabels = (o.parseDirection == 'x') ? tableData.columnHeaders : tableData.lineHeaders;

		// legend keys
		this._keys = (o.parseDirection == 'x') ? tableData.lineHeaders : tableData.columnHeaders;

		// Display categories as X labels
		this.drawXAxis(xLabels);

		// Display data range as Y labels
		this.drawYAxis(yLabels);

		// iterate on the series and draw the bars
		var xBandWidth = (xLabels.length != 0) ? w / xLabels.length : w,
			yScale = (range != 0) ? h / range : h,
			zeroPos = h - ((min < 0) ? -min : 0) * yScale; // Position of the 0 on the Y axis

		for (var i = 0; i < data.length; i++) {
			ctx.strokeStyle = o.colors[i];
			var linewidth = (xBandWidth - o.barGroupMargin*2) / data.length; // a single bar width (with margins)
			ctx.lineWidth = linewidth - (o.barMargin * 2);
			var serie = data[i];

			for (var j = 0; j < serie.length; j++) {
				ctx.beginPath();
				var xPos = j*xBandWidth + o.barGroupMargin + i*linewidth + linewidth/2;
				ctx.moveTo(xPos, zeroPos);
				ctx.lineTo(xPos, Math.round(-serie[j] * yScale) + zeroPos);
				ctx.stroke();
				ctx.closePath();
			}
		}
	}
})();
/**
 * Pie charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by colored slices of a pie.
 */
(function define() {
	var pie = $.visualize.plugins.pie = function () {

		var o = this.options,
			ctx = this.target.canvasContext,
			$canvas = this.target.canvas,
			w = $canvas.width(), h = $canvas.height(),
			tabledata = this.data,

			data = (o.parseDirection == 'x') ? tabledata.lines : tabledata.columns,
			seriesTotal = $.map(data, Array.sum),
			grandTotal = Array.sum(seriesTotal);

		// legend keys
		this._keys = (o.parseDirection == 'x') ? tabledata.lineHeaders : tabledata.columnHeaders;

		if (o.pieLabelPos == 'outside') {
			this.target.container.addClass('visualize-pie-outside');
		}

		var centerX = Math.round(w / 2),
			centerY = Math.round(h / 2),
			radius = centerY - o.pieMargin,
			counter = 0.0;

		var labels = $('<ul class="visualize-labels"></ul>')
			.insertAfter($canvas);

		$.each(seriesTotal, function (i, total) {
			// Draw the pie pieces
			var slice = (total <= 0 || isNaN(total)) ? 0 : total / grandTotal;
			if (slice > 0) {
				ctx.beginPath();
				ctx.moveTo(centerX, centerY);
				ctx.arc(centerX, centerY, radius,
					counter * Math.PI * 2 - Math.PI * 0.5,
					(counter + slice) * Math.PI * 2 - Math.PI * 0.5,
					false);
				ctx.lineTo(centerX, centerY);
				ctx.closePath();
				ctx.fillStyle = o.colors[i];
				ctx.fill();
			}

			// Draw labels
			var sliceMiddle = (counter + slice / 2);
			var distance = o.pieLabelPos == 'inside' ? radius / 1.6 : radius + radius / 5;
			var labelX = Math.round(centerX + Math.sin(sliceMiddle * Math.PI * 2) * (distance));
			var labelY = Math.round(centerY - Math.cos(sliceMiddle * Math.PI * 2) * (distance));
			var leftRight = (labelX > centerX) ? 'right' : 'left';
			var topBottom = (labelY > centerY) ? 'bottom' : 'top';
			var percentage = parseFloat((slice * 100).toFixed(2));

			if (percentage) {
				var labelval = (o.pieLabelsAsPercent) ? percentage + '%' : total;
				var $label = $('<span class="visualize-label">' + labelval + '</span>')
					.css({leftRight: 0, topBottom: 0});
				var label = $('<li class="visualize-label-pos"></li>')
					.append($label).appendTo(labels)
					.css({left:labelX, top:labelY});
				$label
					.css('font-size', radius / 10)
					.css('margin-' + leftRight, -$label.width() / 2)
					.css('margin-' + topBottom, -$label.outerHeight() / 2);

				if (o.textColors[i]) {
					$label.css('color', o.textColors[i]);
				}
			}
			counter += slice;
		});

	}
})();
/**
 * Draw line and area charts the jquery Visualize library 2.0
 *
 * Data are represented by serie of colored lines
 */
(function define() {

	var line = $.visualize.plugins.line = function(area) {

		var o = $.extend({}, this.options),
			ctx = this.target.canvasContext,
			canvas = this.target.canvas,
			w = canvas.width(), h = canvas.height(),

			tableData = this.data,
			data = (o.parseDirection == 'x') ? tableData.lines : tableData.columns,
			max = Math.ceil(Array.max($.map(data, Array.max))),
			min = Math.floor(Array.min($.map(data, Array.min))),
			range = max - ((min > 0) ? (min = 0) : min),

			yLabels = $.visualize.getRangeLabels(min, max, o.ticks),
			yScale  = (range != 0) ? h / range : h,
			xLabels = (o.parseDirection == 'x') ? tableData.columnHeaders : tableData.lineHeaders,
			xScale  = (xLabels.length != 1) ? w / (xLabels.length - 1) : w;

		this._keys = (o.parseDirection == 'x') ? tableData.lineHeaders : tableData.columnHeaders;

		// Display categories as X labels
		this.drawXAxis(xLabels, {centerLabels: false});

		// Display data range as Y labels
		this.drawYAxis(yLabels);

		//iterate and draw
		$.each(data, function (i, serie) {
			ctx.beginPath();
			ctx.lineWidth = o.lineWeight;
			ctx.lineJoin = 'round';

			ctx.moveTo(0, h - yScale*serie[0]);
			for (var j = 0; j < serie.length; j++) {
				ctx.lineTo(xScale*j, h - yScale*serie[j]);
			}

			ctx.strokeStyle = o.colors[i];
			ctx.stroke();

			if (area) {
				ctx.lineTo(w, h);
				ctx.lineTo(0, h);
				ctx.closePath();
				ctx.fillStyle = o.colors[i];
				ctx.globalAlpha = .3;
				ctx.fill();
				ctx.globalAlpha = 1.0;
			} else {
				ctx.closePath();
			}
		});
	};

	/**
	 * The lines define a visible area from the X axis
	 */
	$.visualize.plugins.area = function () {
		line.call(this, true);
	};

})();


/**
 * Vertical stacks for the jquery Visualize plugin 2.0
 *
 * Data are represented by colored portions inside vertical bars that are piled one on another.
 * The data can be normalized to a 0..100 scale so that each serie can be easily compared.
 * Usage example :
 * $("table").visualize("stack"[, options]);
 */
(function define() {

	/**
	 * Specific plugin options with their default values
	 */
	var defaults = {
		normalize: false,
		ticks: 7
	}

	/**
	 * Shortcut for
	 * $("table").visualize("stack", {normalize: true, ticks: 5});
	 */
	$.visualize.plugins.stack_100 = function () {
		this.options.normalize = true;
		this.options.ticks = 5; // this will give us ticks as follows : 0, 25, 50, 75, 100
		stack.call(this);
	};

	var stack = $.visualize.plugins.stack = function () {

		var o = $.extend({}, defaults, this.options),
			ctx = this.target.canvasContext,
			canvas = this.target.canvas,
			w = canvas.width(), h = canvas.height(),
			tableData = this.data,

			data = (o.parseDirection == 'x') ? tableData.columns : tableData.lines,
			xLabels = (o.parseDirection == 'x') ? tableData.columnHeaders : tableData.lineHeaders,
			dataSums = $.map(data, Array.sum),
			dataRange = (o.normalize ? 100 : Array.max(dataSums)),
			yLabels = $.visualize.getRangeLabels(0, dataRange, o.ticks);

		this._keys = (o.parseDirection == 'x') ? tableData.lineHeaders : tableData.columnHeaders;

		// Display categories as X labels
		this.drawXAxis(xLabels);

		// Display data range as Y labels
		var yAxisOptions = (o.normalize ? {format: function(label) {return label+'%';}} : {});
		this.drawYAxis(yLabels, yAxisOptions);

		// Iterate and draw the series of bars
		var xInterval = (xLabels.length != 0) ? w / xLabels.length : w,
			yScale = (dataRange != 0) ? h / dataRange : h;

		for (var i = 0; i < data.length; i++) {
			ctx.lineWidth  = xInterval - ((o.barMargin+o.barGroupMargin)*2);

			var serie = data[i], xPos = xInterval*i + xInterval/ 2, yPos = h;
			var yFactor = o.normalize ? (100 / Array.sum(serie)) : 1;

			for (var j = 0; j < serie.length; j++) {
				var yVal = Math.round(serie[j]*yScale*yFactor);
				ctx.beginPath();
				ctx.strokeStyle = o.colors[j];
				ctx.moveTo(xPos, yPos);
				ctx.lineTo(xPos, yPos - yVal);
				ctx.stroke();
				ctx.closePath();

				yPos -= yVal;
			}
		}
	}

})();
/**
 * Horizontal bars charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by horizontal bars.
 */
(function define() {
	var hbar = $.visualize.plugins.hbar = function () {

		var o = this.options,
			ctx = this.target.canvasContext,
			canvas = this.target.canvas,
			w = canvas.width(), h = canvas.height(),
			tabledata = this.data,

			data = (o.parseDirection == 'x') ? tabledata.lines : tabledata.columns,
			max = Math.ceil(Array.max($.map(data, Array.max))),
			min = Math.floor(Array.min($.map(data, Array.min))),
			range = max - ((min > 0) ? (min = 0) : min),

			xLabels = $.visualize.getRangeLabels(min, max, o.ticks),
			yLabels = (o.parseDirection == 'x') ? tabledata.columnHeaders : tabledata.lineHeaders;

		this._keys = (o.parseDirection == 'x') ? tabledata.lineHeaders : tabledata.columnHeaders;

		// Display data range as X labels
		this.drawXAxis(xLabels);

		// Display categories as Y labels
		this.drawYAxis(yLabels, {drawLines: true});

		// iterate on the series and draw the bars
		var xScale = (range != 0) ? w / range : w,
			yBandHeight = (yLabels.length != 0) ? h / yLabels.length : h,
			zeroPos = ((min < 0) ? -min : 0) * xScale; // Position of the 0 on the X axis

		for (var i = 0; i < data.length; i++) {
			ctx.beginPath();
			var linewidth = (yBandHeight - o.barGroupMargin*2) / data.length; // a single bar width (with margins)
			ctx.lineWidth = linewidth - (o.barMargin * 2);
			var serie = data[i];

			for (var j = 0; j < serie.length; j++) {
				var yPos = j*yBandHeight + o.barGroupMargin + i*linewidth + linewidth/2;
				ctx.moveTo(zeroPos, yPos);
				ctx.lineTo(Math.round(serie[j] * xScale) + zeroPos, yPos);
			}
			ctx.strokeStyle = o.colors[i];
			ctx.stroke();
			ctx.closePath();
		}
	}
})();
/**
 * Horizontal stacked bars charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by colored portions inside an horizontal bar.
 * The data can be normalized to a 0..100 scale so that each serie can be easily compared.
 * Usage example :
 * $("table").visualize("hstack"[, options]);
 */
(function define() {

	/**
	 * Specific plugin options with their default values
	 */
	var defaults = {
		normalize: false,
		ticks: 7
	}

	/**
	 * Shortcut for
	 * $("table").visualize("hstack", {normalize: true, ticks: 5});
	 */
	$.visualize.plugins.hstack_100 = function () {
		this.options.normalize = true;
		this.options.ticks = 5; // this will give us ticks as follows : 0, 25, 50, 75, 100
		hstack.call(this);
	};

	var hstack = $.visualize.plugins.hstack = function () {

		var o = $.extend({}, defaults, this.options),
			ctx = this.target.canvasContext,
			canvas = this.target.canvas,
			w = canvas.width(), h = canvas.height(),
			tableData = this.data,

			data = (o.parseDirection == 'x') ? tableData.lines : tableData.columns,
			dataSums = $.map(data, Array.sum),
			dataRange = (o.normalize ? 100 : Array.max(dataSums)),
			xLabels = $.visualize.getRangeLabels(0, dataRange, o.ticks),
			yLabels = (o.parseDirection == 'x') ? tableData.lineHeaders : tableData.columnHeaders;

		this._keys = (o.parseDirection == 'x') ? tabledata.columnHeaders : tabledata.lineHeaders;

		// Display data range as X labels
		var xAxisOptions = (o.normalize ? {format: function(label) {return label+'%';}} : {});
		this.drawXAxis(xLabels, xAxisOptions);

		// Display categories as Y labels
		this.drawYAxis(yLabels);

		// Iterate and draw the series of bars
		var xScale = (dataRange != 0) ? w / dataRange : w,
			yInterval = (yLabels.length != 0) ? h / yLabels.length : h;

		for (var i = 0; i < data.length; i++) {
			ctx.lineWidth  = yInterval - ((o.barMargin+o.barGroupMargin)*2);

			var serie = data[i], xPos = 0, yPos = h - yInterval*i - yInterval/2;
			var xFactor = o.normalize ? (100 / Array.sum(serie)) : 1;

			for (var j = 0; j < serie.length; j++) {
				var xVal = Math.round(serie[j]*xScale*xFactor);
				ctx.beginPath();
				ctx.strokeStyle = o.colors[j];
				ctx.moveTo(xPos, yPos);
				ctx.lineTo(xPos + xVal, yPos);
				ctx.stroke();
				ctx.closePath();

				xPos += xVal;
			}
		}
	}

})();
