
// Twitch stuff probably won't work localy, just mock atoken and userid
const twitch = window.Twitch.ext;
var atoken, userId, currPoke, moveUsed;



function handleWhisper(message){
    updatePokemon(message);
}
function checkChatter(chatter_list){
    console.log(userId)
    console.log(chatter_list)
    console.log(chatter_list.includes(userId))
    if (chatter_list.includes(userId)) {
        showPokeballGif()
    }
    else{
        showPokeballStatic()
    }
}
function handleBroadcast(message){

    if(message.hasOwnProperty('chatter_list'))
    {
        checkChatter(message.chatter_list);
    }
    if(message.hasOwnProperty('clear_pokemon'))
    {
        $('.primary').css("display", "none");
        $('.waiting').hide();
    }
    if(message.hasOwnProperty('uid'))
    {
        console.log(message['uid'])
        if(message['uid'] == userId){
            updatePokemon(message)

        }
    }
}
function parseJwt (token){
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
    };

twitch.onAuthorized((auth) => {
    // save our credentials
    if (twitch.viewer.isLinked) {
        $('pokeball-text').innerHTML = "If the pokeball is moving, you are eligible to be the trainer in GPB vs Chat Ironmon. If the pokeball isn't moving, either chat or gift/renew your subscription to GPB to become eligible. Click and drag the pokeball to move the extension.  Click this message to hide the text."
        // user is logged in/ID Shared
    } else {
        $('pokeball-text').innerHTML = "If you wish to participate in Chat-Vs-Poo Ironmon please grant access to your UserId in the extension. Click this message to hide the text."

        twitch.actions.requestIdShare();
    }
    atoken = auth.token; //JWT passed to backend for authentication 
    userId = 'U' + parseJwt(atoken).user_id; //opaque userID 
    console.log('whisper-'+userId)
    twitch.listen('whisper-'+userId, (target, type, message)=>{
        console.log("whisper")
        console.log(message)
        handleWhisper(JSON.parse(message));
      })
});


