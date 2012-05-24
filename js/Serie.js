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


	// I am the constructor function.
	function Serie(name/*, values */) {

		var name = name || "New Serie",
				serie;

		if (arguments.length > 1) { // We have some values to add
			console.log("Adding some values to " + name);
			// (turn arguments into an array and remove the first element)
			var valuesToAdd = Array.apply( null, arguments );
			valuesToAdd.shift();
			serie = valuesToAdd;
		} else {
			serie = [];
		}

		serie.name = name;

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
		return( serie );

	};


	// I create a new serie from the given array.
	Serie.fromArray = function( array ){

		// Create a new serie.
		var serie = Serie.apply( null, array );

		// Return the new serie.
		return( serie );

	};


	// I determine if the given object is an array.
	Serie.isArray = function( value ) {

		// Get it's stringified version.
		var stringValue = Object.prototype.toString.call( value );

		// Check to see if the string represtnation denotes array.
		return( stringValue.toLowerCase() === "[object array]" );

	};


	// ------------------------------------------------------ //
	// ------------------------------------------------------ //


	// Define the class methods.
	Serie.prototype = {

		// I add the given item to the serie. If the given item
		// is an array, then each item within the array is added
		// individually.
		add: function( value ) {

			// Check to see if the item is an array.
			if ( value && value.length ) {

				// Add each item in the array.
				for (var i = 0 ; i < value.length ; i++){
					// Add the sub-item using default push() method.
					Array.prototype.push.call( this, value[ i ] );
				}

			} else {
				// Use the default push() method.
				Array.prototype.push.call( this, value );

			}

			// Return this object reference for method chaining.
			return this;
		},


		// I add all the given items to the serie.
		addAll: function() {

			// Loop over all the arguments to add them to the
			// serie individually.
			for (var i = 0 ; i < arguments.length ; i++){

				// Add the given value.
				this.add( arguments[ i ] );

			}

			// Return this object reference for method chaining.
			return this;
		},

		forEachDefinedValue: function(doSomething) {
			if (doSomething instanceof Function) {
				for (var i = 0, len = this.length; i < len; i++) {
					var val = this[i];
					if (typeof val != "undefined") doSomething(i, val);
				}
			}
		},

		max: function() {
			var max = Math.max.apply( null, this );
			if (isNaN(max)) { // scarce !!! (Math.max doesn't play well with scarce arrays..)
				max = undefined;
				this.forEachDefinedValue(function(i, val) {
					if (max === undefined) max = val; else if (val > max) max = val;
				});
			}
			return max;
		},

		min: function() {
			var min = Math.min.apply( null, this );
			if (isNaN(min)) { // scarce !!! (Math.max doesn't play well with scarce arrays..)
				min = undefined;
				this.forEachDefinedValue(function(i, val) {
					if (min === undefined) min = val; else if (val < min) min = val;
				});
			}
			return min;
		},

		sum: function() {
			var total = 0, len = this.length, val;
			for (var i = len; i--; ) {
				val = this[i];
				if (val) total += val; // take care of not adding undefined values
			}
			return total;
		},

		avg: function() {
			return (this.length) ? this.sum() / this.length : undefined;
		},

		/**
		 * Makes a function memorize its returned value so that
		 * the next call will not compute it again
		 * Usage Note (Important) : Use that method when all data is gathered
			 so that you won't call again any method modifying the serie's content
			 Second usage note : Call this method without any argument to
			 memoize the default methods : max(), min(), sum(),
		 */
		memoize: function( /* names */ ) {
			var names = (arguments.length) ? arguments : ["max", "min", "sum", "avg"];

			for (var i = names.length-1; i--; ) {
				var methodName = names[i];
				if (!this[methodName] || !this[methodName] instanceof Function) return;

				(function closure() {
					var computed = this[methodName].apply(this);
					this[methodName] = function() {
						return computed;
					}
				}).apply(this);
			}

			return this;
		}

	};


	// ------------------------------------------------------ //


	// Return our Serie constructor in the given namespace.
	namespace.Serie = Serie;

})((module) ? module.exports : window);
