"use strict";
const app = new PIXI.Application({
    width: 1000,
    height: 600
});
let gameDiv = document.querySelector("#game")
gameDiv.appendChild(app.view);


// Load assets
app.loader.add([
    "images/title-screen.png",
    "images/button.png",
    "images/button-hover.png",
    "images/button-pressed.png",
    "images/pause-overlay.png",
    "images/background.png",
    "images/pizza-dough.png",
    "images/pizza-dough-red.png",
    "images/pizza-dough-white.png",
    "images/sauce-red.png",
    "images/sauce-white.png",
    "images/cheese.png",
    "images/pepperoni.png",
    "images/sausage.png",
    "images/mushroom.png",
    "images/pepper.png",
    "images/olive.png",
    "images/bin-sauce-red.png",
    "images/bin-sauce-white.png",
    "images/bin-sauce-empty.png",
    "images/bin-cheese.png",
    "images/bin-pepperoni.png",
    "images/bin-sausage.png",
    "images/bin-mushroom.png",
    "images/bin-peppers.png",
    "images/bin-olives.png",
    "images/blob-red.png",
    "images/blob-white.png",
    "images/order-red-sauce.png",
    "images/order-white-sauce.png",
    "images/order-cheese.png",
    "images/order-checkmark.png",
    "images/order-x.png"
]);
app.loader.onComplete.add(initialize);
app.loader.load();

// Constants, Textures, & Aliases
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
let stage;
let redBin, whiteBin, emptyBin;
let dough, redDough, whiteDough;
let button, buttonHover, buttonPressed, pauseOverlay;

// Game Variables
let startScene, gameScene, pauseScene, gameOverScene;
let scoreLabel, mistakesLabel, gameOverScoreLabel;
let score = 0;
let mistakes = 0;
let paused = true;
let pizza;
let order;
let redSauce, whiteSauce, cheese, pepperoni, sausage, mushrooms, peppers, olives;
let toppings = [];
let redSpread, whiteSpread;
let maxToppings, maxTypes, maxMistakes;
let speed, speedIncrease, scoreIncrease;
let music;


