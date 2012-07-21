all: pack min

# Concatenate plugins to main librarie
pack: js/jquery.visualize.js js/plugins/jquery.visualize.bar.js js/plugins/jquery.visualize.radar.js js/plugins/jquery.visualize.pilebar.js js/plugins/jquery.visualize.dots.js js/plugins/jquery.visualize.hbar.js js/plugins/jquery.visualize.hstack.js
	cat $^ > dist/jquery.visualize.pack.js

min: dist/jquery.visualize.pack.js
	uglifyjs $^ > dist/jquery.visualize.pack.min.js

