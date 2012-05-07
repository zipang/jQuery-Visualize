/*
 * --------------------------------------------------------------------
 * jQuery Visualize plugin
 * Author: Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group 
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * --------------------------------------------------------------------
*/
(function($) {

    $.visualize = {
        plugins: {} // additional chart scripts will load inside this namespace
    };

    function createChart(charts, type, context) {

        if (charts[type]) {
            console.log("Executing existing chart " + type);
            charts[type]();

        } else if ($.visualize.plugins[type]) {
            $.visualize.plugins[type].apply(context); // call our external plugin with the passed context

        } else {
            // try to dynamically load a new type of chart from external plugin
            console.log("Trying to load js/jquery.vizualize." + type + ".js");

            $.getScript("js/jquery.visualize." + type + ".js", function loaded() {
                $.visualize.plugins[type].apply(context);
            }).fail(function(jqxhr, settings, exception) {
                context.target.canvasContainer.remove();
                throw "Failed to load jquery.vizualize plugin " + type + " : " + exception;
            });
        }
    }

    // Table data scrapper object
    function TableData(table, options) {
        this.table = $(table);
        this.options = options;
    }

    TableData.prototype = {

        dataGroups: function(){
            if (this._dataGroups) return this._dataGroups; // stored result

            var dataGroups = [];
            var colors = this.options.colors,
                textColors = this.options.textColors,
                rowFilter = this.options.rowFilter,
                colFilter = this.options.colFilter;

            if(this.options.parseDirection == 'x'){
                this.table.find('tr:gt(0)').filter(rowFilter).each(function(i, tr){
                    dataGroups[i] = {};
                    dataGroups[i].points = [];
                    dataGroups[i].color = colors[i];
                    if(textColors[i]){ dataGroups[i].textColor = textColors[i]; }
                    $(tr).find('td').filter(colFilter).each(function(){
                        dataGroups[i].points.push( parseFloat($(this).text()) );
                    });
                });
            }
            else {
                var cols = this.table.find('tr:eq(1) td').filter(colFilter).size();
                for(var i=0; i<cols; i++){
                    dataGroups[i] = {};
                    dataGroups[i].points = [];
                    dataGroups[i].color = colors[i];
                    if(textColors[i]){ dataGroups[i].textColor = textColors[i]; }
                    this.table.find('tr:gt(0)').filter(rowFilter).each(function(){
                        dataGroups[i].points.push( $(this).find('td').filter(colFilter).eq(i).text()*1 );
                    });
                }
            }
            return (this._dataGroups = dataGroups);
        },

        allData: function(){
            if (this._allData) return this._allData;

            var allData = [];
            $(this.dataGroups()).each(function(){
                allData.push(this.points);
            });
            return (this._allData = allData);
        },

        dataSum: function(){
            if (this._dataSum) return this._dataSum;

            var dataSum = 0;
            var allData = this.allData().join(',').split(','); // remove blank values
            $(allData).each(function(){
                dataSum += parseFloat(this);
            });
            return (this._dataSum = dataSum);
        },

        topValue: function(){
            if (this._topValue) return this._topValue;

            var topValue = 0;
            var allData = this.allData().join(',').split(','); // remove blank values
            $(allData).each(function(){
                if(parseFloat(this,10)>topValue) topValue = parseFloat(this);
            });
            return (this._topValue = topValue);
        },

        bottomValue: function(){
            if (this._bottomValue) return this._bottomValue;

            var bottomValue = 0;
            var allData = this.allData().join(',').split(',');
            $(allData).each(function(i, val){
                if(val<bottomValue) bottomValue = parseFloat(val);
            });
            return (this._bottomValue = bottomValue);
        },

        memberTotals: function(){
            if (this._memberTotals) return this._memberTotals;

            var memberTotals = [];
            var dataGroups = this.dataGroups();
            $(dataGroups).each(function(l){
                var count = 0;
                $(dataGroups[l].points).each(function(m){
                    count +=dataGroups[l].points[m];
                });
                memberTotals.push(count);
            });
            return (this._memberTotals = memberTotals);
        },

        totalYRange: function(){
            return this.topValue() - this.bottomValue();
        },

        xLabels: function(){
            if (this._xLabels) return this._xLabels;

            var xLabels = [];
            if(this.options.parseDirection == 'x'){ // parse the column headers
                this.table.find('tr:eq(0) th').filter(this.options.colFilter).each(function(i, th){
                    xLabels.push($(th).html());
                });
            }
            else {
                this.table.find('tr:gt(0) th').filter(this.options.rowFilter).each(function(i, th){
                    xLabels.push($(th).html());
                });
            }
            return (this._xLabels = xLabels);
        },

        yLabels : function() {
            if (this._yLabels) return this._yLabels;

            var bottomValue = this.bottomValue(),
                topValue = this.topValue(),
                totalYRange = topValue - bottomValue,
                yLabels = [];
            yLabels.push(bottomValue);
            var numLabels = Math.round(this.options.height / this.options.yLabelInterval);
            var loopInterval = Math.ceil(totalYRange / numLabels) || 1;
            while( yLabels[yLabels.length-1] < topValue - loopInterval){
                yLabels.push(yLabels[yLabels.length-1] + loopInterval);
            }
            yLabels.push(topValue);
            return (this._yLabels = yLabels);
        }
    }; // TableData prototype

$.fn.visualize = function(options, container){

	return $(this).each(function(){

		//configuration
		var o = $.extend({
			type: 'bar', //also available: area, pie, line
			width: $(this).width(), //height of canvas - defaults to table height
			height: $(this).height(), //height of canvas - defaults to table height
			appendTitle: true, //table caption text is added to chart
			title: null, //grabs from table caption if null
			appendKey: true, //color key is added to chart
			rowFilter: ' ',
			colFilter: ' ',
			colors: ['#be1e2d','#666699','#92d5ea','#ee8310','#8d10ee','#5a3b16','#26a4ed','#f45a90','#e9e744'],
			textColors: [], //corresponds with colors array. null/undefined items will fall back to CSS
			parseDirection: 'x', //which direction to parse the table data
			pieMargin: 20, //pie charts only - spacing around pie
			pieLabelsAsPercent: true,
			pieLabelPos: 'inside',
			lineWeight: 4, //for line and area - stroke weight
			barGroupMargin: 10,
			barMargin: 1, //space around bars in bar chart (added to both sides of bar)
			yLabelInterval: 30 //distance between y labels
		},options);
		
		//reset width, height to numbers
		o.width  = parseFloat(o.width);
		o.height = parseFloat(o.height);

		var self = $(this);

		//function to create a chart
		var charts = {
			pie: function(){	
				
				canvasContain.addClass('visualize-pie');
				
				if(o.pieLabelPos == 'outside'){ canvasContain.addClass('visualize-pie-outside'); }	
						
				var centerx = Math.round(canvas.width()/2);
				var centery = Math.round(canvas.height()/2);
				var radius = centery - o.pieMargin;				
				var counter = 0.0;
				var toRad = function(integer){ return (Math.PI/180)*integer; };
				var labels = $('<ul class="visualize-labels"></ul>')
					.insertAfter(canvas);

				//draw the pie pieces
				$.each(memberTotals, function(i){
					var fraction = (this <= 0 || isNaN(this))? 0 : this / dataSum;
					ctx.beginPath();
					ctx.moveTo(centerx, centery);
					ctx.arc(centerx, centery, radius, 
						counter * Math.PI * 2 - Math.PI * 0.5,
						(counter + fraction) * Math.PI * 2 - Math.PI * 0.5,
		                false);
			        ctx.lineTo(centerx, centery);
			        ctx.closePath();
			        ctx.fillStyle = dataGroups[i].color;
			        ctx.fill();
			        // draw labels
			       	var sliceMiddle = (counter + fraction/2);
			       	var distance = o.pieLabelPos == 'inside' ? radius/1.5 : radius +  radius / 5;
			        var labelx = Math.round(centerx + Math.sin(sliceMiddle * Math.PI * 2) * (distance));
			        var labely = Math.round(centery - Math.cos(sliceMiddle * Math.PI * 2) * (distance));
			        var leftRight = (labelx > centerx) ? 'right' : 'left';
			        var topBottom = (labely > centery) ? 'bottom' : 'top';
			        var percentage = parseFloat((fraction*100).toFixed(2));

			        if(percentage){
			        	var labelval = (o.pieLabelsAsPercent) ? percentage + '%' : this;
				        var labeltext = $('<span class="visualize-label">' + labelval +'</span>')
				        	.css(leftRight, 0)
				        	.css(topBottom, 0);
				        	if(labeltext)
				        var label = $('<li class="visualize-label-pos"></li>')
				       			.appendTo(labels)
				        		.css({left: labelx, top: labely})
				        		.append(labeltext);	
				        labeltext
				        	.css('font-size', radius / 8)		
				        	.css('margin-'+leftRight, -labeltext.width()/2)
				        	.css('margin-'+topBottom, -labeltext.outerHeight()/2);
				        	
				        if(dataGroups[i].textColor){ labeltext.css('color', dataGroups[i].textColor); }	
			        }
			      	counter+=fraction;
				});
			},
			
			line: function(area){
			
				if(area){ canvasContain.addClass('visualize-area'); }
				else{ canvasContain.addClass('visualize-line'); }
			
				//write X labels
				var xInterval = canvas.width() / (xLabels.length -1);
				var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
					.width(canvas.width())
					.height(canvas.height())
					.insertBefore(canvas);
				$.each(xLabels, function(i){ 
					var thisLi = $('<li><span>'+this+'</span></li>')
						.prepend('<span class="line" />')
						.css('left', xInterval * i)
						.appendTo(xlabelsUL);						
					var label = thisLi.find('span:not(.line)');
					var leftOffset = label.width()/-2;
					if(i == 0){ leftOffset = 0; }
					else if(i== xLabels.length-1){ leftOffset = -label.width(); }
					label
						.css('margin-left', leftOffset)
						.addClass('label');
				});

				//write Y labels
				var yScale = canvas.height() / totalYRange;
				var liBottom = canvas.height() / (yLabels.length-1);
				var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
					.width(canvas.width())
					.height(canvas.height())
					.insertBefore(canvas);
					
				$.each(yLabels, function(i){  
					var thisLi = $('<li><span>'+this+'</span></li>')
						.prepend('<span class="line"  />')
						.css('bottom',liBottom*i)
						.prependTo(ylabelsUL);
					var label = thisLi.find('span:not(.line)');
					var topOffset = label.height()/-2;
					if(i == 0){ topOffset = -label.height(); }
					else if(i== yLabels.length-1){ topOffset = 0; }
					label
						.css('margin-top', topOffset)
						.addClass('label');
				});

				//start from the bottom left
				ctx.translate(0,zeroLoc);
				//iterate and draw
				$.each(dataGroups,function(h){
					ctx.beginPath();
					ctx.lineWidth = o.lineWeight;
					ctx.lineJoin = 'round';
					var points = this.points;
					var integer = 0;
					ctx.moveTo(0,-(points[0]*yScale));
					$.each(points, function(){
						ctx.lineTo(integer,-(this*yScale));
						integer+=xInterval;
					});
					ctx.strokeStyle = this.color;
					ctx.stroke();
					if(area){
						ctx.lineTo(integer,0);
						ctx.lineTo(0,0);
						ctx.closePath();
						ctx.fillStyle = this.color;
						ctx.globalAlpha = .3;
						ctx.fill();
						ctx.globalAlpha = 1.0;
					}
					else {ctx.closePath();}
				});
			},
			
			area: function(){
				this.line(true);
			},
			
			bar: function(){
				
				canvasContain.addClass('visualize-bar');
			
				//write X labels
				var xInterval = canvas.width() / (xLabels.length);
				var xlabelsUL = $('<ul class="visualize-labels-x"></ul>')
					.width(canvas.width())
					.height(canvas.height())
					.insertBefore(canvas);
				$.each(xLabels, function(i){ 
					var thisLi = $('<li><span class="label">'+this+'</span></li>')
						.prepend('<span class="line" />')
						.css('left', xInterval * i)
						.width(xInterval)
						.appendTo(xlabelsUL);
					var label = thisLi.find('span.label');
					label.addClass('label');
				});

				//write Y labels
				var yScale = canvas.height() / totalYRange;
				var liBottom = canvas.height() / (yLabels.length-1);
				var ylabelsUL = $('<ul class="visualize-labels-y"></ul>')
					.width(canvas.width())
					.height(canvas.height())
					.insertBefore(canvas);
				$.each(yLabels, function(i){  
					var thisLi = $('<li><span>'+this+'</span></li>')
						.prepend('<span class="line"  />')
						.css('bottom',liBottom*i)
						.prependTo(ylabelsUL);
						var label = thisLi.find('span:not(.line)');
						var topOffset = label.height()/-2;
						if(i == 0){ topOffset = -label.height(); }
						else if(i== yLabels.length-1){ topOffset = 0; }
						label
							.css('margin-top', topOffset)
							.addClass('label');
				});

				//start from the bottom left
				ctx.translate(0,zeroLoc);
				//iterate and draw
				for(var h=0; h<dataGroups.length; h++){
					ctx.beginPath();
					var linewidth = (xInterval-o.barGroupMargin*2) / dataGroups.length; //removed +1 
					var strokeWidth = linewidth - (o.barMargin*2);
					ctx.lineWidth = strokeWidth;
					var points = dataGroups[h].points;
					var integer = 0;
					for(var i=0; i<points.length; i++){
						var xVal = (integer-o.barGroupMargin)+(h*linewidth)+linewidth/2;
						xVal += o.barGroupMargin*2;
						
						ctx.moveTo(xVal, 0);
						ctx.lineTo(xVal, Math.round(-points[i]*yScale));
						integer+=xInterval;
					}
					ctx.strokeStyle = dataGroups[h].color;
					ctx.stroke();
					ctx.closePath();
				}
			}
		};
	
		//create new canvas, set w&h attrs (not inline styles)
		var canvasNode = document.createElement("canvas"); 
		canvasNode.setAttribute('height',o.height);
		canvasNode.setAttribute('width',o.width);
		var canvas = $(canvasNode);
			
		//get title for chart
		var title = o.title || self.find('caption').text();
		
		//create canvas wrapper div, set inline w&h, append
		var canvasContain = (container || $('<div class="visualize" role="img" aria-label="Chart representing data from the table: '+ title +'" />'))
			.height(o.height)
			.width(o.width)
			.append(canvas);

		//scrape table (this should be cleaned up into an obj)
		var tableData = new TableData(self, o);

		var dataGroups = tableData.dataGroups();
		var allData = tableData.allData();
		var dataSum = tableData.dataSum();
		var topValue = tableData.topValue();
		var bottomValue = tableData.bottomValue();
		var memberTotals = tableData.memberTotals();
		var totalYRange = tableData.totalYRange();
		var zeroLoc = o.height * (topValue/totalYRange);
		var xLabels = tableData.xLabels();
		var yLabels = tableData.yLabels();
								
		//title/key container
		if(o.appendTitle || o.appendKey){
			var infoContain = $('<div class="visualize-info"></div>')
				.appendTo(canvasContain);
		}
		
		//append title
		if(o.appendTitle){
			$('<div class="visualize-title">'+ title +'</div>').appendTo(infoContain);
		}
		
		//append key
		if(o.appendKey){
			var newKey = $('<ul class="visualize-key"></ul>');
			var selector;
			if(o.parseDirection == 'x'){
				selector = self.find('tr:gt(0) th').filter(o.rowFilter);
			}
			else{
				selector = self.find('tr:eq(0) th').filter(o.colFilter);
			}
			
			selector.each(function(i){
				$('<li><span class="visualize-key-color" style="background: '+dataGroups[i].color+'"></span><span class="visualize-key-label">'+ $(this).text() +'</span></li>')
					.appendTo(newKey);
			});
			newKey.appendTo(infoContain);
		}
		
		//append new canvas to page
		
		if(!container){canvasContain.insertAfter(this); }
		if( typeof(G_vmlCanvasManager) != 'undefined' ){ G_vmlCanvasManager.init(); G_vmlCanvasManager.initElement(canvas[0]); }	
		
		//set up the drawing board	
		var ctx = canvas[0].getContext('2d');
		
		//create chart
		createChart(charts, o.type, {
            target: {
                canvasContainer: canvasContain,
                canvasContext: ctx,
                canvas: canvas
            },
            data: tableData,
            options: o
        });
		
		//clean up some doubled lines that sit on top of canvas borders (done via JS due to IE)
		$('.visualize-line li:first-child span.line, .visualize-line li:last-child span.line, .visualize-area li:first-child span.line, .visualize-area li:last-child span.line, .visualize-bar li:first-child span.line,.visualize-bar .visualize-labels-y li:last-child span.line').css('border','none');
		if(!container){
		//add event for updating
		canvasContain.bind('visualizeRefresh', function(){
			self.visualize(o, $(this).empty()); 
		});
		}
	}).next(); //returns canvas(es)
};
})(jQuery);


