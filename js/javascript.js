/* Size of the grid in pixels*/
const gridWidthPixels = 500;
const gridHeightPixels = 500;

/* Color parameters of the pen stroke in hsl */
let strokeHue;
let strokeSaturation;
/* The following value represents the percentage by 
which each layer of pen decreases the light */
const strokeWeight = 10; // %. In the range [0-100]

let gridWidthElements = 16; // Initial number of grid elements in width
let gridHeightElements = 16; // Initial number of grid elements in height

let elementWidth; // Size of each grid element in pixels: horizontal
let elementHeight; // Size of each grid element in pixels: vertical

let mouseClicked = false; // Mouse initially not clicked

/* Create the pointers to the DOM elements */
const gridContainer = document.querySelector(".grid-container");
const clearButton = document.querySelector("#clean-button");
const colorButton = document.querySelector("#color-button");
const clickListenArray = [
    gridContainer,
    document.querySelector('body')
];

/* Define the grid size */
gridContainer.setAttribute('style', `width:${gridWidthPixels}px;` +
        `height:${gridHeightPixels}px`);

/* Add event listeners */
clearButton.addEventListener('click', restartGrid);
colorButton.addEventListener('click', setColorStroke);
clickListenArray.forEach(element => {
    element.addEventListener('mousedown', mouseDown);
    element.addEventListener('mouseup', mouseUp);
});
window.addEventListener('blur', mouseUp); // Mouse up when window focus lost

/* Draw the grid for the first time */
initializeGrid();

 /* Functions */

/* Draw the grid from the number of elements in
    width and height. Start with white elements */ 
function initializeGrid() {
    setColorStroke();
    elementWidth = computeElementWidth();
    elementHeight = computeElementHeight();
    for (let j=0; j < gridHeightElements; j++) {
        const rowDiv = makeDiv(gridContainer, "row");
        rowDiv.setAttribute('id', `row${j}`);
        for (let i=0; i < gridWidthElements; i++) {
            const gridElementDiv = makeDiv(rowDiv);
            gridElementDiv.setAttribute('id', `r${j}-c${i}`);
        }
    }
}

/* Create divs of two types:
    + rowContainer: hang from grid container and hold a row of grid elements
    + gridElement: hang from a rowContainer */
function makeDiv(parent, divType="element") {
    const div = document.createElement('div');
    if (divType != "element") {
        div.classList.add("row-container");
    } else {
        div.classList.add("grid-element");
        div.setAttribute('style', `width:${elementWidth}px;` +
        `height:${elementHeight}px`);
        div.addEventListener('mouseenter', mouseEnterGridElement);
        div.addEventListener('mousedown', mouseDown);
        div.addEventListener('mouseup', mouseUp);
    }
    parent.appendChild(div);
    return div;
}

/* Compute dimensions of each element taking into account that
    the borders of each element are 1px thick and there are
    two vertically and two horizontally per element */
function computeElementWidth() { // Compute grid element width in pixels
    return gridWidthPixels/gridWidthElements-2;
}
function computeElementHeight() { // Compute grid element height in pixels
    return gridHeightPixels/gridHeightElements-2;
}

/* Erase rowContainers and gridElements*/
function eraseGrid() {
    for (let j=0; j < gridHeightElements; j++) {
        const rowDiv = document.querySelector(`#row${j}`)
        for (let i=0; i < gridWidthElements; i++) {
            const gridElementDiv = document.querySelector(`#r${j}-c${i}`)
            rowDiv.removeChild(gridElementDiv);
        }
        gridContainer.removeChild(rowDiv);
    }
}

/* When the mouse enters a grid element, evaluate if it
    should change its background color */
function mouseEnterGridElement(e) {
    paintElement(this);
}

/* Change background color of a grid element if mouse is clicked */
function paintElement(object) {
    const currentColor = object.style.backgroundColor;
    if (mouseClicked) 
        object.style.backgroundColor = computeColor(currentColor);
}

/* Compute color change of a grid element taking into account
    its current color and the pen stroke parameters */
function computeColor(current) {
    const currentHSL = rgbToHsl(current);
    const hueResult = hueSum(currentHSL);
    const saturationResult = satSum(currentHSL);
    const lightResult = lightSum(currentHSL);
    return `hsl(${hueResult}deg, ${saturationResult}%, ${lightResult}%)`;
}

