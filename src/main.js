const PORT = 8080;
const ADDRESS = '0.0.0.0';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var path = require('path');
var machine = require('child_process');
var fs = require('fs');

var users = [];

app.use(express.static(path.join(__dirname, 'static')));

io.on('connection', function(socket){
  users.push(socket);
  console.log('id: ' + socket.id + ' connected');
  io.to(socket.id).emit('message','welcome. you are ' + socket.id)
  io.emit('status', {"users": users.length});
  get_dirs(socket);


  socket.on('disconnect', function(){
    console.log('id: ' + this.id + ' disconnected');
    users.splice(users.indexOf(this),1);
    io.emit('status', {"users": users.length});
  });
});

http.listen(PORT, ADDRESS, function(){
    console.log("listening on port " + PORT + " and host " + ADDRESS);
});

function get_dirs(socket){
    let json = [];
    let files = [];
    fs.readdirSync('./src/static/songs').forEach(dir => {
        fs.readdirSync('./src/static/songs/'+dir).forEach(file => {
            files.push({'name': file});
        });
        json.push({'name': dir, 'files':files});
        files = [];
    });
    io.to(socket.id).emit('update_dirs',json);
}
