const prisma = require('../../database/prisma');

async function createOrder(req, res) {
  try {
    const uid = Number(req.user?.uid);

    if (!Number.isInteger(uid)) {
      return res.status(401).json({
        message: 'User is not authenticated'
      });
    }

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'items must be a non-empty array'
      });
    }

    const normalizedItems = items.map((item) => ({
      pid: Number(item.pid),
      qty: Number(item.qty)
    }));

    const hasInvalidItem = normalizedItems.some(
      (item) =>
        !Number.isInteger(item.pid) ||
        !Number.isInteger(item.qty) ||
        item.pid <= 0 ||
        item.qty <= 0
    );

    if (hasInvalidItem) {
      return res.status(400).json({
        message: 'Each item must have a positive integer pid and qty'
      });
    }

    const productIds = normalizedItems.map((item) => item.pid);
    const uniqueProductIds = [...new Set(productIds)];

    if (productIds.length !== uniqueProductIds.length) {
      return res.status(400).json({
        message: 'A product cannot appear more than once in an order'
      });
    }

    const products = await prisma.product.findMany({
      where: {
        pid: {
          in: uniqueProductIds
        }
      }
    });

    if (products.length !== uniqueProductIds.length) {
      const foundProductIds = products.map((product) => product.pid);
      const missingProductIds = uniqueProductIds.filter(
        (pid) => !foundProductIds.includes(pid)
      );

      return res.status(404).json({
        message: 'Product not found',
        missingProductIds
      });
    }

    const productMap = new Map(
      products.map((product) => [product.pid, product])
    );

    for (const item of normalizedItems) {
      const product = productMap.get(item.pid);

      if (product.quantity < item.qty) {
        return res.status(400).json({
          message: `Not enough stock for product ${item.pid}`,
          availableQuantity: product.quantity,
          requestedQuantity: item.qty
        });
      }
    }

    const order = await prisma.$transaction(async (transaction) => {
      const createdOrder = await transaction.order.create({
        data: {
          uid,
          details: {
            create: normalizedItems.map((item) => {
              const product = productMap.get(item.pid);

              return {
                pid: item.pid,
                qty: item.qty,
                unitPrice: product.price
              };
            })
          },
          shipments: {
            create: {
              status: 'PENDING'
            }
          }
        },
        include: {
          details: {
            include: {
              product: true
            }
          },
          shipments: true
        }
      });

      for (const item of normalizedItems) {
        await transaction.product.update({
          where: {
            pid: item.pid
          },
          data: {
            quantity: {
              decrement: item.qty
            }
          }
        });
      }

      return createdOrder;
    });

    return res.status(201).json({
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Server error while creating order'
    });
  }
}

async function getMyOrders(req, res) {
  try {
    const uid = Number(req.user?.uid);

    if (!Number.isInteger(uid)) {
      return res.status(401).json({
        message: 'User is not authenticated'
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        uid
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        details: {
          include: {
            product: true
          }
        },
        shipments: true
      }
    });

    return res.status(200).json({
      data: orders
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Server error while getting orders'
    });
  }
}

async function getMyOrderById(req, res) {
  try {
    const uid = Number(req.user?.uid);
    const oid = Number(req.params.oid);

    if (!Number.isInteger(uid)) {
      return res.status(401).json({
        message: 'User is not authenticated'
      });
    }

    if (!Number.isInteger(oid) || oid <= 0) {
      return res.status(400).json({
        message: 'Invalid order id'
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        oid,
        uid
      },
      include: {
        details: {
          include: {
            product: true
          }
        },
        shipments: true
      }
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      data: order
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Server error while getting order'
    });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById
};