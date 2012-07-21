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
			max = Math.ceil(Array.max($.map(data, Array.max))),
			min = Math.floor(Array.min($.map(data, Array.min))),
			range = max - ((min > 0) ? (min = 0) : min),

			xLabels = $.visualize.getRangeLabels(min, max, o.ticks),
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

		ctx.strokeStyle = o.bgcolors[0];
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

		ctx.strokeStyle = o.bgcolors[0];
		ctx.stroke();
		ctx.closePath();

		// iterate on the series and draw the bars
		var xScale = w / range,
			yBandHeight = h / (yLabels.length),
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
