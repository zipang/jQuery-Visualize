/**
 * Let's consider the following table structure
 *                  John        Mary         Peter
 * Food                  0         420           15
 * Cars                950         595          150
 * Electronics        1500          20          800
 * Fashion             190        2000            0
 */
var stats = {
    title: "Sales Data",
    description: "Sales per vendor during the year 2012",
    units: "$",   // int, float, percent

    series: {
				keys: {
					lines: ["Food", "Cars", "Electronics", "Fashion"],
					columns: ["John", "Mary", "Peter"],
					categories: this.lines,
					salesman: this.columns
				}

				food: [0, 420, 15],
				cars: [950, 595, 150],
				electronics: [1500, 20, 800],
				fashion: [190, 2000, 0],

				john: [0, 950, 1500, 190]
				mary: [420, 595, 1500, 2000]
				peter: [15, 150, 800, 0]

    }
};

