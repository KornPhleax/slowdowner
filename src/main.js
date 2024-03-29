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

var allowed_dirs = ['sheets', 'songs'];

app.use(express.static(path.join(__dirname, '../dist')));

io.on('connection', function(socket){
  users.push(socket);
  console.log('id: ' + socket.id + ' connected');
  io.to(socket.id).emit('message','welcome. you are ' + socket.id)
  io.emit('status', {"users": users.length});

  socket.on('update', function(req){
    if(allowed_dirs.indexOf(req) >= 0){
      get_file_list(socket, req);
    }
  });

  socket.on('log', function(msg){
    console.log('id: ' + this.id + ' LOG:' + msg);
  });

  socket.on('disconnect', function(){
    console.log('id: ' + this.id + ' disconnected');
    users.splice(users.indexOf(this),1);
    io.emit('status', {"users": users.length});
  });
});

http.listen(PORT, ADDRESS, function(){
    console.log("listening on port " + PORT + " and host " + ADDRESS);
});

function get_file_list(socket, req){
    let json = [];
    let files = [];
    let songs_path = path.join(__dirname, '../dist/', req)
    fs.readdir(songs_path, (err, res) => {
      if(err) io.to(socket.id).emit('message','failed to load data... - '+err)
      else
        res.forEach(dir => {
          fs.readdirSync(path.join(songs_path,dir)).forEach(file => {
              files.push({'name': file});
          });
          json.push({'name': dir, 'files':files});
          files = [];
        });
        io.to(socket.id).emit('update_' + req ,json);
    });
}