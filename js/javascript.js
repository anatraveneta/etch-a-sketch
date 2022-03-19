/* Basic Parameters */
const gridWidthPixels = 500;
const gridHeightPixels = 500;

let strokeHue;
let strokeSat;
const strokeWeight = 10;
let colorStroke;

let gridWidthElements = 16; // Number of pixels in width
let gridHeightElements = 16; // Number of pixels in height

let elementWidth;
let elementHeight;

let mouseClicked = false;


const gridContainer = document.querySelector(".grid-container");
const clearButton = document.querySelector("#clean-button");
const colorButton = document.querySelector("#color-button");
const clickListenArray = [
    gridContainer,
    document.querySelector('body')
];

gridContainer.setAttribute('style', `width:${gridWidthPixels}px;` +
        `height:${gridHeightPixels}px`);

clearButton.addEventListener('click', restartGrid);
colorButton.addEventListener('click', setColorStroke);

clickListenArray.forEach(element => {
    element.addEventListener('mousedown', mouseDown);
    element.addEventListener('mouseup', mouseUp);
});


initializeGrid();



 /* Functions */
function initializeGrid() {
    setColorStroke();
    elementWidth = computeElementWidth();
    elementHeight = computeElementHeight();
    for (let j=0; j < gridHeightElements; j++) {
        const rowDiv = makeDiv(gridContainer, "row");
        let parent = rowDiv;
        rowDiv.setAttribute('id', `row${j}`);
        for (let i=0; i < gridWidthElements; i++) {
            const pixelDiv = makeDiv(parent);
            pixelDiv.setAttribute('id', `r${j}-c${i}`);
        }
    }
}

function makeDiv(parent, divType="element") {
    const div = document.createElement('div');
    if (divType != "element") {
        div.classList.add("row-container");
    } else {
        div.classList.add("pixel");
        div.setAttribute('style', `width:${elementWidth}px;` +
        `height:${elementHeight}px`);
        div.addEventListener('mouseenter', mouseEnterPixel);
        div.addEventListener('mousedown', mouseDown);
        div.addEventListener('mouseup', mouseUp);
    }
    parent.appendChild(div);
    return div;
}

/* Compute dimensions of each element taking into account that
    the borders of each element are 1px thick and there are
    two vertically and two horizontally per element */
function computeElementWidth() {
    return gridWidthPixels/gridWidthElements-2;
}

function computeElementHeight() {
    return gridHeightPixels/gridHeightElements-2;
}

function eraseGrid() {
    for (let j=0; j < gridHeightElements; j++) {
        const rowDiv = document.querySelector(`#row${j}`)
        let parent = rowDiv;
        for (let i=0; i < gridWidthElements; i++) {
            const pixelDiv = document.querySelector(`#r${j}-c${i}`)
            parent.removeChild(pixelDiv);
        }
        parent = gridContainer;
        parent.removeChild(rowDiv);
    }
}

function mouseEnterPixel(e) {
    paintElement(this);
}

function paintElement(object) {
    const pattern = /^r[0-9]+-c[0-9]+$/;
    const idText = object.id;
    if (pattern.test(idText) && mouseClicked) {
        const pixel = document.querySelector(`#${idText}`);
        const currentColor = pixel.style.backgroundColor;
        pixel.style.backgroundColor = computeColor(currentColor);
    }
}

function computeColor(current) {
    const currentHSL = rgbToHsl(current);
    const strokeHSL = [strokeHue, strokeSat, strokeWeight];
    const hueRes = hueSum(currentHSL, strokeHSL);
    const satRes = satSum(currentHSL, strokeHSL);
    const lightRes = lightSum(currentHSL, strokeHSL);
    return `hsl(${hueRes}deg, ${satRes}%, ${lightRes}%)`;
}

function hueSum(hsl1, hsl2) {
    /* We can still improve this by taking into
    account the l parameter in a ponderation */
    if (hsl1[0] == 0 && hsl1[1] == 0 && hsl1[2] == 100) {
        return hsl2[0];
    }
    let first = Math.min(hsl1[0], hsl2[0]);
    let second = Math.max(hsl1[0], hsl2[0]);
    if ((second - first) > 180) {
        const temp = second;
        second = first+360;
        first = temp;
    }
    return ((first + second)/2)%360;
}

function satSum(hsl1, hsl2) {
    /* Oversimplistic, we have to improve 
    by taking into account the l parameter */
    if (hsl1[0] == 0 && hsl1[1] == 0 && hsl1[2] == 100) {
        return hsl2[1];
    }
    return (hsl1[1] + hsl2[1])/2;
}

function lightSum(hsl1, hsl2) {
    return Math.max(hsl1[2] - hsl2[2], 0);
}

function rgbToHsl(rgbStr) {
    if (!rgbStr) return[0, 0, 100]
    let [r, g, b] = rgbStrToArray(rgbStr);
    r /= 255, g /= 255, b /= 255;
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

    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}

function rgbStrToArray(rgbStr) {
    let rgbArray = rgbStr.slice(4, -1).split(", ");
    rgbArray = rgbArray.map(x => parseInt(x));
    return rgbArray;
}

function restartGrid() {
    let n = askSize();
    if (n == 0) return;
    eraseGrid();
    gridWidthElements = n;
    gridHeightElements = n;
    initializeGrid();
}

function askSize() {
    let answer = Number(prompt("Enter the grid size (1 to 100)", "16"));
    answer = Math.round(answer);
    return answer > 0 && answer <= 100 && !isNaN(answer) && answer;
}

function mouseDown(e) {
    mouseClicked = true;
    paintElement(this);
}

function mouseUp(e) {
    mouseClicked = false;
}

function setColorStroke() {
    strokeHue = Math.round(Math.random()*3600)/10;
    strokeSat = Math.round(Math.random()*100);
    colorStroke = `hsl(${strokeHue}deg, ${strokeSat}%, ${100-strokeWeight}%)`;
    colorButton.style.backgroundColor = colorStroke;
}