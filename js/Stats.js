/**
 * Stats: Gather serie of values into coherent views (or axis of analysis)
	 Multiple series are grouped into categories that usually data views
	 along an axis.

	Example :

	var sales = new Stats("Representants sales per business categories");

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

*/

// Define the Serie constructor in the given namespace.
(function define(namespace) {


	/**
	* Multi	dimensional structure to store series of data
	* and easily retrieve them
	* @param stats
	*/
	function Stats(stats) {

		var defaultSelf	= {
			title:"Empty",
			description:"not provided",
			series:{
				lines:[],
				columns:[]
			}
		};

		if (arguments.length == 1 && typeof stats == "object") {

		} else if (typeof stats == "string") {
			this.title = stats;

		} else {
		}

	}

	Stats.prototype = {
	};

	// ------------------------------------------------------ //


	// Return our Serie constructor in the given namespace.
	namespace.Stats = Stats;

})((module) ? module.exports : window);
