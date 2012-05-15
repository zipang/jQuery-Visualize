// Run the script on DOM ready:
$(function(){

		$(function loaded() {
				$.visualize(stats, {
					type: "dots", 
					container: "dots", 
					columns: "categories", lines: "salesman", 
					width: 800, height: 500							
				});
		});

	/*$('table').visualize({type: 'pie', height: '300px', width: '420px'});
	$('table').visualize({type: 'bar', width: '420px'});
	$('table').visualize({type: 'area', width: '420px'});
	$('table').visualize({type: 'line', width: '420px'});
	$('table').visualize({type: 'radar', width: '420px'});
	$('table').visualize({type: 'pilebar', width: '420px'});
	$('table').visualize({type: 'pilebar100', width: '420px', height: '200px', yLabelInterval: 50});*/
});