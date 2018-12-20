var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// var games = require('./config/games')

const server = app.listen(6789, function(){
    console.log('listening on port 6789');
})

const io = require('socket.io')(server)
const games = {};

app.use(bodyParser.json())
app.use(express.static(__dirname + "/public/dist/public"));
// require('./server/config/routes')(app);


app.post('/game', function(req, res){
    games[req.body.id] = {
        hostname: req.body.hostname,
        gametitle: req.body.gametitle,
        players: [req.body.hostname]
    }
    // io.socket.emit('gameAdded', {message: "testing890", newGame: games})
    res.json({id: req.body.id});
})

app.all('*', function(req, res){
    res.sendFile(__dirname + '/public/dist/public/index.html');
})




io.on('connection', socket => {

    socket.on('addGame', data => {
        games[data.id] = {
            hostname: data.data.hostname,
            gametitle: data.data.gametitle,
            players: [data.data.hostname]
        }
        console.log("GAMEZ", games);
        socket.emit('addedGame', {message: "HERE IS THE DATA YO", id: data.id});
    })

})





