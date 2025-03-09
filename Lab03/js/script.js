/*
┌────────────── SVG Container ────────────────┐
│                  ↕ margin.top               │
│         ┌─────── Chart Area ───────┐        │
│    ←→   │                          │   ←→   │
│  margin │                          │ margin │
│   left  │                          │ right  │
│         └──────────────────────────┘        │
│                 ↕ margin.bottom             │
└─────────────────────────────────────────────┘
*/
// The margin code above
const margin = {top: 40, right: 40, bottom: 40, left: 60};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select('#vis') // vis is located as a tag in HTML too but also mainly in css 
    .append('svg')
    .attr('width', width + margin.left + margin.right) // width of the chart plus margins
    .attr('height', height + margin.top + margin.bottom) // height of the chart plus margins 
    /*  
        Below is a group element inside the SVG
        .attr('transform', 'translate(...)') moves the entire chart inside the group to respect the margins.
        the line below is necessary because it allows for correct positioning of bars with the margins and not
        at the true (0,0) coordinate which can cause bars to overlap ... ask more about this to the TA
    */ 
    .append('g') 
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Create scales
  const xScale = d3.scaleLinear() // a numeric / quantative scale
    .domain([0, 100]) // prefined data range
    .range([0, width]);

  const yScale = d3.scaleLinear()
  .domain([0, 100]) // prefined data range
  .range([height, 0]);

// Scale for x-axis
const xAxis = d3.axisBottom(xScale); // 
svg.append('g')
   .attr('transform', `translate(0,${height})`)
   .call(xAxis);

// Scale for y-axis
const yAxis = d3.axisLeft(yScale)
    .tickValues([0, 20, 40, 60, 80, 100]); // Explicitly setting tick values


svg.append('g')
       .attr('class', 'y-axis')
       .call(yAxis);
// Adding the x-axis label
svg.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .style('text-anchor', 'middle')
    .text('College Graduates');
// Adding y-axis label
svg.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 15)
    .style('text-anchor', 'middle')
    .text('Income (in $1000 dollars)');
// Loading the data
let currentData = []; // global variable

d3.json('data/data.json')
    //callback function
    .then(data => {
        console.log(data)
        currentData = data.points
        updateVis()
    })
    .catch(error => console.error('Error loading data:', error))

// function to update and use the scatterplot 
// determines which button/function should be used
function updateVis(){
    // To make sure we can manipulate circles, we need to select all .point elements. 
    // And thus, all circles created should have this class name (see below).
    svg.selectAll('.point')
    // using the global variable
    .data(currentData)
    .join(
        function(enter){
            return  enter
            .append('circle')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 5)
            .style('fill', d => d.color)
            // Important. All new circles should be associated with the point class
            .attr('class', 'point')
         },
        // We know we want to changes their coordinates
        function(update){
            return  update
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
         }, 
        // We know we want to remove an element if its associated data point is removed
        function(exit){
            return  exit.remove()
         }
    )
}
function addRandomPoint() {
    // make it easier for debugging
    console.log('add point');
    const newPoint = {
        x: Math.random() * 100, // Generate a number between 0 - 100
        y: Math.random() * 100, // Generate a number between 0 - 100
        color: 'red'
    };

    currentData.push(newPoint);
    // call to update visualization
    updateVis();
}
function removeRandomPoint() {
    // make it easier for debugging
    console.log('remove point')
    currentData.pop();
    // call to update visualization
    updateVis();
}
function updateRandomPoints() {
    // make it easier for debugging
    console.log('update points')
    currentData = currentData.map(d => ({
        id: currentData.length + 1,
        x: d.x + (Math.random() * 10 - 5), // Move x slightly within ±5
        y: d.y + (Math.random() * 10 - 5)  // Move y slightly within ±5
    }));

    // call to update visualization
    updateVis();
}