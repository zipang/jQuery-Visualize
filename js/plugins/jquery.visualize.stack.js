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
