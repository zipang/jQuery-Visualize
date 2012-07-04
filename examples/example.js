// Run the script on DOM ready:
$(function(){
	$('table').visualize({type: 'pie', height: '300px', width: '420px'});
	$('table').visualize({type: 'bar', width: '420px'});
	$('table').visualize({type: 'area', width: '420px'});
	$('table').visualize({type: 'line', width: '420px'});

	$('table').visualize({type: 'radar', width: '420px'});

	$('table').visualize({type: 'pilebar_100', width: '420px', height: '200px', yLabelInterval: 50});
    $('table').visualize({type: 'pilebar', width: '420px', height: '200px', yLabelInterval: 50});

	$('table').visualize({type: 'dots', width: '420px', height: '200px', yLabelInterval: 50});
	$('table').visualize({type: 'dots_w', width: '420px', height: '200px', yLabelInterval: 50});

    $('table').visualize({type: 'hbar', width: '420px', height: '400px', yLabelInterval: 100});
});
