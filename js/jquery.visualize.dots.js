/**
 * Scatter charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a serie of dots along two axis
 */
(function define() {

    /**
     * Simple Dots
     */
    $.visualize.plugins.dots = function () {

        drawDots.call(this, false);
    };
    /**
     * Weighted Dots
     */
    $.visualize.plugins.dots_w = function () {

        drawDots.call(this, true);
    };

    function drawDots(weighted) {

        var o = this.options,
            container = this.target.canvasContainer,
            ctx = this.target.canvasContext,
            canvas = this.target.canvas,
            w = canvas.width(), h = canvas.height(),
            series = this.data.dataGroups(),
            xLabels = this.data.xLabels(),
            topValue = this.data.topValue(),
            bottomValue = (this.data.bottomValue() > 0) ? 0 : this.data.bottomValue(),
            totalYRange =  topValue - bottomValue,
            yLabels = this.data.yLabels(bottomValue, topValue);

        container.addClass('visualize-dots');

        // Display X labels
        var xInterval = w / (xLabels.length - 1);
        var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
            .width(w).height(h)
            .insertBefore(canvas);

        $.each(xLabels, function(i, label) {
            var $label = $("<span class='label'></span>").html(label);
            $("<li>")
                .css("left", xInterval * i)
                .prepend("<span class='line' />")
                .append($label)
                .appendTo(xlabelsUL);

            // Adjust the labels' positions
            var leftOffset = $label.width() / -2;
            if (i == 0) {
                leftOffset = 0;
            } else if (i== xLabels.length-1) {
                leftOffset = -$label.width();
            }
            $label.css('margin-left', leftOffset);
        });


        // Display Y labels
        var yScale = h / totalYRange;
        var liBottom = h / (yLabels.length - 1);

        var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
            .width(w).height(h)
            .insertBefore(canvas);

        $.each(yLabels, function(i, label){
            var $label = $("<span class='label'></span>").html(label);
            $("<li>")
                .css("bottom", liBottom * i)
                .prepend("<span class='line' />")
                .append($label)
                .prependTo(ylabelsUL);

            // Adjust the vertical position of first and last labels
            var topOffset = $label.height() / -2;
            if (i == 0) {
                topOffset = -$label.height();
            } else if (i == yLabels.length-1) {
                topOffset = 0;
            }
            $label.css('margin-top', topOffset);
        });

        //iterate and draw
        $.each(series, function(idx, serie) {

            ctx.fillStyle = serie.color;
            ctx.strokeStyle = serie.color;
            ctx.lineWidth = o.lineWeight;
            ctx.lineJoin = 'round';

            $.each(serie.points, function(i, val){
                ctx.beginPath();
                var radius = weighted ? serie.points_weight[i] : 1;
                ctx.arc(i*xInterval, -val*yScale + h, radius, 0, 2*Math.PI, false);
                ctx.fill();
                ctx.stroke();
            });

        });
    }

})();


