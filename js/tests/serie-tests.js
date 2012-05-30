
var Serie = require("../Serie").Serie,
		vows	= require("vows"),
	should	= require("should");

vows.describe("Statistical Serie").addBatch({

	"Empty serie initialization (name only)": {

		topic: function() {
			return new Serie("John sales");
		},

		"Check name and initial length": function (s) {
			s.name.should.equal("John sales");
			s.length.should.equal(0);
		}
	},

	"Empty serie initialization (name and empty array)": {

		topic: function() {
			return new Serie("John sales", []);
		},

		"Check name and initial length": function (s) {
			s.name.should.equal("John sales");
			s.length.should.equal(0);
		}
	},

	"Empty serie initialization (object)": {

		topic: function() {
			return new Serie({name: "John sales"});
		},

		"Check name and initial length": function (s) {
			s.name.should.equal("John sales");
			s.length.should.equal(0);
		}
	},

	"Empty serie initialization (object with empty array)": {

		topic: function() {
			return new Serie({name: "John sales", value: []});
		},

		"Check name and initial length": function (s) {
			s.name.should.equal("John sales");
			s.length.should.equal(0);
		}
	},

	"Serie is really an array !!": {

		topic: function() {
			return new Serie("John sales", 1, 2, 3);
		},

		"Check name and initial length": function (s) {
			s.should.be.instanceof(Array);
			s.length.should.equal(3);
			s[0].should.equal(1);
			s[2].should.equal(3);
		},

		"Push and pop": function (s) {
			s.push("wtf");
			s.pop().should.equal("wtf");
		}
	},

	"Serie has better than that": {

		topic: function() {
			return new Serie("John sales", 1, 2, 3, 4, 5);
		},

		"has Serie.constructor": function (s) {
			s.constructor.should.eql(Serie);
		},

		/* Broken.. and irreparable with this implementation
			 (serie is REALLY an Array)
		"instance of Serie": function (s) {
			s.should.be.an.instanceof(Serie);
		},*/

		"Serie has min()": function (s) {
			s.min().should.equal(1);
		},

		"Serie has max()": function (s) {
			s.max().should.equal(5);
		},

		"Serie has sum()": function (s) {
			s.sum().should.equal(15);
		},

		"Serie has avg()": function (s) {
			s.avg().should.equal(3);
		}
	},

	"Serie doesn't care about holes": {

		topic: function() {
			var s = new Serie("John sales", 1, 2, 3, undefined, 4, 5);
			s[10] = 100; // Well.. now we habe big holes in our structure
			return s;
		},

		"Serie has min()": function (s) {
			s.min().should.equal(1);
		},

		"Serie has max()": function (s) {
			s.max().should.equal(100);
		},

		"Serie has sum()": function (s) {
			s.sum().should.equal(115);
		}

	},

	"Serie's elements can be accessed by aliases when keys are provided": {

		topic: function() {
			return new Serie("letters", "a", "b", "c").keys("A", "B", "C");
		},

		"We can get elements by their aliases": function (letters) {
			letters[0].should.equal(letters.A)
			letters.A.should.equal("a");
			letters[0] = "aha!";
			letters.A.should.equal("aha!"); // still true
		},

		"We can write elements by their alias": function (letters) {
			letters.B = "Bébé";
			letters[1].should.equal("Bébé");
		}
	},

	"Serie can compare arbitrary objects given a specific comparator !!": {

		topic: function() {
			var paris  = {location: {lat: 48.856578, long: 2.351828}, population: 2234105},
					berlin = {location: {lat: 52.5186, long: 13.4081}, population: 3499879},
					dublin = {location: {lat: 53.343418, long: -6.267612}, population: 525383};

			return new Serie("cities", paris, berlin, dublin).keys("paris", "berlin", "dublin");
		},

		"Dublin is the northest citie in our list": function (cities) {
			cities.max(function getLatitude() {
				return this.location.lat;
			}).should.equal(cities.dublin);

			cities.maxValue(function getLatitude() {
				return this.location.lat;
			}).should.equal(cities.dublin.location.lat);
		},

		"Dublin has the lowest number of habitants in our list": function (cities) {
			cities.min(function getPopulation() {
				return this.population;
			}).should.equal(cities.dublin);

			cities.minValue(function getPopulation() {
				return this.population;
			}).should.equal(cities.dublin.population);
		},

		"We can now sum cities population": function (cities) {
			cities.sum(function getPopulation() {
				return this.population;
			}).should.equal(
				cities.paris.population
				+ cities.berlin.population
				+ cities.dublin.population
			);
		}

	},

	"Serie has Memoize !!": {

		topic: function() {
			return new Serie("John sales", 1, 2, 3, 4, 5).memoize();
		},

		"Serie has min()": function (s) {
			s.min().should.equal(1);
		},

		"Serie has max()": function (s) {
			s.max().should.equal(5);
		},

		"Serie has sum()": function (s) {
			s.sum().should.equal(15);
		},

		"Serie has avg()": function (s) {
			s.avg().should.equal(3);
		}
	},

	"Now.. if a serie changes.. just call memoize() again !!": {

		topic: function() {
			return new Serie("John sales", 1, 2, 3, 4, 5).memoize();
		},

		"min() will not reflect a change unless i rememoize the whole serie !": function (s) {
			s.min().should.equal(1);
			s[0] = -10;
			s.min().should.equal(1); // allways..
			s.memoize(); // do it again..
			s.min().should.equal(-10); // actualized !
		}

	}

}).export(module); // End of batch
