var express = require('express');
var app = express();

app.use(express.static(__dirname + "/public/dist/public"));
// require('./server/config/routes')(app);
app.all('*', function(req, res){
    res.sendFile(__dirname + '/public/dist/public/index.html');
})


app.listen(6789, function(){
    console.log('listening on port 6789');
})