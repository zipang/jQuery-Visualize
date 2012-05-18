/**
 * Created by JetBrains WebStorm.
 * User: christophe
 * Date: 14/05/12
 * Time: 12:38
 */
(function ($) {

// UTILITIES
    Array.max = function (arr) {
        return Math.max.apply(Array, arr);
    };
    Array.min = function (arr) {
        return Math.min.apply(Array, arr);
    };
    Array.sum = function (arr) {
        var len = (arr && arr.length ? arr.length : 0), sum = 0, val;
        for (var i = 0; i < len; i++) {
            val = parseFloat(arr[i]);
            sum += ((!arr[i] || isNaN(arr[i])) ? 0 : val);
        }
        return sum;
    };
    Array.avg = function (arr) {
        var len = (arr && arr.length ? arr.length : 0);
        return (len ? Array.sum(arr) / len : 0);
    };

    // Build a generic representation of the data scraped from the table
    function scrapeTable(table) {
    }

    /**
     * Multi dimensional structure to store series of data
     * and easily retrieve them
     * @param stats
     */
    function Stats(stats) {

        var defaultSelf = {
            title:"Empty",
            description:"not provided",
            series:{
                lines:[],
                columns:[]
            }
        };

        if (typeof stats == "string") {
            this.table = $(stats);
            $.extend(this, scrapeTable(this.table));

        } else {
            $.extend(this, defaultSelf, stats);
        }
    }

    Stats.prototype = {
        max:function () {
            var dataSet, len = arguments.length;
            if (len == 1) {
                return Array.max(this.series[arguments[0]]);
            }
        }
    };


    function EnhancedCanvas($canvas, container) {
        this.canvas = $canvas[0];
        this.width  = $canvas.width();
        this.height = $canvas.height();
        this.canvasContainer = container;
        this.canvasContext = this.canvas.getContext('2d');
    }

    EnhancedCanvas.prototype = {
        /**
         * Set the coordinate system
         * @param coordRange {x: range array, y: range array}
         */
        setViewport: function(coordRange) {
            this.coordRange = coordRange;

            var xRange = (coordRange.x[1] - coordRange.x[0]);
            var xScale = this.width / xRange;

            var yRange = (coordRange.y[0] - coordRange.y[1]); // reverse orientation for the y axis
            var yScale = this.height / yRange;

            this.canvasContext.scale(xScale, yScale); // this makes the viewport scale to the desired range
            this.canvasContext.translate(-1*coordRange.x[0], -1*coordRange.y[1]); // this map the center where it should be

        },

        drawAxis: function() {
            var ctx = this.canvasContext;

            // Draw the X axis
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.moveTo(this.coordRange.x[0], 0);
            ctx.lineTo(this.coordRange.x[1], 0);
            ctx.stroke();

            // Draw the Y axis
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.moveTo(0, this.coordRange.y[0]);
            ctx.lineTo(0, this.coordRange.y[1]);
            ctx.stroke();
        }
    };

    var defaults = {
        type:'bar', //also available: area, pie, line
        width:$(this).width(), //height of canvas - defaults to table height
        height:$(this).height(), //height of canvas - defaults to table height

        appendTitle:true, //table caption text is added to chart
        title:null, //grabs from table caption if null
        appendKey:true, //color key is added to chart

        rowFilter:' ',
        colFilter:' ',

        colors:['#be1e2d', '#666699', '#92d5ea', '#ee8310', '#8d10ee', '#5a3b16', '#26a4ed', '#f45a90', '#e9e744'],
        textColors:[], //corresponds with colors array. null/undefined items will fall back to CSS

        parseDirection:'x', //which direction to parse the table data
        lineWeight:4, //for line and area - stroke weight
        yLabelInterval:30, //distance between y labels

        pieMargin:20, //pie charts only - spacing around pie
        pieLabelsAsPercent:true,
        pieLabelPos:'inside',

        barGroupMargin:10,
        barMargin:1  //space around bars in bar chart (added to both sides of bar)
    };

    $.visualize = function (rawData, opts) {

        var options = $.extend({}, defaults, opts);
        var stats = new Stats(rawData);

        //create canvas wrapper div, set inline w&h, append
        var canvasContainer;
        if (options.container) {
            canvasContainer = $(options.container);
            if (canvasContainer.length == 0) throw "[jquery.visualize plugin error] The target container '" + options.container + "' didn't return any matching element.";

        } else {
            canvasContainer = $("<div>")
                .addClass("visualize")
                .attr("role", "img")
                .attr("aria-label", "Graph for " + stats.title)
                .height(options.height).width(options.width)
            ;
        }

        //create new canvas, set w&h attrs (not inline styles)
        var canvas = $("<canvas>")
            .height(options.height)
            .width(options.width)
            .appendTo(canvasContainer)
        ;

        //title/key container
        if (options.appendTitle || options.appendKey) {

            var infoContainer = $('<div class="visualize-info"></div>')
                .appendTo(canvasContainer);

            //append title
            if (options.appendTitle) {
                $("<div>")
                    .addClass("visualize-title")
                    .html(stats.title)
                    .appendTo(infoContainer);
            }

            //append key
            if (options.appendKey) {
                var legend = $("<ul>").addClass("visualize-key");
                $.each(stats.series.lines, function (i, line) {
                    $("<li>")
                        .append(
                        $("<span>")
                            .addClass("visualize-key-color")
                            .css({background:options.colors[i]})
                    ).append(
                        $("<span>")
                            .addClass("visualize-key-label")
                            .html(line.name)
                    ).appendTo(legend);
                });
                legend.appendTo(infoContainer);
            }
        }

        // Append new canvas to page
        if (!options.container) {
            if (stats.table) {
                canvasContainer.insertAfter(stats.table);
            } else {
                canvasContainer.appendTo("body");
            }
        }

        // Something strange (maybe a IE hack)
        // @TODO TEST OR SUPPRESS THIS
        if (typeof(G_vmlCanvasManager) != 'undefined') {
            G_vmlCanvasManager.init();
            G_vmlCanvasManager.initElement(canvas[0]);
        }

        // Create chart
        var type = options.type,
            context = {
                data:stats,
                options:options,
                target: new EnhancedCanvas(canvas, canvasContainer)
            };

        if ($.visualize.plugins[type]) {
            $.visualize.plugins[type].apply(context); // call our external plugin with the passed context

        } else {
            // try to dynamically load a new type of chart from external plugin
            console.log("Trying to load jquery.visualize." + type + ".js");

            $.getScript("./js/jquery.visualize." + type + ".js",
                function loaded() {
                    $.visualize.plugins[type].apply(context);
                }).fail(function (jqxhr, settings, exception) {
                    context.target.canvasContainer.remove();
                    throw "[jquery.visualize plugin error] Failed to load jquery.visualize plugin " + type + " : " + exception;
                });
        }

    };

    $.visualize.plugins = {}; // additional chart scripts will load inside this namespace


    /**
     * Call the visualize plugin on tables to scrap their data
     * and automatically display a resulting charts
     * @param options
     * @param container the target element where to display the chart. eq to pass it as options.container
     */
    $.fn.visualize = function (options, container) {

        if (container) {
            options.container = $(container);
        }

        return $(this).each(function (i, table) {

            if (table.tagName != "TABLE") throw "[jquery.visualize plugin error] We don't know how to scrap anything else than HTML <table>(s)";

            //configuration
            $.visualize(stats, options);

        });

    };


})(jQuery);