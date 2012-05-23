/*
 * --------------------------------------------------------------------
 * jQuery Visualize plugin
 * Author: Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * --------------------------------------------------------------------
 */
(function ($) {
    $.visualize = {
        plugins:{} // additional chart scripts will load inside this namespace
    };
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

    function createChart(charts, type, context) {

        if (charts[type]) {
            console.log("Executing existing chart " + type);
            charts[type]();

        } else if ($.visualize.plugins[type]) {
            $.visualize.plugins[type].apply(context); // call our external plugin with the passed context

        } else {
            // try to dynamically load a new type of chart from external plugin
            console.log("Trying to load jquery.vizualize." + type + ".js");
            $.getScript("./js/jquery.visualize." + type.split(/[-_]/)[0] + ".js",
                function loaded() {
                    $.visualize.plugins[type].apply(context);
                }).fail(function (jqxhr, settings, exception) {
                    context.target.canvasContainer.remove();
                    if (console.log) console.log( "Failed to load jquery.vizualize plugin " + type
                        + " in following location : ./js/jquery.visualize." + type.split(/[-_]/)[0] + ".js\n"
                        + exception );
                });
        }
    }

    // Table data scrapper object
    function TableData(table, options) {
        this.table = $(table);
        this.options = options;
    }

    TableData.prototype = {
        dataGroups:function () {
            if (this._dataGroups) return this._dataGroups; // stored result

            var dataGroups = [];
            var colors = this.options.colors,
                textColors = this.options.textColors,
                rowFilter = this.options.rowFilter,
                colFilter = this.options.colFilter;

            if (this.options.parseDirection == 'x') {
                this.table.find('tr:gt(0)').filter(rowFilter).each(function (i, tr) {
                    dataGroups[i] = {};
                    dataGroups[i].points = [];
                    dataGroups[i].points_weight = [];
                    dataGroups[i].color = colors[i];
                    if (textColors[i]) {
                        dataGroups[i].textColor = textColors[i];
                    }
                    $(tr).find('td').filter(colFilter).each(function () {
                        var values = $(this).text().split(";");
                        dataGroups[i].points.push(values.length > 0 ? parseFloat(values[0]) : 0);
                        dataGroups[i].points_weight.push(values.length > 1 ? parseFloat(values[1]) : 1);
                    });
                });

            } else {
                var cols = this.table.find('tr:eq(1) td').filter(colFilter).size();
                for (var i = 0; i < cols; i++) {
                    dataGroups[i] = {};
                    dataGroups[i].points = [];
                    dataGroups[i].points_weight = [];
                    dataGroups[i].color = colors[i];
                    if (textColors[i]) {
                        dataGroups[i].textColor = textColors[i];
                    }
                    this.table.find('tr:gt(0)').filter(rowFilter).each(function () {
                        var values = $(this).find('td').filter(colFilter).eq(i).text().split(";");
                        dataGroups[i].points.push(values.length > 0 ? parseFloat(values[0]) : 0);
                        dataGroups[i].points_weight.push(values.length > 1 ? parseFloat(values[1]) : 1);
                    });
                }
                ;
            }
            return (this._dataGroups = dataGroups);
        },

        allData:function () {
            if (this._allData) return this._allData;
            var allData = [];
            $(this.dataGroups()).each(function () {
                allData.push.apply(allData, this.points);
            });
            return (this._allData = allData);
        },

        dataSum:function () {
            if (this._dataSum) return this._dataSum;
            return (this._dataSum = Array.sum(this.allData()));
        },

        topValue:function () {
            if (this._topValue) return this._topValue;
            return (this._topValue = Array.max(this.allData()));
        },

        bottomValue:function () {
            if (this._bottomValue) return this._bottomValue;
            return (this._bottomValue = Array.min(this.allData()));
        },

        memberTotals:function () {
            if (this._memberTotals) return this._memberTotals;
            var memberTotals = [];
            var dataGroups = this.dataGroups();
            $.each(dataGroups, function (i, group) {
                memberTotals.push(Array.sum(group.points));
            });
            return (this._memberTotals = memberTotals);
        },

        groupSums:function () {
            if (this._groupSums) return this._groupSums;
            var groupSums = [];
            var dataGroups = this.dataGroups();
            for (var h = 0; h < dataGroups.length; h++) {
                var points = dataGroups[h].points;
                for (var i = 0; i < points.length; i++) {
                    if (typeof(groupSums[i]) == 'undefined') groupSums[i] = 0;
                    groupSums[i] += parseFloat(points[i]);
                }
            }
            return (this._groupSums = groupSums);
        },

        totalYRange:function () {
            return this.topValue() - this.bottomValue();
        },

        xLabels:function () {
            if (this._xLabels) return this._xLabels;
            var xLabels = [];
            if (this.options.parseDirection == 'x') { // parse the column headers
                this.table.find('tr:eq(0) th').filter(this.options.colFilter).each(function (i, th) {
                    xLabels.push($(th).html());
                });
            }
            else {
                this.table.find('tr:gt(0) th').filter(this.options.rowFilter).each(function (i, th) {
                    xLabels.push($(th).html());
                });
            }
            return (this._xLabels = xLabels);
        },

        yLabels:function (start, end) {
            var totalYRange = end - start,
                labels = [];
            labels.push(start);
            var numLabels = Math.round(this.options.height / this.options.yLabelInterval);
            var incr = Math.ceil(totalYRange / numLabels) || 1;
            while (labels[labels.length - 1] < end - incr) {
                labels.push(labels[labels.length - 1] + incr);
            }
            labels.push(end);
            return labels;
        },

        yLabels100:function () {
            if (this._yLabels100) return this._yLabels100;
            var labels = [0];
            var numLabels = Math.round(this.options.height / this.options.yLabelInterval);
            var incr = Math.ceil(100 / numLabels) || 1;
            while (labels[labels.length - 1] < 100 - incr) {
                labels.push(labels[labels.length - 1] + incr);
            }
            labels.push(100);
            return (this._yLabels100 = labels);
        }
    }; // TableData prototype

    $.fn.visualize = function (options, container) {

        return $(this).each(function () {

            var $table = $(this);
            //configuration
            var o = $.extend({
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

                pieMargin:20, //pie charts only - spacing around pie
                pieLabelsAsPercent:true,
                pieLabelPos:'inside',

                lineWeight:4, //for line and area - stroke weight
                barGroupMargin:10,
                barMargin:1, //space around bars in bar chart (added to both sides of bar)
                yLabelInterval:30 //distance between y labels
            }, options);

            //reset width, height to numbers
            o.width = parseFloat(o.width);
            o.height = parseFloat(o.height);

            // Chart functions
            var charts = {
                pie:function () {
                    canvasContain.addClass('visualize-pie');
                    if (o.pieLabelPos == 'outside') {
                        canvasContain.addClass('visualize-pie-outside');
                    }
                    var centerx = Math.round(canvas.width() / 2);
                    var centery = Math.round(canvas.height() / 2);
                    var radius = centery - o.pieMargin;
                    var counter = 0.0;
                    var labels = $('<ul class="visualize-labels"></ul>')
                        .insertAfter(canvas);


                    $.each(memberTotals, function (i, total) {
                        // Draw the pie pieces
                        var fraction = (total <= 0 || isNaN(total)) ? 0 : total / dataSum;
                        ctx.beginPath();
                        ctx.moveTo(centerx, centery);
                        ctx.arc(centerx, centery, radius,
                            counter * Math.PI * 2 - Math.PI * 0.5,
                            (counter + fraction) * Math.PI * 2 - Math.PI * 0.5,
                            false);
                        ctx.lineTo(centerx, centery);
                        ctx.closePath();
                        ctx.fillStyle = dataGroups[i].color;
                        ctx.fill();

                        // Draw labels
                        var sliceMiddle = (counter + fraction / 2);
                        var distance = o.pieLabelPos == 'inside' ? radius / 1.5 : radius + radius / 5;
                        var labelx = Math.round(centerx + Math.sin(sliceMiddle * Math.PI * 2) * (distance));
                        var labely = Math.round(centery - Math.cos(sliceMiddle * Math.PI * 2) * (distance));
                        var leftRight = (labelx > centerx) ? 'right' : 'left';
                        var topBottom = (labely > centery) ? 'bottom' : 'top';
                        var percentage = parseFloat((fraction * 100).toFixed(2));

                        if (percentage) {
                            var labelval = (o.pieLabelsAsPercent) ? percentage + '%' : total;
                            var labeltext = $('<span class="visualize-label">' + labelval + '</span>')
                                .css(leftRight, 0)
                                .css(topBottom, 0);
                            var label = $('<li class="visualize-label-pos"></li>')
                                .appendTo(labels)
                                .css({left:labelx, top:labely})
                                .append(labeltext);
                            labeltext
                                .css('font-size', radius / 8)
                                .css('margin-' + leftRight, -labeltext.width() / 2)
                                .css('margin-' + topBottom, -labeltext.outerHeight() / 2);
                            if (dataGroups[i].textColor) {
                                labeltext.css('color', dataGroups[i].textColor);
                            }
                        }
                        counter += fraction;
                    });
                },

                line:function (area) {
                    if (area) {
                        canvasContain.addClass('visualize-area');
                    }
                    else {
                        canvasContain.addClass('visualize-line');
                    }
                    //write X labels
                    var xInterval = canvas.width() / (xLabels.length - 1);
                    var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
                        .width(canvas.width())
                        .height(canvas.height())
                        .insertBefore(canvas);
                    $.each(xLabels, function (i) {
                        var thisLi = $('<li><span>' + this + '</span></li>')
                            .prepend('<span class="line" />')
                            .css('left', xInterval * i)
                            .appendTo(xlabelsUL);
                        var label = thisLi.find('span:not(.line)');
                        var leftOffset = label.width() / -2;
                        if (i == 0) {
                            leftOffset = 0;
                        }
                        else if (i == xLabels.length - 1) {
                            leftOffset = -label.width();
                        }
                        label
                            .css('margin-left', leftOffset)
                            .addClass('label');
                    });
                    //write Y labels
                    var yScale = canvas.height() / totalYRange;
                    var liBottom = canvas.height() / (yLabels.length - 1);
                    var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
                        .width(canvas.width())
                        .height(canvas.height())
                        .insertBefore(canvas);
                    $.each(yLabels, function (i) {
                        var thisLi = $('<li><span>' + this + '</span></li>')
                            .prepend('<span class="line" />')
                            .css('bottom', liBottom * i)
                            .prependTo(ylabelsUL);
                        var label = thisLi.find('span:not(.line)');
                        var topOffset = label.height() / -2;
                        if (i == 0) {
                            topOffset = -label.height();
                        }
                        else if (i == yLabels.length - 1) {
                            topOffset = 0;
                        }
                        label
                            .css('margin-top', topOffset)
                            .addClass('label');
                    });
                    //start from the bottom left
                    ctx.translate(0, zeroLoc);
                    //iterate and draw
                    $.each(dataGroups, function (h) {
                        ctx.beginPath();
                        ctx.lineWidth = o.lineWeight;
                        ctx.lineJoin = 'round';
                        var points = this.points;
                        var integer = 0;
                        ctx.moveTo(0, -(points[0] * yScale));
                        $.each(points, function () {
                            ctx.lineTo(integer, -(this * yScale));
                            integer += xInterval;
                        });
                        ctx.strokeStyle = this.color;
                        ctx.stroke();
                        if (area) {
                            ctx.lineTo(integer, 0);
                            ctx.lineTo(0, 0);
                            ctx.closePath();
                            ctx.fillStyle = this.color;
                            ctx.globalAlpha = .3;
                            ctx.fill();
                            ctx.globalAlpha = 1.0;
                        }
                        else {
                            ctx.closePath();
                        }
                    });
                },

                area:function () {
                    this.line(true);
                },

                bar:function () {
                    canvasContain.addClass('visualize-bar');

                    //write X labels
                    var xInterval = canvas.width() / (xLabels.length);
                    var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
                        .width(canvas.width())
                        .height(canvas.height())
                        .insertBefore(canvas);

                    $.each(xLabels, function (i) {
                        var thisLi = $('<li><span class="label">' + this + '</span></li>')
                            .prepend('<span class="line" />')
                            .css('left', xInterval * i)
                            .width(xInterval)
                            .appendTo(xlabelsUL);
                    });

                    //write Y labels
                    var yScale = canvas.height() / totalYRange;
                    var liBottom = canvas.height() / (yLabels.length - 1);
                    var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
                        .width(canvas.width())
                        .height(canvas.height())
                        .insertBefore(canvas);

                    $.each(yLabels, function (i) {
                        var thisLi = $('<li><span>' + this + '</span></li>')
                            .prepend('<span class="line" />')
                            .css('bottom', liBottom * i)
                            .prependTo(ylabelsUL);
                        var label = thisLi.find('span:not(.line)');
                        var topOffset = label.height() / -2;
                        if (i == 0) {
                            topOffset = -label.height();
                        } else if (i == yLabels.length - 1) {
                            topOffset = 0;
                        }
                        label
                            .css('margin-top', topOffset)
                            .addClass('label');
                    });
                    //start from the bottom left
                    ctx.translate(0, zeroLoc);
                    //iterate and draw
                    for (var h = 0; h < dataGroups.length; h++) {
                        ctx.beginPath();
                        var linewidth = (xInterval - o.barGroupMargin * 2) / dataGroups.length; //removed +1
                        var strokeWidth = linewidth - (o.barMargin * 2);
                        ctx.lineWidth = strokeWidth;
                        var points = dataGroups[h].points;
                        var integer = 0;
                        for (var i = 0; i < points.length; i++) {
                            var xVal = (integer - o.barGroupMargin) + (h * linewidth) + linewidth / 2;
                            xVal += o.barGroupMargin * 2;
                            ctx.moveTo(xVal, 0);
                            ctx.lineTo(xVal, Math.round(-points[i] * yScale));
                            integer += xInterval;
                        }
                        ctx.strokeStyle = dataGroups[h].color;
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            };

            //create new canvas, set w&h attrs (not inline styles)
            var canvasNode = document.createElement("canvas");
            canvasNode.setAttribute('height', o.height);
            canvasNode.setAttribute('width', o.width);
            var canvas = $(canvasNode);
            //get title for chart
            var title = o.title || $table.find('caption').text();

            //create canvas wrapper div, set inline w&h, append
            var canvasContain = (container || $('<div class="visualize" role="img" aria-label="Chart representing data from the table: ' + title + '" />'))
                .height(o.height)
                .width(o.width)
                .append(canvas);

            //scrape table (this should be cleaned up into an obj)
            var tableData = new TableData($table, o);
            var dataGroups = tableData.dataGroups();
            var allData = tableData.allData();
            var dataSum = tableData.dataSum();
            var topValue = tableData.topValue();
            var bottomValue = tableData.bottomValue();
            var memberTotals = tableData.memberTotals();
            var totalYRange = tableData.totalYRange();
            var zeroLoc = o.height * (topValue / totalYRange);
            var xLabels = tableData.xLabels();
            var yLabels = tableData.yLabels(bottomValue, topValue);

            //title/key container
            if (o.appendTitle || o.appendKey) {
                var infoContain = $('<div class="visualize-info"></div>')
                    .appendTo(canvasContain);
            }

            //append title
            if (o.appendTitle) {
                $('<div class="visualize-title">' + title + '</div>').appendTo(infoContain);
            }

            //append key
            if (o.appendKey) {
                var newKey = $('<ul class="visualize-key"></ul>');
                var selector;
                if (o.parseDirection == 'x') {
                    selector = $table.find('tr:gt(0) th').filter(o.rowFilter);
                } else {
                    selector = $table.find('tr:eq(0) th').filter(o.colFilter);
                }
                selector.each(function (i) {
                    $('<li><span class="visualize-key-color" style="background: ' + dataGroups[i].color + '"></span><span class="visualize-key-label">' + $(this).text() + '</span></li>')
                        .appendTo(newKey);
                });
                newKey.appendTo(infoContain);
            }

            //append new canvas to page
            if (!container) {
                canvasContain.insertAfter($table);
            }
            if (typeof(G_vmlCanvasManager) != 'undefined') {
                G_vmlCanvasManager.init();
                G_vmlCanvasManager.initElement(canvas[0]);
            }

            //set up the drawing board
            var ctx = canvas[0].getContext('2d');

            //create chart
            createChart(charts, o.type, {
                target:{
                    canvasContainer:canvasContain,
                    canvasContext:ctx,
                    canvas:canvas
                },
                data:tableData,
                options:o
            });

            //clean up some doubled lines that sit on top of canvas borders (done via JS due to IE)
            $('.visualize-line li:first-child span.line, .visualize-line li:last-child span.line, .visualize-area li:first-child span.line, .visualize-area li:last-child span.line, .visualize-bar li:first-child span.line,.visualize-bar .visualize-labels-y li:last-child span.line').css('border', 'none');

            if (!container) {
                //add event for updating
                canvasContain.bind('visualizeRefresh', function () {
                    $table.visualize(o, $(this).empty());
                });
            }
        }).next(); //returns canvas(es)
    };
})(jQuery);
/**
 * Radar charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a star shaped form whose branches
 * are equal to the total value of each serie
 * Doesn't work very well if there is less than 3 members in the serie.
 */
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

    // Draw the branches of our star shape
    $.each(memberTotals, function (i, total) {

        var ratio = total / topValue;
        var distance = radius * ratio / 2;

        ctx.beginPath();
        ctx.lineWidth = o.lineWeight;
        ctx.lineJoin = 'round';
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(i * area_span) * distance,
            centerY + Math.sin(i * area_span) * distance
        );
        ctx.strokeStyle = dataGroups[i].color;
        ctx.stroke();
        ctx.closePath();
    });

    // Draw the surrounding form
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = o.colors[memberCount];

    ctx.moveTo(
        centerX + radius * memberTotals[0] / topValue / 2,
        centerY
    );

    $.each(memberTotals, function (i, total) {

        var ratio = total / topValue;
        var distance = radius * ratio / 2;

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
            .css('margin-' + topBottom, -labeltext.outerHeight() / 2);

    });

    ctx.closePath();
    ctx.stroke();
};
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

    $.visualize.plugins.pilebar_100 = function () {

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

        // Display X labels
        var xInterval = canvas.width() / (xLabels.length);
        var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
            .width(canvas.width())
            .height(canvas.height())
            .insertBefore(canvas);

        $.each(xLabels, function(i, label) {
            var $label = $("<span class='label'></span>").html(label);
            $("<li>")
                .css("left", xInterval * i)
                .width(xInterval)
                .prepend("<span class='line' />")
                .append($label)
                .appendTo(xlabelsUL);
        });

        // Display Y labels
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
            var topOffset = $label.height() / -2;
            if (i == 0) {
                topOffset = -$label.height();
            } else if (i == yLabels.length-1) {
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
