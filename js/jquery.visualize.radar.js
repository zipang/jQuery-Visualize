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

    var centerx = Math.round(canvas.width() / 2);
    var centery = Math.round(canvas.height() / 2);

    var area_span = Math.PI * 2 / memberCount;
    var radius = (centery < centerx ? centery : centerx) - o.pieMargin;

    var labels = $('<ul class="visualize-labels"></ul>').insertAfter(canvas);

    // Draw the axis
    $.each(memberTotals, function (i, total) {

        var ratio = total / topValue;
        var distance = radius * ratio;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.moveTo(centerx, centery);
        ctx.lineTo(
            centerx + Math.cos(i * area_span) * distance,
            centery + Math.sin(i * area_span) * distance
        );
        ctx.strokeStyle = dataGroups[i].color;
        ctx.stroke();
        ctx.closePath()
    });

    // Draw the pie pieces
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';

    ctx.moveTo(
        centerx + radius * memberTotals[0] / topValue,
        centery
    );

    $.each(memberTotals, function (i, total) {

        if (total > 0) {

            var ratio = total / topValue;
            var distance = radius * ratio;
            var labelx = centerx + Math.cos(i * area_span) * distance;
            var labely = centery + Math.sin(i * area_span) * distance;
            ctx.lineTo(labelx, labely);

            // draw labels
            labely += (labely > centery ? radius / 16 : -radius / 16);

            var leftRight = (labelx > centerx) ? 'right' : 'left';
            var topBottom = (labely > centery) ? 'bottom' : 'top';

            var labeltext = $("<span>")
                .addClass("visualize-label")
                .html(total)
                .css(leftRight, 0)
                .css(topBottom, 0)
                .css('font-size', radius / 8)
                .css('color', dataGroups[i].color);

            $("<li>")
                .addClass("visualize-label-pos")
                .css({left:labelx, top:labely})
                .append(labeltext)
                .appendTo(labels);

            labeltext
                .css('margin-' + leftRight, -labeltext.width() / 2)
                .css('margin-' + topBottom, -labeltext.outerHeight() / 2)
        }

    });

    ctx.closePath();
    ctx.stroke();
};
