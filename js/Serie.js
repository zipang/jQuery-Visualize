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

		serie.constructor = Serie;

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
		 * Define alias for each indexed element in the serie
		 * The provided array of keys must have the same length as this serie's length
		 */
		keys: function(keys) {

			this.removeKeys(); // remove previously stored keys

			this._keys = (keys instanceof Array) ? keys : Array.apply(null, arguments);

			// Define the key's aliases as getters and setters
			for (var index = this._keys.length; index--; ) {
				(function rememberAlias(serie, i) {
					serie.__defineGetter__(serie._keys[i], function() {
						return serie[i];
					});
					serie.__defineSetter__(serie._keys[i], function(val) {
						serie[i] = val;
					});
				})(this, index);
			}

			return this;
		},

		removeKeys: function() {

			if (!this._keys) return;

			// Remove the memorized key elements
			for (var i = this._keys.length; i--; ) {
				delete this._keys[i];
			}

			delete this._keys;

			return this;
		},

		/**
		 * Iterate only on the defined elements
		 */
		forEachDefinedItem: function(doSomething) {

			if (doSomething instanceof Function) {

				for (var i = 0, len = this.length; i < len; i++) {
					var val = this[i];
					if (typeof val != "undefined") doSomething(i, val);
				}
			}

			return this;
		},

		/**
		 * Returns the greatest value of defined elements in the serie
		 * Use the provided value extractor if values in the serie are not numerical
		 * A extractor function takes 2 arguments and must return a positive
		 * value if the first argument is superior to the second,
		 * 0 if they are equal and a negative value in the last eventuality
		 */
		max: function(extractor) {
			var max, maxValue;

			if (typeof extractor == "function") {
					this.forEachDefinedItem(function(i, item) {
						var val = extractor.apply(item);
						if (max === undefined || val > maxValue) {
							max = item;
							maxValue = val;
						}
					});

			} else { // we expect only numerical values
				// Try the most usual and quick method working only on contiguous numerical series..
				max = Math.max.apply( null, this );

				if (!max && max !== 0) { // quack !!! (playing with scarce arrays....)
					max = undefined;
					this.forEachDefinedItem(function(i, val) {
						if (max === undefined) max = val; else if (val > max) max = val;
					});
				}
			}
			return max;
		},

		maxValue: function(extractor) {
			return extractor.apply(this.max(extractor));
		},

		/**
		 * Returns the smallest numerical value of defined elements in the serie
		 */
		min: function(extractor) {
			var min, minValue;

			if (typeof extractor == "function") {
					this.forEachDefinedItem(function(i, item) {
						var val = extractor.apply(item);
						if (min === undefined || val < minValue) {
							min = item; minValue = val;
						}
					});

			} else {  // we expect only numerical values
				// Try the most usual and quick method working only on contiguous numerical series..
				min = Math.min.apply( null, this );

				if (!min && min !== 0) { // quack !!! (playing with scarce arrays....)
					min = undefined;
					this.forEachDefinedItem(function(i, val) {
						if (min === undefined) min = val; else if (val < min) min = val;
					});
				}
			}
			return min;
		},

		minValue: function(extractor) {
			return extractor.apply(this.min(extractor));
		},

		sum: function(extractor) {
			var val, total = 0, i = this.length;
			while (i--) {
				val = (extractor ? extractor.apply(this[i]) : this[i]);
				if (val) total += val; // take care of not adding undefined values
			}
			return total;
		},

		avg: function(extractor) {
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

			for (var i = names.length; i--; ) {
				var methodName = names[i];

				if (Serie.prototype[methodName] && Serie.prototype[methodName] instanceof Function) {

					var computed = Serie.prototype[methodName].apply(this);

					// WARNING : Defaults min(), max(), sum(), avg().. methods only work with numeric values
					// >> Trying to store anything else surely indicates tha we have messes somewhere
					// The only way to deal with non Number object when calling max, min, etc..
					// is to specify a extractor or value getter when calling them
					if (computed.constructor == Number) {
						(function remember(methodName, computed) {
							this[methodName] = function() {
								return computed;
							};
						}).call(this, methodName, computed);
					}
				}
			}

			return this;
		}

	};


	// ------------------------------------------------------ //


	// Return our Serie constructor in the given namespace.
	namespace.Serie = Serie;

})((module) ? module.exports : window);
