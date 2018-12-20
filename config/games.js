const Game = require('./game').Game
const Player = require('./game').Player
const io = require('../server').io


module.exports = {
    postNewGame: function(req, res) {
        let player = new Player;
        player.name = req.body.hostname;
        
    }
}