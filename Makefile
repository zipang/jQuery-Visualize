all: basic minbasic full minfull

# Concatenate basic set plugins to main librarie
basic: js/jquery.visualize.js js/plugins/jquery.visualize.bar.js js/plugins/jquery.visualize.pie.js js/plugins/jquery.visualize.line.js 
	cat $^ > dist/jquery.visualize.basic.js

minbasic: dist/jquery.visualize.basic.js
	uglifyjs $^ > dist/jquery.visualize.basic.min.js

# Concatenate all released plugins to main librarie
full: js/jquery.visualize.js js/plugins/jquery.visualize.bar.js js/plugins/jquery.visualize.pie.js js/plugins/jquery.visualize.line.js js/plugins/jquery.visualize.stack.js js/plugins/jquery.visualize.hbar.js js/plugins/jquery.visualize.hstack.js
	cat $^ > dist/jquery.visualize.ext.js

minfull: dist/jquery.visualize.ext.js
	uglifyjs $^ > dist/jquery.visualize.ext.min.js

