/**
 * Created by JetBrains WebStorm.
 * User: christophe
 * Date: 14/05/12
 * Time: 12:38
 * To change this template use File | Settings | File Templates.
 */
(function($) {


// UTILITIES
Array.max = function(arr) {
    return Math.max.apply(Array, arr);
};
Array.min = function(arr) {
    return Math.min.apply(Array, arr);
};
Array.sum = function(arr) {
    var len = (arr && arr.length ? arr.length : 0), sum = 0, val;
    for (var i = 0; i < len; i++) {
        val = parseFloat(arr[i]);
        sum += ((!arr[i] || isNaN(arr[i])) ? 0 : val);
    }
    return sum;
};
Array.avg = function(arr) {
    var len = (arr && arr.length ? arr.length : 0);
    return (len ? Array.sum(arr)/len : 0);
};


/**
 * Multi dimensional structure to store series of data
 * and easily retrieve them
 * @param stats
 */
function Stats(stats) {

    var defaultSelf = {
        title: "Empty",
        description: "not provided",
        series: {
            lines: [],
            columns: []
        }
    }

    if (typeof stats == "string") {
        this.table = $(stats);
        $.extend(this, scrapeTable(this.table));
    } else {
        $.extend(this, stats);
    }
}

Stats.prototype = {
    max: function() {
        var dataSet, len = arguments.length;
        if (len == 1) {
            return Array.max(this.series[arguments[0]]);
        }
    }
};


/**
 * Call the visualize plugin on tables to scrap their data
 * and automatically display a resulting charts
 * @param options
 * @param container
 */
$.fn.visualize = function(opts, container) {

    var defaults = {
        type: 'bar', //also available: area, pie, line
        width: $(this).width(), //height of canvas - defaults to table height
        height: $(this).height(), //height of canvas - defaults to table height

        appendTitle: true, //table caption text is added to chart
        title: null, //grabs from table caption if null
        appendKey: true, //color key is added to chart

        rowFilter: ' ',
        colFilter: ' ',

        colors: ['#be1e2d','#666699','#92d5ea','#ee8310','#8d10ee','#5a3b16','#26a4ed','#f45a90','#e9e744'],
        textColors: [], //corresponds with colors array. null/undefined items will fall back to CSS

        parseDirection: 'x', //which direction to parse the table data
        lineWeight: 4, //for line and area - stroke weight
        yLabelInterval: 30, //distance between y labels

        pieMargin: 20, //pie charts only - spacing around pie
        pieLabelsAsPercent: true,
        pieLabelPos: 'inside',

        barGroupMargin: 10,
        barMargin: 1  //space around bars in bar chart (added to both sides of bar)
    };

    return $(this).each(function() {

        //configuration
        var options = $.extend(defaults, opts);


        var self = $(this);

    });

}


$.visualize = {
    plugins: {} // additional chart scripts will load inside this namespace
};

})(jQuery);