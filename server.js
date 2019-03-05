const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Game = require('./config/game').Game;
const Player = require('./config/game').Player;
const games = require('./confic/games');

const server = app.listen(6789, function(){
    console.log('listening on port 6789');
})


app.use(bodyParser.json())
app.use(express.static(__dirname + "/public/dist/public"));

const io = require('socket.io')(server)
const gameArray = [];
 
    io.on('connection', socket => {
        
        socket.on('addGame', data => {

            let newPlayer = new Player({
                name: data.hostname,
                color: games.randomColor(),
                wpm: 0,
                playerId: games.randomPlayerId()
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
            io.emit('gameAdded', {data: newGame})///////////////
        });

        socket.on('lookForGames', async () => {
            const findall =  await games.findAllGames();
            socket.emit('gameAdded', {data: findall}) // re-emits all games to ViewGamesComponent
        });

        socket.on('newPlayer', data => {

            let newPlayer = new Player({
                playerId: games.randomPlayerId(),
                name: data.username,
                color: games.randomColor(),
                wpm: 0
            })

            newPlayer.save(function(err){
                if(err) {
                    console.log(err.message);
                }               
            })

            games.addPlayerToGame(newPlayer, data.id);
            console.log("DOUBLE CHECK", newPlayer)
            socket.emit('joinOK', {id: data.id, playerId: newPlayer.playerId});
            // io.to(data.id).emit('playerJoined', findGameById(data.id));

            // Re-emit new array of players to players waiting
            games.findGameById(data.id, function(err, game){
                if(err){
                    console.log(err.message);
                } else {
                    io.to(data.id).emit('playerJoined', game);
                }
            })

        })
    
        socket.on('listenForNewPlayers', id => { //when the player gets to the wait screen
            socket.join(id)
            games.findGameById(id, function(err, gameCallback){
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
            games.updateBeingPlayed(id);
            let seconds = 60;
            let interval = setInterval( () => {
                console.log('seconds:::', seconds)
                if(seconds <= 0){
                    io.to(id).emit('gameHasEnded');
                    clearInterval(interval);
                } else {
                    seconds--;
                    games.findLeader(id, function(err, game){
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
            let game = games.findGameById(data.id, function(err, game){
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




