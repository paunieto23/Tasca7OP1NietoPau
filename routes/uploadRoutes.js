const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

// Aquestes rutes són placeholders per l'enunciat (upload local / cloud)
// Pots substituir-les pel teu codi real d'upload.
router.use(auth);

router.post('/local', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Upload local (placeholder)",
    data: { file: null },
  });
});

router.post('/cloud', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Upload cloud (placeholder)",
    data: { file: null },
  });
});

module.exports = router;
