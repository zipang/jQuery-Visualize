/**
 * Piled bars charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a colored portions in a vertival bar.
 * The data can be normalized to a 0..100 scale so that each serie can be easily compared.
 */
(function define() {

    $.visualize.plugins.pilebar = function () {

        drawPile.call(this, false);
    };
    $.visualize.plugins.pilebar100 = function () {

        drawPile.call(this, true);
    };

    function drawPile(normalized) {
        var o = this.options,
            container = this.target.canvasContainer,
            ctx = this.target.canvasContext,
            canvas = this.target.canvas,
            dataGroups = this.data.dataGroups(),
            xLabels = this.data.xLabels(),
            groupSums = this.data.groupSums(),
            totalYRange = Array.max(groupSums);
            yLabels = (normalized ? this.data.yLabels100() : this.data.yLabels(0, totalYRange)),

        container.addClass("visualize-bar");

        // Create X labels
        var xInterval = canvas.width() / (xLabels.length);
        var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
            .width(canvas.width())
            .height(canvas.height())
            .insertBefore(canvas);

        $.each(xLabels, function(i, label){
            $("<li>")
                .css("left", xInterval * i)
                .width(xInterval)
                .prepend("<span class='line' />")
                .append($("<span class='label' />").html(label))
                .appendTo(xlabelsUL);
        });

        // Create Y labels
        var yScale = canvas.height() / (normalized ? 100 : totalYRange);
        var liBottom = canvas.height() / (yLabels.length-1);

        var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
            .width(canvas.width())
            .height(canvas.height())
            .insertBefore(canvas);

        $.each(yLabels, function(i, label){
            var $label = $("<span class='label'></span>").html(label);
            $("<li>")
                .css("bottom", liBottom * i)
                .prepend("<span class='line' />")
                .append($label)
                .prependTo(ylabelsUL);

            // Adjust the vertical position of first and last labels
            var topOffset = $label.height()/-2;
            if (i==0) {
                topOffset = -$label.height();
            } else if (i== yLabels.length-1) {
                topOffset = 0;
            }
            $label.css('margin-top', topOffset);
        });

        // Start from the bottom left
        var updatedZeroLoc = [];

        for (var h=0; h<dataGroups.length; h++){ // series
            ctx.beginPath();
            var linewidth = (xInterval-o.barGroupMargin*2) ;// removed / dataGroups.length; // removed +1
            var strokeWidth = linewidth - (o.barMargin*2);
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = dataGroups[h].color;
            var points = dataGroups[h].points;
            var integer = 0;

            for(var i=0; i<points.length; i++){
                if ( typeof(updatedZeroLoc[i])=='undefined' ) updatedZeroLoc[i]=o.height ;
                var xVal = (integer-o.barGroupMargin) + linewidth/2;
                xVal += o.barGroupMargin*2;

                ctx.moveTo(xVal, updatedZeroLoc[i]);

                updatedZeroLoc[i] += Math.round(-points[i]*yScale*(normalized ? 100 / groupSums[i] : 1));
                ctx.lineTo(
                    xVal
                    , updatedZeroLoc[i]
                        +0.1 /* this a hack, otherwise bar are not displayed if all value in a serie are zero */
                );

                integer+=xInterval;
            }
            ctx.stroke();
            ctx.closePath();
        }

    }



})();
