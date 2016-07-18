function renderPathChart(chartData) {
    d3.select("#p2pChart svg").remove();
    var margin = {top: 20, right: 50, bottom: 30, left: 50},
        width = 700 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    var config = {
        chartId: '#p2pChart',
        margin: margin
    };

    var duration = 500;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickValues([0, 7, 14, 21, 28]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(10);

    var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) { 
            return x(d.time); 
        })
        .y(function(d) { 
            return y(d.pathNumber); 
        });

    
    var tooltip = d3.select('body')
        .append('div')  
        .attr('class', 'tooltip')               
        .style('opacity', 0);

    
    var margin = config.margin;

    var svg = d3.select(config.chartId).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');  

    //clear old if any
    //svg.selectAll('circle').exit().remove();

    //set color by nodes
    var nodeLabels = [];
    var nodeData = [];
    chartData.forEach(function(path) { 
        nodeData = nodeData.concat(path.nodes);
        path.nodes.forEach(function(node) {
            if(nodeLabels.indexOf(node.label) === -1){
                nodeLabels.push(node.label);
            }
        });
    });
    //remove purchase
    nodeLabels.shift();
    
    color.domain(nodeLabels);

  
    x.domain([29, 0]);
    y.domain([11, 0]);
    

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .style("font-size","11px")
    .attr("x", width/2 + 50)
    .attr("y", height + 35)
    .text("Avg. time before purchase"); 

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
    

    var purchasePaths = svg.selectAll('.node')
        .data(chartData)
        .enter().append('g')
        .attr('class', 'node');

    purchasePaths.append('path')
        .attr('class', 'line')
        .transition()
        .duration(duration)
        .attr('d', function(d) { return line(d.nodes); })
        .style('stroke', function(d) { return 'gray'; });

    

    var nodes = svg.selectAll('circle')
        .data(nodeData)
        .enter();

    var shoppingNodes = svg.selectAll('circle')
        .data(nodeData.filter(function (d) {
            return !d.time;
        }))
        .enter();                   

    var touchNodes = svg.selectAll('circle')
        .data(nodeData.filter(function (d) {
            return d.time;
        }))
        .enter();   

      

    touchNodes.append('clipPath')
        .attr('id', function(d) {  return 'clip' + d.pathNumber + d.time; })
        .append('rect')
        .attr('x', function(d){  return x(d.time + 1);})
        .attr('width', function(){ return 40;})
        .attr('y', function(d) {return y(d.pathNumber + 0.35 - 0.7 * d.volume);})
        .attr('height', function() {return 40;});    



    //exit  
    // touchNodes.exit().remove(); 

    nodes.append('circle')
        .attr('r', 14)
        .attr('class', function (d) { return (d.time) ? 'touchNodes': '';})
        .attr('stroke',function (d) { return (d.time) ? color(d.label) : '#D3D3D3';})
        .style('fill', function(d) { return (d.time) ? 'white' : '#D3D3D3'; })
        .attr('cx', function(d) { return x(d.time); })
        .attr('cy', function(d) { return y(d.pathNumber);});

    


    //water fill circle
    var fishBowl = touchNodes.append('circle')
        .attr('r',14)
        .attr('class', 'touchNodes')
        .style('fill', function(d) {return color(d.label); })
        .attr('cx', function(d) { return x(d.time); })
        .attr('cy', function(d) { return y(d.pathNumber);})
        .attr('clip-path', function(d) { return 'url(#clip' + d.pathNumber + d.time + ')'; });
    

    //shopping cart    
    shoppingNodes.append('svg:foreignObject')
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', function(d){
            return x(d.time + 0.35);
        })
        .attr('y', function(d) { 
            return y(d.pathNumber - 0.13);
        })
        .append('xhtml:span')
        .attr('class', 'glyphicon glyphicon-shopping-cart');    
    
        // add legend   
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("x", width - 65)
        .attr("y", 50)
        .attr("height", 100)
        .attr("width", 100)
        .attr('transform', 'translate(-20,50)')    
      
    
    legend.selectAll('rect')
      .data(nodeLabels)
      .enter()
      .append("circle")
      .attr('r', 5)
      .attr("cx", function(d, i){ return 42 +  i *  60;})
      .attr("cy", -45)
      .style("fill", function(d) { return color(d);});
      
    legend.selectAll('text')
      .data(nodeLabels)
      .enter()
      .append("text")
      .style('font-size','10px')
      .attr("x", function(d, i){ return 50 + i *  60;})
      .attr("y", -42)
      .text(function(d) { return d;});

    
    svg.selectAll('.touchNodes')
        .on('mouseover', function(d) {       
            fishBowl.attr('clip-path', null);

            //should be a toggle
            touchNodes.append('text')
                .attr('x', function(d){  return x(d.time);})
                .attr('y', function(d) { return y(d.pathNumber + 0.1);})
                .attr('text-anchor', 'middle')
                .style('font-size','10px')
                .style('fill', 'white')
                .attr('class', 'node-volume')
                .text(function(d) { return (d.volume*100).toFixed(0) + '%';});
            
            svg.append("line")
                .attr("class", "x-axis-drop-line")
                .style("stroke", color(d.label))
                .style("stroke-dasharray", "3,3")
                .style("opacity", 0.5)
                .attr("x1", x(d.time))
                .attr("y1", y(d.pathNumber))
                .attr("x2", x(d.time))
                .attr("y2", y(11));
    

            tooltip.transition()        
                .duration(20)       
                .style('opacity', 0.9);
            tooltip.html('<div><h4>' + d.label +'</h4><p>Avg. Time before purchase: ' + d.time + ' day(s)</p></div>');
    

        })
        .on('mousemove', function(){
            tooltip.style('left', (d3.event.pageX) + 10 + 'px')     
                .style('top', (d3.event.pageY + 20) + 'px');
        })                   
        .on('mouseout', function() {
            fishBowl.attr('clip-path', function(d) { return 'url(#clip' + d.pathNumber + d.time + ')'; });
            
            //touchNodes.selectAll('text').remove();
            svg.selectAll('.node-volume').remove();

            d3.selectAll(".x-axis-drop-line").remove();

            //remove tooltip
            tooltip.transition()        
                        .duration(500)      
                        .style('opacity', 0);
           
        });
        
}

function updatedPathChart(newData) {
    
}