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

// Sample data with object structure
const data = [
    {count: 10, category: 'Apple'},
    {count: 30, category: 'Banana'},
    {count: 45, category: 'Pear'},
    {count: 60, category: 'Orange'},
    {count: 20, category: 'Grape'}
];

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

/*
    Now we create something called a scale (in both axes) so that we can have maintainability. Scales are like
    functions that take an input (our data) and output some length representing the visualization, so 
    basically a range of pixels based on our input data

    Data index:  0   1   2   3   4
            ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐
            │ │ │ │ │ │ │ │ │ │  ← Bars
            └─┘ └─┘ └─┘ └─┘ └─┘
            ←→  ←→   Padding
*/
const xScale = d3.scaleBand() // Creates equal-width bands for categorical data
    .domain(data.map(d => d.category)) // Use category field from the new dataset...Sets input values (0 to data.length-1)
    .range([0, width]) // Sets output range (0 to width in pixels)
    .padding(0.2) // Adds space between bars (0.2 = 20% of band width)

/*
    The SVG coordinates for the Y-Axis is inverted because SVG coordinates increase downward
    and we want taller bars to go up, so inverting the scale makes higher values appear higher on screen
*/
const yScale = d3.scaleLinear() // Creates a continuous linear mapping
    .domain([0, d3.max(data, d => d.count)]) // Sets input range (0 to max data value)
    .range([height, 0]);  // Inverted for SVG coordinates, sets output range (height to 0 pixels)

// Color map for each bar - an object
// https://codepen.io/bagaski/full/RwKvybw --> For colors
const colorMap = {
    Apple: "tomato",
    Banana: "gold",
    Pear: "lightgreen",
    Orange: "darkorange",
    Grape: "palevioletred"
};

// Drawing Bars
svg.selectAll('rect')                              // Select all rectangles (none exist yet so they are placeholders)
    .data(data)                                    // Bind data array to selection
    .enter()                                       // Get 'enter' selection for new elements
    .append('rect')                                // Add rectangle for each data point
    .attr('class', 'bar')                          // Add CSS class for styling
    .attr('x', d => xScale(d.category))            // X position from band scale - object oriented version
    .attr('y', d => yScale(d.count))               // Y position from linear scale - object oriented version
    .attr('width', xScale.bandwidth())             // Width from band scale, a fixed number
    .attr('height', d => height - yScale(d.count)) // Height calculation - object oriented
    .style('fill', d => colorMap[d.category]);     // Assign color based on category

/*
    PART 2: CREATING X and Y AXIS 
    input scale:  [0, 1, 2, 3, 4]
    output:       ┴─────┴─────┴─────┴─────┴
                  0     1     2     3     4
    BEFORE TRANSLATION:
    0     1     2     3     4
    ┴─────┴─────┴─────┴─────┴
            at y=0
    AFTER TRANSLATION:
    ┌──────────────────────┐  
    │                      │   
    │      Chart Area      │ 
    │                      │ 
    └──────────────────────┘    
    0    1    2    3    4
    ┴────┴────┴────┴────┴
        at y=height
*/
// Scale for x-axis
const xAxis = d3.axisBottom(xScale); // 
svg.append('g')
   .attr('transform', `translate(0,${height})`)
   .call(xAxis);

// Scale for y-axis
// const yAxis = d3.axisLeft(yScale); --> this is the default
const yAxis = d3.axisLeft(yScale)
    .tickValues(d3.range(0, d3.max(data, d => d.count) + 10, 10)) // Explicitly set tick values
    .tickFormat(d3.format("d")) // Ensure numbers are displayed properly

// Append Y-axis Grid Lines
svg.append('g')
    .attr('class', 'grid')
    .selectAll('line')
    .data(d3.range(0, d3.max(data, d => d.count) + 10, 10)) // Use same tick values
    .enter()
    .append('line')
    .filter(d => d !== 0) // Exclude the baseline (y=0)
    .attr('x1', 0) // Start from left
    .attr('x2', width) // Extend to right
    .attr('y1', d => yScale(d)) // Align with Y-axis ticks
    .attr('y2', d => yScale(d)) // Make it horizontal
    .attr('stroke', '#ccc') // Light gray
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '4 4'); // Dashed grid lines

svg.append('g')
       .attr('class', 'y-axis')
       .call(yAxis);

// Adding the x-axis label
svg.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .style('text-anchor', 'middle')
    .text('fruit');
// Adding y-axis label
svg.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 15)
    .style('text-anchor', 'middle')
    .text('count');