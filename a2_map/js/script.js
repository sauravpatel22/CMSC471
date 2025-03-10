// Global: Dropdown menu options
const settingOptions = ['ALL CRIMES', 'ABANDONED BUILDING', 'AIRCRAFT', 'AIRPORT BUILDING NON-TERMINAL - NON-SECURE AREA',
    'AIRPORT BUILDING NON-TERMINAL - SECURE AREA', 'AIRPORT EXTERIOR - NON-SECURE AREA', 'AIRPORT EXTERIOR - SECURE AREA',
    'AIRPORT PARKING LOT', 'AIRPORT TERMINAL LOWER LEVEL - NON-SECURE AREA', 'AIRPORT TERMINAL LOWER LEVEL - SECURE AREA',
    'AIRPORT TERMINAL MEZZANINE - NON-SECURE AREA', 'AIRPORT TERMINAL UPPER LEVEL - NON-SECURE AREA',
    'AIRPORT TERMINAL UPPER LEVEL - SECURE AREA', 'AIRPORT TRANSPORTATION SYSTEM (ATS)', 'AIRPORT VENDING ESTABLISHMENT',
    'ALLEY', 'ANIMAL HOSPITAL', 'APARTMENT', 'APPLIANCE STORE', 'ATHLETIC CLUB', 'ATM (AUTOMATIC TELLER MACHINE)',
    'AUTO', 'AUTO / BOAT / RV DEALERSHIP', 'BANK', 'BARBERSHOP', 'BARBER SHOP/BEAUTY SALON', 'BAR OR TAVERN', 'BASEMENT',
    'BOAT / WATERCRAFT', 'BOWLING ALLEY', 'BRIDGE', 'CAR WASH', 'CASINO/GAMBLING ESTABLISHMENT', 'CEMETARY', 'CHA APARTMENT',
    'CHA GROUNDS', 'CHA HALLWAY', 'CHA HALLWAY / STAIRWELL / ELEVATOR', 'CHA PARKING LOT / GROUNDS',
    'CHURCH / SYNAGOGUE / PLACE OF WORSHIP', 'CLEANING STORE', 'COIN OPERATED MACHINE', 'COLLEGE / UNIVERSITY - GROUNDS',
    'COLLEGE / UNIVERSITY - RESIDENCE HALL', 'COMMERCIAL / BUSINESS OFFICE', 'CONSTRUCTION SITE', 'CONVENIENCE STORE',
    'CREDIT UNION', 'CTA BUS', 'CTA BUS STOP', 'CTA "L" TRAIN', 'CTA PARKING LOT / GARAGE / OTHER PROPERTY',
    'CTA PLATFORM', 'CTA PROPERTY', 'CTA STATION', 'CTA TRACKS - RIGHT OF WAY', 'CTA TRAIN', 'CURRENCY EXCHANGE',
    'DAY CARE CENTER', 'DEPARTMENT STORE', 'DRIVEWAY', 'DRIVEWAY - RESIDENTIAL', 'DRUG STORE',
    'FACTORY / MANUFACTURING BUILDING', 'FARM', 'FEDERAL BUILDING', 'FIRE STATION', 'FOREST PRESERVE', 'GANGWAY',
    'GARAGE', 'GAS STATION', 'GOVERNMENT BUILDING / PROPERTY', 'GROCERY FOOD STORE', 'HALLWAY', 'HIGHWAY / EXPRESSWAY',
    'HOSPITAL', 'HOSPITAL BUILDING / GROUNDS', 'HOTEL / MOTEL', 'HOUSE', 'JAIL / LOCK-UP FACILITY', 'KENNEL',
    'LAKEFRONT / WATERFRONT / RIVERBANK', 'LIBRARY', 'LIQUOR STORE', 'MEDICAL / DENTAL OFFICE', 'MOVIE HOUSE / THEATER',
    'NEWSSTAND', 'NURSING / RETIREMENT HOME', 'OFFICE', 'OTHER COMMERCIAL TRANSPORTATION', 'OTHER RAILROAD PROPERTY / TRAIN DEPOT',
    'OTHER (SPECIFY)', 'PARKING LOT', 'PARKING LOT / GARAGE (NON RESIDENTIAL)', 'PARK PROPERTY', 'PAWN SHOP',
    'POLICE FACILITY / VEHICLE PARKING LOT', 'POOL ROOM', 'PORCH', 'RAILROAD PROPERTY', 'RESIDENCE'];

const distTypeOptions = ['Crimes in District', 'Crimes in Setting'];

// Global variables for data storage
let geoData, crimeCounts; 

// sets up what I first see when loading the page
function setupSelector() {
    const settingDropdown = d3.select("#settingDropdown"); // variable to know what dropdown we selected
    settingDropdown.selectAll('option')
        .data(settingOptions)
        .enter().append('option')
        .text(d => d)
        .attr("value", d => d); // map to CSV directly to keep it simple

    settingDropdown.property('value', settingOptions[0]); // Initial is just 'ALL CRIMES'

    // Explicitly log dropdown changes
    settingDropdown.on("change", function () {
        let selectedSetting = d3.select("#settingDropdown").property("value");
        console.log(`Dropdown changed to: ${selectedSetting}`); // debugging
        updateMap(); // update the map so no reloading ... done every time we change a drop down option
    });
}

