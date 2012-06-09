/**
 * Created by JetBrains WebStorm.
 * User: christophe
 * Date: 14/05/12
 * Time: 12:38
 */
(function ($) {


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


    $.visualize.plugins = {}; // additional chart scripts will load inside this namespace


    /**
     * Call the visualize plugin on tables to scrap their data
     * and automatically display a resulting charts
     * @param options
     * @param container the target element where to display the chart. eq to pass it as options.container
     */
    $.fn.visualize = function (options, container) {

				var $table = $(this);

				if ($table.length == 0) return;

				var options = $.extend({}, defaults, options);

        if (container) {
            options.container = $(container);
        }

				// look into our plugin store
				var type = options.type,
						plugin = $.Deferred(
							$.visualize.plugins[type],
							$.getScript("./js/plugins/jquery.visualize." + type + ".js").resolve($.visualize.plugins[type])
				);

				plugin
					.done(drawChart)
					.fail(function (jqxhr, settings, exception) {
							throw "[jquery.visualize plugin error] Failed to load jquery.visualize plugin " + type + " : " + exception;
					});

				function drawChart(plugin) {
					$table.each(function (i, table) {

						if (table.tagName != "TABLE") throw "[jquery.visualize plugin error] We don't know how to scrap anything else than HTML <table>(s)";

						//configuration
						plugin.apply({
							data: $(table),
							options: options
						});

					});

				})

				return $table;


    };


})(jQuery);