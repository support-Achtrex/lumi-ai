const { query } = require('../config/database');
const { get, set } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

class ConversationService {

  // ── Create new conversation session ──────────────────────────────────────
  static async createConversation({ userId, title, enterpriseId, vehicleContext }) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO conversations (id, user_id, enterprise_id, title, vehicle_context, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [id, userId, enterpriseId || null, title || 'New Conversation', JSON.stringify(vehicleContext || {})]
    );
    return result.rows[0];
  }

  // ── Get conversation with message history ─────────────────────────────────
  static async getConversation(conversationId, userId) {
    const cacheKey = `conversation:${conversationId}`;
    const cached = await get(cacheKey);
    if (cached) return cached;

    const convResult = await query(
      `SELECT c.*, u.name as user_name, u.email as user_email
       FROM conversations c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1 AND c.user_id = $2 AND c.deleted_at IS NULL`,
      [conversationId, userId]
    );

    if (convResult.rows.length === 0) return null;

    const conversation = convResult.rows[0];

    const messagesResult = await query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [conversationId]
    );

    conversation.messages = messagesResult.rows;

    await set(cacheKey, conversation, 300); // 5 min cache
    return conversation;
  }

  // ── Get message history in Claude format ─────────────────────────────────
  static async getMessageHistory(conversationId, limit = 20) {
    const result = await query(
      `SELECT role, content FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [conversationId, limit]
    );

    // Return in chronological order for Claude API
    return result.rows.reverse().map(row => ({
      role:    row.role,
      content: row.content
    }));
  }

  // ── Save a message ────────────────────────────────────────────────────────
  static async saveMessage({ conversationId, role, content, metadata }) {
    const id = uuidv4();

    await query(
      `INSERT INTO messages (id, conversation_id, role, content, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, conversationId, role, content, JSON.stringify(metadata || {})]
    );

    // Update conversation timestamp
    await query(
      `UPDATE conversations SET updated_at = NOW(), message_count = message_count + 1
       WHERE id = $1`,
      [conversationId]
    );

    // Invalidate cache
    await this.invalidateCache(conversationId);

    return id;
  }

  // ── Get user conversation list ────────────────────────────────────────────
  static async getUserConversations(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT c.id, c.title, c.created_at, c.updated_at, c.message_count,
              c.vehicle_context->>'vin' as vehicle_vin
       FROM conversations c
       WHERE c.user_id = $1 AND c.deleted_at IS NULL
       ORDER BY c.updated_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM conversations WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    return {
      conversations: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  }

  // ── Soft delete conversation ──────────────────────────────────────────────
  static async deleteConversation(conversationId, userId) {
    const result = await query(
      `UPDATE conversations SET deleted_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [conversationId, userId]
    );

    if (result.rows.length === 0) return false;
    await this.invalidateCache(conversationId);
    return true;
  }

  // ── Update conversation title ─────────────────────────────────────────────
  static async updateTitle(conversationId, userId, title) {
    await query(
      `UPDATE conversations SET title = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3`,
      [title, conversationId, userId]
    );
    await this.invalidateCache(conversationId);
  }

  // ── Auto-generate title from first message ────────────────────────────────
  static generateTitle(firstMessage) {
    const clean = firstMessage.replace(/\n/g, ' ').trim();
    return clean.length > 60 ? clean.substring(0, 60) + '...' : clean;
  }

  // ── Invalidate Redis cache for conversation ───────────────────────────────
  static async invalidateCache(conversationId) {
    const { del } = require('../config/redis');
    await del(`conversation:${conversationId}`);
  }
}

module.exports = ConversationService;
