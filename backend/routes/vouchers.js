const router = require('express').Router();
const crypto = require('crypto');
const db = require('../db/db');
const auth = require('../middleware/auth');

function generateCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Create a voucher
router.post('/', auth, (req, res) => {
  const { value, expires_at } = req.body;
  if (!value || isNaN(value) || value <= 0) return res.status(400).json({ error: 'Valid value required' });

  const code = generateCode();
  const { lastInsertRowid } = db
    .prepare('INSERT INTO vouchers (code, value, owner_id, expires_at) VALUES (?, ?, ?, ?)')
    .run(code, value, req.user.id, expires_at || null);

  const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(lastInsertRowid);
  res.status(201).json(voucher);
});

// List vouchers for the authenticated user
router.get('/', auth, (req, res) => {
  const vouchers = db.prepare('SELECT * FROM vouchers WHERE owner_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(vouchers);
});

// Redeem a voucher by code
router.post('/redeem', auth, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });

  const voucher = db.prepare('SELECT * FROM vouchers WHERE code = ?').get(code);
  if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
  if (voucher.status !== 'active') return res.status(409).json({ error: `Voucher is ${voucher.status}` });
  if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    db.prepare("UPDATE vouchers SET status = 'expired' WHERE id = ?").run(voucher.id);
    return res.status(409).json({ error: 'Voucher has expired' });
  }

  db.prepare("UPDATE vouchers SET status = 'redeemed' WHERE id = ?").run(voucher.id);
  db.prepare('INSERT INTO redemptions (voucher_id, redeemed_by) VALUES (?, ?)').run(voucher.id, req.user.id);

  // Dev: log email instead of sending
  console.log(`[EMAIL] Voucher ${code} redeemed by user ${req.user.email} — value: ${voucher.value}`);

  res.json({ message: 'Voucher redeemed successfully', voucher: { ...voucher, status: 'redeemed' } });
});

module.exports = router;
