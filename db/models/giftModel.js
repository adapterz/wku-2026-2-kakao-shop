// receiverId 기준 조회, 발신자(sender)는 orders.user_id를 통해 조회
const pool = require('../pool');

const getGiftsByReceiverId = async (receiverId, status) => {
  let query = `
    SELECT 
      g.id as gift_id,
      p.name as product_name,
      p.thumbnail_url as thumbnail_url,
      p.brand as brand,
      g.status as status,
      u.nickname as sender_nickname,
      o.is_self_gift as is_self_gift,
      g.created_at as created_at,
      g.used_at as used_at
    FROM gifts g
    JOIN orders o ON g.order_id = o.id
    JOIN products p ON o.product_id = p.id
    JOIN users u ON o.user_id = u.id
    WHERE o.receiver_id = ?
  `;
  const params = [receiverId];

  if (status === 'unused' || status === 'used') {
    query += ` AND g.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY g.created_at DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

module.exports = {
  getGiftsByReceiverId
};
