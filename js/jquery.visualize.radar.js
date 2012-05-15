/**
 * Radar charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a star shaped form whose branches
 * are equal to the total value of each serie
 * Doesn't work very well if there is less than 3 members in the serie.
 */
$.visualize.plugins.radar = function () {

    var options = this.options,
        container = this.target.canvasContainer,
        ctx = this.target.canvasContext,
        canvas = this.target.canvas,
        data = this.data;


    container.addClass('visualize-pie');

    if (options.pieLabelPos == 'outside') {
        container.addClass('visualize-pie-outside');
    }

		var max = data.series.lines.max();
		var radius = max + options.pieMargin;

		// Tell the drawing area (canvas) to be the center of a cicrcle with the given radius
		var tx = this.target.setWindow(-radius, radius, -radius, radius);  
		ctx.setTransformation(tx);

    var area_span = Math.PI * 2 / this.data.series.lines.count();


    // Draw the branches of our star shape
    $.each(data.series.lines, function (i, line) {

        var l = line.sum();

        ctx.beginPath();
        ctx.lineWidth = options.lineWeight;
        ctx.lineJoin = 'round';
        ctx.moveTo(0, 0);
        ctx.lineTo(
            l * Math.cos(i * area_span),
            l * Math.sin(i * area_span)
        );
        ctx.strokeStyle = options.colors[i];
        ctx.stroke();
        ctx.closePath();
    });

    // Draw the surrounding form
    var labels = $('<ul class="visualize-labels"></ul>').insertAfter(canvas);

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = options.colors[memberCount];

    ctx.moveTo(
        centerX + radius * memberTotals[0] / topValue / 2,
        centerY
    );

    $.each(data.series.lines, function (i, line) {

        var ratio = line.sum() / max;
        var l = radius * ratio;

        var labelX = l * Math.cos(i * area_span);
        var labelY = l * Math.sin(i * area_span);
        ctx.lineTo(labelX, labelY);

        // draw labels
        labelY += (labelY > centerY ? radius / 16 : -radius / 16);

        var leftRight = (labelX > centerX) ? 'right' : 'left';
        var topBottom = (labelY > centerY) ? 'bottom' : 'top';

        var labeltext = $("<span>")
            .addClass("visualize-label")
            .html(line.sum())
            .css(leftRight, 0)
            .css(topBottom, 0)
            .css('font-size', radius / 8)
            .css('color', options.colors[i});

        $("<li>")
            .addClass("visualize-label-pos")
            .css({left:labelX, top:labelY})
            .append(labeltext)
            .appendTo(labels);

        labeltext
            .css('margin-' + leftRight, -labeltext.width() / 2)
            .css('margin-' + topBottom, -labeltext.outerHeight() / 2);

    });

    ctx.closePath();
    ctx.stroke();
};
