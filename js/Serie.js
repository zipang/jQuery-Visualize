/**
 * Serie: A serie of values
	(basically an array with extended built_in methods like max(), min()..)

	Examples :
	var s = new Serie("line");
	s.add(1, 2, 3); //  Add some numbers
	s[3] = 4; // one more

*/

// Define the Serie constructor in the given namespace.
(function define(namespace) {


	/**
	 * The Serie constructor supports multiple signatures:
			new Serie({name: "One Two Three", values: [1, 2, 3]})
			new Serie("One Two Three", [1, 2, 3])
			new Serie("One Two Three", 1, 2, 3)
   */
	function Serie(name/*, values */) {
		var serie;

		if (arguments.length == 1 && typeof arguments[0] == "object") {
			serie = arguments[0].values || [];
			serie.name = arguments[0].name;

		} else {

			var name = name || "New Serie";

			if (arguments.length == 2 && arguments[1] instanceof Array) { // We have some values to add
				serie = arguments[1];

			} else if (arguments.length > 1) { // We have some values to add
				// (turn arguments into an array and remove the first element)
				var valuesToAdd = Array.apply( null, arguments );
				valuesToAdd.shift();
				serie = valuesToAdd;

			} else {
				serie = [];
			}

			serie.name = name;

		}

		// Augment our array instance with all the Serie goodness..
		Serie.injectClassMethods( serie );

		return serie;
	}


	// ------------------------------------------------------ //
	// ------------------------------------------------------ //


	// Define the static methods.
	Serie.injectClassMethods = function( serie ){

		// Loop over all the prototype methods and add them
		// to the new serie.
		for (var method in Serie.prototype) {

			// Make sure this is a local method.
			if (Serie.prototype.hasOwnProperty( method )) {

				// Add the method to the serie.
				serie[ method ] = Serie.prototype[ method ];
			}
		}

		// Return the updated serie.
		return serie;

	};


	// ------------------------------------------------------ //
	// ------------------------------------------------------ //


	// Define usefull methods for statistical use of this serie.
	Serie.prototype = {

		/**
		 * Define the keys of the elements in the serie
		 */
		keys: function(keys) {
			this.keys = (keys instanceof Array) ? keys : Array.apply(null, arguments);
			return this;
		},

		getValue: function(i) {
			return this[i];
		},

		/**
		 * Define how to retrieve the numerical value of elements
		 * when they are not numbers
		 * This method will be used if defined by sum(), avg(), min(), max()..
		 */
		defineElementValue: function(extractValue) {
			if (extractValue instanceof Function) {
				this.getValue = function(i) {
					return (typeof this[i] == "undefined") ? undefined : extractValue.apply(this[i]);
				};
			}
			return this;
		},

		/**
		 * Iterate only on the defined elements
		 */
		forEachDefinedValue: function(doSomething) {

			if (doSomething instanceof Function) {

				for (var i = 0, len = this.length; i < len; i++) {
					var val = this.getValue(i);
					if (typeof val != "undefined") doSomething(i, val);
				}
			}

			return this;
		},

		/**
		 * Returns the greatest value of defined elements in the serie
		 * Use the provided comparator if values in the serie are not numerical
		 * A comparator function takes 2 arguments and must return a positive
		 * value if the first argument is superior to the second,
		 * 0 if they are equal and a negative value
		 */
		max: function(comparator) {
			var max;

			if (typeof comparator == "function") {
					this.forEachDefinedValue(function(i, val) {
						if (max === undefined) max = val; else if (comparator(val, max) > 0) max = val;
					});

			} else {
				// Try the most usual and quick method working only on contiguous numerical series..
				max = Math.max.apply( null, this );

				if (!max && max != 0) { // quack !!! (playing with scarce arrays or non numerical objects....)
					max = undefined;
					this.forEachDefinedValue(function(i, val) {
						if (max === undefined) max = val; else if (val > max) max = val;
					});
				}
			}
			return max;
		},

		/**
		 * Returns the smallest numerical value of defined elements in the serie
		 */
		min: function(comparator) {
			var min;

			if (typeof comparator == "function") {
					this.forEachDefinedValue(function(i, val) {
						if (min === undefined) min = val; else if (comparator(val, min) < 0) min = val;
					});

			} else {
				// Try the most usual and quick method working only on contiguous numerical series..
				min = Math.min.apply( null, this );

				if (!min && min != 0) { // quack !!! (playing with scarce arrays or non numerical objects....)
					min = undefined;
					this.forEachDefinedValue(function(i, val) {
						if (min === undefined) min = val; else if (val < min) min = val;
					});
				}
			}
			return min;
		},

		sum: function() {
			var total = 0, len = this.length, val;
			for (var i = len; i--; ) {
				val = this.getValue(i);
				if (val) total += val; // take care of not adding undefined values
			}
			return total;
		},

		avg: function() {
			return (this.length) ? this.sum() / this.length : undefined;
		},

		/**
		 * Makes expensive functions memorize their last returned value so that
		 * the next call will not compute it again
		 * Usage Note (Important) : Use that method when all data is gathered
			 so that you won't call again any method modifying the serie's content
			 Call memoize() again if you have changed the data of the serie.
			 Second usage note : Call this method without any argument to
			 memoize the default methods : max(), min(), sum(), avg()
		 */
		memoize: function( /* names */ ) {
			var names = (arguments.length) ? arguments : ["max", "min", "sum", "avg"];

			for (var i = names.length-1; i--; ) {
				var methodName = names[i];
				if (!Serie.prototype[methodName] || !Serie.prototype[methodName] instanceof Function) return;

				(function closure() {
					var computed = Serie.prototype[methodName].apply(this);
					// WARNING : Defaults min(), max().. methods only work with numeric values
					// >> Trying to store anything else will surely lead us to trouble
					// because the only way to deal with non Number object when calling max, min, etc..
					// is to specify a comparator or value getter when calling them
					if (computed instanceof Number) {
						this[methodName] = function() { // the memoized function still accepts a comparator
							return computed;
						}
					}
				}).apply(this);
			}

			// memoize the elements by their key
			if (this.keys) {
				for (var i = this.length; i--; ) {
					this[this.keys[i]] = this[i];
				}
			}

			return this;
		}

	};


	// ------------------------------------------------------ //


	// Return our Serie constructor in the given namespace.
	namespace.Serie = Serie;

})((module) ? module.exports : window);
