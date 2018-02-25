/**
 * Maze generator & game!
 * Olle 25.2.18
 */

/* Height and Width in blocks (not pixels.) blockSize x blockSize */

var width = 30;
var height = 20;
var blockSize = 30;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/**
 * Directions:
 * 0 = up,
 * 1 = left,
 * 2 = down,
 * 3 = right
 */

var player = {
    x: 1,
    y: 1,
    direction: 2 // Down
}


var notAllowed = [
    [{x: 0, y: (-1)}, {x: (-1), y: (-1)}, {x: 1, y: (-1)}, {x: (-1), y: (-2)}, {x: 0, y: (-2)}, {x: 1, y: (-2)}],
    [{x: 1, y: 0}, {x: (1), y: (-1)}, {x: 2, y: (-1)}, {x: 2, y: (0)}, {x: 2, y: 1}, {x: 1, y: 1}],
    [{x: (-1), y: 1}, {x: 0, y: 1}, {y: 1, x: 1}, {x: (-1), y: 2}, {x: 0, y: 2}, {x: 1, y: 2}],
    [{x: (-1), y: (-1)}, {x: (-1), y: 0}, {x: (-1), y: 1}, {x: (-2), y: (-1)}, {x: (-2), y: 0}, {x: (-2), y: 1}]
];



var map = new Array(width * height);
canvas.width = width * blockSize;
canvas.height = height * blockSize;


var pointPos = {
    x: player.x,
    y: player.y,
    direction: 2 // Down 
}

var choices = [{
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

render();



document.addEventListener("keydown", function(e){
    var codes = [38, 39, 40, 37];
    var index = codes.indexOf(e.keyCode);
    console.log(index);
    if(index != -1){
        player.x += choices[index].x;
        player.y += choices[index].y;
        player.direction = index;
    }
    
})

function render() {
    /* Render everything 60 times a second */
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /* Draw map */
    for (var i = 0; i < map.length; i++) {
        if (map[i] > 0) {
            var color = "#111";
            /* Set color */
            if (map[i] == 2) color = "#31ce43";
            if (map[i] == 3) color = "grey";
            ctx.fillStyle = color;

            var x = i % width;
            var y = (i - x) / width;
            ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)
        }
    }

    /* Render out player */
    ctx.fillStyle = "#f44268";
    ctx.fillRect(player.x * blockSize, player.y * blockSize, blockSize, blockSize)

    /* Render out map drawer
    ctx.fillStyle = "5bc8ff";
    ctx.fillRect(pointPos.x * blockSize, pointPos.y * blockSize, blockSize, blockSize); */

    for(var i = 0; i < turns.length; i++){
        ctx.fillStyle = "#f45942";
        ctx.fillRect(turns[i].x * blockSize, turns[i].y * blockSize, blockSize, blockSize)
    }

    /* Render out face for generator 
    for(var i = 0; i < notAllowed[pointPos.direction].length; i++){
        ctx.fillStyle = "#5bc8ff";
        ctx.fillRect((notAllowed[pointPos.direction][i].x + pointPos.x ) * blockSize, (notAllowed[pointPos.direction][i].y + pointPos.y) * blockSize, blockSize, blockSize)
    } */

    var ways = openWays(player.x, player.y);
    if(ways.length < 2){
        // Auto move
        for(let i = -1; i < 2; i++){
            if(map[coordinatesToIndex(player.x + choices[player.direction + i].x, player.y + choices[player.direction + i].y)] == 0){
                player.x += choices[player.direction + i].x;
                player.y += choices[player.direction + i].y;
            }
        }
    }


    requestAnimationFrame(render);

    
}

function openWays(x, y){
    var open = new Array();
    for(let i = 0; i < choices.length; i++){
        if(i != player.direction && map[coordinatesToIndex(x + choices[i].x, y + choices[i].y)] == 0) open.push({x: x + choices[i].x, y:  y + choices[i].y});
    }
    return open;
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


generateMaze();

var finished = false;

function generateMaze() {
    for (let i = 0; i < map.length; i++) {
        map[i] = 1;
    }
    
    /* window.mapDrawer = setInterval(function () { */
        while(!finished){
        var option = Math.floor(Math.random() * 100);

        if (option > 70) {
            /* Turn */
            drawTurn();
        } else {
            /* Continue forward */
            drawForward();
        }

        map[coordinatesToIndex(pointPos.x, pointPos.y)] = 0;

        } /* , 5); */
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
            //clearInterval(mapDrawer);
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
    if (randomBoolean()) {
        pointPos.direction--;
        if (pointPos.direction < 0) {
            pointPos.direction = 3;
        }
    } else {
        pointPos.direction++;
        if (pointPos.direction > 3) {
            pointPos.direction = 0;
        }
    }

    if(legalTurns(x, y) > 1){
        turns.push({
            x: x,
            y: y
        });
    }
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
}