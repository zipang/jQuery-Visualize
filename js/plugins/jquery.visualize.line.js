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


