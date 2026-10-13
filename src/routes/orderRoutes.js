const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');

const {
  createOrder,
  getMyOrders,
  getMyOrderById
} = require('../modules/order/order.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:oid', getMyOrderById);

module.exports = router;