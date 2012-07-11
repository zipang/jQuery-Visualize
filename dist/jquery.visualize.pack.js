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
		return Math.max.apply(Array, arr);
	};
	Array.min = function (arr) {
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

	/**
	 * Get a regular serie of numbers from @param first to @param last in n steps
	 * @param ticks number of steps (ticks). Default to 5
	 * @return {Array}
	 */
	$.visualize.getRangeLabels = function (first, last, ticks) {
		var ticks  = ticks || 5,
		    slices = ticks - 1,
		    domain = last - first,
		    labels = [];

		labels.push(first);

		for (var i = 1; i < slices; i++) {
			labels.push(Math.ceil(first + domain/slices*i));
		}

		labels.push(last);
		return labels;
	};

	/**
	 * Find the plugin to draw a specific chart
	 */
	function drawChart(charts, type, context) {

		if (charts[type]) {
			// One of the 4 basic predefined charts
			charts[type].apply(context);

		} else if ($.visualize.plugins[type]) {
			// Allready loaded chart plugin
			$.visualize.plugins[type].apply(context);

		} else {
			// Try to dynamically load a new type of chart from external plugin
			$.getScript("./js/plugins/jquery.visualize." + type.split(/[-_]/)[0] + ".js",
				function loaded() {
					$.visualize.plugins[type].apply(context);
				}).fail(function (jqxhr, settings, exception) {
					context.target.canvasContainer.remove();
					if (console.log) console.log( "Failed to load jquery.vizualize plugin " + type
						+ " in following location : ./js/plugins/jquery.visualize." + type.split(/[-_]/)[0] + ".js\n"
						+ exception );
				});
		}
	}

	/* --------------------------------------------------------------------
	 * Table scrapper object
	 * -------------------------------------------------------------------- */
	function TableData(table, options) {
		this.table = $(table);
		this.options = options;
		// private
		this._headers = {x:[], y:[]};
	}

	TableData.prototype = {

		parse: function() {
			if (this.parsed) return this;

			var rowFilter = this.options.rowFilter,
				colFilter = this.options.colFilter,
				lines = [], lineHeaders = [], columnHeaders = [];

			$("tr", this.table).filter(rowFilter).each(function (i, tr) {
				var cells = [];
				$("th, td", $(tr)).filter(colFilter).each(function (j, td) {
					cells.push((i == 0) || (j == 0)? $(td).text() : parseFloat($(td).text()));
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
			this.parsed = true;
			return this;
		},

		dataGroups:function () {
			if (this._dataGroups) return this._dataGroups; // stored result

			var dataGroups = [];
			var colors = this.options.colors,
				textColors = this.options.textColors,
				rowFilter = this.options.rowFilter,
				colFilter = this.options.colFilter;

			if (this.options.parseDirection == 'x') {
				this.table.find('tr:gt(0)').filter(rowFilter).each(function (i, tr) {
					dataGroups[i] = {};
					dataGroups[i].points = [];
					dataGroups[i].points_weight = [];
					dataGroups[i].color = colors[i];
					if (textColors[i]) {
						dataGroups[i].textColor = textColors[i];
					}
					$(tr).find('td').filter(colFilter).each(function () {
						var values = $(this).text().split(";");
						dataGroups[i].points.push(values.length > 0 ? parseFloat(values[0]) : 0);
						dataGroups[i].points_weight.push(values.length > 1 ? parseFloat(values[1]) : 1);
					});
				});

			} else {
				var cols = this.table.find('tr:eq(1) td').filter(colFilter).size();
				for (var i = 0; i < cols; i++) {
					dataGroups[i] = {};
					dataGroups[i].points = [];
					dataGroups[i].points_weight = [];
					dataGroups[i].color = colors[i];
					if (textColors[i]) {
						dataGroups[i].textColor = textColors[i];
					}
					this.table.find('tr:gt(0)').filter(rowFilter).each(function () {
						var values = $(this).find('td').filter(colFilter).eq(i).text().split(";");
						dataGroups[i].points.push(values.length > 0 ? parseFloat(values[0]) : 0);
						dataGroups[i].points_weight.push(values.length > 1 ? parseFloat(values[1]) : 1);
					});
				}
			}
			return (this._dataGroups = dataGroups);
		},

		allData:function () {
			if (this._allData) return this._allData;
			var allData = [];
			$(this.dataGroups()).each(function () {
				allData.push.apply(allData, this.points);
			});
			return (this._allData = allData);
		},

		dataSum:function () {
			if (this._dataSum) return this._dataSum;
			return (this._dataSum = Array.sum(this.allData()));
		},

		topValue:function () {
			if (this._topValue) return this._topValue;
			return (this._topValue = Array.max(this.allData()));
		},

		bottomValue:function () {
			if (this._bottomValue) return this._bottomValue;
			return (this._bottomValue = Array.min(this.allData()));
		},

		memberTotals:function () {
			if (this._memberTotals) return this._memberTotals;
			var memberTotals = [];
			var dataGroups = this.dataGroups();
			$.each(dataGroups, function (i, group) {
				memberTotals.push(Array.sum(group.points));
			});
			return (this._memberTotals = memberTotals);
		},

		groupSums:function () {
			if (this._groupSums) return this._groupSums;
			var groupSums = [];
			var dataGroups = this.dataGroups();
			for (var h = 0; h < dataGroups.length; h++) {
				var points = dataGroups[h].points;
				for (var i = 0; i < points.length; i++) {
					if (typeof(groupSums[i]) == 'undefined') groupSums[i] = 0;
					groupSums[i] += parseFloat(points[i]);
				}
			}
			return (this._groupSums = groupSums);
		},

		totalYRange:function () {
			return this.topValue() - this.bottomValue();
		},

		xLabels:function () {
			return this.parseHeaders(this.options.parseDirection);
		},

		keys:function () {
			return this.parseHeaders(this.options.parseDirection == 'x' ? 'y' : 'x');
		},

		parseHeaders:function (direction) {
			var headers = this._headers[direction];
			if (headers.length) return headers; // allready filled

			if (direction == 'x') { // parse the column headers
				this.table.find('tr:eq(0) th').filter(this.options.colFilter).each(function (i, th) {
					headers.push($(th).html());
				});
			} else { // parse the line headers
				this.table.find('tr:gt(0) th').filter(this.options.rowFilter).each(function (i, th) {
					headers.push($(th).html());
				});
			}
			return headers;
		},

		yLabels:function (start, end) {
			var numLabels = this.options.ticks || Math.round(this.options.height / this.options.yLabelInterval);
			return $.visualize.getRangeLabels(start, end, numLabels);
		},

		yLabels100:function () {
			return $.visualize.getRangeLabels(0, 100, 5);
		}
	}; // TableData prototype

	/**
	 * Plugin definition
	 * Usage example :
	 * $("table.pie").visualize({type: 'pie'})
	 */
	$.fn.visualize = function(options, container) {

		if (typeof options == "string") { // visualize(type, options, container)
			options = $.extend({}, container, {type: options});
			container = arguments[2];
		}

		return $(this).each(function () {

			var $table = $(this);

			//configuration
			var o = $.extend({
				type:'bar', //also available: area, pie, line
				width:$table.width(), //height of canvas - defaults to table height
				height:$table.height(), //height of canvas - defaults to table height
				appendTitle:true, //table caption text is added to chart
				title:null, //grabs from table caption if null
				appendKey:true, //color key is added to chart
				rowFilter:' ',
				colFilter:' ',
				colors:['#be1e2d', '#666699', '#92d5ea', '#ee8310', '#8d10ee', '#5a3b16', '#26a4ed', '#f45a90', '#e9e744'],
				textColors:[], //corresponds with colors array. null/undefined items will fall back to CSS
				parseDirection:'x', //which direction to parse the table data

				pieMargin:20, //pie charts only - spacing around pie
				pieLabelsAsPercent:true,
				pieLabelPos:'inside',

				lineWeight:4, //for line and area - stroke weight
				barGroupMargin:10,
				barMargin:1, //space around bars in bar chart (added to both sides of bar)
				yLabelInterval:30 //distance between y labels
			}, options);

			//reset width, height to numbers
			var w = o.width  = parseFloat(o.width);
			var h = o.height = parseFloat(o.height);

			// Build-in Chart functions
			var charts = {
				pie:function () {
					$canvasContainer.addClass('visualize-pie');
					if (o.pieLabelPos == 'outside') {
						$canvasContainer.addClass('visualize-pie-outside');
					}
					var centerX = Math.round(w / 2);
					var centerY = Math.round(h / 2);
					var radius = centerY - o.pieMargin;
					var counter = 0.0;
					var labels = $('<ul class="visualize-labels"></ul>')
						.insertAfter($canvas);

					$.each(memberTotals, function (i, total) {
						// Draw the pie pieces
						var slice = (total <= 0 || isNaN(total)) ? 0 : total / dataSum;
						if (slice > 0) {
							ctx.beginPath();
							ctx.moveTo(centerX, centerY);
							ctx.arc(centerX, centerY, radius,
								counter * Math.PI * 2 - Math.PI * 0.5,
								(counter + slice) * Math.PI * 2 - Math.PI * 0.5,
								false);
							ctx.lineTo(centerX, centerY);
							ctx.closePath();
							ctx.fillStyle = dataGroups[i].color;
							ctx.fill();
						}

						// Draw labels
						var sliceMiddle = (counter + slice / 2);
						var distance = o.pieLabelPos == 'inside' ? radius / 1.5 : radius + radius / 5;
						var labelX = Math.round(centerX + Math.sin(sliceMiddle * Math.PI * 2) * (distance));
						var labelY = Math.round(centerY - Math.cos(sliceMiddle * Math.PI * 2) * (distance));
						var leftRight = (labelX > centerX) ? 'right' : 'left';
						var topBottom = (labelY > centerY) ? 'bottom' : 'top';
						var percentage = parseFloat((slice * 100).toFixed(2));

						if (percentage) {
							var labelval = (o.pieLabelsAsPercent) ? percentage + '%' : total;
							var labeltext = $('<span class="visualize-label">' + labelval + '</span>')
								.css(leftRight, 0)
								.css(topBottom, 0);
							var label = $('<li class="visualize-label-pos"></li>')
								.appendTo(labels)
								.css({left:labelX, top:labelY})
								.append(labeltext);
							labeltext
								.css('font-size', radius / 8)
								.css('margin-' + leftRight, -labeltext.width() / 2)
								.css('margin-' + topBottom, -labeltext.outerHeight() / 2);
							if (dataGroups[i].textColor) {
								labeltext.css('color', dataGroups[i].textColor);
							}
						}
						counter += slice;
					});
				},

				line:function (area) {
					$canvasContainer.addClass((area) ? 'visualize-area' : 'visualize-line');

					//write X labels
					var xInterval = $canvas.width() / (xLabels.length - 1);
					var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
						.width(w).height(h)
						.insertBefore($canvas);
					$.each(xLabels, function (i) {
						var thisLi = $('<li><span>' + this + '</span></li>')
							.prepend('<span class="line" />')
							.css('left', xInterval * i)
							.appendTo(xlabelsUL);
						var label = thisLi.find('span:not(.line)');
						var leftOffset = label.width() / -2;
						if (i == 0) {
							leftOffset = 0;
						}
						else if (i == xLabels.length - 1) {
							leftOffset = -label.width();
						}
						label
							.css('margin-left', leftOffset)
							.addClass('label');
					});
					//write Y labels
					var yScale = h / totalYRange;
					var liBottom = h / (yLabels.length - 1);
					var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
						.width(w).height(h)
						.insertBefore($canvas);
					$.each(yLabels, function (i) {
						var thisLi = $('<li><span>' + this + '</span></li>')
							.prepend('<span class="line" />')
							.css('bottom', liBottom * i)
							.prependTo(ylabelsUL);
						var label = thisLi.find('span:not(.line)');
						var topOffset = label.height() / -2;
						if (i == 0) {
							topOffset = -label.height();
						}else if (i == yLabels.length - 1) {
							topOffset = 0;
						}
						label
							.css('margin-top', topOffset)
							.addClass('label');
					});
					//start from the bottom left
					ctx.translate(0, zeroLoc);
					//iterate and draw
					$.each(dataGroups, function () {
						ctx.beginPath();
						ctx.lineWidth = o.lineWeight;
						ctx.lineJoin = 'round';
						var points = this.points;
						var integer = 0;
						ctx.moveTo(0, -(points[0] * yScale));
						$.each(points, function () {
							ctx.lineTo(integer, -(this * yScale));
							integer += xInterval;
						});
						ctx.strokeStyle = this.color;
						ctx.stroke();
						if (area) {
							ctx.lineTo(integer, 0);
							ctx.lineTo(0, 0);
							ctx.closePath();
							ctx.fillStyle = this.color;
							ctx.globalAlpha = .3;
							ctx.fill();
							ctx.globalAlpha = 1.0;
						}
						else {
							ctx.closePath();
						}
					});
				},

				area:function () {
          charts.line(true);
				},

				bar:function () {
					$canvasContainer.addClass('visualize-bar');

					//write X labels
					var xInterval = w / (xLabels.length);
					var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
						.width(w).height(h)
						.insertBefore($canvas);

					$.each(xLabels, function (i) {
						var thisLi = $('<li><span class="label">' + this + '</span></li>')
							.prepend('<span class="line" />')
							.css('left', xInterval * i)
							.width(xInterval)
							.appendTo(xlabelsUL);
					});

					// write Y labels
					var yScale = h / totalYRange;
					var liBottom = h / (yLabels.length - 1);
					var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
						.width(w).height(h)
						.insertBefore($canvas);

					$.each(yLabels, function (i, label) {
						var $label = $("<span>").addClass("label").html(label);
						var thisLi = $("<li>")
							.css('bottom', liBottom * i)
							.prepend('<span class="line" />')
                            .append($label)
							.prependTo(ylabelsUL);

                        $label.css('margin-top', $label.height() / -2);
					});

					//start from the bottom left
					ctx.translate(0, zeroLoc);
					//iterate and draw
					$.each(dataGroups, function (i, group) {
						ctx.beginPath();
						var serieWidth = (xInterval - o.barGroupMargin * 2) / dataGroups.length;
						ctx.lineWidth = serieWidth - (o.barMargin * 2);

						$.each(group.points, function(j, val) {
							var xVal = ((j * xInterval) - o.barGroupMargin) + (i * serieWidth) + serieWidth / 2;
							xVal += o.barGroupMargin * 2;
							var yVal = Math.round(-val * yScale);
							if (yVal) {
								ctx.moveTo(xVal, 0);
								ctx.lineTo(xVal, yVal);
							}
						});
						ctx.strokeStyle = group.color;
						ctx.stroke();
						ctx.closePath();
					});
				}
			};

			//create new canvas, set w&h attrs (not inline styles)
			var $canvas = $("<canvas>").attr("height", h).attr("width", w);
			//get title for chart
			var title = o.title || $table.find('caption').text();

			//create canvas wrapper div, set inline w&h, append
			var $canvasContainer = (container || $("<div>"))
				.addClass("visualize")
				.attr("role", "img").attr("aria-label", "Chart representing data from the table: " + title)
				.height(h).width(w)
				.append($canvas);

			//scrape table (this should be cleaned up into an obj)
			var tableData = new TableData($table, o).parse();
			var dataGroups = tableData.dataGroups();
			var dataSum = tableData.dataSum();
			var topValue = tableData.topValue();
			var bottomValue = tableData.bottomValue();
			var memberTotals = tableData.memberTotals();
			var totalYRange = tableData.totalYRange();
			var zeroLoc = h * (topValue / totalYRange);
			var xLabels = tableData.xLabels();
			var yLabels = tableData.yLabels(bottomValue, topValue);


			//append new canvas to page
			if (!container) {
				$canvasContainer.insertAfter($table);
			}
			if (typeof(G_vmlCanvasManager) != 'undefined') {
				G_vmlCanvasManager.init();
				G_vmlCanvasManager.initElement($canvas[0]);
			}

			//set up the drawing board
			var ctx = $canvas[0].getContext('2d');

			//create chart
			drawChart(charts, o.type, {
				target:{
					canvasContainer:$canvasContainer,
					canvasContext:ctx,
					canvas:$canvas
				},
				data:tableData,
				options:o
			});


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
          $.each(tableData.keys(), function(i, key) {
            $("<li>")
              .append($("<span>").addClass("visualize-key-color").css("background", o.colors[i]))
              .append($("<span>").addClass("visualize-key-label").html(key))
              .appendTo($keys)
          });
          $keys.appendTo($infoContainer);
        }
      }

			//clean up some doubled lines that sit on top of canvas borders (done via JS due to IE)
			$('.visualize-line li:first-child span.line, .visualize-line li:last-child span.line, .visualize-area li:first-child span.line, .visualize-area li:last-child span.line, .visualize-bar li:first-child span.line,.visualize-bar .visualize-labels-y li:last-child span.line').css('border', 'none');

			if (!container) {
				//add event for updating
				$canvasContainer.bind('visualizeRefresh', function () {
					$table.visualize(o, $(this).empty());
				});
			}
		}).next(); //returns canvas(es)
	};
})(jQuery);
/**
 * Radar charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a star shaped form whose branches
 * are equal to the total value of each serie
 * Doesn't work very well if there is less than 3 members in the serie.
 */
$.visualize.plugins.radar = function () {

    var o = this.options,
        container = this.target.canvasContainer,
        ctx = this.target.canvasContext,
        canvas = this.target.canvas,
        dataGroups = this.data.dataGroups(),
        memberCount = dataGroups.length,
        memberTotals = this.data.memberTotals(),
        topValue = this.data.topValue();


    container.addClass('visualize-pie');

    if (o.pieLabelPos == 'outside') {
        container.addClass('visualize-pie-outside');
    }

    var centerX = Math.round(canvas.width() / 2);
    var centerY = Math.round(canvas.height() / 2);

    var area_span = Math.PI * 2 / memberCount;
    var radius = (centerY < centerX ? centerY : centerX) - o.pieMargin;

    var labels = $('<ul class="visualize-labels"></ul>').insertAfter(canvas);

    // Draw the branches of our star shape
    $.each(memberTotals, function (i, total) {

        var ratio = total / topValue;
        var distance = radius * ratio / 2;

        ctx.beginPath();
        ctx.lineWidth = o.lineWeight;
        ctx.lineJoin = 'round';
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(i * area_span) * distance,
            centerY + Math.sin(i * area_span) * distance
        );
        ctx.strokeStyle = dataGroups[i].color;
        ctx.stroke();
        ctx.closePath();
    });

    // Draw the surrounding form
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = o.colors[memberCount];

    ctx.moveTo(
        centerX + radius * memberTotals[0] / topValue / 2,
        centerY
    );

    $.each(memberTotals, function (i, total) {

        var ratio = total / topValue;
        var distance = radius * ratio / 2;

        var labelX = centerX + Math.cos(i * area_span) * distance;
        var labelY = centerY + Math.sin(i * area_span) * distance;
        ctx.lineTo(labelX, labelY);

        // draw labels
        labelY += (labelY > centerY ? radius / 16 : -radius / 16);

        var leftRight = (labelX > centerX) ? 'right' : 'left';
        var topBottom = (labelY > centerY) ? 'bottom' : 'top';

        var labeltext = $("<span>")
            .addClass("visualize-label")
            .html(total)
            .css(leftRight, 0)
            .css(topBottom, 0)
            .css('font-size', radius / 8)
            .css('color', dataGroups[i].color);

        $("<li>")
            .addClass("visualize-label-pos")
            .css({left:labelX, top:labelY})
            .append(labeltext)
            .appendTo(labels);

        labeltext
            .css('margin-' + leftRight, -labeltext.width() / 2)
            .css('margin-' + topBottom, -labeltext.outerHeight() / 2);

    });

    ctx.closePath();
    ctx.stroke();
};
/**
 * Piled bars charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a colored portions in a vertival bar.
 * The data can be normalized to a 0..100 scale so that each serie can be easily compared.
 */
