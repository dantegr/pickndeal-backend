const socketIO = require('socket.io');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { createNotificationHelper } = require('../controllers/notificationController');

class SocketManager {
  constructor() {
    this.io = null;
    this.users = new Map(); // Map to store userId -> socketId
  }

  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3002",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
    
    console.log('Socket.io initialized');
    return this.io;
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);
      
      // Register user when they connect
      const userId = socket.handshake.auth?.userId;
      if (userId) {
        socket.userId = userId;
        this.registerUser(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
      }

      // Handle sending messages (1-on-1 direct messaging)
      socket.on('send_message', async (data) => {
        const { message, receiverId, senderId } = data;
        
        try {
          // Find or create chat and add message to it
          const chat = await Chat.findOrCreateChat(senderId, receiverId);
          
          // Add message to chat
          const newMessage = await chat.addMessage({
            sender: senderId,
            receiver: receiverId,
            textContent: message.textContent,
            dateSent: new Date()
          });

          // Get sender info for the response
          const sender = await User.findById(senderId).select('name email image');
          const messageWithSender = {
            ...newMessage,
            sender
          };

          // Create notification for the receiver using the controller helper
          try {
            const notification = await createNotificationHelper(
              receiverId,
              'chat',
              {
                senderId: senderId,
                senderName: sender.name || sender.email || 'Unknown User',
                message: message.textContent
              }
            );
            console.log(`Notification created for user ${receiverId} from ${sender.name || sender.email}`);
            
            // Check if receiver is connected and emit notification event
            const receiverSocketId = this.users.get(receiverId);
            if (receiverSocketId) {
              this.io.to(receiverSocketId).emit('notification_created', {
                notification,
                senderId,
                timestamp: new Date()
              });
              console.log(`Notification event emitted to user ${receiverId} on socket ${receiverSocketId}`);
            }
          } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Don't fail the message send if notification creation fails
          }

          // Emit to the specific receiver if they're online
          const receiverSocketId = this.users.get(receiverId);
          console.log(`Looking for receiver ${receiverId}, found socket: ${receiverSocketId}`);
          console.log('Current users map:', Array.from(this.users.entries()));
          
          if (receiverSocketId) {
            console.log(`Emitting new_message to receiver ${receiverId} on socket ${receiverSocketId}`);
            this.io.to(receiverSocketId).emit('new_message', {
              chatId: chat._id,
              message: messageWithSender,
              senderId,
              timestamp: newMessage.dateSent
            });
          } else {
            console.log(`Receiver ${receiverId} is not online`);
          }

          // Also emit back to sender with the saved message
          socket.emit('message_sent', {
            chatId: chat._id,
            message: messageWithSender,
            tempId: data.tempId // Include tempId to match with frontend temp message
          });

          console.log(`Message saved and sent in chat ${chat._id} from ${senderId} to ${receiverId}`);
        } catch (error) {
          console.error('Error saving/sending message:', error);
          socket.emit('message_error', {
            error: 'Failed to send message',
            tempId: data.tempId
          });
        }
      });

      // Handle typing indicators (direct messaging)
      socket.on('typing_start', (data) => {
        const { userId, receiverId } = data;
        const receiverSocketId = this.users.get(receiverId);
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit('user_typing', {
            userId,
            isTyping: true
          });
        }
      });

      socket.on('typing_stop', (data) => {
        const { userId, receiverId } = data;
        const receiverSocketId = this.users.get(receiverId);
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit('user_typing', {
            userId,
            isTyping: false
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        // Remove user from the users map
        if (socket.userId) {
          this.users.delete(socket.userId);
          
          // Notify others that user is offline
          this.io.emit('user_status', {
            userId: socket.userId,
            status: 'offline',
            timestamp: new Date()
          });
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  // This method can be called from authenticated routes when needed
  registerUser(userId, socketId) {
    // Store the user-socket mapping
    this.users.set(userId, socketId);
    console.log(`Registered user ${userId} with socket ${socketId}`);
    console.log('Current online users:', Array.from(this.users.keys()));
    
    // Notify others that user is online (only if io is initialized)
    if (this.io) {
      this.io.emit('user_status', {
        userId,
        status: 'online',
        timestamp: new Date()
      });
    }
  }

  getUserSocket(userId) {
    return this.users.get(userId);
  }

  isUserOnline(userId) {
    return this.users.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.users.keys());
  }

  // Method to emit to specific user
  emitToUser(userId, event, data) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Method to emit to both users in a 1-on-1 chat
  emitToChat(userIds, event, data) {
    userIds.forEach(userId => {
      this.emitToUser(userId, event, data);
    });
  }
}

module.exports = new SocketManager();