const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { car_id, pickup_date, return_date, pickup_location } = req.body;
    if (!car_id || !pickup_date || !return_date)
      return res.status(400).json({ error: 'Car, pickup date, and return date are required.' });

    const carResult = await db.query('SELECT * FROM cars WHERE id = $1 AND available = TRUE', [car_id]);
    if (carResult.rows.length === 0)
      return res.status(404).json({ error: 'Car not found or unavailable.' });

    const car = carResult.rows[0];
    const d1 = new Date(pickup_date);
    const d2 = new Date(return_date);
    if (d2 <= d1) return res.status(400).json({ error: 'Return date must be after pickup date.' });

    const total_days = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    const total_price = total_days * car.price_per_day;

    const result = await db.query(
      `INSERT INTO bookings (user_id, car_id, pickup_date, return_date, pickup_location, total_days, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [req.user.id, car_id, pickup_date, return_date, pickup_location || '', total_days, total_price]
    );

    res.status(201).json({
      message: 'Booking confirmed!',
      booking_id: result.rows[0].id,
      total_days,
      total_price
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed.' });
  }
});

// Get my bookings
router.get('/my', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, c.name as car_name, c.brand, c.image_url, c.type
       FROM bookings b JOIN cars c ON b.car_id = c.id
       WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found.' });
    if (result.rows[0].status !== 'pending')
      return res.status(400).json({ error: 'Only pending bookings can be cancelled.' });

    await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [req.params.id]);
    res.json({ message: 'Booking cancelled.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

// Admin: all bookings
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, c.name as car_name, c.brand, u.name as user_name, u.email as user_email
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// Admin: update booking status
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status))
      return res.status(400).json({ error: 'Invalid status.' });
    await db.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: 'Status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

module.exports = router;