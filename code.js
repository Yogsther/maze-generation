
/**
 * First attemt at making a maze-ecaping bot. 
 * v.0.4 - Known bugs: Sometimes the bot will get stuck, I'm working on this.
 */

 /* Height and Width in blocks (not pixels.) 10x10 */

var width = 50;
var height = 30;

const canvas = document.getElementById("canvas"); 
const ctx = canvas.getContext("2d");

/**
 * Directions:
 * 0 = up,
 * 1 = left,
 * 2 = down,
 * 3 = right
 */
var bot = {
    x: 4,
    y: 1,
    direction: 2 // Down
}


var runBot = false; /* If true, the bot will start making its way out. */

var map = new Array(width*height);
canvas.width = width*10;
canvas.height = height*10;

render();

/* setInterval(function(){
    render();
}, 500); */


var drawModeAdd = true;

var mousePos = {
    x: 0,
    y: 0
}

function reset(){
    runBot = false;
    bot.x = 4;
    bot.y = 1;
    bot.direction = 2;

    for(let i = 0; i < map.length; i++){
        if(map[i] == 3) map[i] = 0;
    }
}

var mouseDown = false;

/* Remove right click feature on canvas */
canvas.oncontextmenu = function (e) {
    e.preventDefault();
};

/* Get mouse position */
canvas.addEventListener("mousemove", function(evt){
    var rect = canvas.getBoundingClientRect();
    mousePos = {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };

    if(mouseDown){
        /* Draw on canvas if mouse is down. */
        draw();
    }

});

function draw(){
    if(drawModeAdd){
        addBlock(Math.floor(mousePos.x/10), Math.floor(mousePos.y/10));
    } else {
        removeBlock(Math.floor(mousePos.x/10), Math.floor(mousePos.y/10));
    }
}

canvas.addEventListener("mousedown", function(e){
    mouseDown = true;
    console.log(e.button);
    drawModeAdd = (e.button === 0); /* If left click, remove pixels.  */
})

canvas.addEventListener("mouseup", function(e){
    mouseDown = false;
});

/* Draw on click */
canvas.addEventListener("click", function(e){ draw(); });

function render(){
    /* Render everything 60 times a second */
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    for(var i = 0; i < map.length; i++){
        if(map[i] > 0){
            
            var color = "#bc4545";
            /* Set color */
            if(map[i] == 2) color = "#31ce43";
            if(map[i] == 3) color = "grey";
            ctx.fillStyle = color;

            var x = i % width;
            var y = (i - x) / width;
            ctx.fillRect(x*10, y*10, 10, 10)
        }
        
    }

    if(runBot){
        botStep();
    }


    /* Render out bot */
    ctx.fillStyle = "white";
    ctx.fillRect(bot.x*10, bot.y*10, 10, 10)
    requestAnimationFrame(render);
}

function botStep(){
    /* Check if bot has finished the maze. */
    if(map[coordinatesToIndex(bot.x,bot.y)] == 2){
        console.log("Finished!");
        return;
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
    }]
    
    var choicesPoints = new Array();

    /* Evaluate the conditions of all direciton, and come up with a value for how good of an option each direction is. */
    for(let i = 0; i < choices.length; i++){
        var choice = choices.slice()[i];
        var block = map[coordinatesToIndex(choice.x + bot.x, choice.y + bot.y)];
        if(block == 0 || block == null){
            choicesPoints[i] = {index: i, points: 1}; /* Never been here before, should walk there. */
        } else if(block == 1){
            choicesPoints[i] = {index: i, points: 10}; /* Not possible, wall in the way. */
        } else if(block == 3){
            choicesPoints[i] = {index: i, points: 2}; /* Been here before, but can return. */
        } else if(block == 2){
            choicesPoints[i] = {index: i, points: 0}; /* Block is finish, go there! */
        } else {
            console.warn("Unexpected block at index:" + coordinatesToIndex(choice.x + bot.x, choice.y + bot.y));
        }
    }

    /* Sort choices */
    choicesPoints.sort(function(a, b) {
        return a.points - b.points;
    });

    var finalChoice = choicesPoints[0];

    if(finalChoice > 5){
        stop();
        console.error("Stuck! This maze is invalid.");
    } else if(finalChoice.points > 1){
        console.log("Want to points: " + choicesPoints[bot.direction].points);
        for(let i = 0; i < choicesPoints.length; i++){
            if(choicesPoints[i].index == bot.direction){
                if(choicesPoints[i].points < 10){
                    bot.x += choices[bot.direction].x;
                    bot.y += choices[bot.direction].y;
                } else {
                        if(randomBoolean){
                            bot.direction--;
                            if(bot.direction < 0){
                                bot.direction = 3;
                            }
                        } else {
                            bot.direction++;
                            if(bot.direction > 3){
                                bot.direction = 0;
                            }
                        }                        
                    }
                }
            }
        } else {
        bot.direction = finalChoice.index;
        bot.x += choices[finalChoice.index].x;
        bot.y += choices[finalChoice.index].y;
    }
    
    map[coordinatesToIndex(bot.x, bot.y)] = 3;

    return;

}

function randomBoolean(){
    if(Math.random() > 0.5){
        return false;
    } else {
        return true;
    }
}

function start(){
    runBot = true;
    document.getElementById("stopAndRestart").innerHTML = "Stop";
}

function stop(){
    if(runBot){
        runBot = false;
        document.getElementById("stopAndRestart").innerHTML = "Reset";
    } else {
        reset();
    }
    
    
    
}

function addBlock(x, y){
    map[coordinatesToIndex(x ,y)] = 1;
}

function addTrailBlock(x, y){
    map[coordinatesToIndex(x ,y)] = 3;
}

function removeBlock(x, y){
    map[x + (width*y)] = 0;
}

function coordinatesToIndex(x, y){
    return x + (width*y);
}

function indexToCoordinates(index){
    var x = index % width;
    var y = (index - x) / width
    return {x: x, y: y};
}


spawnBoundingBox();
function spawnBoundingBox(){
    /* Draw bounding box. */
    for(var i = 0; i < width; i++){
        addBlock(i, 0);
    }
    for(var i = 0; i < width; i++){
        addBlock(i, height-1);
    }
    for(var i = 0; i < height; i++){
        addBlock(0, i);
    }
    for(var i = 0; i < height; i++){
        addBlock(width-1, i);
    }
    /* Add Start and Finish points. */
    map[coordinatesToIndex(width-4, height-1)] = 2;
}