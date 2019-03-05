const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/type-town');


const playerSchema = new mongoose.Schema({
    name: {type: String},
    wpm: {type: Number},
    color: {type: String},
    playerId: {type: String}
})

const gameSchema = new mongoose.Schema({
    id: {type: String},
    hostname: {type: String, default: "guest"},
    title: {type: String, default: "game" + Math.floor(Math.random() * 10000)},
    players: {type: [playerSchema]},
    leader: {type: playerSchema},
    secondsRemaining: {type: Number},
    beingPlayed: {type: Boolean}
}, {timestamps: true})


mongoose.model("Player" , playerSchema);
mongoose.model("Game" , gameSchema);

module.exports = {
    Game: mongoose.model("Game"),
    Player: mongoose.model("Player")
}