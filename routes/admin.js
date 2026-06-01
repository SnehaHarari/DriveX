const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const total_cars    = (await db.query('SELECT COUNT(*) FROM cars')).rows[0].count;
    const total_users   = (await db.query("SELECT COUNT(*) FROM users WHERE role = 'user'")).rows[0].count;
    const total_bookings = (await db.query('SELECT COUNT(*) FROM bookings')).rows[0].count;
    const total_revenue  = (await db.query("SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status != 'cancelled'")).rows[0].coalesce;
    const pending        = (await db.query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")).rows[0].count;

    res.json({
      total_cars: parseInt(total_cars),
      total_users: parseInt(total_users),
      total_bookings: parseInt(total_bookings),
      total_revenue: parseFloat(total_revenue),
      pending_bookings: parseInt(pending)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// All users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Delete user
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = $1 AND role != 'admin'", [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

module.exports = router;