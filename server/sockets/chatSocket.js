const Message = require("../models/Message");

function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // client joins a "room" for a specific conversation
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
    });

    // client sends a message
    socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
      try {
        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          text,
        });

        // broadcast the new message to everyone in that conversation's room
        io.to(conversationId).emit("newMessage", message);
      } catch (err) {
        socket.emit("errorMessage", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}

module.exports = chatSocket;