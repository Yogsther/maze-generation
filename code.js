/**
 * Maze generator & game!
 * Olle 25.2.18
 */

/* Height and Width in blocks (not pixels.) blockSize x blockSize */


var width = 50;
var height = 50;
var blockSize = 18;
var speed = 1;
var probability = 50;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/**
 * Directions:
 * 0 = up,
 * 1 = left,
 * 2 = down,
 * 3 = right
 */

const notAllowed = [
    [{x: 0, y: (-1)}, {x: (-1), y: (-1)}, {x: 1, y: (-1)}, {x: (-1), y: (-2)}, {x: 0, y: (-2)}, {x: 1, y: (-2)}],
    [{x: 1, y: 0}, {x: (1), y: (-1)}, {x: 2, y: (-1)}, {x: 2, y: (0)}, {x: 2, y: 1}, {x: 1, y: 1}],
    [{x: (-1), y: 1}, {x: 0, y: 1}, {y: 1, x: 1}, {x: (-1), y: 2}, {x: 0, y: 2}, {x: 1, y: 2}],
    [{x: (-1), y: (-1)}, {x: (-1), y: 0}, {x: (-1), y: 1}, {x: (-2), y: (-1)}, {x: (-2), y: 0}, {x: (-2), y: 1}]
];



var map = new Array(width * height);
canvas.width = width * blockSize;
canvas.height = height * blockSize;


var pointPos = {
    x: 1,
    y: 1,
    direction: 2 // Down 
}

const choices = [{
    description: "up",
    direction: 0,
    x: 0,
    y: (-1)
}, {
    description: "left",
    direction: 1,
    x: 1,
    y: 0
}, {
    description: "down",
    direction: 2,
    x: 0,
    y: 1
}, {
    description: "right",
    direction: 3,
    x: (-1),
    y: 0
}];

var turns = new Array();
run();
render();

function loadColors(){
    try{
    var colorsArr = ["path", "background", "node", "search", "start", "end"];
    window.finalColors = new Object();
    for(let i = 0; i < colorsArr.length; i++){
        finalColors[colorsArr[i]] = document.getElementById(colorsArr[i]).value;
        document.getElementById(colorsArr[i] + "_block").style.backgroundColor = finalColors[colorsArr[i]];
    }
} catch(e){}
}

function run(){
    width = document.getElementById("width").value;
    height = document.getElementById("height").value;
    blockSize = document.getElementById("blockSize").value;
    speed = document.getElementById("speed").value;
    probability = document.getElementById("probability").value;
    if(probability > 99){
        probability = 99;
        document.getElementById("probability").value = probability;
    }

    loadColors();

    map = new Array(width * height);
    checking = new Array();
    turns = new Array();
    canvas.width = width * blockSize;
    canvas.height = height * blockSize;
    pointPos = {
        x: 1,
        y: 1,
        direction: 2 // Down 
    }
    if(document.getElementById("clear").checked){
    try{ clearInterval(mapDrawer); } catch(e){}
    }

    finished = false;
    
    
    generateMaze(document.getElementById("animate").checked);
}


function render() {
    /* Render everything 60 times a second */
    ctx.fillStyle = finalColors.path;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /* Draw map */
    for (var i = 0; i < map.length; i++) {
        if (map[i] > 0) {
            var color = finalColors.background;
            /* Set color */
            if (map[i] == 2) color = finalColors.end;
            if (map[i] == 3) color = "grey"; // I have no clue what the fuck this is.
            ctx.fillStyle = color;

            var x = i % width;
            var y = (i - x) / width;
            ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)
        }
    }


    /* Render out map drawer */
    ctx.fillStyle = "#5bc8ff";
    ctx.fillRect(pointPos.x * blockSize, pointPos.y * blockSize, blockSize, blockSize); 

    /* Render out nodes */
    for(var i = 0; i < turns.length; i++){
        ctx.fillStyle = finalColors.node;
        ctx.fillRect(turns[i].x * blockSize, turns[i].y * blockSize, blockSize, blockSize)
    }

    /* Render out face for generator */
    if(!finished){
    for(var i = 0; i < notAllowed[pointPos.direction].length; i++){
        ctx.fillStyle = finalColors.search;
        ctx.fillRect((notAllowed[pointPos.direction][i].x + pointPos.x ) * blockSize, (notAllowed[pointPos.direction][i].y + pointPos.y) * blockSize, blockSize, blockSize)
        }
    }


    requestAnimationFrame(render);

    
}



