var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// var games = require('./config/games')

const server = app.listen(6789, function(){
    console.log('listening on port 6789');
})


app.use(bodyParser.json())
app.use(express.static(__dirname + "/public/dist/public"));

const io = require('socket.io')(server)
const gameArray = []

function randomPlayerId(){
    let possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    let id = '';
    for(var i = 0; i < 5; i++){
        id += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return id;
}

function randomColor(){
    let r = Math.floor((Math.random() * 155) + 100)
    let g = Math.floor((Math.random() * 155) + 100)
    let b = Math.floor((Math.random() * 155) + 100)
    return `rgb(${r},${g},${b})`
}

function findGameById(id){
    for(let i = 0; i < gameArray.length; i++){
        if (gameArray[i].id == id){
            return gameArray[i];
        }
    }
}

function leader(game){
    console.log("this is the leader:");
    let leader = game.players[0];
    for(let i = 0; i < game.players.length; i++){
        if (game.players[i].wpm > leader.wpm){
            leader = game.players[i];
            game.leader = game.players[i];
        }
    }
    return leader;
}
    
    io.on('connection', socket => {
        
        socket.on('addGame', data => {

            console.log("data: ", data)
            let newPlayer = {
                name: data.hostname,
                color: randomColor(),
                wpm: 0,
                playerId: randomPlayerId()
            }
            let newGame = {
                id: data.id,
                title: data.gametitle,
                hostname: data.hostname,
                players: [newPlayer],
                leader: data.hostname,
                secondsRemaining: 60,
                beingPlayed: false
            }
            gameArray.push(newGame)
            socket.join(data.id);
            socket.emit('addedGame', {id: data.id, playerId: newPlayer.playerId})
            io.emit('gameAdded', {data: gameArray})
        })

        socket.on('lookForGames', ()=> {
            console.log("GAME ARRAY: ", gameArray)
            socket.emit('gameAdded', {data: gameArray}) // re-emits all games to ViewGamesComponent
        })

        socket.on('newPlayer', data => {
            console.log("PLAYER DATA: ", data)
            let newPlayer = {
                playerId: randomPlayerId(),
                name: data.username,
                color: randomColor(),
                wpm: 0
            }    
            for(let i = 0; i < gameArray.length; i++){
                if(gameArray[i].id == data.id){
                    console.log("WE GOT A MATCH");
                    gameArray[i].players.push(newPlayer)
                    socket.emit('joinOK', {id: data.id, playerId: newPlayer.playerId})
                    io.to(data.id).emit('playerJoined', gameArray[i]) // once the player has already joined
                }
            }
    })
    
        socket.on('listenForNewPlayers', id => { //when the player gets to the wait screen
            socket.join(id)
            for(let i = 0; i < gameArray.length; i++){
                if(gameArray[i].id == id){
                    socket.emit('playerJoined', gameArray[i])
                }
            }
        })

        socket.on('beginWasClicked', id => {
            io.to(id).emit('playerClickedCountdown')
        })

        socket.on('gameHasStarted', id => {
            let game = findGameById(id)
            if (game.beingPlayed == true){
                return; //?
            } else {
            game.beingPlayed = true;
            let interval = setInterval(() => {
                if(game.secondsRemaining == 0){
                    io.to(id).emit('gameHasEnded');
                    clearInterval(interval);
                } else {
                    game.secondsRemaining--;
                    let lead = leader(game);
                    io.to(id).emit('updateData', {time: game.secondsRemaining, leader: lead})
                }
            }, 1000)
        }
        })

        socket.on('playerUpdate', data => {
            let game = findGameById(data.id)
            console.log("HERE IS THE DATA: ", data)
            console.log("HERE IS THE GAME: ", game);
            for (let i = 0; i < game.players.length; i++){
                if(game.players[i].playerId == data.playerId){
                    game.players[i].wpm = data.wpm;
                    console.log("WPMWPMWPMWPMWPMW", game.players[i]);
                }
            }
        })

    })
    
    app.all('*', function(req, res){
        res.sendFile(__dirname + '/public/dist/public/index.html');
    })