// Load GeoJSON and Crime Counts CSV
Promise.all([
    d3.json("data/Police_districts.geojson"), // map of chicago
    d3.csv("data/Crime_Counts.csv") // data about crimes in chicago from database
]).then(([loadedGeoData, crimeCountsData]) => {

    geoData = loadedGeoData; // variable that holds this map info
    crimeCounts = {}; // acts as a map

    // Get column names from CSV (excluding 'District')
    let csvHeaders = crimeCountsData.columns.slice(1); // Skip 'District' column

    crimeCountsData.forEach(d => {
        let districtNum = +d.District; // Convert district to number
        if (!crimeCounts[districtNum]) {
            crimeCounts[districtNum] = {}; // Initialize district entry
        }

        csvHeaders.forEach(column => {
            crimeCounts[districtNum][column] = +d[column] || 0; // Store using CSV headers directly
        });

        // Assign "ALL CRIMES" to use "Total Crimes"
        crimeCounts[districtNum]["ALL CRIMES"] = +d["Total Crimes"] || 0;
    });

    console.log("Crime Data Loaded:", crimeCounts); // Debugging to make sure data is loaded

    drawMap(); // Draw the map initially
    updateMap(); // Update it when changed option
}).catch(error => console.error("Error loading data:", error));



// Function to Draw the Map
function drawMap() {
    // Standard margins
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // SVG settings and attributes from here and css file
    let svg = d3.select("#map")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .select("g");

        // CHAT GENERATED BECAUSE SVG WASNT LOADING FOR SOME REASON
        if (svg.empty()) {
            svg = d3.select("#map").append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
        }
    
    // Make sure that the map actually fits inside our SVG
    const projection = d3.geoMercator()
        .fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);
    
    // Debugging
    console.log("Crime Counts Before Coloring:", crimeCounts);

    // Get selected crime type from dropdown (uses exact CSV column names)
    let selectedSetting = d3.select("#settingDropdown").property("value");

    // Find the maximum crime count
    let maxCrimeCount = d3.max(Object.values(crimeCounts), d => d[selectedSetting] || 0) || 1;

    // Remove old map paths
    svg.selectAll("path").remove();

    svg.selectAll("path")
    .data(geoData.features)
    .enter().append("path")
    .attr("class", "district")
    .attr("d", path)
    .attr("stroke", "black")
    .attr("fill", d => {
        let districtNumber = +d.properties.dist_num;
        let selectedSetting = d3.select("#settingDropdown").property("value"); // Get latest dropdown selection
        let crimeCount = crimeCounts[districtNumber]?.[selectedSetting] || 0;

        // Here we calculate a heat map on red based on dynammic approach
        let maxCrimeCount = d3.max(Object.values(crimeCounts), d => d[selectedSetting] || 0) || 1;
        let intensity = Math.round((255 * crimeCount) / maxCrimeCount);
        let r = 255;
        let g = 255 - intensity;
        let b = 255 - intensity;

        return `rgb(${r}, ${g}, ${b})`;
    })

    // Fix Tooltip to Use Correct Selected Dropdown Option
    // Mouse over highlights it to orange 
    .on("mouseover", function (event, d) {
        let districtNumber = +d.properties.dist_num;
        let selectedSetting = d3.select("#settingDropdown").property("value"); // ✅ Get latest dropdown selection
        let crimeCount = crimeCounts[districtNumber]?.[selectedSetting] || 0;
        let totalCrimes = crimeCounts[districtNumber]?.["Total Crimes"] || 0;

        console.log(`Tooltip - District ${districtNumber}: ${selectedSetting} Crimes = ${crimeCount}`);

        d3.select(".tooltip")
            .style("visibility", "visible")
            .html(`<strong>District ${districtNumber}</strong><br><strong>${selectedSetting} Crimes:</strong> ${crimeCount}<br><strong>Total Crimes:</strong> ${totalCrimes}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    // Some more event listeners 
    .on("mousemove", function (event) {
        d3.select(".tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function () {
        d3.select(".tooltip").style("visibility", "hidden");
    });

    console.log("Map initialized with crime data.");
}


// Function to Update Map Based on Dropdown Selection
function updateMap() {
    let selectedSetting = d3.select("#settingDropdown").property("value");

    console.log(`Filtering by: ${selectedSetting}`);

    // Find the maximum crime count dynamically
    let maxCrimeCount = d3.max(Object.values(crimeCounts), d => d[selectedSetting] || 0) || 1;

    console.log(`Max ${selectedSetting} Crimes: ${maxCrimeCount}`);

    let districtSelection = d3.selectAll(".district");

    // Debugging for my purposes
    if (districtSelection.empty()) {
        console.error("Error: No .district elements found. Ensure the map is drawn first.");
        return;
    }

    // fill this in with UPDATED results from the heat map using the same dynamic approach 
    districtSelection.transition()
        .duration(500)
        .attr("fill", function(d) {
            let districtNumber = +d.properties.dist_num;
            let crimeCount = crimeCounts[districtNumber]?.[selectedSetting] || 0;

            // ✅ Apply Red Color Scale (Higher Crime = Darker Red)
            let intensity = Math.round((255 * crimeCount) / maxCrimeCount);
            let r = 255;
            let g = 255 - intensity;
            let b = 255 - intensity;

            console.log(`District ${districtNumber}: Crime ${crimeCount} -> Color rgb(${r},${g},${b})`);

            return `rgb(${r}, ${g}, ${b})`;
        });
}


// Initialize dropdowns
setupSelector();
