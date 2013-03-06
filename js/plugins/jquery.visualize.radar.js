/**
 * Radar charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a spider web around iradiating axes.
 */
(function define() {

	var defaults = {
		width: 250, height: 250, 
		margin: 20, // spacing around
		labelsAsPercent: false,
		maxValues: 12
	};

	var FULL_PIE  = Math.PI * 2, // 2*PI
		QUART = Math.PI * 0.5;   // PI/2
	
	/**
	 * Define Radar draw function 
	 */
	$.visualize.plugins.radar = function () {

		var o = this.options,
			ctx = this.target.canvasContext,
			$canvas = this.target.canvas,
			w = $canvas.width() || defaults.width, h = $canvas.height() || defaults.height,
			tableData = this.data;

		// We'll use the same CSS as pie charts
		this.target.container.addClass("visualize-pie");

		// Let's gather the radar data
		var series = [], keys = [], labels = [], topValue;

		if (o.column) { // extract data from a single column
/*			
			var input = tableData.get("columns", o.column), 
				type  = o.columnType || isNaN(input[0]) ? "text" : "value",
				stats = {};
			$.each(input, function(i, dat) {
				if (type == "value") { // take this value
					stats[tableData.lineHeaders[i] || tableData.lines[i][0]] = dat;
				} else { // count the number of items with the same value
					if (!stats[dat]) stats[dat] = 1; else stats[dat] += 1;
				}
			});
			for (var key in stats) {
				keys.push(key);
				series.push(stats[key]);
			} 
*/
		} else { // extract data from the whole lines/columns (sum the values)
			if (o.parseDirection == 'x') { // series are lines
				series = [$.map(tableData.lines, Array.sum)];
				labels = tableData.lineHeaders;
			} else {
				series = [$.map(tableData.columns, Array.sum)];
				labels = tableData.columnHeaders;
			}
			keys = ["Total"];
			topValue = Array.max($.map(series, Array.max));
		}

		// Deal with the unrepresentable (too much discret values)
		if (series.length > o.maxValues) {
			keys = ["Cannot represent more than " + o.maxValues + " values (" + series.length + ")"];
			series = [100];
		}
			
		this._keys = keys;

		var centerX = Math.round(w / 2),
			centerY = Math.round(h / 2),
			R = (centerY < centerX ? centerY : centerX) - o.margin,
			alpha   = FULL_PIE / series[0].length;


		var $labels = $('<ul class="visualize-labels"></ul>').insertAfter($canvas);

		// Draw the branches of our star shape
		for (var i = 0; i < series[0].length; i++) {

			var X = centerX + Math.cos(i * alpha) * R,
				labelX = centerX + Math.cos(i * alpha + 0.2) * (R + o.margin / 2),
				Y = centerY + Math.sin(i * alpha) * R,
				labelY = centerY + Math.sin(i * alpha + 0.2) * (R + o.margin / 2) - 5;

		    ctx.beginPath();
		    ctx.lineWidth = 1;
		    ctx.moveTo(centerX, centerY);
		    ctx.lineTo(X, Y);		    
		    ctx.strokeStyle = o.lineColors[0];
		    ctx.stroke();
		    ctx.closePath();

		    addLabel(labelX, labelY, labels[i], o.lineColors[1], 16, $labels);
		};



		$.each(series, function(i, serie) {

			// Draw the spiders
			ctx.beginPath();
			ctx.lineWidth = o.lineWeight;
			ctx.lineJoin = 'round';
			ctx.strokeStyle = o.colors[i];

			ctx.moveTo(
				centerX + R * serie[0] / topValue,
				centerY
			);

			$.each(serie, function (j, val) {

				var ratio = val / topValue,
					D = R * ratio,
					X = centerX + Math.cos(j * alpha) * D,
					labelX = centerX + Math.cos(j * alpha - 0.1) * D * 1.2,
					Y = centerY + Math.sin(j * alpha) * D,
					labelY = centerY + Math.sin(j * alpha - 0.1) * D * 1.2 - 10;

				ctx.lineTo(X, Y);

				// draw labels
				addLabel(labelX, labelY, val, o.colors[i], 14, $labels);

			});

			ctx.closePath();
			ctx.stroke();

		}); // each series

	}; // radar

	function addLabel(x, y, txt, color, size, $target) {
		// var leftRight = (X > centerX) ? 'right' : 'left',
		// 	topBottom = (Y > centerY) ? 'bottom' : 'top';

		var $label = $("<span>")
				.addClass("visualize-label")
				.html(txt)
				.css("left", 0)
				.css("top", 0)
				.css('font-size', size)
				.css('color', color);

		$("<li>")
			.addClass("visualize-label-pos")
			.css({left: x, top: y})
			.append($label)
			.appendTo($target);

		// $label
		// 	.css('margin-' + leftRight, -$label.width() / 2)
		// 	.css('margin-' + topBottom, -$label.outerHeight() / 2);

	}

	$.visualize.plugins.radar.defaults = defaults;
})();
