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
    let highestWPM = game.players[0].wpm;
    for(let i = 1; i < game.players.length; i++){
        if (game.players[i].wpm > highestWPM){
            highestWPM = game.players[i].wpm
        }
    }
    return highestWPM;
}
    
    io.on('connection', socket => {
        
        socket.on('addGame', data => {

            console.log("data: ", data)
            let newPlayer = {
                name: data.hostname,
                color: randomColor(),
                wpm: 0
            }
            let newGame = {
                id: data.id,
                title: data.gametitle,
                hostname: data.hostname,
                players: [newPlayer],
                leader: data.hostname,
                secondsRemaining: 60
            }
            gameArray.push(newGame)
            socket.join(data.id);
            socket.emit('addedGame', {id: data.id})
            io.emit('gameAdded', {data: gameArray})
        })

        socket.on('lookForGames', ()=> {
            console.log("GAME ARRAY: ", gameArray)
            socket.emit('gameAdded', {data: gameArray}) // re-emits all games to ViewGamesComponent
        })

        socket.on('newPlayer', data => {
            console.log("PLAYER DATA: ", data)
            let newPlayer = {
                name: data.username,
                color: randomColor(),
                wpm: 0
            }    
            for(let i = 0; i < gameArray.length; i++){
                if(gameArray[i].id == data.id){
                    console.log("WE GOT A MATCH");
                    gameArray[i].players.push(newPlayer)
                    socket.emit('joinOK', {id: data.id})
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
            console.log("GAME ID: ", id)
            let game = findGameById(id)
            console.log("HERE IS THE GAME", game)
            let interval = setInterval(() => {
                if(game.secondsRemaining == 0){
                    io.to(id).emit('gameHasEnded');
                    clearInterval(interval);
                } else {
                    game.secondsRemaining--;
                    console.log("SECONDS LEFT: ", game.secondsRemaining);
                    io.to(id).emit('updateData', {time: game.secondsRemaining, leader: leader(game)})
                }
            }, 1000)
        })


    })
    
    app.all('*', function(req, res){
        res.sendFile(__dirname + '/public/dist/public/index.html');
    })




