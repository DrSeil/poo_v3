
// Twitch stuff probably won't work localy, just mock atoken and userid
const twitch = window.Twitch.ext;
var atoken, userId, currPoke, moveUsed;

twitch.onAuthorized((auth) => {
    // save our credentials
    atoken = auth.token; //JWT passed to backend for authentication 
    userId = auth.userId; //opaque userID 
    console.log(userId)
});

twitch.listen('broadcast', (target, type, message) => {
    console.log(message)
    updatePokemon(JSON.parse(message))
}
);

var Dragonair = {
    "uid": "U135753687",
    "nature": "Hasty",
    "curHP": 33,
    "name": "Dragonair",
    "stats": {
        "atk": 20,
        "hp": 33,
        "def": 17,
        "spa": 15,
        "spe": 20,
        "spd": 11
    },
    "types": [
        "dragon",
        "fire"
    ],
    "moves": [
        {
            "category": "Special",
            "name": "Psych Up",
            "power": "90",
            "type": "normal",
            "accuracy": "0",
            "pp": 10
        },
        {
            "category": "Status",
            "name": "Fake Tears",
            "power": "0",
            "type": "dark",
            "accuracy": "100",
            "pp": 20
        },
        {
            "category": "Physical",
            "name": "Jump Kick",
            "power": "70",
            "type": "fighting",
            "accuracy": "95",
            "pp": 3
        },
        {
            "category": "Status",
            "name": "Conversion 2",
            "power": "0",
            "type": "normal",
            "accuracy": "0",
            "pp": 0
        }
    ],
    "ability": "Swift Swim"
};
function updatePokemon(pokemon) {
    // Should make an empty page saying time to wait for the next pokemon
    if(pokemon.hasOwnProperty('clear_pokemon'))
    {
        document.getElementById('moveable').style.display='none';
        return;
    }
    // In theory the "moveable" tag should be able to be dragged around a webpage, I was hoping users could move the extension to where they want it to be.
    document.getElementById('moveable').style.display='block';

    currPoke = pokemon;
    moveUsed = false;
    document.getElementById('name').innerText = pokemon.name;

    var types = pokemon.types.filter(Boolean);
    var icon_types = []
    var icon_text = ""
    for (t in types)
    {
        icon_text += "<p class='type-icon type-" + types[t] +"'>"+types[t]+"</p> "
    }
    document.getElementById('types').innerHTML = icon_text;

    document.getElementById('ability').innerText = 'Ability: ' + pokemon.ability;

    var stats = pokemon.stats;
    var statsHtml = '<div class="column">HP: ' + pokemon.curHP + '/' + stats.hp + '<br>ATK: ' + stats.atk + '<br>DEF: ' + stats.def + '</div>' +
        '<div class="column">SPA: ' + stats.spa + '<br>SPD: ' + stats.spd + '<br>SPE: ' + stats.spe + '</div>';
    document.getElementById('stats').innerHTML = statsHtml;

    var movesHtml = '<div class="grid-container">';
    for (var i = 0; i < pokemon.moves.length; i++) {
        var move = pokemon.moves[i];
        var moveDetails = 'Category: ' + move.category + ', Power: ' + move.power + ', Type: ' + move.type + ', Accuracy: ' + move.accuracy + ', PP: ' + move.pp;
        // var buttonColor = 'background-color: #a5ffa8;';
        var buttonColor = ''
        var isDisabled = '';


        if (move.pp < 5) {
            buttonColor = 'background-color: #fffd87;';
        }
        if (move.pp === 0) {
            buttonColor = 'background-color: #fc7c7c;';
            isDisabled = 'disabled';
        }
        // uid is sent to say which twitch user should be allowed to click the buttons.
        if(pokemon.uid !== userId )
        {
            buttonColor = 'background-color: #555753;';

            isDisabled = 'disabled'
        }
        movesHtml += '<button class="button" id="'+move.name+'"style="' + buttonColor + '" onclick="useMove(\'' + move.name + '\')" title="' + moveDetails + '" ' + isDisabled + '>' + move.name +  "<br><p class='type-icon type-" + move.type +"'>"+move.type+"</p> "+'<br>POW:'+ move.power+ ' PP: ' + move.pp + '</button>';
        // if (i % 2 !== 0) movesHtml += '<br>';
    }
    movesHtml += '</div>';

    document.getElementById('moves').innerHTML = movesHtml;
}

//This is some code I found online to move a div around.  haven't been able to verify it works in the extension yet.
dragElement(document.getElementById("moveable"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
function useMove(moveName) {
    if(moveUsed)
    {
        console.log("Move already sent")
        return;
    }
    moveUsed = true;
    
    // When a Move is selected put a box around it
    div = document.getElementById(moveName)
    // Get the div element

    div.style.borderStyle = 'solid';

    // Set the border width
    div.style.borderWidth = '2px';

    // Set the border color
    div.style.borderColor = 'red';


    // Make a request to send the move information.
    let url = 'https://ironmon.royston.com';
    let data = { selectedMove: moveName, 
                    timestamp: new Date().getTime(),
                token: atoken,
                pokemon: currPoke   
                };
    //console.log(data);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        //.then(data => console.log(data))
        .catch((error) => console.error('Error:', error));
}
window.onload = function () {

    console.log("loaded");
    updatePokemon(Dragonair);
}