function randomBoolean() {
    if (Math.random() > 0.5) {
        return false;
    } else {
        return true;
    }
}


function addBlock(x, y) {
    map[coordinatesToIndex(x, y)] = 1;
}

function addTrailBlock(x, y) {
    map[coordinatesToIndex(x, y)] = 3;
}

function removeBlock(x, y) {
    map[x + (width * y)] = 0;
}

function coordinatesToIndex(x, y) {
    return x + (width * y);
}

function indexToCoordinates(index) {
    var x = index % width;
    var y = (index - x) / width
    return {
        x: x,
        y: y
    };
}

var finished = false;

function generateMaze(animate) {
    for (let i = 0; i < map.length; i++) {
        map[i] = 1;
    }

    if(animate){
        window.mapDrawer = setInterval(function () {
            var option = Math.floor(Math.random() * 100);

            if (option < probability) {
                /* Turn */
                drawTurn();
            } else {
                /* Continue forward */
                drawForward();
            }
    
            map[coordinatesToIndex(pointPos.x, pointPos.y)] = 0;

        }, speed);
    } else {
        while(!finished){
            var option = Math.floor(Math.random() * 100);
    
            if (option < probability) {
                /* Turn */
                drawTurn();
            } else {
                /* Continue forward */
                drawForward();
            }
    
            map[coordinatesToIndex(pointPos.x, pointPos.y)] = 0;
        }
    }        
}


function drawForward() {
    var x = pointPos.x;
        y = pointPos.y;
        index = coordinatesToIndex(pointPos.x, pointPos.y)
        dir = pointPos.direction;

    /* Check if facing direction is clear */
    if(checkDirection(x, y, dir)){

        if(legalTurns(pointPos.x, pointPos.y) > 1){
            turns.push({x: pointPos.x, y: pointPos.y})
        }

        pointPos.x += choices[pointPos.direction].x;
        pointPos.y += choices[pointPos.direction].y;
    } else if(atDeadEnd(x, y)){
        if(turns.length < 1){
            clearInterval(mapDrawer);
            finished = true;
            spawnBoundingBox();
            return;
        }
        pointPos.x = turns[turns.length-1].x;
        pointPos.y = turns[turns.length-1].y;
        turns.splice(turns.length-1, 1);
    } else {
        drawTurn(x, y);
    }
}

function atDeadEnd(x, y){
    for(let i = 0; i < 3; i++){
        if(checkDirection(x, y, i)){
            return false;
        }
    }
    return true;
}

function drawTurn(x, y){
    /* Turn */

    var check = shuffle([0, 1, 2, 3]);    
    for(let i = 0; i < check.length; i++){
        if(checkDirection(pointPos.x, pointPos.y, check[i])){
            pointPos.direction = check[i];
            break;
        }
    }

    if(legalTurns(x, y) > 1){
        turns.push({
            x: x,
            y: y
        });
    }
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function legalTurns(x, y){
    var legal = 0;
    for(let i = 0; i < 3; i++){
        if(checkDirection(x, y, i)) legal++;
    }
    return legal;
}

function checkDirection(x, y, dir){

    /* Check */
    var currentlyNotAllowed = notAllowed[dir];
    
    for(let i = 0; i < currentlyNotAllowed.length; i++){
        if(map[coordinatesToIndex(currentlyNotAllowed[i].x + x, currentlyNotAllowed[i].y + y)] !== 1){
            return false;
        }
        if(currentlyNotAllowed[i].x + x == -1 || currentlyNotAllowed[i].x + x == width){
            return false;
        }
        if(currentlyNotAllowed[i].y + y == -1 || currentlyNotAllowed[i].y + y == height){
            return false;
        }
    }

    return true;
}

var checking = new Array();



function getMapSlot(x, y){
    return map[coordinatesToIndex(x,y)];
}

function spawnBoundingBox() {
    /* Finish point. */
    for(var i = map.length; i > 0; i--){
        if(map[i] == 0){
            map[i] = 2;
            break;
        }
    }
    map[coordinatesToIndex(1, 1)] = 2;
}