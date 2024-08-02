const express = require('express');
const http = require('http');
const mysql = require('mysql');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Spring@2023',
  database: 'status_updates'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');

  db.query('INSERT INTO statuses (username, status) VALUES (?, ?)', ['Papi_Mokoena', 'Just completed a marathon!'], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return;
    }
    console.log('Data inserted, ID:', result.insertId);
  });
});

// Serve static files
app.use(express.static('public'));

// Define a default route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle WebSocket connections
io.on('connection', socket => {
  console.log('New user connected');

  // Send existing statuses to the new client
  db.query('SELECT * FROM statuses ORDER BY created_at DESC', (err, results) => {
    if (err) throw err;
    socket.emit('load statuses', results);
  });

  // Listen for new status updates
  socket.on('new status', (data) => {
    const { username, status } = data;

    // Insert the new status into the database
    db.query('INSERT INTO statuses (username, status) VALUES (?, ?)', [username, status], (err, result) => {
      if (err) throw err;

      // Broadcast the new status to all connected clients
      io.emit('status update', { id: result.insertId, username, status, created_at: new Date() });
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
