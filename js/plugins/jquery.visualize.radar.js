/**
 * Radar charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a star shaped form whose branches
 * are equal to the total value of each serie
 * Doesn't work very well if there is less than 3 members in the serie.
 */
$.visualize.plugins.radar = function () {

    var o = this.options,
        ctx = this.target.canvasContext,
        canvas = this.target.canvas,
		tableData = this.data,
		data = (o.parseDirection == 'x') ? tableData.lines : tableData.columns,
        seriesLength = data[0].length,
        topValue = Array.max($.map(data, Array.max));

    var centerX = Math.round(canvas.width() / 2);
    var centerY = Math.round(canvas.height() / 2);

    var area_span = Math.PI * 2 / seriesLength;
    var radius = (centerY < centerX ? centerY : centerX) - o.pieMargin;

    var labels = $('<ul class="visualize-labels"></ul>').insertAfter(canvas);

    // Draw the branches of our star shape
    for (var i=0; i < data.length; i++) {

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(i * area_span) * radius,
            centerY + Math.sin(i * area_span) * radius
        );
        ctx.strokeStyle = o.bgcolors[1];
        ctx.stroke();
        ctx.closePath();
    };


	$.each(data, function(i, serie) {

		// Draw the spiders
		ctx.beginPath();
		ctx.lineWidth = o.lineWeight;
		ctx.lineJoin = 'round';
		ctx.strokeStyle = o.colors[i];

		ctx.moveTo(
			centerX + radius * serie[0] / topValue / 2,
			centerY
		);

		$.each(serie, function (j, val) {

			var ratio = val / topValue;
			var distance = radius * ratio / 2;

			var labelX = centerX + Math.cos(i * area_span) * distance;
			var labelY = centerY + Math.sin(i * area_span) * distance;
			ctx.lineTo(labelX, labelY);

			// draw labels
			labelY += (labelY > centerY ? radius / 16 : -radius / 16);

			var leftRight = (labelX > centerX) ? 'right' : 'left';
			var topBottom = (labelY > centerY) ? 'bottom' : 'top';

			var labelText = $("<span>")
				.addClass("visualize-label")
				.html(val)
				.css(leftRight, 0)
				.css(topBottom, 0)
				.css('font-size', radius / 8)
				.css('color', o.colors[j]);

			$("<li>")
				.addClass("visualize-label-pos")
				.css({left:labelX, top:labelY})
				.append(labelText)
				.appendTo(labels);

			labelText
				.css('margin-' + leftRight, -labelText.width() / 2)
				.css('margin-' + topBottom, -labelText.outerHeight() / 2);
	    });

		ctx.closePath();
		ctx.stroke();

    });

};
