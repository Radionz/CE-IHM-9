var app = require('express')(),
http = require('http').Server(app),
io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send('<h1>DriveSafer server OK</h1>');
});

io.on('connection', function(socket){
  console.log('user connected: ' + socket.id);
  socket.emit('ack', "connected");

  socket.on('disconnect', function(){
    console.log('user disconnected: ' + socket.id);
  });

  socket.on('message', function(msg){
    console.log('client:'+ socket.id + ' send message: ' + msg.replace("btn_", ""));
    socket.broadcast.emit('message', msg);
  });
});

http.listen(8080, function(){
  console.log('Server listening on *:8080');
});