// Set up values on startup
function initialize() {
    stage = app.stage;

    // Create scenes
    startScene = new PIXI.Container();
    startScene.visible = true;
    stage.addChild(startScene);

    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    pauseScene = new PIXI.Container();
    pauseScene.visible = false;
    stage.addChild(pauseScene);

    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);


    // Prepare textures
    let background = new PIXI.Sprite(app.loader.resources["images/background.png"].texture);
    gameScene.addChild(background);
    background = new PIXI.Sprite(app.loader.resources["images/title-screen.png"].texture);
    startScene.addChild(background);
    background = new PIXI.Sprite(app.loader.resources["images/pause-overlay.png"].texture);
    pauseScene.addChild(background);
    background = new PIXI.Sprite(app.loader.resources["images/pause-overlay.png"].texture);
    gameOverScene.addChild(background);

    redBin = app.loader.resources["images/bin-sauce-red.png"].texture;
    whiteBin = app.loader.resources["images/bin-sauce-white.png"].texture;
    emptyBin = app.loader.resources["images/bin-sauce-empty.png"].texture;

    redDough = app.loader.resources["images/pizza-dough-red.png"].texture;
    whiteDough = app.loader.resources["images/pizza-dough-white.png"].texture;

    button = app.loader.resources["images/button.png"].texture;
    buttonHover = app.loader.resources["images/button-hover.png"].texture;
    buttonPressed = app.loader.resources["images/button-pressed.png"].texture;


    // Create ingredient bins
    redSauce = new ToppingBin("images/bin-sauce-red.png", "red-sauce", 23, 317);
    gameScene.addChild(redSauce);
    whiteSauce = new ToppingBin("images/bin-sauce-white.png", "white-sauce", 117, 317);
    gameScene.addChild(whiteSauce);
    cheese = new ToppingBin("images/bin-cheese.png", "cheese", 231, 317);
    gameScene.addChild(cheese);
    pepperoni = new ToppingBin("images/bin-pepperoni.png", "pepperoni", 452, 317);
    gameScene.addChild(pepperoni);
    sausage = new ToppingBin("images/bin-sausage.png", "sausage", 564, 316);
    gameScene.addChild(sausage);
    mushrooms = new ToppingBin("images/bin-mushroom.png", "mushroom", 675, 316);
    gameScene.addChild(mushrooms);
    peppers = new ToppingBin("images/bin-peppers.png", "pepper", 792.5, 315);
    gameScene.addChild(peppers);
    olives = new ToppingBin("images/bin-olives.png", "olive", 902, 317);
    gameScene.addChild(olives);


    // Create labels
    let labelStyle = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 30,
        fontFamily: "Acme",
        fontWeight: 400
    });

    let textStyle = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 100,
        fontFamily: "Acme",
        fontWeight: 400
    })

    scoreLabel = new PIXI.Text();
    scoreLabel.style = labelStyle;
    scoreLabel.x = 65;
    scoreLabel.y = 65;
    gameScene.addChild(scoreLabel);

    mistakesLabel = new PIXI.Text();
    mistakesLabel.style = labelStyle;
    mistakesLabel.x = 65;
    mistakesLabel.y = 110;
    gameScene.addChild(mistakesLabel);

    let titleText = new PIXI.Text("Pizza Rush!");
    titleText.style = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 135,
        fontFamily: "Acme",
        fontWeight: 400
    })
    titleText.anchor.set(0.5, 0.5);
    titleText.x = sceneWidth / 2;
    titleText.y = (sceneHeight / 2) - 80;
    startScene.addChild(titleText);

    let subtitleText = new PIXI.Text("A game by Jordan Allard");
    subtitleText.style = labelStyle;
    subtitleText.anchor.set(0.5, 0.5);
    subtitleText.x = sceneWidth / 2;
    subtitleText.y = (sceneHeight / 2) + 25;
    startScene.addChild(subtitleText);

    startScene.addChild(createButton(1.4, "Start Game", labelStyle, sceneWidth / 2, 470, startGame));
    gameScene.addChild(createButton(0.8, "Pause Game", labelStyle, 375, 60, pauseGame));
    
    pauseScene.addChild(
        createButton(0.8, "Resume Game", labelStyle, 
        (sceneWidth/2) - ((button.width/2)-12), (sceneHeight/2) + 80, resumeGame)
    );
    pauseScene.addChild(
        createButton(0.8, "Quit to Title", labelStyle, 
        (sceneWidth/2) + ((button.width/2)-12), (sceneHeight/2) + 80, quitToTitle)
    );
    
    let pauseText = new PIXI.Text("Paused");
    pauseText.style = textStyle;
    pauseText.anchor.set(0.5, 0.5);
    pauseText.x = sceneWidth / 2;
    pauseText.y = (sceneHeight / 2) - 50;
    pauseScene.addChild(pauseText);

    gameOverScene.addChild(
        createButton(0.8, "Play Again", labelStyle, 
        (sceneWidth/2) - ((button.width/2)-12), (sceneHeight/2) + 85, startGame)
    );
    gameOverScene.addChild(
        createButton(0.8, "Quit to Title", labelStyle, 
        (sceneWidth/2) + ((button.width/2)-12), (sceneHeight/2) + 85, quitToTitle)
    );

    let gameOverText = new PIXI.Text("Game Over!");
    gameOverText.style = textStyle;
    gameOverText.anchor.set(0.5, 0.5);
    gameOverText.x = sceneWidth / 2;
    gameOverText.y = (sceneHeight / 2) - 70;
    gameOverScene.addChild(gameOverText);

    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = labelStyle;
    gameOverScoreLabel.anchor.set(0.5, 0.5);
    gameOverScoreLabel.x = sceneWidth / 2;
    gameOverScoreLabel.y = (sceneHeight / 2) + 10;
    gameOverScene.addChild(gameOverScoreLabel);


    // Prep other game variables
    redSpread = new PIXI.Container();
    whiteSpread = new PIXI.Container();
    music = document.querySelector("audio");
    

    // Set default difficulty values
    maxToppings = 4;
    maxTypes = 0;
    maxMistakes = 5;
    speed = 100;
    speedIncrease = 5;
    scoreIncrease = 40;

    app.ticker.add(gameLoop);
}


// Returns a new button object with the given properties
function createButton(scale, text, textStyle, x, y, clickFunction) {
    let buttonObject = new PIXI.Sprite(button);
    buttonObject.anchor.set(0.5, 0.5);
    buttonObject.scale.set(scale);
    let buttonText = new PIXI.Text(text);
    buttonText.style = textStyle;
    buttonText.anchor.set(0.5, 0.5);
    buttonText.x = 0;
    buttonText.y = -5;
    buttonObject.addChild(buttonText);
    buttonObject.x = x;
    buttonObject.y = y;
    buttonObject.interactive = true;
    buttonObject.buttonMode = true;
    buttonObject.on("pointerover", e => { e.currentTarget.texture = buttonHover });
    buttonObject.on("pointerdown", e => {
        e.currentTarget.texture = buttonPressed; 
        e.currentTarget.children[0].y = 5;
    });
    buttonObject.on("pointerout", e =>  { 
        e.currentTarget.texture = button;
        e.currentTarget.children[0].y = -5;
    });
    buttonObject.on("pointerup", clickFunction);
    return buttonObject;
}

