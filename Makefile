all: clean basic minbasic full minfull

# Erase and recreate the distribution directory
clean: 
	rm -rf dist/
	mkdir dist/

# Concatenate basic set plugins to main librarie
basic: js/jquery.TableData.js js/jquery.visualize.js js/plugins/jquery.visualize.bar.js js/plugins/jquery.visualize.pie.js js/plugins/jquery.visualize.line.js 
	cat $^ > dist/jquery.visualize.basic.js

minbasic: dist/jquery.visualize.basic.js
	uglifyjs $^ > dist/jquery.visualize.basic.min.js

# Concatenate all released plugins to main librarie
full: js/jquery.TableData.js js/jquery.visualize.js js/plugins/jquery.visualize.bar.js js/plugins/jquery.visualize.pie.js js/plugins/jquery.visualize.line.js js/plugins/jquery.visualize.stack.js js/plugins/jquery.visualize.hbar.js js/plugins/jquery.visualize.hstack.js
	cat $^ > dist/jquery.visualize.pack.js

minfull: dist/jquery.visualize.pack.js
	uglifyjs $^ > dist/jquery.visualize.pack.min.js

