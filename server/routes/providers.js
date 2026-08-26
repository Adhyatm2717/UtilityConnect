const express = require('express');
const { getProviders, getProvider } = require('../controllers/providers');

const router = express.Router();

router.route('/').get(getProviders);
router.route('/:id').get(getProvider);

module.exports = router;
