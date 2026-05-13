import { Router } from 'express';

const router = Router();

// Placeholder for future Stripe webhook integration
router.post('/stripe', async (req, res) => {
  // TODO: Verify Stripe signature, handle subscription events
  res.json({ received: true });
});

export default router;