(function define() {

    $.visualize.plugins.pilebar = function () {

        drawPile.call(this, false);
    };

    $.visualize.plugins.pilebar_100 = function () {

        drawPile.call(this, true);
    };

    function drawPile(normalized) {
        var o = this.options,
            container = this.target.canvasContainer.addClass("visualize-bar"),
            ctx = this.target.canvasContext,
            canvas = this.target.canvas,
            dataGroups = this.data.dataGroups(),
            xLabels = this.data.xLabels(),
            groupSums = this.data.groupSums(),
            totalYRange = Array.max(groupSums),
            yLabels = (normalized ? this.data.yLabels100() : this.data.yLabels(0, totalYRange));

        // Display X labels
        var xInterval = canvas.width() / (xLabels.length);
        var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
            .width(canvas.width())
            .height(canvas.height())
            .insertBefore(canvas);

        $.each(xLabels, function(i, label) {
            var $label = $("<span class='label'></span>").html(label);
            $("<li>")
                .css("left", xInterval * i)
                .width(xInterval)
                .prepend("<span class='line' />")
                .append($label)
                .appendTo(xlabelsUL);
        });

        // Display Y labels
        var yScale = canvas.height() / (normalized ? 100 : totalYRange);
        var liBottom = canvas.height() / (yLabels.length-1);

        var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
            .width(canvas.width())
            .height(canvas.height())
            .insertBefore(canvas);

        $.each(yLabels, function(i, label){
            var $label = $("<span class='label'></span>").html(label);
            $("<li>")
                .css("bottom", liBottom * i)
                .prepend("<span class='line' />")
                .append($label)
                .prependTo(ylabelsUL);

            // Adjust the vertical position of first and last labels
            var topOffset = $label.height() / -2;
            if (i == 0) {
                topOffset = -$label.height();
            } else if (i == yLabels.length-1) {
                topOffset = 0;
            }
            $label.css('margin-top', topOffset);
        });

        // Start from the bottom left
        var updatedZeroLoc = [];

        for (var h=0; h<dataGroups.length; h++) { // series
            ctx.beginPath();
            var groupWidth = (xInterval - o.barGroupMargin*2) ;
            ctx.lineWidth = groupWidth - (o.barMargin*2);
            ctx.strokeStyle = dataGroups[h].color;

            var points = dataGroups[h].points, xPos = 0;

            for (var i=0; i<points.length; i++) {
                if (typeof(updatedZeroLoc[i]) == 'undefined') updatedZeroLoc[i] = o.height ;
                var xVal = (xPos-o.barGroupMargin) + groupWidth/2;
                xVal += o.barGroupMargin*2;

                ctx.moveTo(xVal, updatedZeroLoc[i]);

                updatedZeroLoc[i] += Math.round(-points[i]*yScale*(normalized ? 100 / groupSums[i] : 1));
                ctx.lineTo(
                    xVal
                    , updatedZeroLoc[i]
                        +0.1 /* this a hack, otherwise bar are not displayed if all value in a serie are zero */
                );

                xPos+=xInterval;
            }
            ctx.stroke();
            ctx.closePath();
        }

    }

})();
/**
 * Scatter charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a serie of dots along two axis
 */
