const Game = require('./game').Game
const Player = require('./game').Player
const io = require('../server').io


module.exports = {

    //gives random 5 digit id for player and game

    randomPlayerId: function(){
        let possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        let id = '';
        for(let i = 0; i < 5; i++){
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return id;
    },

    //gives random rgb color value for player 

    randomColor: function(){
        let r = Math.floor((Math.random() * 155) + 100);
        let g = Math.floor((Math.random() * 155) + 100);
        let b = Math.floor((Math.random() * 155) + 100);
        return `rgb(${r}, ${g}, ${b})`;
    },

    //finds game, result is handled by callback in function, read only

    findGameById: function(id, callback){
        Game.find({id: id}, function(err, result){
            if(err){
                callback(err, null);
            } else {
                callback(null, result);
            };
        });
    },

    //sets value of game in database to beingPlayed: true for removal of game from list of available games

    updateBeingPlayed: function(id){
        Game.findOneAndUpdate({id: id}, {$set: {beingPlayed: true}}, function(err, result){
            if(err){
                console.log(err.message);
            } else {
                return result; 
            };
        });
    },

    //adds player that joined to array of players in game in database

    addPlayerToGame: function(player, gameId){
        Game.findOneAndUpdate({id: gameId}, {$push: {players: player}}, function(err){
            if(err) {
                console.log(err.message);
            };
        });
    },

    //retrieves all games from db with a value of beingPlayed: false

    findAllGames: async function(){
        try {
            const results =  await Game.find({beingPlayed: false});
            return results;
        } catch(err) {
            throw err;
        };
    },

    //finds current leader of the game being played

    findLeader: function(gameId, callback){
        Game.find({id: id}, function(err, result){
            if(err){
                callback(err, null)
            } else {
                callback(null, result.players);
            }
        })
    }

}