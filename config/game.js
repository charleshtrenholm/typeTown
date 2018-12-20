var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/TypeTownTest')


const playerSchema = new mongoose.Schema({
    name: {type: String},
    wpm: {type: Number}
})

const gameSchema = new mongoose.Schema({
    hostname: {type: String, default: "guest"},
    gametitle: {type: String, default: "game" + Math.floor(Math.random() * 10000)},
    players: {type: [playerSchema]},
    leader: {type: playerSchema}
}, {timestamps: true})


mongoose.model("Player" , playerSchema);
mongoose.model("Game" , gameSchema);

module.exports = {
    Game: mongoose.model("Game"),
    Player: mongoose.model("Player")
}