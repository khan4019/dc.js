(function () {
	'use strict';
	var mta = window.mta || {};
	window.mta = mta;

	mta.pathChart = function (config) {

		var defaultMargin = {top:45, right: 20, bottom: 40, left: 20};
		var availableHeight = config.height || 500;
		var legendWidth = config.legendWidth || 160;
		var legendLeftMargin = 40;
		var legend, legendPerRow;
		var lineDuration = 1000, fillDuration = 700;

		
	    function getWidth() {
	    	return parseInt(d3.select(config.chartId + ' svg').style('width'), 10) - margin.left - margin.right;
	    }
    	
	    var margin = config.margin || defaultMargin;
		var color = d3.scale.category10();
		var height = availableHeight - margin.top - margin.bottom;
		var width = getWidth();
		var nodeMinSpace = 0.2;

    	var svg, x, y, xAxis, yAxis, xPosition, line, shoppingNodes, touchNodes, fishBowl, nodeVolumes, tooltip;
    	var nodeLabels = [], nodeData = [], legendData;

    	
    	function getLegendY(i, textOffset) {
			var rowLimit = legendPerRow;
			var legendY;
			switch(true){
				case (i < rowLimit):
					legendY =-85;
					break; 
				case (i < 2*rowLimit):
					legendY = -70;
					break;
				case (i < 3*rowLimit):
					legendY = -55;
					break;
				case (i < 4*rowLimit):
					legendY = -40;
					break;	
				default:
					legendY = -25;
					break;			
			}
			return legendY + textOffset;
		}

		function getLegendX(i, textOffset){ 
			return legendLeftMargin + textOffset + (i % legendPerRow) *  legendWidth;
		}

		function chart(selection) {
			selection.each(function (chartData) {
				line = d3.svg.line()
	               .interpolate('basis')
	               .x(function(d) { return x(d.time); })
	               .y(function(d) { return y(d.pathId); });

	            tooltip = d3.select('body')
	                .append('div')  
	                .attr('class', 'tooltip nodeTooltip'); 

                x = d3.scale.linear()
                    .range([0, width])
                    .domain([29, 0]);
            
            	y = d3.scale.linear()
            	    .range([height, 0])
                    .domain([11, 0]);  

                xPosition = function (d) {
                	if(d.timeToNext && d.timeToNext < nodeMinSpace){
                		return x(d.time + nodeMinSpace);
                	}
                	return x(d.time);
                };

                xAxis = d3.svg.axis()
			        .scale(x)
				    .orient('bottom')
				    .tickValues([0, 7, 14, 21, 28]);

				yAxis = d3.svg.axis()
				    .scale(y)
				    .orient('left');

				svg = d3.select(config.chartId + ' svg')
				    .attr('width', width + margin.left + margin.right)
				    .attr('height', height + margin.top + margin.bottom)
				  	.append('g')
				    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

				svg.append('g')
				    .attr('class', 'x axis')
				    .attr('transform', 'translate(0,' + height + ')')
				    .call(xAxis);

				svg.append('g')
			    	.attr('class', 'y axis')
			    	.call(yAxis);    

				svg.append('text')
				    .attr('class', 'x axis label')
				    .attr('text-anchor', 'middle')
				    .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + 30) + ')')
				    .text('Average time before purchase');

				legend = svg.append('g')
				    .attr('x', width)
				    .attr('y', 50)
				    .attr('height', 100)
				    .attr('width', 100)
				    .attr('transform', 'translate(-20,50)');    

	            chart.refreshChart(chartData);

	            d3.select(window).on('resize', resizeChart);
			});
			
		}

		chart.refreshChart = function (newData) {
			svg.selectAll('circle, .path-line, .legend-text, .node-volume, .fishBowl-air').remove();
			updateNodesAndLabelsData(newData);

		    color.domain(nodeLabels);

		    //draw horizontal line in a path
		 	svg.selectAll('.path-line')
		        .data(newData)
		        .enter().append('path')
		        .attr('class', 'path-line')
		        .style('stroke', '#D3D3D3')
		        .attr('d', function(d) {var lastNode = d.nodes[d.nodes.length -1]; return line([lastNode, lastNode]); })
		        .transition()
		        .duration(lineDuration)
		        .attr('d', function(d) { return line([d.nodes[0], d.nodes[d.nodes.length -1]]); }); 

		    shoppingNodes = svg.selectAll('circle')
		        .data(nodeData.filter(function (d) {
		            return !d.time;
		        }))
		        .enter()
		        .append('g');                   

		    touchNodes = svg.selectAll('circle')
		        .data(nodeData.filter(function (d) {
		            return d.time;
		        }))
		        .enter()
		        .append('g');    

		 	
		    touchNodes.append('circle')
		        .attr('r', 15)
		        .attr('class', 'touchNodes')
		        .attr('stroke',function (d) { return color(d.label);})
		        .style('fill', 'white')
		        .attr('cy', function(d) { return y(d.pathId);})
		        .attr('cx', function(d) { return x(d.lastNodeTime); })
		        .transition()
		        .duration(lineDuration)
		        .attr('cx', function(d) { return xPosition(d); });

		    
		    //clip path is a rectagle which will create the empty part of the circle by creating intersection of 
		    //the y position of the clip reactangle is based on volume. 
		    touchNodes.append('clipPath')
		        .attr('id', function(d) {  return 'clip' + d.pathId + d.time; })
		        .attr('class', 'fishBowl-air')
		        .append('rect')
		        .attr('x', function(d){  return x(d.time + 1);}) //position the clip from circle edget
		        .attr('width', function(){ return 40;})
		        .attr('y', function(d) {return y(d.pathId + 0.38);})
		        .attr('height', function() {return 0;})
		        .transition()
		        .delay(fillDuration)
		        .duration(fillDuration)
		        .attr('y', function(d) {return y(d.pathId + 0.38 - 0.76 * d.volume);})
		        .attr('height', function() {return 40;});  
		    
		    
		    //water fill circle by using adding clip path
		    fishBowl = touchNodes.append('circle')
		        .attr('r',15)
		        .attr('class', 'fishBowl')
		        .style('fill', function(d) {return color(d.label); })
		        .attr('cx', function(d) { return xPosition(d); })
		        .attr('cy', function(d) { return y(d.pathId);})
		        .attr('clip-path', function(d) { return 'url(#clip' + d.pathId + d.time + ')'; });
		    
		    nodeVolumes = touchNodes.append('text')
		        .attr('x', function(d){  return xPosition(d);})
		        .attr('y', function(d) { return y(d.pathId + 0.1);})
		        .attr('text-anchor', 'middle')
		        .text(function(d) { return (d.volume*100).toFixed(0) + '%';})
		        .attr('class', 'node-volume'); 
		    
		    //shopping cart node 
		    shoppingNodes.append('circle')
		        .attr('r', 15)
		        .attr('class', 'shoppingNodes')
		        .attr('stroke', '#D3D3D3')
		        .style('fill', '#D3D3D3' )
		        .attr('cx', function(d) { return x(d.time); })
		        .attr('cy', function(d) { return y(d.pathId);});

		    //shopping cart icon
		    shoppingNodes.
		    	append('text')
		        .attr('class', 'glyphicon cart-holder')
		        .attr('x', function(d){ return x(d.time);})
		        .attr('y', function(d) { return y(d.pathId + 0.25);})
		        .attr('text-anchor', 'middle')
		        .style('fill', 'white')
		        .text('\ue116');
		    
		    refreshLegend();
		    applyTooltip();

			return chart;
		};

		function resizeChart() {
		   var newWidth = getWidth();
		   if(newWidth !== width){
		   		width = newWidth;
		       	reDrawNodes();
		   }
		   return chart;
		}

		function applyTooltip() {
			svg.selectAll('.touchNodes, .fishBowl, .node-volume')
			.on('mouseover', function(d) {      
			    fishBowl.attr('clip-path', null);
			    nodeVolumes.style('opacity', 0.9);
			    
			    svg.selectAll('.touchNodes')
			    	.attr('stroke', 'white');

			    tooltip.style('opacity', 0.9)
			        .html('<div>'+
			        		'<h4>' + d.label + '</h4>' + 
			        		'<p>Average volume contribution: ' + (d.volume*100).toFixed(2) + '%</p>' +
			        		'<p>Average time before purchase: ' + d.time.toFixed(2) + ' days</p>' +
			        	'</div>');
			    
			    //add drop line
			    svg.append('line')
			        .attr('class', 'x-axis-drop-line')
			        .style('stroke', color(d.label))
			        .attr('x1', xPosition(d))
			        .attr('y1', y(d.pathId + 0.5))
			        .attr('x2', xPosition(d))
			        .attr('y2', y(d.pathId + 0.5))
			        .transition()
			        .duration(fillDuration)
			        .attr('y2', y(11));
			    })
			.on('mousemove', function(){
			    tooltip.style('left', (d3.event.pageX) + 10 + 'px')     
			        .style('top', (d3.event.pageY + 20) + 'px');
			})                      
			.on('mouseout', function() {
			    fishBowl.attr('clip-path', function(d) { return 'url(#clip' + d.pathId + d.time + ')'; });
			    
			    tooltip.style({opacity: 0, top:document.body.offsetHeight +'px'});
			    
			    svg.selectAll('.touchNodes')
			    	.attr('stroke', function(d) {return color(d.label); });

			    //hide node text
			    svg.selectAll('.node-volume')
			        .style('opacity', 0);
			    svg.selectAll('.x-axis-drop-line')
			    	.remove();
			});
		}

		function refreshLegend() {
			//supports four lines of legend only. after that it will be cluttered in the fourth line
			legendData = nodeLabels.slice(1);
			
			legendPerRow = Math.floor((width - legendLeftMargin)/legendWidth);

			legend.selectAll('.legend-circle')
			  	.data(legendData)
			  	.enter()
			  	.append('circle')
			  	.attr('r', 5)
			  	.attr('cx', function(d,i){ return getLegendX(i, 0); })
			  	.attr('cy', function (d, i) { return getLegendY(i, 0);})
			  	.attr('class','legend-circle')
			  	.style('fill', function(d) { return color(d);});
			  
			legend.selectAll('text')
			  	.data(legendData)
			  	.enter()
			  	.append('text')
			  	.style('font-size','10px')
			  	.attr('x', function(d, i){ return getLegendX(i, 8);})
			  	.attr('y', function (d, i) { return getLegendY(i, 3);})
			  	.attr('class','legend-text')
			  	.text(function (d) { 
			  		var cutOff =  (d === d.toUpperCase()) ? 21 : 25;
			  		if(d.length > cutOff + 3){
			  			return d.substring(0,cutOff) + '...';
			  		}
			  		return d;
			  	})
			  	.append('title')
			  	.text(function(d) { return d;});

			return chart;
		}

		function reDrawNodes() {
		    x.range([0, width]);
		    xAxis.scale(x);
		    svg.select('.x.axis')
		        .call(xAxis);

		    //move chart items.
		    svg.selectAll('.touchNodes, .shoppingNodes, .fishBowl')
		        .attr('cx', function(d) { return xPosition(d); });

		    svg.selectAll('.node-volume')
		        .attr('x', function(d){return xPosition(d);});

		    svg.selectAll('.fishBowl-air rect')
		        .attr('x', function(d){  return x(d.time + 1);});

		    svg.selectAll('.cart-holder')
		        .attr('x', function(d){ return x(d.time);});

		    svg.selectAll('.path-line')
		        .attr('d', function(d) { return line(d.nodes); });

		    //move x axis label
		    d3.selectAll('.x.label')
		    	.attr('transform', 'translate(' + (width / 2) + ' ,' + (height + 30) + ')');

		    moveLegend();	

		    return chart;
		}

		function moveLegend() {
			legendPerRow = Math.floor((width-legendLeftMargin)/legendWidth);

			svg.selectAll('.legend-text')
		    	.attr('x', function(d, i){ return getLegendX(i, 8);})
			  	.attr('y', function (d, i) { return getLegendY(i, 3);});

			svg.selectAll('.legend-circle')
			  	.attr('cx', function(d,i){ return getLegendX(i, 0); })
			  	.attr('cy', function (d, i) { return getLegendY(i, 0);});
			  
			return chart;
		}

		function updateNodesAndLabelsData(newData) {
			nodeData = [];
			nodeLabels = [];
			newData.forEach(function(path) {
				var pathLastNodeTime = path.nodes[path.nodes.length -1].time;
			    path.nodes.forEach(function(node) {
			    	node.lastNodeTime = pathLastNodeTime;
			        if(nodeLabels.indexOf(node.label) === -1){
			            nodeLabels.push(node.label);
			        }
			    });
			    nodeData = nodeData.concat(path.nodes);
			});
		}
		
		return chart;
	};
}());