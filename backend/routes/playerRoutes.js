const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/:playerId', playerController.getPlayer);
router.post('/', playerController.createPlayer);
router.get('/wallet/:playerId', playerController.getWalletBalance);
router.post('/cashout', playerController.handleCashout);

module.exports = router;
