/**
 * Created by JetBrains WebStorm.
 * User: christophe
 * Date: 07/05/12
 * Time: 16:21
 */

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

        lines: [
            {
                name: "Food",
                values: [0, 420, 15]
            }, {
                name: "Cars",
                values: [950, 595, 150]
            }, {
                name: "Electronics",
                values: [1500, 20, 800]
            }, {
                name: "Fashion",
                values: [190, 2000, 0]
            }
        ],

        columns: [
            {
                name: "John",
                values: [0, 950, 1500, 190]
            }, {
                name: "Mary",
                values: [0, 950, 1500, 190]
            }, {
                name: "Peter",
                values: [0, 950, 1500, 190]
            }
        ]

    }
};

