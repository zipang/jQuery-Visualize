/**
 * Pie charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by colored slices of a pie.
 */
(function define() {

	var defaults = {
		pieMargin:20, //pie charts only - spacing around pie
		pieLabelsAsPercent:false,
		pieLabelPos:'inside',		
	};
	
	$.visualize.plugins.pie = function () {

		var o = this.options,
			ctx = this.target.canvasContext,
			$canvas = this.target.canvas,
			w = $canvas.width(), h = $canvas.height(),
			tabledata = this.data;

		// Let's gather the pie data
		var slices = [], keys = [], total;

		if (o.column) { // extract data from a single column
			var input = tabledata.get("columns", o.column), 
				type  = o.columnType || isNaN(input[0]) ? "text" : "value",
				stats = {};
			$.each(input, function(i, dat) {
				if (type == "value") { // take this value
					stats[tabledata.lineHeaders[i]] = dat;
				} else { // count the number of items with the same value
					if (!stats[dat]) stats[dat] = 1; else stats[dat] += 1;
				}
			});
			for (var key in stats) {
				keys.push(key);
				slices.push(stats[key]);
			}
		} else { // extract data from the whole lines/columns (sum the values)
			if (o.parseDirection == 'x') { // series are lines
				slices = $.map(tabledata.lines, Array.sum);
				keys = tabledata.lineHeaders;
			} else {
				slices = $.map(tabledata.columns, Array.sum);
				keys = tabledata.columnHeaders;
			}
		}
			
		total = Array.sum(slices);
		this._keys = keys;

		// Let's draw the pie
		if (o.pieLabelPos == 'outside') {
			this.target.container.addClass('visualize-pie-outside');
		}

		var labels = $('<ul class="visualize-labels"></ul>')
			.insertAfter($canvas);

		var centerX = Math.round(w / 2),
			centerY = Math.round(h / 2),
			radius = centerY - o.pieMargin,
			counter = 0.0;

		$.each(slices, function (i, val) {

			// Draw the pie pieces
			var slice = (val <= 0 || isNaN(val)) ? 0 : val / total;
			if (slice > 0) {
				ctx.beginPath();
				ctx.moveTo(centerX, centerY);
				ctx.arc(centerX, centerY, radius,
					counter * Math.PI * 2 - Math.PI * 0.5,
					(counter + slice) * Math.PI * 2 - Math.PI * 0.5,
					false);
				ctx.lineTo(centerX, centerY);
				ctx.closePath();
				ctx.fillStyle = o.colors[i % o.colors.length];
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
				var labelval = (o.pieLabelsAsPercent) ? percentage + '%' : val;
				var $label = $('<span class="visualize-label">' + labelval + '</span>')
					.css({leftRight: 0, topBottom: 0});
				var label = $('<li class="visualize-label-pos"></li>')
					.append($label).appendTo(labels)
					.css({left:labelX, top:labelY});
				$label
					.css('font-size', Math.min(radius / 10, 20))
					.css('margin-' + leftRight, -$label.width() / 2)
					.css('margin-' + topBottom, -$label.outerHeight() / 2);

				if (o.textColors[i]) {
					$label.css('color', o.textColors[i]);
				}
			}
			counter += slice;
		}); // each slices

	}; // pie

	$.visualize.plugins.pie.defaults = defaults;
})();
