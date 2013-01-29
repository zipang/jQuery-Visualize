/**
 * Table Data Parser
 * (This is the internal representation of tabular data used by jquery-visualize)
 */
(function(context, $) {

	var defaults = {
		rowFilter: "*",
		colFilter: "*",
		parser: function(x) {
			var sData = $.trim(x),
				nData = parseFloat(sData);
			return isNaN(nData) ? sData : nData;
		}
	};

	// UTILITIES

	Array.max = function (arr) {
		if (!arr || arr.length == 0) return undefined;
		return Math.max.apply(Array, arr);
	};
	Array.min = function (arr) {
		if (!arr || arr.length == 0) return undefined;
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
	Array.map = Array.prototype.map ? 
		function (arr, fn) {
			return arr.map(fn);
		} :
		function (arr, fn) {
			var len = arr.length, ret = new Array(len);
			for (var i = 0; i < len; i++) ret[i] = fn(arr[i]);
			return ret;
		};


	$.debounce = function(fn, delay) {
		var delay = delay || 250;
		return function() {
			var ctx = this, args = arguments;
			clearTimeout(fn.hnd);
			fn.hnd = setTimeout(function() {
				fn.apply(ctx, args);
			}, delay);
		};
	};

	/**-------------------------------------------------------------------- *
	 * TableData constructor
	 * Example : new TableData(t)
	 * -------------------------------------------------------------------- */
	function TableData(table, options) {
		this.$table = $(table);
		this.options = $.extend({}, defaults, options);
		// look for a dataTable extension on this table
		if ($.fn.DataTable && $.fn.DataTable.fnIsDataTable(this.$table.get(0))) {
			this.dataTable = this.$table.dataTable();
		}
		this.parse();
		this.$table.data("visualize-data", this);
	}

	TableData.prototype = {

		parse: function() {
			var options = this.options,
				rowFilter = options.rowFilter,
			    colFilter = options.colFilter,
			    lines = [], lineHeaders = [], columnHeaders = [],
				cellParser = options.parser,
				header = $("thead tr", this.$table).get(0),
				rows   = this.dataTable ? this.dataTable.$("tr", {"filter":"applied"}) : $("tbody tr", this.$table);

			$("td, th", header).each(function(i, td) {
				columnHeaders.push($(td).text());
			});

			rows.filter(rowFilter).each(function (i, tr) {
				var cells = [];

				$("th, td", tr).filter(colFilter).each(function (j, cell) {
					
					if (j == 0 && cell.tagName == "TH") {
						lineHeaders.push($(cell).text());
					} else {
						cells.push(cellParser($(cell).text()));	
					}
				});
				
				lines.push(cells);

				if (lineHeaders.length > 0) { // check that the column headers have the same length as the lines data
					var firstDataLine = lines[0];
					if (columnHeaders.length > firstDataLine.length) columnHeaders.shift();
				}
			});

			var lcount = lines.length,
			    ccount = lines[0].length,
			    columns = [];

			for (var j = 0; j < ccount; j++) {
				var columnValues = [];
				for (var i = 0; i < lcount; i++) {
					columnValues.push(lines[i][j]);
				}
				columns.push(columnValues);
			}

			this.lineHeaders = lineHeaders;
			this.columnHeaders = columnHeaders;
			this.lines = lines;
			this.columns = columns;
		},

		/**
		 * Retrieve a line or column from its name
		 * @param collection : [columns|lines]
		 * @param name : name of column or line to retrieve
		 */
		get: function(collection, name) {
			var i = 0, lname = name.toLowerCase(), headers = this[(collection.toLowerCase() == "columns") ? "columnHeaders" : "lineHeaders"];
			while (headers[i] !== undefined && headers[i].toLowerCase() != lname) i++;
			return (i < headers.length) ? this[collection][i] : [];
		}
	}; // TableData prototype

	context.TableData = TableData;
	
})(window, jQuery);