/* Compute current number of layers on a grid element 
    from its hsl background color parameters */
function layersQuantity(hsl) {
    return Math.round((100-hsl[2])/strokeWeight);
}

/* Make a weighted average by the saturation of each layer. 
    The average is computed in a polar coordinate. */
function hueSum(hsl) {
    if (hsl[1] == 0) {
        /* Return 100% of stroke hue when previous grid element
            background has no saturation (achromatic) */
        return strokeHue;
    }
    if (strokeSaturation == 0) {
        /* Return 100% of previous grid element background hue 
            when stroke has no saturation (achromatic) */
        return hsl[0];
    }
    const w1 = layersQuantity(hsl)*hsl[1];
    const w2 = strokeSaturation;
    let first = Math.min(hsl[0], strokeHue);
    let second = Math.max(hsl[0], strokeHue);
    let wFirst;
    let wSecond;
    /* The average is computed in the smallest angle between the
        two colors */
    if ((second - first) > 180) {
        const temp = second;
        second = first + 360;
        first = temp;
    }
    if (hsl[0] == first%360) {
        wFirst = w1;
        wSecond = w2;
    } else {
        wFirst = w2;
        wSecond = w1;
    }
    return ((wFirst*first + wSecond*second)/(wFirst + wSecond))%360;
}

/* Make a weighted average as per the hue.
    This time it is simpler because it is not in polar coordinate
    and the weight is the quantity of layers */
function satSum(hsl) {
    if (hsl[0] == 0 && hsl[1] == 0 && hsl[2] == 100) {
        /* Return 100% of stroke saturation when previous grid element
            background is white (we consider it as transparent) */
        return strokeSaturation;
    }
    const w1 = layersQuantity(hsl);
    const w2 = 1;
    return (w1*hsl[1] + w2*strokeSaturation)/(w1 + w2);
}

/* Reduce the light by one stroke weight.
    The value return cannot be smaller than 0. */
function lightSum(hsl) {
    return Math.max(hsl[2] - strokeWeight, 0);
}

/* Convert a string containing rgb values
    of a color into hsl numeric array */
function rgbToHsl(rgbStr) {
    if (!rgbStr) return[0, 0, 100] // If empty, return white
    let [r, g, b] = rgbStrToArray(rgbStr);
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.floor(h * 360)%360, Math.floor(s * 100), Math.floor(l * 100)];
}

/* Convert the string returned by object.style.backgroundColor
    method, into a numeric array containing the three
    values of red, green, blue defining the color */
function rgbStrToArray(rgbStr) {
    let rgbArray = rgbStr.slice(4, -1).split(", ");
    rgbArray = rgbArray.map(x => parseInt(x));
    return rgbArray;
}

/* Ask the user the grid size, erase old grid and
    build a new white grid*/
function restartGrid() {
    let n = askSize();
    if (n == 0) return;
    eraseGrid();
    gridWidthElements = n;
    gridHeightElements = n;
    initializeGrid();
}

/* Ask the user the grid size */
function askSize() {
    let answer = Number(prompt("Enter the grid size (1 to 100)", "16"));
    answer = Math.round(answer);
    return answer > 0 && answer <= 100 && !isNaN(answer) && answer;
}

/* Toggle mouseClicked to true.
    Paint the element if the event
    is triggered from a grid element */
function mouseDown(e) {
    /* Avoid triggering the event from the
        grid element parents' event listeners
        (grid container, body) */ 
    e.stopPropagation();
    mouseClicked = true;
    if (this.getAttribute("class") == "grid-element") paintElement(this);
}

/* Toggle mouseClicked to false */
function mouseUp(e) {
    mouseClicked = false;
}

/* Set stroke parameters in terms of HSL.
    Hue and Saturation are fixed randomly.
    Light is the general constant parameter strokeWeight.
    Set colorButton background accirdingly. */
function setColorStroke() {
    strokeHue = Math.floor(Math.random()*359);
    strokeSaturation = Math.floor(Math.random()*100);
    /* Put a light of 50 % for the button background in order
    to give a better understanding of the color after several strokes */
    const colorStroke = `hsl(${strokeHue}deg, ${strokeSaturation}%, ${50}%)`;
    colorButton.style.backgroundColor = colorStroke;
}