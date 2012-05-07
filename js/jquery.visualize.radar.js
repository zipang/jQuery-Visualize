$.visualize.plugins.radar = function () {

    var o = this.options,
        container = this.target.canvasContainer,
        ctx = this.target.canvasContext,
        canvas = this.target.canvas,
        dataGroups = this.data.dataGroups(),
        memberCount = dataGroups.length,
        memberTotals = this.data.memberTotals(),
        topValue = this.data.topValue();


    container.addClass('visualize-pie');

    if (o.pieLabelPos == 'outside') {
        container.addClass('visualize-pie-outside');
    }

    var centerX = Math.round(canvas.width() / 2);
    var centerY = Math.round(canvas.height() / 2);

    var area_span = Math.PI * 2 / memberCount;
    var radius = (centerY < centerX ? centerY : centerX) - o.pieMargin;

    var labels = $('<ul class="visualize-labels"></ul>').insertAfter(canvas);

    // Draw the axis
    $.each(memberTotals, function (i, total) {

        var ratio = total / topValue;
        var distance = radius * ratio;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(i * area_span) * distance,
            centerY + Math.sin(i * area_span) * distance
        );
        ctx.strokeStyle = dataGroups[i].color;
        ctx.stroke();
        ctx.closePath()
    });

    // Draw the surrounding lines
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = o.colors[memberCount];

    ctx.moveTo(
        centerX + radius * memberTotals[0] / topValue,
        centerY
    );

    $.each(memberTotals, function (i, total) {

        var ratio = total / topValue;
        var distance = radius * ratio;
        var labelX = centerX + Math.cos(i * area_span) * distance;
        var labelY = centerY + Math.sin(i * area_span) * distance;
        ctx.lineTo(labelX, labelY);

        // draw labels
        labelY += (labelY > centerY ? radius / 16 : -radius / 16);

        var leftRight = (labelX > centerX) ? 'right' : 'left';
        var topBottom = (labelY > centerY) ? 'bottom' : 'top';

        var labeltext = $("<span>")
            .addClass("visualize-label")
            .html(total)
            .css(leftRight, 0)
            .css(topBottom, 0)
            .css('font-size', radius / 8)
            .css('color', dataGroups[i].color);

        $("<li>")
            .addClass("visualize-label-pos")
            .css({left:labelX, top:labelY})
            .append(labeltext)
            .appendTo(labels);

        labeltext
            .css('margin-' + leftRight, -labeltext.width() / 2)
            .css('margin-' + topBottom, -labeltext.outerHeight() / 2)

    });

    ctx.closePath();
    ctx.stroke();
};
