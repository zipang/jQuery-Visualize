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
       data-visualize-type="pie" data-visualize-pie-margin="10" >
    <caption>How to pass options through data- attributes</caption>
    <thead>
        <tr>
            <td></td>
            <th scope="col" data-visualize-target="vis-food">food</th>
            <th scope="col" data-visualize-target="vis-auto">auto</th>
            <th scope="col" data-visualize-target="vis-household">household</th>
            <th scope="col" data-visualize-target="vis-furniture">furniture</th>
        </tr>
    </thead>
    <tbody>
        <!-- ...  -->    
    </tbody>
</table>
```

##Plugin Development

New charts can be easily developped and loaded as visualize plugins.
To do that, just add the new rendering functions to the '$.visualize.plugins' namespace.

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

##Road Map
We are now working on the experimental branch on a complete rewriting of this project to support these features :
- Add a well structured and programmable Data structure that will contain the data to render, and will permit us to initialize the data with various data sources.
- Break the code in separate modules to be able to independantly tests each features, add readability to the code, and be evolutive.
- Add a facility layer on top of the canvas element to provide the developper with a more friendly and fun API to develop new charts.
- Add a bridge towards more complete chart tools like Google charts or jqPlots
- Keep the compatibility and ease of use of the original jQuery Visualize plugin (should not require any code change except the include source)

This work has been made possible with the help of [Profeci](http://profeci.eu), a french company that specializes in Data Knowledge and allready uses this new version to display great data reporting.

