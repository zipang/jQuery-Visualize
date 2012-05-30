
var Serie   = require("../Serie").Serie,
		DataSet = require("../DataSet").DataSet,
		vows		= require("vows"),
	should		= require("should");


function rawData(title) {
	return {
		title: title,
		description: "Sales by departments and salesman",
		series: {
			lines: {
				keys: ["Cars", "Food", "Electronic"],
				"John": [1500, 340, 890],
				"Bettie": [2000, 450, 210],
				"Paul": [0, 890, 1500],
			},
			columns: {
				keys: ["John", "Bettie", "Paul"],
				"Cars": [1500, 2000, 0],
				"Food": [340, 450, 890],
				"Electronic": [890, 210, 1500]
			},
		}
	};
}

function dataSet(title) {
	return new DataSet(rawData(title));
}


vows.describe("A multidimensional set of data").addBatch({

	"Data set initialization": {

		topic: function() {
			return new DataSet("Sales");
		},

		"Check name and initial length": function (data) {
			data.should.include("title", "series");
			data.title.should.equal("Sales");
		},

		"Add manually some series inside categories": {
			topic: function(data) {
				data.add();
			}
		}
	},

	"Create a DataSet from raw structure": {

		topic: function() {
			return dataSet("Sales");
		},

		"Check name and initial length": function (data) {
			data.should.have.keys(["title", "description", "series"]);
			data.title.should.equal("Sales");
		},

		"Check series existence": function (data) {
			data.series.should.have.keys(["lines", "columns"]);
		},

		"Check lines content": {
			topic: function (data) {return data.series.lines;},

			"lines is a Serie": function (lines) {
				should.exist(lines);
				lines.constructor.should.eql(Serie);
				should.ok(lines.length == 3);
			},

			"lines has aliased values": function (lines) {
				should.exist(lines.John);
			}

		}
	}

}).export(module); // End of batch
