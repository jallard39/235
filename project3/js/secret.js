document.onkeydown = createSettingsMenu;

function createSettingsMenu(e) {
    if (e.key != "f") return;
    if (document.querySelector("#strikes") != null) {
        document.querySelector("#secret-settings").innerHTML = "";
        return;
    };

    let menu = `<div id="settings"><h1>Jordan's Secret Settings Menu</h1>`;
    menu += `<div class="setting"><label for="strikes">Strikes: </label>`;
    menu += `<input type="number" id="strikes" value=${maxMistakes} min=1></div>`;
    menu += `<div class="setting"><label for="speed">Speed Increase: </label>`;
    menu += `<input type="number" id="speed" value=${speedIncrease}></div>`;
    menu += `<div class="setting"><label for="toppings">Max Toppings: </label>`;
    menu += `<input type="number" id="toppings" value=${maxToppings} min=0></div>`;
    menu += `<div class="setting"><label for="interval">Interval for unlocking new toppings: </label>`;
    menu += `<input type="number" id="interval" value=${scoreIncrease} min=0></div>`;
    menu += '<input type="button" id="apply" value="Apply Changes" onclick="applyChanges()"></div>';
    document.querySelector("#secret-settings").innerHTML = menu;
}

function applyChanges() {
    maxMistakes = parseInt(document.querySelector("#strikes").value);
    speedIncrease = parseInt(document.querySelector("#speed").value);
    maxToppings = parseInt(document.querySelector("#toppings").value);
    scoreIncrease = parseInt(document.querySelector("#interval").value);
    if (gameScene.visible === true) {
        startGame();
    }
    else {
        quitToTitle();
    }
} 