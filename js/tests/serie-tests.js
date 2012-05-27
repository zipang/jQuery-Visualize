
var Serie = require("../Serie").Serie,
	vows   = require("vows"),
	should = require("should");

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
			s.name.should.equal("John sales");
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

	"Serie's elements can be accessed by keys when provided": {

		topic: function() {
			return new Serie("letters", "a", "b", "c").keys("A", "B", "C").memoize();
		},

		"ABC..": function (letters) {
			letters[0].should.equal(letters.A);
		}
	},

	"Serie can compare arbitrary objects given a specific comparator !!": {

		topic: function() {
			var paris = {location: {lat: 48.856578, long: 2.351828}, population: 2234105},
					berlin = {location: {lat: 52.5186, long: 13.4081}, population: 3499879},
					dublin = {location: {lat: 53.343418, long: -6.267612}, population: 525383};

			return new Serie("cities", paris, berlin, dublin).keys("paris", "berlin", "dublin").memoize();
		},

		"Dublin is the northest citie in our list": function (cities) {
			cities.max(function thulest(a,b) {
				return (a.location.lat - b.location.lat);
			}).should.equal(cities.dublin);
		},

		"Dublin has the lowest number of habitants in our list": function (cities) {
			cities.min(function hasGreatestPopulation(a,b) {
				return (a.population - b.population);
			}).should.equal(cities.dublin);
		}

	},

	"Serie can compare arbitrary objects given a value extractor !!": {

		topic: function() {
			var paris = {location: {lat: 48.856578, long: 2.351828}, population: 2234105},
					berlin = {location: {lat: 52.5186, long: 13.4081}, population: 3499879},
					dublin = {location: {lat: 53.343418, long: -6.267612}, population: 525383};

			return new Serie("cities", paris, berlin, dublin)
				.keys("paris", "berlin", "dublin").memoize()
				.defineElementValue(function() {
					return this.population;
				});
		},

		"Berlin is the most crowded city in our list": function (cities) {
			cities.max().should.equal(cities.berlin.population);
		},

		"Dublin is the least crowded city in our list": function (cities) {
			cities.min().should.equal(cities.dublin.population);
		},

		"We can now sum cities population": function (cities) {
			cities.sum().should.equal(
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
