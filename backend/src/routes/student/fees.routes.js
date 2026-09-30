const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const c = require('../../controllers/fees.controller');

const router = express.Router();

// Student: view all their fee records, payments, and summary
router.get('/fees', c.myFees);

module.exports = router;
