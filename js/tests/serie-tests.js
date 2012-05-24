
var Serie = require("../Serie").Serie,
	vows   = require("vows"),
	should = require("should");

vows.describe("Statistical Serie").addBatch({

	"Simple initialization": {

		topic: function() {
			return new Serie("John sales");
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

	"Serie has Memoize !!": {

		topic: function() {
			return new Serie("John sales", 1, 2, 3, 4, 5).memoize();
		},

		"Serie has min()": function (s) {
			console.log("memorized min : " + s.min());
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
	}


}).export(module); // End of batch
