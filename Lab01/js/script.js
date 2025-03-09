console.log('D3 Version: ', d3.version);
const width = 600;
const height = 400;
const r = 50; // radius

const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width)
    .attr('height', height);


// Draw a small circle
svg.append('circle')
    //center of the circle
    .attr('cx', 0.25*width)
    .attr('cy', 0.5*height)
    // radius of the circle
    .attr('r', r)
    .attr('stroke', 'black')
    // color of the circle
    .style('fill', 'steelblue');

svg.append('circle')
    //center of the circle
    .attr('cx', 0.5*width)
    .attr('cy', 0.5*height)
    // radius of the circle
    .attr('r', r)
    .attr('stroke', 'black')
    // color of the circle
    .style('fill', 'green');

svg.append('circle')
    //center of the circle
    .attr('cx', 0.75*width)
    .attr('cy', 0.5*height)
    // radius of the circle
    .attr('r', r)
    .attr('stroke', 'black')
    // color of the circle
    .style('fill', 'darkred');
    

// rectangle
svg.append('rect')
    .attr('x', 0.5*width-30) // x-coordinate
    .attr('y', 100) // y-coordinate
    .attr('width', 60) // width of rect
    .attr('height', 20) // height of rect
    .attr('stroke', 'black')
    .style('fill', 'green');

svg.append('line')
    .attr('x1', 10)
    .attr('y1', 10)
    .attr('x2', 900)
    .attr('y2', 100)
    .attr('stroke', 'blue') // color of the line