(function define() {

    /**
     * Simple Dots
     */
    $.visualize.plugins.dots = function () {

        drawDots.call(this, false);
    };
    /**
     * Weighted Dots
     */
    $.visualize.plugins.dots_w = function () {

        drawDots.call(this, true);
    };

    function drawDots(weighted) {

        var o = this.options,
            container = this.target.canvasContainer,
            ctx = this.target.canvasContext,
            canvas = this.target.canvas,
            w = canvas.width(), h = canvas.height(),
            series = this.data.dataGroups(),
            xLabels = this.data.xLabels(),
            topValue = this.data.topValue(),
            bottomValue = (this.data.bottomValue() > 0) ? 0 : this.data.bottomValue(),
            totalYRange =  topValue - bottomValue,
            yLabels = this.data.yLabels(bottomValue, topValue);

        container.addClass('visualize-dots');

        // Display X labels
        var xInterval = w / (xLabels.length - 1);
        var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
            .width(w).height(h)
            .insertBefore(canvas);

        $.each(xLabels, function(i, label) {
            var $label = $("<span>").addClass("label").html(label);
            $("<li>")
                .css("left", xInterval * i)
                .prepend("<span class='line' />")
                .append($label)
                .appendTo(xlabelsUL);

            // Adjust the labels' positions
            var leftOffset = $label.width() / -2;
            if (i == 0) {
                leftOffset = 0;
            } else if (i== xLabels.length-1) {
                leftOffset = -$label.width();
            }
            $label.css('margin-left', leftOffset);
        });


        // Display Y labels
        var yScale = h / totalYRange;
        var liBottom = h / (yLabels.length - 1);

        var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
            .width(w).height(h)
            .insertBefore(canvas);

        $.each(yLabels, function(i, label){
            var $label = $("<span>").addClass("label").html(label);
            $("<li>")
                .css("bottom", liBottom * i)
                .prepend("<span class='line' />")
                .append($label)
                .prependTo(ylabelsUL);

            // Adjust the vertical position of label
            $label.css('margin-top', $label.height() / -2);
        });

        //iterate and draw
        $.each(series, function(idx, serie) {

            ctx.fillStyle = serie.color;
            ctx.strokeStyle = serie.color;
            ctx.lineWidth = o.lineWeight;
            ctx.lineJoin = 'round';

            $.each(serie.points, function(i, val){
                ctx.beginPath();
                var radius = weighted ? serie.points_weight[i] : 1;
                ctx.arc(i*xInterval, -val*yScale + h, radius, 0, 2*Math.PI, false);
                ctx.fill();
                ctx.stroke();
            });

        });
    }

})();


