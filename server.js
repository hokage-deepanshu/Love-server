const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // <-- 1. YEH LINE ADD KARO

const app = express();
app.use(cors()); // <-- 2. YEH LINE ADD KARO

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"] // <-- 3. Yeh bhi add kar do, best practice hai
    }
});
// ... baaki ka code

const players = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Jab naya user join karta hai
    socket.on('join', (name) => {
        players[socket.id] = { id: socket.id, name, position: { x: Math.random() * 4 - 2, y: 0, z: Math.random() * 4 - 2 } };
        // Sabko naye player ki info bhejo
        io.emit('update-players', players);
    });

    // Jab koi message bhejta hai
    socket.on('sendMessage', (message) => {
        const sender = players[socket.id];
        if(sender) {
             io.emit('receiveMessage', { name: sender.name, message });
        }
    });

    // Jab koi avatar move karta hai
    socket.on('move', (position) => {
        if (players[socket.id]) {
            players[socket.id].position = position;
            // Sabko movement ki update bhejo
            io.emit('update-players', players);
        }
    });
    
    // Jab koi star create karta hai
    socket.on('createStar', (position) => {
        io.emit('newStar', position);
    });

    // Jab koi heartbeat sync karta hai
    socket.on('syncHeartbeat', () => {
        if (players[socket.id]) {
            io.emit('heartbeat', players[socket.id].id);
        }
    });

    // Jab user disconnect hota hai
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id];
        io.emit('update-players', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Messenger Boy is listening on port ${PORT}`));