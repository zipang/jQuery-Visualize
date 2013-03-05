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
		this.drawYAxis(yLabels, {drawLines: true, fromTop: true});

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
