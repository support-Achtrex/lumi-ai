const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// ── GET /api/billing/plans ─────────────────────────────────────────────────────
router.get('/plans', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM plans WHERE is_active = true ORDER BY price_usd ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/billing/paystack/initialize ────────────────────────────────────
router.post(
  '/paystack/initialize',
  authenticate,
  [
    body('amount').isNumeric().isFloat({ min: 1 }),
    body('discountCode').optional().isString(),
    body('plan_id').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { amount, discountCode, plan_id, callback_url, vin } = req.body;
      let finalAmount = amount;

      // Check for discount code
      if (discountCode) {
        const discountRes = await query('SELECT * FROM discounts WHERE code = $1 AND is_active = true', [discountCode.toUpperCase()]);
        if (discountRes.rows.length > 0) {
          const discount = discountRes.rows[0];
          if (!discount.expires_at || new Date(discount.expires_at) > new Date()) {
            if (!discount.max_uses || discount.uses < discount.max_uses) {
              if (discount.percentage_off) {
                finalAmount = finalAmount - (finalAmount * (discount.percentage_off / 100));
              } else if (discount.fixed_amount_off) {
                finalAmount = Math.max(0, finalAmount - discount.fixed_amount_off);
              }
              // Record use
              await query('UPDATE discounts SET uses = uses + 1 WHERE id = $1', [discount.id]);
            }
          }
        }
      }

      if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ success: false, error: 'Paystack is not configured on the server.' });
      }

      const callbackUrl = callback_url || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/console/billing`;

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: req.user.email,
          amount: Math.round(finalAmount * 12 * 100), // Convert USD to Cedis (* 12), then to Pesewas (* 100)
          currency: 'GHS',
          callback_url: callbackUrl,
          metadata: { plan_id: plan_id || null, vin: vin || null }
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({ success: true, data: response.data.data });
    } catch (error) {
      console.error('Paystack Initialize Error:', error.response?.data || error.message);
      res.status(500).json({ success: false, error: 'Failed to initialize payment' });
    }
  }
);

// ── GET /api/billing/paystack/verify ─────────────────────────────────────────
router.get('/paystack/verify', authenticate, async (req, res, next) => {
  try {
    const { reference } = req.query;
    if (!reference) {
      return res.status(400).json({ success: false, error: 'Missing reference' });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const { status, metadata, amount: paidAmount } = response.data.data;
    const paidUsd = paidAmount / 100 / 12;
    const email = req.user.email;

      if (status === 'success') {
      let creditsToAdd = 0;
      let newPlanType = 'free';

      if (metadata && metadata.plan_id) {
        // Dynamic Plan Fulfillment
        const planRes = await query('SELECT * FROM plans WHERE id = $1', [metadata.plan_id]);
        if (planRes.rows.length > 0) {
          const plan = planRes.rows[0];
          creditsToAdd = parseFloat(plan.credits);
          newPlanType = plan.tab === 'enterprise' ? 'enterprise' : 'pro';
        } else {
          creditsToAdd = paidUsd; // Fallback
        }
      } else {
        // Fallback or Vehicle History Report
        creditsToAdd = paidUsd;
      }

      // If a VIN was provided in metadata, this is a history report purchase
      if (metadata && metadata.vin) {
        await query(
          'INSERT INTO unlocked_reports (user_id, vin) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [req.user.id, metadata.vin]
        );
      }

      // Update the user's credits and plan
      await query(
        `UPDATE users SET credits = credits + $1, plan_type = CASE WHEN $2 != 'free' THEN $2 ELSE plan_type END WHERE email = $3`,
        [creditsToAdd, newPlanType, email]
      );

      // Create an invoice record
      const planName = newPlanType === 'free' ? 'Single Purchase' : newPlanType.charAt(0).toUpperCase() + newPlanType.slice(1) + ' Plan';
      await query(
        `INSERT INTO invoices (user_id, amount, plan_name, reference, status) VALUES ($1, $2, $3, $4, 'paid') ON CONFLICT (reference) DO NOTHING`,
        [req.user.id, paidUsd, planName, reference]
      );

      return res.json({ success: true, creditsAdded: creditsToAdd, plan_type: newPlanType });
    }

    res.status(400).json({ success: false, error: `Payment status: ${status}` });
  } catch (error) {
    console.error('Paystack Verify Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
});

// ── GET /api/billing/invoices ──────────────────────────────────────────────────
router.get('/invoices', authenticate, async (req, res, next) => {
  try {
    const result = await query('SELECT id, amount, plan_name, reference, status, created_at FROM invoices WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
