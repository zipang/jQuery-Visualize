/**
 * Horizontal bars charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by horizontal bars.
 */
(function define() {
	$.visualize.plugins.bar = function () {

		var o = this.options,
			container = this.target.canvasContainer.addClass("visualize-bar"),
			ctx = this.target.canvasContext,
			canvas = this.target.canvas,
			w = canvas.width(), h = canvas.height(),
			tabledata = this.data,

			data = (o.parseDirection == 'x') ? tabledata.lines : tabledata.columns,
			max = Math.ceil(Array.max($.map(data, Array.max))),
			min = Math.floor(Array.min($.map(data, Array.min))),
			range = max - ((min > 0) ? (min = 0) : min),

			yLabels = $.visualize.getRangeLabels(min, max, o.ticks),
			xLabels = (o.parseDirection == 'x') ? tabledata.columnHeaders : tabledata.lineHeaders;

		// Display categories as X labels
		var xBandWidth = w / xLabels.length;
		var xlabelsUL = $("<ul>").addClass("visualize-labels-x")
			.width(w).height(h)
			.insertBefore(canvas);

		$.each(xLabels, function(i, label) {
			var $label = $("<span>").addClass("label").html(label);
			$("<li>")
				.css('left', xBandWidth * i)
				.width(xBandWidth)
				.append($label)
				.appendTo(xlabelsUL);
		});

		// Display data range as Y labels
		var ylabelsUL = $("<ul>").addClass("visualize-labels-y")
			.width(w).height(h)
			.insertBefore(canvas);

		ctx.beginPath();
		ctx.lineWidth = 0.1;

		var liHeight = h / (yLabels.length - 1);

		$.each(yLabels, function(i, label) {
			var $label = $("<span>").addClass("label").html(label);
			$("<li>")
				.css({"bottom": liHeight*i})
				.append($label)
				.appendTo(ylabelsUL);

			// Slitghly reposition the label to center it on the median line
			$label.css('margin-top', -0.5 * $label.height());

			ctx.moveTo(0, liHeight * (i + 1));
			ctx.lineTo(w, liHeight * (i + 1));
		});

		ctx.strokeStyle = o.bgcolors[0];
		ctx.stroke();
		ctx.closePath();

		// iterate on the series and draw the bars
		var yScale = h / range,
			zeroPos = h - ((min < 0) ? -min : 0) * yScale; // Position of the 0 on the X axis

		for (var i = 0; i < data.length; i++) {
			ctx.beginPath();
			var linewidth = (xBandWidth - o.barGroupMargin*2) / data.length; // a single bar width (with margins)
			ctx.lineWidth = linewidth - (o.barMargin * 2);
			var serie = data[i];

			for (var j = 0; j < serie.length; j++) {
				var xPos = j*xBandWidth + o.barGroupMargin + i*linewidth + linewidth/2;
				ctx.moveTo(xPos, zeroPos);
				ctx.lineTo(xPos, Math.round(-serie[j] * yScale) + zeroPos);
			}
			ctx.strokeStyle = o.colors[i];
			ctx.stroke();
			ctx.closePath();
		}
	}
})();
