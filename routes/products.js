const express = require('express');
const router = express.Router();
const pool = require('../db');

// 상품 목록 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');

    res.status(200).json({
      data: rows
    });
  } catch (error) {
    console.error('Database query error (GET /api/products):', error);
    res.status(500).json({
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: null,
      data: null
    });
  }
});

module.exports = router;
