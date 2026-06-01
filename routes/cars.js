const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// Get all cars (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, fuel, seats, search } = req.query;
    let query = 'SELECT * FROM cars WHERE available = TRUE';
    const params = [];
    let idx = 1;

    if (type && type !== 'All') {
      query += ` AND type = $${idx++}`;
      params.push(type);
    }
    if (fuel) {
      query += ` AND fuel = $${idx++}`;
      params.push(fuel);
    }
    if (seats) {
      query += ` AND seats >= $${idx++}`;
      params.push(parseInt(seats));
    }
    if (search) {
      query += ` AND (name ILIKE $${idx} OR brand ILIKE $${idx + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      idx += 2;
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cars.' });
  }
});

// Get single car
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Car not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Add car (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, brand, type, fuel, seats, transmission, price_per_day, image_url, description, features } = req.body;
    if (!name || !brand || !type || !fuel || !price_per_day)
      return res.status(400).json({ error: 'Required fields missing.' });

    const result = await db.query(
      `INSERT INTO cars (name, brand, type, fuel, seats, transmission, price_per_day, image_url, description, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [name, brand, type, fuel, seats || 5, transmission || 'Manual', price_per_day, image_url || '', description || '', features || '']
    );
    res.status(201).json({ message: 'Car added successfully.', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add car.' });
  }
});

// Update car (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, brand, type, fuel, seats, transmission, price_per_day, image_url, description, features, available } = req.body;
    await db.query(
      `UPDATE cars SET name=$1, brand=$2, type=$3, fuel=$4, seats=$5, transmission=$6,
       price_per_day=$7, image_url=$8, description=$9, features=$10, available=$11
       WHERE id=$12`,
      [name, brand, type, fuel, seats, transmission, price_per_day, image_url, description, features,
       available !== undefined ? available : true, req.params.id]
    );
    res.json({ message: 'Car updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update car.' });
  }
});

// Delete car (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM cars WHERE id = $1', [req.params.id]);
    res.json({ message: 'Car deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete car.' });
  }
});

module.exports = router;