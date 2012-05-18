/**
 * Radar charts for the jquery Visualize plugin 2.0
 *
 * Data are represented by a star shaped form whose branches
 * are equal to the total value of each serie
 * Doesn't work very well if there is less than 3 members in the serie.
 */
(function define() {

    $.visualize.plugins.dots = function () {

        drawDots.call(this, false);
    };
    $.visualize.plugins.wdots = function () {

        drawDots.call(this, true);
    };

    function drawDots(area) {

			var o = this.options,
					container = this.target.canvasContainer,
					ctx = this.target.canvasContext,
					canvas = this.target.canvas,
					dataGroups = this.data.dataGroups(),
					xLabels = this.data.xLabels(),
					groupSums = this.data.groupSums(),
					totalYRange = Array.max(groupSums),
					topValue = this.data.topValue(),
					zeroLoc = o.height * (topValue/totalYRange);

			container.addClass('visualize-line'); 

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
				// ctx.beginPath();
				ctx.lineWidth = o.lineWeight;
				ctx.lineJoin = 'round';
				var points = this.points;
				var points_weight = this.points_weight;
				var integer = 0;
				var ptidx = 0;
				var radius = 1;
				ctx.fillStyle = this.color;
				ctx.strokeStyle = this.color;
				$.each(points, function(){
					ctx.beginPath();
					radius = area ? points_weight[ptidx] : 1;
					ctx.arc(integer,-(this*yScale),radius,0,2*Math.PI,false);          
					integer+=xInterval;
					ptidx += 1;
					ctx.fill();
				ctx.stroke();              
				});
			
			});
		}

})();


