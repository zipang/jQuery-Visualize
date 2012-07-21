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
			dataSums = $.map(data, Array.sum),
			dataRange = (o.normalize ? 100 : Array.max(dataSums)),
			xLabels = $.visualize.getRangeLabels(0, dataRange, o.ticks),
			yLabels = (o.parseDirection == 'x') ? tableData.lineHeaders : tableData.columnHeaders;

		this.data.keys = (o.parseDirection == 'x') ?
			function() {return tableData.columnHeaders;} :
			function() {return tableData.lineHeaders;};

		// Display data range as X labels
		var xAxisOptions = (o.normalize ? {format: function(label) {return label+'%';}} : {});
		this.drawXAxis(xLabels, xAxisOptions);

		// Display categories as Y labels
		this.drawYAxis(yLabels);

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
