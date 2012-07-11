// Run the script on DOM ready:
$(function(){
	$('table').visualize('pie', {height: '300px', width: '420px'});
	$('table').visualize('bar', {width: '420px'});
	$('table').visualize('area', {width: '420px'});
	$('table').visualize('line', {width: '420px'});

	$('table').visualize('radar', {width: '420px'});

	$('table').visualize('pilebar_100', {width: '420px', height: '200px', yLabelInterval: 50});
	$('table').visualize('pilebar', {width: '420px', height: '200px', yLabelInterval: 50});

	$('table').visualize('dots', {width: '420px', height: '200px', yLabelInterval: 50});
	$('table').visualize('dots_w', {width: '420px', height: '200px', yLabelInterval: 50});

	$('table').visualize('hbar', {width: '420px', height: '400px', yLabelInterval: 100});
	$('table').visualize('hstack', {width: '420px', height: '200px'});
	$('table').visualize('hstack_100', {width: '420px', height: '200px'});

});