/**
 * Horizontal bars charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by horizontal bars.
 */

(function define() {
    $.visualize.plugins.hbar = function () {

        var o = this.options,
            container = this.target.canvasContainer.addClass("visualize-hbar"),
            ctx = this.target.canvasContext,
            canvas = this.target.canvas,
            w = canvas.width(), h = canvas.height(),
            tabledata = this.data,

            data = (o.parseDirection == 'x') ? tabledata.lines : tabledata.columns,
            dataMax = data.map(Array.max),
            dataRange = Array.max(dataMax),

				    xLabels = $.visualize.getRangeLabels(0, dataRange, 5),
				    yLabels = (o.parseDirection == 'x') ? tabledata.columnHeaders : tabledata.lineHeaders;

        // Display data range as X labels
        var xlabelsUL = $("<ul>").addClass("visualize-labels-x")
            .width(w).height(h)
            .insertBefore(canvas);

        ctx.beginPath();
        ctx.lineWidth = 0.1;

        var xInterval = w / (xLabels.length - 1);

        $.each(xLabels, function(i, label) {

            var $label = $("<span>").addClass("label").html(label);
            $("<li>")
                .css('left', xInterval * i)
                .width(xInterval)
                .append($label)
                .appendTo(xlabelsUL);

            if (i > 0) {
                $label.css("margin-left", -0.5 * $label.width());
            }

            ctx.moveTo(xInterval * (i + 1), 0);
            ctx.lineTo(xInterval * (i + 1), h);

        });

        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.closePath();

        // Display categories as Y labels
        var ylabelsUL = $("<ul>").addClass("visualize-labels-y")
            .width(w).height(h)
            .insertBefore(canvas);

        ctx.beginPath();
        ctx.lineWidth = 0.1;

        var liHeight = h / (yLabels.length);

        $.each(yLabels, function(i, label) {
            var $label = $("<span>").addClass("label").html(label);
            $("<li>")
                .css({"top": liHeight*i + liHeight/2, "height": liHeight/2})
                .append($label)
                .appendTo(ylabelsUL);

            // Slitghly reposition the label to center it on the median line
            $label.css('margin-top', -0.5 * $label.height());

            ctx.moveTo(0, liHeight * (i + 1));
            ctx.lineTo(w, liHeight * (i + 1));
        });

        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.closePath();

        // iterate on the series and draw the bars
        var xScale = w / dataRange;
        var yBandHeight = h / (yLabels.length);

        for (var i = 0; i < data.length; i++) {
            ctx.beginPath();
            var linewidth = (yBandHeight - o.barGroupMargin*2) / data.length; // a single bar width (with margins)
            ctx.lineWidth = linewidth - (o.barMargin * 2);
            var serie = data[i];

            for (var j = 0; j < serie.length; j++) {
                var yPos = j*yBandHeight + o.barGroupMargin + i*linewidth + linewidth/2;
                ctx.moveTo(0, yPos);
                ctx.lineTo(Math.round(serie[j] * xScale) + 0.1, yPos);
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

		var o = $.extend(defaults, this.options),
			container = this.target.canvasContainer.addClass("visualize-hstack"),
			ctx = this.target.canvasContext,
			canvas = this.target.canvas,
			w = canvas.width(), h = canvas.height(),
			tableData = this.data,

			data = (o.parseDirection == 'x') ? tableData.lines : tableData.columns,
			dataSums = data.map(Array.sum),
			dataRange = (o.normalize ? 100 : Array.max(dataSums)),
			xLabels = $.visualize.getRangeLabels(0, dataRange, o.ticks),
			yLabels = (o.parseDirection == 'x') ? tableData.lineHeaders : tableData.columnHeaders;

		this.data.keys = (o.parseDirection == 'x') ?
			function() {return tableData.columnHeaders;} :
			function() {return tableData.lineHeaders;};

		// Display data range as X labels
		var xInterval = w / (xLabels.length - 1);
		var xlabelsUL = $("<ul>").addClass("visualize-labels-x")
			.width(w).height(h)
			.insertBefore(canvas);

		ctx.beginPath();
		ctx.lineWidth = 0.1;

		$.each(xLabels, function(i, label) {
			var $label = $("<span>").addClass("label").html(label);
			$("<li>")
				.css("left", xInterval * i)
				.width(xInterval)
				// .prepend("<span class='line' />")
				.append($label)
				.appendTo(xlabelsUL);

			$label.css((i == 0) ? {"text-align": "left"} : {"margin-left": -0.5 * $label.width()});

			ctx.moveTo(xInterval * (i + 1), 0);
			ctx.lineTo(xInterval * (i + 1), h);

		});

		ctx.strokeStyle = "#fff";
		ctx.stroke();
		ctx.closePath();

		// Display categories as Y labels
		var ylabelsUL = $("<ul>").addClass("visualize-labels-y")
			.width(w).height(h)
			.insertBefore(canvas);

		ctx.beginPath();
		ctx.lineWidth = 0.1;

		var liHeight = h / (yLabels.length);

		$.each(yLabels, function(i, label){
			var $label = $("<span>").addClass("label").html(label);
			$("<li>")
				.css("bottom", liHeight * i + liHeight / 2)
				//.prepend("<span class='line' />")
				.append($label)
				.prependTo(ylabelsUL);

			// Reposition the label by shifting it by half the height of its container
			$label.css('margin-top', $label.height() / -2);

			ctx.moveTo(0, h - liHeight * i);
			ctx.lineTo(w, h - liHeight * i);
		});

		ctx.strokeStyle = "#fff";
		ctx.stroke();
		ctx.closePath();

		// Iterate and draw the series of bars
		var xScale = w / dataRange;
		var yInterval = h / (yLabels.length);

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
