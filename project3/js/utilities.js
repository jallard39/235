// Uses bounding box collision detection to determine if objects overlap
function rectsIntersect(a, b) {
    let aBox = a.getBounds();
    let bBox = b.getBounds();

    if (aBox.x + aBox.width > bBox.x &&
        aBox.x < bBox.x + bBox.width &&
        aBox.y + aBox.height > bBox.y &&
        aBox.y < bBox.y + bBox.height) {
        return true;
    }
    else {
        return false;
    }
}

// Returns true if joining the objects at the current position will increase the width of the param 'a'
function increasesBounds(a, b, margin) {
    let aBox = a.getBounds();
    let bBox = b.getBounds();

    if (bBox.x + margin < aBox.x || bBox.y + margin < aBox.y ||
        Math.abs(bBox.x - aBox.x) + bBox.width > a.texture.width + margin ||
        Math.abs(bBox.y - aBox.y) + bBox.height > a.texture.height + margin)
        return true;
    else
        return false;
}

// Returns a random integer between min and max
function getRandom(min, max) {
    return Math.trunc(Math.random() * (max - min) + min);
}

function getLocalX(pizza, topping) {
    return topping.x - pizza.x;
}

function getLocalY(pizza, topping) {
    return topping.y - pizza.y;
}