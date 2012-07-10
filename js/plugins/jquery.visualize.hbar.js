/**
 * Horizontal bars charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by horizontal bars.
 */

(function define() {
    $.visualize.plugins.hbar = function () {

        var o = this.options,
            container = this.target.canvasContainer.addClass("visualize-hbar"),
            ctx = this.target.canvasContext,
            canvas = this.target.canvas,
            w = canvas.width(), h = canvas.height(),
            dataGroups = this.data.dataGroups(),
            xLabels = this.data.xLabels(),
            totalYRange = this.data.topValue(),
            yLabels = this.data.yLabels(0, totalYRange);

        // Display data range as X labels
        var xlabelsUL = $("<ul>").addClass("visualize-labels-x")
            .width(w).height(h)
            .insertBefore(canvas);

        ctx.beginPath();
        ctx.lineWidth = 0.1;

        var xInterval = w / (yLabels.length - 1);

        $.each(yLabels, function(i, label) {

            var $label = $("<span>").addClass("label").html(label);
            $("<li>")
                .css('left', xInterval * i)
                .width(xInterval)
                .append($label)
                .appendTo(xlabelsUL);

            if (i > 0) {
                $label.css("margin-left", $label.width() / -2);
            }

            ctx.moveTo(xInterval * (i + 1), 0);
            ctx.lineTo(xInterval * (i + 1), h);

        });

        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.closePath();

        // Display categories as Y labels
        var ylabelsUL = $("<ul>").addClass("visualize-labels-y")
            .width(w).height(h)
            .insertBefore(canvas);

        ctx.beginPath();
        ctx.lineWidth = 0.1;

        var liHeight = h / (xLabels.length);

        $.each(xLabels, function(i, label) {
            var $label = $("<span>").addClass("label").html(label);
            $("<li>")
                .css("bottom", liHeight * i + liHeight / 2)
                .append($label)
                .prependTo(ylabelsUL);

            // Reposition the label by shifting it by half the height of its container
            $label.css('margin-top', $label.height() / -2);

            ctx.moveTo(0, h - liHeight * i);
            ctx.lineTo(w, h - liHeight * i);
        });

        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.closePath();

        // iterate on the series and draw the bars
        var xScale = w / totalYRange;
        var yInterval = h / (xLabels.length);

        for (var i = 0; i < dataGroups.length; i++) {
            ctx.beginPath();
            var linewidth = (yInterval - o.barGroupMargin * 2) / dataGroups.length; //removed +1 // bar height
            var strokeWidth = linewidth - (o.barMargin * 2);
            ctx.lineWidth = strokeWidth;
            var points = dataGroups[i].points;

            for (var j = 0; j < points.length; j++) {
                var yVal = (j * yInterval - o.barGroupMargin) + (i * linewidth) + linewidth / 2;
                yVal += o.barGroupMargin * 2;

                ctx.moveTo(0, h - yVal);
                ctx.lineTo(Math.round(points[j] * xScale) + 0.1, h - yVal);
            }
            ctx.strokeStyle = dataGroups[i].color;
            ctx.stroke();
            ctx.closePath();
        }
    }
})();
