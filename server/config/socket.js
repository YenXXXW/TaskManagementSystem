const { Server } = require('socket.io');
let io
function createSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  return io;
}


function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { createSocketServer, getIO };
