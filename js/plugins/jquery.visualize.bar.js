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
		this.drawXAxis(xLabels);

		// Display data range as Y labels
		this.drawYAxis(yLabels);

		// iterate on the series and draw the bars
		var xBandWidth = w / xLabels.length,
			yScale = h / range,
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
