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