// Starts a new game
function startGame(e) {
    paused = false;
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    pauseScene.visible = false;
    if (toppings.length > 0) {
        for (let top of toppings) {
            top.destroy();
        }
    }
    toppings = [];
    score = 0;
    mistakes = 0;
    speed = 100;
    maxTypes = 0;
    increaseScoreBy(0);
    increaseMistakesBy(0);
    createNewPizza();
    createOrder();
    music.volume = 1;
    music.play();
}

// Pauses the current game
function pauseGame(e) {
    paused = true;
    pauseScene.visible = true;
    music.volume = 0.3;
}

// Unpauses the current game
function resumeGame(e) {
    paused = false;
    pauseScene.visible = false;
    music.volume = 1;
}

// Return to the title screen
function quitToTitle(e) {
    paused = true;
    gameScene.visible = false;
    gameOverScene.visible = false;
    pauseScene.visible = false;
    startScene.visible = true;
    music.pause();
    music.load();
}

// Ran out of strikes, game over
function gameOver() {
    paused = true;
    pauseScene.visible = false;
    startScene.visible = false;
    gameScene.visible = true;
    gameOverScene.visible = true;
    gameOverScoreLabel.text = `Your final score was: ${score}`;
    music.volume = 0.3;
}


// Primary game loop
function gameLoop() {
    if(paused) return;

    // Calculate frame rate
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt = 1/12;

    // Move the pizza
    pizza.move(dt);
    if (pizza.x > sceneWidth + pizza.width/2) {
        if (!pizza.isLocked) {
            increaseMistakesBy(1);
        }
        if (pizza.isComplete)
            createOrder();
        createNewPizza();
        order.checkmark.visible = false;
        order.xmark.visible = false;
    }

    // Add sauce & toppings, check pizza status
    updateSauce(redSpread, 0.6);
    updateSauce(whiteSpread, 0.6);
    updateTopping(dt);
    updateOrder();
}


// Spawn a new topping when clicking on the bin
function getTopping(e) {
    if(paused) return;

    let top = new Topping(e.currentTarget.type);
    top.x = e.data.global.x;
    top.y = e.data.global.y;
    if (top.type == "red-sauce") {
        top.sauceType = "red";
        e.currentTarget.texture = emptyBin;
    }
    else if (top.type == "white-sauce") {
        top.sauceType = "white";
        e.currentTarget.texture = emptyBin;
    }
    toppings.push(top);
    gameScene.addChild(top);
}

// Update position of the topping
function updateTopping(dt) {
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    for (let top of toppings) {
        switch(top.state) {
            // If still holding click, follow mouse position
            case "move":
                top.position = mousePosition;
                if (top.sauceType && rectsIntersect(top, pizza))
                    addSauce(top);
                break;

            // If let go while on pizza, add topping to pizza
            case "set":
                if (top.sauceType) {
                    top.state = "discard";
                }
                else {
                    let localX = getLocalX(pizza, top);
                    let localY = getLocalY(pizza, top);
                    if (!increasesBounds(pizza, top, 20)) {
                        pizza.addChild(top);
                        if (top.type === "cheese") {
                            top.x = 0;
                            top.y = -5;
                            top.zIndex = 1;
                            pizza.sortChildren();
                            pizza.hasCheese = true;
                        }
                        else {
                            top.x = localX;
                            top.y = localY;
                            pizza.ingredients[top.type] += 1;
                        }
                            
                        toppings.splice(toppings.indexOf(top), 1);
                    }
                    else {
                        top.state = "discard";
                    }
                }
                break;

            // If let go of click, fall off the screen
            case "discard":
                top.fall(dt);

                if (top.y > sceneHeight + top.height) {
                    toppings.splice(toppings.indexOf(top), 1);
                    gameScene.removeChild(top);
                }
                break;
        }
    }
}

// Check what to do with the topping when click is released
function updateToppingState(e) {
    if (e.currentTarget.type == "red-sauce")
        redSauce.texture = redBin;
    else if (e.currentTarget.type == "white-sauce")
        whiteSauce.texture = whiteBin;

    if (rectsIntersect(e.currentTarget, pizza) && !pizza.isLocked)
        e.currentTarget.state = "set";
    else
        e.currentTarget.state = "discard";
}


