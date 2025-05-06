require('dotenv').config();

const http = require('http');
const connectDB = require('../config/db');
const configureMorgan = require('../config/log');
const { createSocketServer } = require('../config/socket');
const handleSocketEvents = require('./controllers/socketController')
const cookieParser = require('cookie-parser');

const app = require('./app');

connectDB();
configureMorgan(app);
const server = http.createServer(app);
const io = createSocketServer(server);

io.on('connection', (socket) => {
  handleSocketEvents(socket);
});

app.use(cookieParser());

app.get('/api', (req, res) => {
  console.log(req.cookies)
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ message: 'Welcome to Task Management System API' });
});

app.use((_, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, _, res) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


