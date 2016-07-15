function renderPathChart(chartData) {

    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var config = {
        chartId: '#p2pChart',
        margin: margin
    };


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

    var svg = d3.select(config.chartId + ' svg')
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
    
    color.domain(nodeLabels);

  
    x.domain([29, 0]);
    y.domain([11, 0]);
    

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);


    var purchasePaths = svg.selectAll('.node')
        .data(chartData)
        .enter().append('g')
        .attr('class', 'node');

    purchasePaths.append('path')
        .attr('class', 'line')
        .attr('d', function(d) { 
            return line(d.nodes); 
        })
        .style('stroke', function(d) { 
            return color(d.name); 
        });

    

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

    //update

    //exit  
    // touchNodes.exit().remove(); 

    var nodeCircles = nodes.append('circle')
        .attr('r', 15)
        .attr('stroke',function (d) { return (d.time) ? color(d.label) : '#D3D3D3';})
        .style('fill', function(d) { return (d.time) ? 'white' : '#D3D3D3'; })
        .attr('cx', function(d) { return x(d.time); })
        .attr('cy', function(d) { return y(d.pathNumber);});

    


    //water fill circle
    var fishBowl = touchNodes.append('circle')
        .attr('r',15)
        .style('fill', function(d) {return color(d.label); })
        .attr('cx', function(d) { return x(d.time); })
        .attr('cy', function(d) { return y(d.pathNumber);})
        .attr('clip-path', function(d) { return 'url(#clip' + d.pathNumber + d.time + ')'; });
    
    nodeCircles.append('text')
        .attr('x', function(d){return x(d.time+0.35);})
        .attr('y', function(d) { return y(d.pathNumber - 0.13);})
        .style('font-size','11px')
        .style('fill', 'red')
        .text(function(d){ return d.label + '%';});


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
    
    
    svg.selectAll('circle').on('mouseover', function(d) {       
            fishBowl.attr('clip-path', null);

            //should be a toggle
            touchNodes.append('text')
                .attr('x', function(d){  return x(d.time);})
                .attr('y', function(d) { return y(d.pathNumber + 0.1);})
                .attr('text-anchor', 'middle')
                .style('font-size','11px')
                .style('fill', 'white')
                .text(function(d) {
                   return d.volume*100 + '%';
                });

            })
                             
        .on('mouseout', function() {
            fishBowl.attr('clip-path', function(d) { return 'url(#clip' + d.pathNumber + d.time + ')'; });
            
            //touchNodes.selectAll('text').remove();
            svg.selectAll('text').remove();

           
        });
        
}

function updatedPathChart(newData) {
    
}