twitch.listen('broadcast', (target, type, message) => {
    console.log(message)
    handleBroadcast(JSON.parse(message))
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
    resetCustomTags();

    // In theory the "moveable" tag should be able to be dragged around a webpage, I was hoping users could move the extension to where they want it to be.
    $('.primary').css("display", "block");
    $('.waiting').hide();

    currPoke = pokemon;
    moveUsed = false;
    $('#name').text(pokemon.name);

    var types = pokemon.types.filter(Boolean);
    for (let t = 0; t < types.length; t++)
    {
        $(`#type${t}`).addClass(`type-${types[t]}`);
        $(`#type${t}`).text(types[t]);
    }
    if (types.length != 2)
    {
        $('#type1').hide();
        $('#type1').text('');

    }

    $('#ability').text('Ability: ' + pokemon.ability);

    $('.current-health').text(pokemon.curHP);
    $('.max-health').text(pokemon.stats.hp);
    $('.attack').text(pokemon.stats.atk);
    $('.defense').text(pokemon.stats.atk);
    $('.special-attack').text(pokemon.stats.spa);
    $('.special-defense').text(pokemon.stats.spd);
    $('.speed').text(pokemon.stats.spe);

    for (var i = 0; i < pokemon.moves.length; i++) {
        var move = pokemon.moves[i];
        var moveDetails = `Category: ${move.category}, Power: ${move.power}, Type: ${move.type}, Accuracy: ${move.accuracy}, PP: ${move.pp}`;
        var buttonColor = '#a5ffa8';
        var isDisabled = (move.pp <= 0 || pokemon.uid !== userId);
        var moveCategory = '';
        if (move.category == 'Physical'){
            moveCategory = '<img src="move-physical.png" alt="Physical" />'
        } else if (move.category == 'Status') {
            moveCategory = '<img src="move-status.png" alt="Status" />'
        } else if (move.category == 'Special') {
            moveCategory = '<img src="move-special.png" alt="Special" />'
        }

        // uid is sent to say which twitch user should be allowed to click the buttons.
        if(pokemon.uid !== userId ) {
            buttonColor = '#555753';
        }
        else if (move.pp < 5 && move.pp > 0) {
            buttonColor = '#fffd87';
        }
        else if (move.pp === 0) {
            buttonColor = '#fc7c7c';
        }

        let moveClass = move.name.replace(' ', '-');


        $(`#move${i}`).prop('title', moveDetails);
        $(`#move${i}`).prop('disabled', isDisabled);
        $(`#move${i}`).val(move.name);
        // $(`#move${i}`).removeClass();
        // $(`#move${i}`).addClass('button');
        $(`#move${i}`).addClass(moveClass);
        $(`#move${i}`).css('background-color', buttonColor);

        $(`#move${i}-name`).text(move.name);
        $(`#move${i}-category`).html(moveCategory);
        // $(`#move${i}-type`).removeClass();
        // $(`#move${i}-type`).addClass('move-type')
        $(`#move${i}-type`).addClass(`type-${move.type}`);
        $(`#move${i}-type`).text(move.type);
        $(`#move${i}-power`).text(move.power);
        $(`#move${i}-pp`).text(move.pp);
        $(`#move${i}`).off("click",  useMove);

        $(`#move${i}`).on("click", {move: $(`#move${i}`).val()}, useMove);
    }
    
    $('.waiting').hide();
}

//This is some code I found online to move a div around.  haven't been able to verify it works in the extension yet.
dragElement(document.getElementById("moveable"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    console.log("#" + elmnt.id + "header")
    $("#pokeball-image").on('mousedown',dragMouseDown);
    $("#pokeball-gif").on('mousedown',dragMouseDown);
        // if ($("#name")) {
        //     // if present, the header is where you move the DIV from:
        //     $("#name").on('mousedown', dragMouseDown);
        // } else {
        //     // otherwise, move the DIV from anywhere inside the DIV:
        //     elmnt.addEventListener("mousedown", dragMouseDown);
        // }

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
function useMove(event) {
    //$('.waiting').show();
    let moveName = event.data.move;
    console.log(moveName)
    if (currPoke.moves.find(x => x.name == moveName).pp <= 0)
    {
        console.log("you can't do that");
        return;
    }
    console.log(`${moveName} was called`);
    if(moveUsed)
    {
        console.log("Move already sent")
        return;
    }
    moveUsed = true;
    let moveClass = moveName.replace(' ', '-');
    
    // When a Move is selected put a box around it
    let div = $(`.${moveClass}`)
    div.css('borderStyle','solid');
    div.css('borderWidth','2px');
    div.css('borderColor', 'red');


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
    $('.waiting').hide();
    $('#pokeball-container').show();
    $('.primary').hide();
  //  updatePokemon(Dragonair);
}
const pokemon_max_moves = 4;
const pokemon_max_types = 2;
function resetCustomTags() {
    for (let x = 0; x <= pokemon_max_moves; x++) {
        $(`#move${x}`).removeClass();
        $(`#move${x}`).addClass('button');
        $(`#move${x}-type`).removeClass();
        $(`#move${x}-type`).addClass('type-icon')
        $(`#move${x}`).off("click",  useMove);
        $(`#move${x}`).css({
            'borderStyle':'',
            'borderWidth':'',
            'borderColor': ''
        });
    }
    for (let t = 0; t < pokemon_max_types; t++)
    {
        $(`#type${t}`).removeClass();
        $(`#type${t}`).addClass('type-icon');
    }
}
function showPokeballGif() {
    document.getElementById("pokeball-image").style.display = "none";
    document.getElementById("pokeball-gif").style.display = "block";
  }
  
  function showPokeballStatic() {
    document.getElementById("pokeball-image").style.display = "block";
    document.getElementById("pokeball-gif").style.display = "none";
  }
  
  function hidePokeballText() {
    const pokeballText = document.getElementById("pokeball-text");
    pokeballText.style.display = "none";
  }
  
  const pokeballContainer = document.getElementById("pokeball-text");
  pokeballContainer.addEventListener("click", hidePokeballText);
//   // Example function calls to switch images
//   showPokeballStatic(); // Initially show static image
//   setTimeout(showPokeballGif, 2000); // After 2 seconds, show animated image