// Spread sauce on the pizza
function addSauce(bottle) {
    if (pizza.sauceType == bottle.sauceType) return;
    let blob = new Topping(bottle.sauceType);
    blob.x = bottle.x;
    blob.y = bottle.y + 120;
    blob.state = "set";

    let localX = getLocalX(pizza, blob);
    let localY = getLocalY(pizza, blob);
    if (!increasesBounds(pizza, blob, -10))  {
        gameScene.addChild(blob);
        if (bottle.sauceType == "red")
            redSpread.addChild(blob);
        else if (bottle.sauceType == "white")
            whiteSpread.addChild(blob);
        blob.x = localX;
        blob.y = localY;
    }
}

// Determine if enough sauce is spread to cover the pizza
function updateSauce(spread, percent) {
    if (spread.children.length == 0) return;

    let bounds = spread.getBounds();
    let targetArea = (Math.PI * (pizza.width/2) * (pizza.height/2)) * percent
    let currentArea = Math.PI * (bounds.width/2) * (bounds.height/2);

    if (currentArea >= targetArea) {
        pizza.sauceType = spread.type;
        if (spread.type == "red")
            pizza.texture = redDough;
        else if (spread.type == "white")
            pizza.texture = whiteDough;
        resetSauce("red");
        resetSauce("white");
    }
}

// Reset the sauce spread
function resetSauce(type) {
    let spread;
    if (type == "red")
        spread = redSpread;
    else if (type == "white")
        spread = whiteSpread;

    if (spread)
        spread.destroy();
    spread = new PIXI.Container();
    spread.type = type;

    if (type == "red")
        redSpread = spread;
    else if (type == "white")
        whiteSpread = spread;

    gameScene.addChild(spread);
    pizza.addChild(spread);
}


// Destroy the old pizza and create a new one on the left
function createNewPizza() {
    if (pizza) pizza.destroy();
    pizza = new Pizza(speed);
    pizza.x = 0 - (pizza.width/2);
    pizza.y = 460;
    gameScene.addChild(pizza);
    resetSauce("red");
    resetSauce("white");
}


// Generate a new order using some random values
function createOrder() {
    if (order) order.destroy();

    if (maxTypes > 5) maxTypes = 5;
    order = new Order(getRandom(0, maxTypes + 1));

    let ingredients = order.ingredients;
    if (getRandom(1, 3) > 1)
        order.sauceType = "red";
    else 
        order.sauceType = "white";
    
    for (let i = 0; i < order.numToppings; i++) {
        let typeIndex = getRandom(0, 4);

        while (ingredients[toppingsList[typeIndex]] != 0) {
            typeIndex = ((typeIndex + 1) % 5);
        }
        ingredients[toppingsList[typeIndex]] = getRandom(2, maxToppings + 1);
    } 
    
    order.display();
}

// Compares current pizza with order and updates the order display
function updateOrder() {
    if (pizza.isLocked) return;
    let isComplete = true;

    // Check sauce
    if (pizza.sauceType == order.sauceType) {
        order.sprites[order.sauceType].alpha = 0.5;
    }
    else {
        order.sprites[order.sauceType].alpha = 1;
        isComplete = false;
    }

    // Check cheese
    if (pizza.hasCheese) {
        order.sprites["cheese"].alpha = 0.5;
    }
    else {
        order.sprites["cheese"].alpha = 1;
        isComplete = false;
    }

    // Check toppings
    for (let i in order.ingredients) {
        if (pizza.ingredients[i] > order.ingredients[i]) {
            pizza.lock();
            for (let k in order.sprites) {
                if (order.sprites[k])
                    order.sprites[k].alpha = 0.5;
            }
            increaseMistakesBy(1);
            order.xmark.visible = true;
            return;
        }
        if (pizza.ingredients[i] != order.ingredients[i]) {
            isComplete = false;
        }

        for (let j = 0; j < pizza.ingredients[i]; j++) {
            order.sprites[i].children[j].alpha = 0.5;
        }
        if (pizza.ingredients[i] == 0 && order.sprites[i]) {
            order.sprites[i].alpha = 1;
            for (let j = 0; j < order.ingredients[i]; j++) {
                order.sprites[i].children[j].alpha = 1;
            }
        }
    }

    if (isComplete) {
        pizza.lock();
        pizza.isComplete = true;
        order.checkmark.visible = true;
        increaseScoreBy(10);
        speed += speedIncrease;
        if (maxTypes < 5 && score%scoreIncrease == 0) {
            maxTypes += 1;
        }
    }
}


// Increases score by the given value and updates display
function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score    ${score}`;
}

// Increases mistakes, updates display, and checks for game over
function increaseMistakesBy(value) {
    mistakes += value;
    mistakesLabel.text = `Strikes   ${mistakes}/${maxMistakes}`;
    if (mistakes >= maxMistakes)
        gameOver();
}