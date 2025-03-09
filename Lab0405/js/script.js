// Global Variables
let allData = []
let xVar = 'income', yVar = 'lifeExp', sizeVar = 'population', targetYear = 2000
let xScale, yScale, sizeScale
// Global variable for continental color scheme
const continents = ['Africa', 'Asia', 'Oceania', 'Americas', 'Europe']
const colorScale = d3.scaleOrdinal(continents, d3.schemeSet2); // d3.schemeSet2 is a set of predefined colors. 
// Dropdown globals
const options = ['Income', 'Life Expectancy', 'GDP', 'Population', 'Child Deaths'];
// Variable Map 
const variableMap = {
    'Income': 'income',
    'Life Expectancy': 'lifeExp',
    'GDP': 'gdp',
    'Population': 'population',
    'Child Deaths': 'childDeaths'
};

// Animation global
const t = 1000; // 1000ms  = 1 second

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
// set margin
const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

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

function init(){
    d3.csv("./data/gapminder_subset.csv", 
    // this is the callback function, applied to each item in the array
    function(d){
        return {  
        // Besides converting the types, we also simpilify the variable names here. 
        country: d.country,
        continent: d.continent,
        year: +d.year, // using + to convert to numbers; same below
        lifeExp: +d.life_expectancy, 
        income: +d.income_per_person, 
        gdp: +d.gdp_per_capita, 
        childDeaths: +d.number_of_child_deaths,
        // Your turn: 
        population: +d.population // Convert population to a number
     }
    })
    .then(data => {
            console.log(data) // Check the structure in the console
            allData = data // Save the processed data

            updateAxes(); // xScale, yScale, and sizeScale are properly set
            addLegend();
            setupSelector();
            updateVis();  //Bubbles have correct positions
            // placeholder for building vis
            // placeholder for adding listerners
        })
    .catch(error => console.error('Error loading data:', error));
}

window.addEventListener('load', init);

// Handles UI changes (sliders, dropdowns)
// Anytime the user tweaks something, this function reacts.
// May need to call updateAxes() and updateVis() here when needed!
function setupSelector(){
    let sliderWidth = Math.min(width, 600); // Ensure slider fits within a max width

    let slider = d3
        .sliderHorizontal()
        .min(d3.min(allData.map(d => +d.year))) // setup the range
        .max(d3.max(allData.map(d => +d.year))) // setup the range
        .step(1)
        .tickFormat(d3.format("d")) // This removes commas
        .value(targetYear)
        .width(sliderWidth - 100) // Ensure the slider fits within bounds -- widened
        .displayValue(false)
        .on('onchange', (val) => {
            targetYear = +val // Update the year
            updateVis() // Refresh the chart
        });

    d3.select('#slider')
        .append('svg')
        .attr('width', sliderWidth + 50)  // Increase width slightly to prevent cut-off
        .attr('height', 80)
        .append('g')
        .attr('transform', 'translate(50,40)') // This controls where the slider is placed
        .call(slider);
        d3.selectAll('.variable')
        // loop over each dropdown button
         .each(function() {
             d3.select(this).selectAll('myOptions')
             .data(options)
             .enter()
             .append('option')
             .text(d => d) // The displayed text
             .attr("value",d => variableMap[d]) // The actual value used in the code
        })

        // Dropdown menu options from globals defined above
        d3.select('#xVariable').property('value', xVar)
        d3.select('#yVariable').property('value', yVar)
        d3.select('#sizeVariable').property('value', sizeVar)

        d3.selectAll('.variable')
        .each(function() {
            d3.select(this)
                .selectAll('option')
                .data(options) // Use the predefined global `options` array
                .enter()
                .append('option')
                .text(d => d) // Displayed text in dropdown
                .attr("value", d => d); // Actual value used in the code
        })
        .on("change", function (event) {
            // Identify which dropdown was changed
            let selectedId = d3.select(this).property("id"); // Get dropdown ID (xVariable, yVariable, sizeVariable)
            let selectedValue = d3.select(this).property("value"); // Get selected value

            console.log(selectedId, selectedValue); // Debugging: logs which dropdown changed and the selected value

            // Map dropdown to corresponding global variable
            if (selectedId === "xVariable") {
                xVar = selectedValue; // Update xVar with the selected value
            } else if (selectedId === "yVariable") {
                yVar = selectedValue; // Update yVar with the selected value
            } else if (selectedId === "sizeVariable") {
                sizeVar = selectedValue; // Update sizeVar with the selected value
            }

            // Update chart
            updateAxes(); // Adjust axis scales and labels
            updateVis();  // Redraw visualization with new variable selections
        });
}

