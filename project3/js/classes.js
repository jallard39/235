class Pizza extends PIXI.Sprite {
    constructor(speed = 100, x = 0, y = 0) {
        super(app.loader.resources["images/pizza-dough.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.zIndex = 0;
        this.fwd = {x:1, y:0};
        this.speed = speed;
        this.isLocked = false;
        this.isComplete = false;
        this.sauceType = null;
        this.hasCheese = false;
        this.ingredients = {
            "pepperoni": 0,
            "sausage": 0,
            "mushroom": 0,
            "pepper": 0,
            "olive": 0
        };
    }

    move(dt = 1/60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    lock() {
        this.isLocked = true;
        this.speed = 450;
    }
}

class ToppingBin extends PIXI.Sprite {
    constructor(imagePath, type, x = 0, y = 0) {
        super(app.loader.resources[imagePath].texture);
        this.anchor.set(0, 1);
        this.x = x;
        this.y = y;
        this.interactive = true;
        this.sortableChildren = true;
        this.type = type;
        this.on("pointerdown", getTopping);
    }
}

class Topping extends PIXI.Sprite {
    constructor(type, x = 0, y = 0) {
        super(app.loader.resources[types[type]].texture);
        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.type = type;
        this.zIndex = 2;
        this.sauceType = null;
        this.gravity = 450;
        this.state = "move"
        this.interactive = true;
        this.on("pointerup", updateToppingState);
    }

    fall(dt = 1/60) {
        this.y += this.gravity * dt;
    }
}

class Order extends PIXI.Container {
    constructor(numToppings) {
        super();
        this.numToppings = numToppings;
        this.sauceType = null;
        this.ingredients = {
            "pepperoni": 0,
            "sausage": 0,
            "mushroom": 0,
            "pepper": 0,
            "olive": 0
        };
        this.sprites = {
            "red": null,
            "white": null,
            "cheese": null,
            "pepperoni": null,
            "sausage": null,
            "mushroom": null,
            "pepper": null,
            "olive": null
        }
        this.checkmark = null;
        this.xmark = null;
    }

    display() {
        gameScene.addChild(this);

        // Add sauce
        let sauce;
        if (this.sauceType == "red") {
            sauce = new PIXI.Sprite(app.loader.resources["images/order-red-sauce.png"].texture);
            this.sprites["red"] = sauce;
        }
        else if (this.sauceType == "white") {
            sauce = new PIXI.Sprite(app.loader.resources["images/order-white-sauce.png"].texture);
            this.sprites["white"] = sauce;
        }
        sauce.x = 560;
        sauce.y = 60;
        gameScene.addChild(sauce);
        this.addChild(sauce);

        // Add cheese
        let cheese = new PIXI.Sprite(app.loader.resources["images/order-cheese.png"].texture);
        cheese.x = 620;
        cheese.y = 60;
        this.sprites["cheese"] = cheese;
        gameScene.addChild(cheese);
        this.addChild(cheese);

        // Add toppings
        let displayBox = new PIXI.Rectangle(725, 55, 180, 138);
        let counter = 0;
        for (let i = 0; i < 5; i++) {
            let num = this.ingredients[toppingsList[i]];
            if (num) {
                let toppings = new PIXI.Container();
                let top;
                for (let j = 0; j < num; j++) {
                    top = new PIXI.Sprite(app.loader.resources[types[toppingsList[i]]].texture);
                    top.scale.set(0.65);
                    top.anchor.set(0.5, 0.5);
                    top.x = displayBox.x + (displayBox.width/(num*2)) + (j* (displayBox.width / num));
                    top.y = displayBox.y + (displayBox.height/(this.numToppings*2) + (counter * (displayBox.height/this.numToppings)));
                    toppings.addChild(top);
                }
                this.sprites[toppingsList[i]] = toppings;
                this.addChild(toppings);
                counter++;
            }
        }

        // Add hidden checkmark and X
        let checkmark = new PIXI.Sprite(app.loader.resources["images/order-checkmark.png"].texture);
        checkmark.x = 580;
        checkmark.y = 60;
        this.addChild(checkmark);
        this.checkmark = checkmark;
        checkmark.visible = false;

        let xmark = new PIXI.Sprite(app.loader.resources["images/order-x.png"].texture);
        xmark.x = 560;
        xmark.y = 60;
        this.addChild(xmark);
        this.xmark = xmark;
        xmark.visible = false;
    }
}


// Some helpful data structures

let types = {
    "red-sauce": "images/sauce-red.png",
    "white-sauce": "images/sauce-white.png",
    "cheese": "images/cheese.png",
    "pepperoni": "images/pepperoni.png",
    "sausage": "images/sausage.png",
    "mushroom": "images/mushroom.png",
    "pepper": "images/pepper.png",
    "olive": "images/olive.png",
    "red": "images/blob-red.png",
    "white": "images/blob-white.png"
}

let toppingsList = ["pepperoni", "sausage", "mushroom", "pepper", "olive"];