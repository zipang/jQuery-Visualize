

    function EnhancedCanvas($canvas, container) {
        this.canvasContainer = container;
        this.canvas = $canvas[0];
        this.width  = $canvas.width();
        this.height = $canvas.height();
        this.canvasContext = this.canvas.getContext('2d');
    }

    EnhancedCanvas.prototype = {
        /**
         * Set the coordinate system
         * @param coordRange {x: range array, y: range array}
         */
        setViewport: function(coordRange) {
            this.coordRange = coordRange;

            var xRange = (coordRange.x[1] - coordRange.x[0]);
            var xScale = this.width / xRange;

            var yRange = (coordRange.y[0] - coordRange.y[1]); // reverse orientation for the y axis
            var yScale = this.height / yRange;

            this.canvasContext.scale(xScale, yScale); // this makes the viewport scale to the desired range
            this.canvasContext.translate(-1*coordRange.x[0], -1*coordRange.y[1]); // this map the center where it should be

        },

        drawAxis: function() {
            var ctx = this.canvasContext;

            // Draw the X axis
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.moveTo(this.coordRange.x[0], 0);
            ctx.lineTo(this.coordRange.x[1], 0);
            ctx.stroke();

            // Draw the Y axis
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.moveTo(0, this.coordRange.y[0]);
            ctx.lineTo(0, this.coordRange.y[1]);
            ctx.stroke();
        },

				init : function(options) {

						//create canvas wrapper div, set inline w&h, append
						var canvasContainer;
						if (options.container) {
								canvasContainer = $(options.container);
								if (canvasContainer.length == 0) throw "[jquery.visualize plugin error] The target container '" + options.container + "' didn't return any matching element.";

						} else {
								canvasContainer = $("<div>")
										.addClass("visualize")
										.attr("role", "img")
										.attr("aria-label", "Graph for " + stats.title)
										.height(options.height).width(options.width)
								;
						}

						//create new canvas, set w&h attrs (not inline styles)
						var canvas = $("<canvas>")
								.height(options.height)
								.width(options.width)
								.appendTo(canvasContainer)
						;

						//title/key container
						if (options.appendTitle || options.appendKey) {

								var infoContainer = $('<div class="visualize-info"></div>')
										.appendTo(canvasContainer);

								//append title
								if (options.appendTitle) {
										$("<div>")
												.addClass("visualize-title")
												.html(stats.title)
												.appendTo(infoContainer);
								}

								//append key
								if (options.appendKey) {
										var legend = $("<ul>").addClass("visualize-key");
										$.each(stats.series.lines, function (i, line) {
												$("<li>")
														.append(
														$("<span>")
																.addClass("visualize-key-color")
																.css({background:options.colors[i]})
												).append(
														$("<span>")
																.addClass("visualize-key-label")
																.html(line.name)
												).appendTo(legend);
										});
										legend.appendTo(infoContainer);
								}
						}

						// Append new canvas to page
						if (!options.container) {
								if (stats.table) {
										canvasContainer.insertAfter(stats.table);
								} else {
										canvasContainer.appendTo("body");
								}
						}

						// Something strange (maybe a IE hack)
						// @TODO TEST OR SUPPRESS THIS
						if (typeof(G_vmlCanvasManager) != 'undefined') {
								G_vmlCanvasManager.init();
								G_vmlCanvasManager.initElement(canvas[0]);
						}


				}

    };
