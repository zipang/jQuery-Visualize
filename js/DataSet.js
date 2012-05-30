/**
 * DataSet: Gather serie of values into coherent views (or axis of analysis)
	 Multiple series are grouped into categories that usually data views
	 along an axis.

	Example :

	var sales = new DataSet("Representants sales per business categories");

	var johnSales = new Serie("John", 1000, 500, 890).keys("Food", "Electronics", "Cars");
	var bettiesSales = new Serie("Bettie", 635, 890, 2130).keys("Food", "Electronics", "Cars");
	var terekSales = new Serie("Terek", 890, 1210, 1754).keys("Food", "Electronics", "Cars");

	sales.add("lines", [johnSales, bettiesSales, terekSales]);

	// Add the same data considered along another axis
	var foodSales = new Serie("Food", 1000, 635, 890).keys("John", "Bettie", "Terek");
	var electronicSales = new Serie("Electronic", 500, 890, 1210).keys("John", "Bettie", "Terek");
	var carSales = new Serie("Cars", 890, 2130, 1754).keys("John", "Bettie", "Terek");

	sales.add("columns", [foodSales, electronicSales, carSales]);

	// We can now access these data in multiple ways :

	sales.columns.Cars.John >> 890
	sales.lines.John.Cars >> 890

	sales.columns.Cars.max() >> 2130
	sales.lines.John.max() >> 1000

	sales.lines.maxValue(function extractLineMax() {
		return this.max();
	}) >> 2130

*/

// import dependancies in
var Serie = this.Serie ? this.Serie : require("./Serie").Serie;

// Define the DataSet constructor in the given namespace.
(function define(namespace) {

	/**
	* Multi	dimensional structure to store series of data
	* and easily retrieve them
	* @param stats
	*/
	function DataSet(stats) {

		var defaultSelf	= {
			title:"Empty",
			description:"not provided",
			series:{}
		};

		if (arguments.length == 0 || !stats) {
			return defaultSelf;

		} else if (arguments.length == 1 && stats.constructor == Object) { // Object literal
			this.title = stats.title || defaultSelf.title;
			this.description = stats.description || defaultSelf.description;

			this.series = {};

			for (var catgName in stats.series) {
				var catg = this.series[catgName] = new Serie(catgName); // 'lines' or 'colums' for example
				var data = stats.series[catgName];

				var serieKeys = data.keys, catgKeys = [];
				delete data.keys;

				for (var name in data) {
					var s = new Serie(name, data[name]).aliases(serieKeys);
					catg.push(s);
					catgKeys.push(name);
				}
				catg.aliases(catgKeys);

			}

		} else if (typeof stats == "string") {
			this.title = stats;
			this.series = {};

		}

	} // DataSet constructor

	DataSet.prototype = {

		/**
		 * Add a new serie of values inside a categorie
		 */
		addSerie: function(catgName, serie) {
			if (arguments.length != 2) {
				throw "Bad arguments : expected a categorie name and a serie"
			}
			var catg = this.series[catgName];
			if (!catg) catg = this.series[catgName] = new Serie(catgName);
			catg.push(serie);
			if (serie.name) { // alias it
				catg.__defineGetter__(name, function() {
					return serie;
				});
			}
		}
	}; // DataSet prototype

	// ------------------------------------------------------ //


	// Return our Serie constructor in the given namespace.
	namespace.DataSet = DataSet;

})((module) ? module.exports : window);
