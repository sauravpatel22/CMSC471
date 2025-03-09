// Verify script is working
console.log('Script loaded successfully!');
/* Why: Immediate feedback in console */

// Select HTML element
const heading = document.querySelector('h1');
/* Why: Gets reference to h1 tag */

// Add interactive behavior
heading.style.cursor = 'pointer';
/* Why: Shows element is clickable */

// Event listener
heading.addEventListener('click', function() {
    this.style.color = getRandomColor();
});
/* Why: Makes heading change color when clicked */

// Check D3.js
console.log('D3 Version:', d3?.version || 'D3 not loaded');
/* Why: Confirms D3 library is available */

// Helper function
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function validateInput() {
    let x = document.getElementById("val").value;
    let text;
    if (isNaN(x) || x < 1 || x > 100) {
        text = "Input not valid";
    } else {
        text = "Input OK";
    }
    document.getElementById("demo").innerHTML = text;
}
/* Why: Creates random color for interaction */