// Draws the x-axis and y-axis
// Adds ticks, labels, and makes sure everything lines up nicely
function updateAxes(){
    // this helps us avoid the issue where multiple axes are drawn
    svg.selectAll('.axis').remove()
    svg.selectAll('.labels').remove()
    // X and Y Axes
    xScale = d3.scaleLinear()
    .domain([0, d3.max(allData, d => d[xVar])]) // The part where its flexible based on our data
    .range([0, width]);
    const xAxis = d3.axisBottom(xScale)

    svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`) // Position at the bottom
    .call(xAxis);

    // Create the y-scale
    yScale = d3.scaleLinear()
    .domain([0, d3.max(allData, d => d[yVar])]) // Set domain based on data
    .range([height, 0]); // Invert range: higher values go up

    // Create the y-axis
    const yAxis = d3.axisLeft(yScale); // Use axisLeft for vertical axis

    // Axes labels
    // X-axis label
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 20)
    .attr("text-anchor", "middle")
    .text(Object.keys(variableMap).find(key => variableMap[key] === xVar)) // Convert back to label
    .attr('class', 'labels')

    // Y-axis label (rotated)
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 40)
    .attr("text-anchor", "middle")
    .text(Object.keys(variableMap).find(key => variableMap[key] === yVar)) // Displays the current y-axis variable
    .attr('class', 'labels')

    // Append y-axis to SVG
    svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,0)`) // Position at the left
    .call(yAxis);

    // Bubbles
    sizeScale = d3.scaleSqrt()
    .domain([0, d3.max(allData, d => d[sizeVar])]) // Largest bubble = largest data point 
    .range([5, 20]); // Size of bubbles
}

// Draws (or updates) the bubbles
function updateVis(){
    let currentData = allData.filter(d => d.year === targetYear)
    svg.selectAll('.points')
    .data(currentData, d => d.country)
    .join(
        // When we have new data points
        function(enter){
            return enter
            .append('circle')
            .attr('class', 'points')
            .attr('cx', d => xScale(d[xVar])) // Position on x-axis
            .attr('cy', d => yScale(d[yVar])) // Position on y-axis
            .attr('r',  d => sizeScale(d[sizeVar])) // Bubble size
            // Apply continent colors
            .style('fill', d => colorScale(d.continent))
            .style('opacity', .5) // Slight transparency for better visibility
            //transition stuff
            .attr('r', 0) // before transition r = 0
            // Tooltip
            // Tooltip on hover
            .on('mouseover', function (event, d) {
                // Highlight effect on hover
                d3.select(this)
                    .style('stroke', 'black') // Black border
                    .style('stroke-width', '4px');

                // Show tooltip
                d3.select('#tooltip')
                    .style("display", 'block')
                    .html(
                        `<strong>${d.country}</strong><br/>
                        Continent: ${d.continent}<br/>
                        ${xVar}: ${d3.format(",")(d[xVar])}<br/>
                        ${yVar}: ${d3.format(",")(d[yVar])}<br/>
                        ${sizeVar}: ${d3.format(",")(d[sizeVar])}`
                    )
                    .style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                // Remove highlight effect
                d3.select(this)
                    .style('stroke', 'none');

                // Hide tooltip
                d3.select('#tooltip')
                    .style('display', 'none');
            })
            .transition(t) // Animate the transition
            .attr('r', d => sizeScale(d[sizeVar])) // Expand to target size
        },
        // Update existing points when data changes
        function(update){
            return update
            // Smoothly move to new positions/sizes
            .transition(t)
            .attr('cx', d => xScale(d[xVar]))
            .attr('cy', d => yScale(d[yVar]))
            .attr('r',  d => sizeScale(d[sizeVar]))
        },
        // Remove points that no longer exist in the filtered data 
        function(exit){
            exit
            .transition(t)
            .attr('r', 0)  // Shrink to radius 0
            .remove()
        }
    )
}

// Adds a legend so users can decode colors
function addLegend() {
    let size = 10;  // Size of the legend squares

    // Create legend squares
    svg.selectAll('continentSquare')
        .data(continents) // Use the global "continents" array
        .enter()
        .append('rect')
        .attr("x", (d, i) => i * (size + 100) + 100) // Position horizontally
        .attr("y", -margin.top / 2) // Position above the chart
        .attr("width", size) // Square width
        .attr("height", size) // Square height
        .style("fill", d => colorScale(d)); // Fill with corresponding continent color

    // Add labels next to squares
    svg.selectAll("continentName")
        .data(continents)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * (size + 100) + 120) // Position slightly right of square
        .attr("y", -margin.top / 2 + size) // Align vertically with the square
        .style("fill", d => colorScale(d))  // Match text color to the square
        .text(d => d) // The actual continent name
        .attr("text-anchor", "left")
        .style('font-size', '13px');
}
