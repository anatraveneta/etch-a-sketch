/* Basic Parameters */
const gridWidthPixels = 500;
const gridHeightPixels = 500;
 
let gridWidthElements = 16; // Number of pixels in width
let gridHeightElements = 16; // Number of pixels in height

let elementWidth;
let elementHeight;


const gridContainer = document.querySelector(".grid-container");
const clearButton = document.querySelector("#clean-button");

gridContainer.setAttribute('style', `width:${gridWidthPixels}px;` +
        `height:${gridHeightPixels}px`);

clearButton.addEventListener('click', restartGrid);

initializeGrid();



 /* Functions */
function initializeGrid() {
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
        div.addEventListener('mouseenter', paintElement);
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

function paintElement(e) {
    this.classList.add('entered');
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