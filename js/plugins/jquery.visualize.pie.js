/**
 * Pie charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by colored slices of a pie.
 */
(function define() {
	var pie = $.visualize.plugins.pie = function () {

		var o = this.options,
			ctx = this.target.canvasContext,
			$canvas = this.target.canvas,
			w = $canvas.width(), h = $canvas.height(),
			tabledata = this.data,

			data = (o.parseDirection == 'x') ? tabledata.lines : tabledata.columns,
			seriesTotal = $.map(data, Array.sum),
			grandTotal = Array.sum(seriesTotal);

		// legend keys
		this._keys = (o.parseDirection == 'x') ? tabledata.lineHeaders : tabledata.columnHeaders;

		if (o.pieLabelPos == 'outside') {
			this.target.container.addClass('visualize-pie-outside');
		}

		var centerX = Math.round(w / 2),
			centerY = Math.round(h / 2),
			radius = centerY - o.pieMargin,
			counter = 0.0;

		var labels = $('<ul class="visualize-labels"></ul>')
			.insertAfter($canvas);

		$.each(seriesTotal, function (i, total) {
			// Draw the pie pieces
			var slice = (total <= 0 || isNaN(total)) ? 0 : total / grandTotal;
			if (slice > 0) {
				ctx.beginPath();
				ctx.moveTo(centerX, centerY);
				ctx.arc(centerX, centerY, radius,
					counter * Math.PI * 2 - Math.PI * 0.5,
					(counter + slice) * Math.PI * 2 - Math.PI * 0.5,
					false);
				ctx.lineTo(centerX, centerY);
				ctx.closePath();
				ctx.fillStyle = o.colors[i];
				ctx.fill();
			}

			// Draw labels
			var sliceMiddle = (counter + slice / 2);
			var distance = o.pieLabelPos == 'inside' ? radius / 1.6 : radius + radius / 5;
			var labelX = Math.round(centerX + Math.sin(sliceMiddle * Math.PI * 2) * (distance));
			var labelY = Math.round(centerY - Math.cos(sliceMiddle * Math.PI * 2) * (distance));
			var leftRight = (labelX > centerX) ? 'right' : 'left';
			var topBottom = (labelY > centerY) ? 'bottom' : 'top';
			var percentage = parseFloat((slice * 100).toFixed(2));

			if (percentage) {
				var labelval = (o.pieLabelsAsPercent) ? percentage + '%' : total;
				var $label = $('<span class="visualize-label">' + labelval + '</span>')
					.css({leftRight: 0, topBottom: 0});
				var label = $('<li class="visualize-label-pos"></li>')
					.append($label).appendTo(labels)
					.css({left:labelX, top:labelY});
				$label
					.css('font-size', radius / 10)
					.css('margin-' + leftRight, -$label.width() / 2)
					.css('margin-' + topBottom, -$label.outerHeight() / 2);

				if (o.textColors[i]) {
					$label.css('color', o.textColors[i]);
				}
			}
			counter += slice;
		});

	}
})();
