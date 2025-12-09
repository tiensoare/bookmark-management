// server.js - Bookmark Management System API
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'https://bms-frontend.onrender.com', // Your actual frontend URL
    'http://localhost:5173' // For local development
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Database connection pool


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// ==================== BOOKMARKS ENDPOINTS ====================

// GET /api/bookmarks - Get all bookmarks for a user
app.get('/api/bookmarks', async (req, res) => {
  const { user_id, is_archived } = req.query;

  try {
    let query = `
      SELECT 
        b.*,
        COUNT(bi.id) as images_count
      FROM bookmarks b
      LEFT JOIN bookmark_images bi ON bi.bookmark_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (user_id) {
      query += ` AND b.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (is_archived !== undefined) {
      query += ` AND b.is_archived = $${paramCount}`;
      params.push(is_archived === 'true');
      paramCount++;
    }

    query += `
      GROUP BY b.id
      ORDER BY 
        COALESCE(b.sort_order, 999999),
        b.created_at DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// GET /api/bookmarks/:id - Get a single bookmark
app.get('/api/bookmarks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM bookmarks WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching bookmark:', err);
    res.status(500).json({ error: 'Failed to fetch bookmark' });
  }
});

// POST /api/bookmarks - Create a new bookmark
app.post('/api/bookmarks', async (req, res) => {
  const { user_id, url, title, notes, is_archived, sort_order } = req.body;

  if (!user_id || !url) {
    return res.status(400).json({ error: 'user_id and url are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bookmarks (user_id, url, title, notes, is_archived, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, url, title || null, notes || null, is_archived || false, sort_order || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating bookmark:', err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Bookmark URL already exists for this user' });
    } else {
      res.status(500).json({ error: 'Failed to create bookmark' });
    }
  }
});

// PUT /api/bookmarks/:id - Update a bookmark
app.put('/api/bookmarks/:id', async (req, res) => {
  const { id } = req.params;
  const { url, title, notes, is_archived, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE bookmarks 
       SET url = COALESCE($1, url),
           title = COALESCE($2, title),
           notes = COALESCE($3, notes),
           is_archived = COALESCE($4, is_archived),
           sort_order = COALESCE($5, sort_order)
       WHERE id = $6
       RETURNING *`,
      [url, title, notes, is_archived, sort_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating bookmark:', err);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

// DELETE /api/bookmarks/:id - Delete a bookmark
app.delete('/api/bookmarks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM bookmarks WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting bookmark:', err);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// PATCH /api/bookmarks/:id/archive - Toggle archive status
app.patch('/api/bookmarks/:id/archive', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE bookmarks 
       SET is_archived = NOT is_archived
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling archive:', err);
    res.status(500).json({ error: 'Failed to toggle archive status' });
  }
});

// ==================== IMAGES ENDPOINTS ====================

// GET /api/bookmarks/:id/images - Get all images for a bookmark
app.get('/api/bookmarks/:id/images', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM bookmark_images 
       WHERE bookmark_id = $1 
       ORDER BY position ASC NULLS LAST, created_at ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// POST /api/bookmarks/:id/images - Add an image to a bookmark
app.post('/api/bookmarks/:id/images', async (req, res) => {
  const { id } = req.params;
  const { image_url, content_type, width_px, height_px, size_bytes, caption, position } = req.body;

  if (!image_url || !content_type) {
    return res.status(400).json({ error: 'image_url and content_type are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bookmark_images 
       (bookmark_id, image_url, content_type, width_px, height_px, size_bytes, caption, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, image_url, content_type, width_px || null, height_px || null, size_bytes || null, caption || null, position || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding image:', err);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// DELETE /api/images/:id - Delete an image
app.delete('/api/images/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM bookmark_images WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ==================== USERS ENDPOINTS ====================

// GET /api/users/:id - Get user by ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, email, display_name, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users/email/:email - Get user by email
app.get('/api/users/email/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, email, display_name, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bookmark API server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end();
  process.exit(0);
});