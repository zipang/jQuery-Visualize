/**
 * Google Charts plugin for the jquery Visualize plugin 2.0
 * @author zipang - http://
 *
 * Scrap data from a table and put it into a google.visualization.DataTable
 * Render it with one of the Google Charts
 * See https://google-developers.appspot.com/chart/interactive/docs/reference
 *
 */
(function define() {

	$.visualize.plugins.googleCharts = function () {

		var data = (this.options.parseDirection == 'x') ? scrapLines(this.dataSrc) : scrapColumns(this.dataSrc);

		var translatedOptions = translateOptionsFor(this.options, this.options.type);
		var chart = loadGoogleChart(this.options.type);

		new chart(data).draw(translatedOptions);

	};

	/**
     * These are the default parsers provided by the data types
	 * supported by the Google Charts structures DataTable and DataView
     */
	var defaultParsers = {
		'string':    function(str) {return String(str);},
		'number':    function(str) {return Number(str);},
		'boolean':   function(str) {return Boolean(str);},
		'date':      function(str) {return Date(str);},
		'datetime':  function(str) {return Date(str);},
		'timeofday': function(str) {return Date(str);}
	};
	var parsers = defaultParsers; // can be overriden with additional parsers in the options

	/**
	 * The supported list of Google Charts
	 */
	function loadGoogleChart(name) {

		return $.getScript();
	}

	/**
	 * Parse the content of an HTML cell according to its declared type
	 * Try to find the content in its data attribute
	 */
	function parseValue(cell, dataType) {
		var strToParse = cell.data("value") || cell.text();
		return parsers[dataType](cell);
	}

	/**
	 * Scrap an HTML table line by line
	 */
	function scrapLines(table) {

			var $table = $(table),
					tableData = new google.visualization.DataTable();

			tableData.addColumn("string", "caption");

			$("tr", $table).each(function (i, line) {

					$("th", $(line)).each(function (j, cell) {
							var $cell = $(cell);

							if (i == 0) { // this is the first line that defines the columns headers
									tableData.addColumn($cell.data("type") || "number", $cell.text());

							} else { // line headers are series caption that must be placed in 1st position in Google Charts
									// other lines are rows containing data
									tableData.addRow();
									tableData.setCell(i - 1, 0, $cell.text());
							}
					});

					$("tr", $(line)).each(function (j, cell) {
							var $cell = $(cell);
							var cellValue = parseValue($cell, tableData.getColumnType(j));
							tableData.setCell(i - 1, j + 1, cellValue, $cell.html());
					});

			})

			tableData.setTableProperty("caption", $table.find("caption").text());
			return tableData;

	}

	/**
	 * Scrap an HTML table vertically
	 */
	function scrapColumns(table) {
		var $table = $(table),
				tableData = new google.visualization.DataTable();

		return tableData;

	}


})();


