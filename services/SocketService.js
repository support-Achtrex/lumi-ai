const logger = require('../config/logger');
const jwt    = require('jsonwebtoken');
const LumiAIService = require('./LumiAIService');
const ConversationService = require('./ConversationService');

function setupSocketHandlers(io) {

  // ── Auth middleware for socket connections ─────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    // ── Join user's personal room ────────────────────────────────────────────
    socket.join(`user:${socket.userId}`);

    // ── Handle streaming chat message ────────────────────────────────────────
    socket.on('chat:message', async ({ message, conversationId }) => {
      try {
        // Get or create conversation
        let convId = conversationId;
        if (!convId) {
          const conv = await ConversationService.createConversation({
            userId: socket.userId,
            title:  ConversationService.generateTitle(message)
          });
          convId = conv.id;
          socket.emit('chat:conversation_created', { conversationId: convId });
        }

        // Get history
        const history = await ConversationService.getMessageHistory(convId, 20);
        const messages = [...history, { role: 'user', content: message }];

        // Save user message
        await ConversationService.saveMessage({
          conversationId: convId,
          role: 'user', content: message
        });

        // Stream LUMI AI response
        socket.emit('chat:stream_start', { conversationId: convId });

        let fullResponse = '';
        const stream = await LumiAIService.chat({ messages, sessionId: convId, stream: true });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text;
            fullResponse += text;
            socket.emit('chat:token', { text, conversationId: convId });
          }
        }

        // Save AI response
        await ConversationService.saveMessage({
          conversationId: convId,
          role: 'assistant', content: fullResponse
        });

        socket.emit('chat:stream_end', { conversationId: convId, fullResponse });

      } catch (error) {
        logger.error('Socket chat error:', error);
        socket.emit('chat:error', { message: 'Failed to process message. Please try again.' });
      }
    });

    // ── Handle typing indicators ─────────────────────────────────────────────
    socket.on('chat:typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('chat:user_typing', {
        userId: socket.userId
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocketHandlers };
