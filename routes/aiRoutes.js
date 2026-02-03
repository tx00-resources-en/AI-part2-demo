const express = require('express');
const router = express.Router();

const generateText = require('../controllers/fitnessController');

// Text generation routes
router.post('/generate-text-v2', generateText);


module.exports = router;