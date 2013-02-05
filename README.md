jQuery Visualize Plugin _Extended_
==================================

This repository contains a *complete* rewriting of the Visualize jQuery plugin code that was released by Filament Group, Inc. as part of their book [Designing with Progressive Enhancement](http://filamentgroup.com/dwpe).

The original version is still developped and maintained by Filament [here](https://github.com/filamentgroup/jQuery-Visualize)

This _extended_ version adds the following features to the original :
- a plugin mechanism to extend the library with new charts.
- several new charts
- integration with the popular [DataTables] jquery component to dynamically re-render charts as the DataTable is filtered/re-ordered.
- A new mechanism to individually bind charts to specific columns.

[DataTables]: http://www.datatables.net/

##Quick Documentation

###Invoking the `.visualize()` method on `<table>` elements

Any table that contains suitable numeric data can be converted into a graph representing this data throught the invocation of the `.visualize()` method.

Serie's labels _must_ be defined as proper table column (`th scope='col'`) and line (`th scope='line'`) headers.

The data visualization type must be passed, and some options specifics to each graph type provided.

```javascript
    // select every tables with the pie class and turn them into graph
    $("table.pie").visualize("pie", {pieLabels: "inside"});
```

Note : passing a single option object with a `type` is equivalent.

```javascript
    // select every tables with the pie class and turn them into graph
    $("table.pie").visualize({type: "pie", pieLabels: "inside"});

```

By default, the graph element will be appended just after the table element it depicts. But you can choose to provide the target to
render it elsewhere..

###Passing options through `data-visualize-*` attributes

Any option can be passed either through the `option` object or through a dedicated data attribute inside the `visualize` namespace.

####Example:

```html
<table class="visualize"
       data-visualize-type="pie" 
       data-visualize-pie-margin="40" 
       data-visualize-pie-labels-as-percent="false" >
    <caption>How to pass options through data- attributes</caption>
    <thead>
        <tr>
            <td></td>
            <th scope="col">Food</th>
            <th scope="col">Auto</th>
            <th scope="col">Household</th>
            <th scope="col">Furniture</th>
        </tr>
    </thead>
    <tbody>
        <!-- ...  -->    
    </tbody>
</table>
```

    And if you added the 'visualize' class to your table, that's all ! You don't even need to write any JavaScript !

###Distribution

Compacted and minified packages of the library can be found inside the `dist/` repository.

* `jquery.visualize.basic.js`
* `jquery.visualize.basic.min.js`
* `jquery.visualize.pack.js` 
* `jquery.visualize.pack.min.js`


To update the distribution, just call the `> make all` command on the project's root.

##Developpers notes

###Plugin Development

New charts can be easily developped and loaded as visualize plugins.
To do that, just add the new rendering functions to the `$.visualize.plugins` namespace.

Example:
```javascript
/**
 * My flashy chart for the jquery Visualize plugin
 * (Data are represented by random flash of lights)
 */
$.visualize.plugins.flashy = function () {

    // Get the drawing context (canvas and options)
    var o = this.options,
        container = this.target.canvasContainer,
        ctx = this.target.canvasContext,
        canvas = this.target.canvas;

    /* do something awesome... */
}

// then..
$("table.flashy").visualize("flashy");

```

##Acknowledgement

This work has been made possible with the help of [Profeci](http://profeci.eu), a french company that specializes in Data Knowledge and allready uses this new version to display great data reporting.

