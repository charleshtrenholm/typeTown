const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Game = require('./config/game').Game;
const Player = require('./config/game').Player;

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

function findGameById(id, callback){
    Game.findOne({id: id}, function(err, gameCallback){
        if (err) {
            callback(err, null)
        } else {
            callback(null, gameCallback)
        }
    });
}

function updateBeingPlayed(id){
    Game.findOneAndUpdate({id: id}, {beingPlayed: true}, function(err, result){
        if (err){
            console.log("UpdateBeingPlayed error >>>", err.message)
        } else {
            return result
        }
    })
}

function addPlayerToGame(player, id){
    Game.findOneAndUpdate({id: id}, {$push: {players: player}}, function(err){
        if(err){
            console.log("AddPlayerToGame error >>>", err.message)
        } 
    })
}

async function findAllGames(){
    try {
        const results = await Game.find({});
        return results;
    } catch (err) {
        throw err;
    }
}


function findLeader(id, callback){
    Game.find({id: id}, function(err, result){
        if(err){
            callback(err, null)
        } else {
            callback(null, result);
        }
    })
}

    
    io.on('connection', socket => {
        
        socket.on('addGame', data => {

            let newPlayer = new Player({
                name: data.hostname,
                color: randomColor(),
                wpm: 0,
                playerId: randomPlayerId()
            });

            newPlayer.save(function(err){
                if(err) console.log(err.message);
            });

            let newGame = new Game({
                id: data.id,
                title: data.gametitle,
                hostname: data.hostname,
                players: [newPlayer],
                leader: newPlayer,
                secondsRemaining: 60,
                beingPlayed: false
            });

            newGame.save(function(err){
                if(err) console.log(err.message);
            });

            gameArray.push(newGame) //////////////////////
            socket.join(data.id);
            socket.emit('addedGame', {id: data.id, playerId: newPlayer.playerId})
            io.emit('gameAdded', {data: findAllGames()})///////////////
        });

        socket.on('lookForGames', async () => {
            const findall =  await findAllGames();
            socket.emit('gameAdded', {data: findall}) // re-emits all games to ViewGamesComponent
        });

        socket.on('newPlayer', data => {

            let newPlayer = new Player({
                playerId: randomPlayerId(),
                name: data.username,
                color: randomColor(),
                wpm: 0
            })

            newPlayer.save(function(err){
                if(err) {
                    console.log(err.message);
                }               
            })

            addPlayerToGame(newPlayer, data.id);
            console.log("DOUBLE CHECK", newPlayer)
            socket.emit('joinOK', {id: data.id, playerId: newPlayer.playerId});
            // io.to(data.id).emit('playerJoined', findGameById(data.id));

            // Re-emit new array of players to players waiting
            findGameById(data.id, function(err, game){
                if(err){
                    console.log(err.message);
                } else {
                    io.to(data.id).emit('playerJoined', game);
                }
            })

        })
    
        socket.on('listenForNewPlayers', id => { //when the player gets to the wait screen
            socket.join(id)
            findGameById(id, function(err, gameCallback){
                if(err){
                    console.log(err.message);
                } else {
                    socket.emit('playerJoined', gameCallback);
                }
            });
        });

        socket.on('beginWasClicked', id => {
            io.to(id).emit('playerClickedCountdown')
        })

        socket.on('gameHasStarted', id => {
            updateBeingPlayed(id);
            let seconds = 60;
            let interval = setInterval( () => {
                console.log('seconds:::', seconds)
                if(seconds <= 0){
                    io.to(id).emit('gameHasEnded');
                    clearInterval(interval);
                } else {
                    seconds--;
                    findLeader(id, function(err, game){
                        if(err){
                            console.log(err.message);
                        } else {
                            console.log("GAMEjjj ", game);
                            io.to(id).emit('updateData', {time: seconds, leader: leader})
                        };
                    });
                };
            }, 1000);
        });

        //TODO:: findgameAndUpdate here

        socket.on('playerUpdate', data => {
            let game = findGameById(data.id, function(err, game){
                if(err){
                    console.log(err.message);
                } else {
                    game.players.map(function(player){
                        if(player.playerId == data.playerId){
                            player.wpm = data.wpm;
                        }
                    })
                }
            }) ///////////////////////
            // for (let i = 0; i < game.players.length; i++){
            //     if(game.players[i].playerId == data.playerId){
            //         game.players[i].wpm = data.wpm;
            //     }
            // }
        })

        socket.on('playerTypeIndex', data => {
            socket.broadcast.to(data.id).emit('otherPlayerIndex', {index: data.index, color: 'purple'})
        })

    })
    
    app.all('*', function(req, res){
        res.sendFile(__dirname + '/public/dist/public/index.html');
    })




