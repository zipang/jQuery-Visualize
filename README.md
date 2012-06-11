jQuery Visualize Plugin (_Extended_)
==================================

This repository contains a partial rewriting of the Visualize jQuery plugin code that was released by Filament Group, Inc. as part of their book [Designing with Progressive Enhancement](http://filamentgroup.com/dwpe).

The original version is still developped and maintained by Filament [here](https://github.com/filamentgroup/jQuery-Visualize)

This first new version, while still a work in progress adds the following features to the original :
- add a plugin mechanism to extend the library with new charts.
- 3 new charts to include individually : piled bars, radar and dots.

Plugins Support


We are now working on the experimental branch on a complete rewriting of this project to support these features :
- Add a well structured and programmable Data structure that will contain the data to render, and will permit us to initialize the data with various data sources.
- Break the code in separate modules to be able to independantly tests each features, add readability to the code, and be evolutive.
- Add a facility layer on top of the canvas element to provide the developper with a more friendly and fun API to develop new charts.
- Add a bridge towards more complete chart tools like Google charts or jqPlots
- Keep the compatibility and ease of use of the original jQuery Visualize plugin (should not require any code change except the include source)

This work has been made possible with the help of [Profeci](http://profeci.eu), a french company that specializes in Data Knowledge and allready uses this new version to display great data reporting.

```javascript
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
```
