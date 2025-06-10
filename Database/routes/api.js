import express from 'express';
const router = express.Router();

// Primjer ruta
router.get('/', (req, res) => {
  res.json({ message: 'API radi!' });
});

export default router;
