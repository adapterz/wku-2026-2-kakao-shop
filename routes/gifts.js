const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/requireLogin');
const giftModel = require('../db/models/giftModel');

router.get('/', requireLogin, async (req, res) => {
  try {
    const receiverId = req.session.userId;
    const { status } = req.query;

    // Call the model function. It handles filtering if status is 'unused' or 'used'.
    // Invalid status defaults to returning all gifts.
    const gifts = await giftModel.getGiftsByReceiverId(receiverId, status);

    // Map snake_case to camelCase
    const formattedData = gifts.map(gift => ({
      giftId: gift.gift_id,
      productName: gift.product_name,
      thumbnailUrl: gift.thumbnail_url,
      status: gift.status,
      senderNickname: gift.sender_nickname,
      isSelfGift: !!gift.is_self_gift,
      createdAt: gift.created_at
    }));

    return res.status(200).json({
      status: 200,
      code: "GIFT_LIST_SUCCESS",
      message: null,
      data: formattedData
    });

  } catch (error) {
    console.error('Failed to fetch gifts:', error);
    return res.status(500).json({
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: null,
      data: null
    });
  }
});

module.exports = router;
