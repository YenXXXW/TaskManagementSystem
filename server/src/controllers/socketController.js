module.exports = (socket) => {
  socket.on('register', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} has been registered`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected: ', socket.id);
  });

};
