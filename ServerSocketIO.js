const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");
require("dotenv").config();

class ChatServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIO(this.server);
        this.connections = new Map();
    }

    startServer(port) {
        this.setupServer(port);
        this.setupSocketIO();
    }

    setupServer(port) {
        this.app.use(
        cors({
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST", "PUT", "DELETE"],
        })
        );
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use("/", (req, res) => {
        return res.send("SERVER ON");
        });
        this.server.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
        });
    }

    setupSocketIO() {
        this.io.on("connection", (socketSender) => {
        socketSender.on("serverConnect", (inforSender) => {
            this.handleServerConnect(socketSender, inforSender);
        });

        socketSender.on("new", (inforSender) => {
            this.handleNewClient(socketSender, inforSender);
        });

        socketSender.on("message", (messageSender) => {
            this.handleMessage(messageSender);
        });
        ~socketSender.on("disconnect", () => {
            this.handleDisconnect(socketSender);
        });
        });
    }

    handleServerConnect(socketSender, inforSender) {
        this.connections.set(socketSender, inforSender);
        console.log(`Server connected`);
    }

    handleNewClient(socketSender, inforSender) {
        this.connections.set(socketSender, inforSender);
        console.log(`New connect username: ${inforSender.username}`);
    }

    handleMessage(messageSender) {
        const usernameReceivers = ['abc', 'Marry', 'Caty'];
        
        this.connections.forEach((usernameReceiver, socketReceiver) => {
            let messageObject = JSON.parse(messageSender); 

            if (usernameReceiver.username === messageObject.username) {
                messageObject.typeSender = "SENDER_" + messageObject.typeSender;
                socketReceiver.emit('receiveMessage', JSON.stringify(messageObject)); 
            } else if (usernameReceivers.includes(messageObject.username)) {
                messageObject.typeSender = "RECEIVER_" + messageObject.typeSender;
                socketReceiver.emit('receiveMessage', JSON.stringify(messageObject)); 
            }
        });
    }

    handleDisconnect(socketSender) {
        this.connections.delete(socketSender);
        console.log(`Close connect`);
    }
}

const PORT = process.env.PORT || 8888;
const chatServer = new ChatServer();
chatServer.startServer(PORT);
