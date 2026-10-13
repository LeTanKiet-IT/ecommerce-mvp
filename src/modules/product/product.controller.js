const prisma = require('../../database/prisma');

async function getProducts(req, res) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        pid: 'asc'
      }
    });

    return res.status(200).json({
      data: products
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Lỗi server khi lấy danh sách sản phẩm'
    });
  }
}

async function getProductById(req, res) {
  try {
    const pid = Number(req.params.pid);

    if (Number.isNaN(pid)) {
      return res.status(400).json({
        message: 'Mã sản phẩm không hợp lệ'
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        pid
      }
    });

    if (!product) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm'
      });
    }

    return res.status(200).json({
      data: product
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Lỗi server khi lấy sản phẩm'
    });
  }
}

async function createProduct(req, res) {
  try {
    const { pname, price, quantity } = req.body;

    if (!pname || price === undefined || quantity === undefined) {
      return res.status(400).json({
        message: 'pname, price và quantity là bắt buộc'
      });
    }

    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      !Number.isInteger(numericQuantity) ||
      numericQuantity < 0
    ) {
      return res.status(400).json({
        message: 'price phải là số không âm, quantity phải là số nguyên không âm'
      });
    }

    const product = await prisma.product.create({
      data: {
        pname: String(pname).trim(),
        price: numericPrice,
        quantity: numericQuantity
      }
    });

    return res.status(201).json({
      message: 'Tạo sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Lỗi server khi tạo sản phẩm'
    });
  }
}

async function updateProduct(req, res) {
  try {
    const pid = Number(req.params.pid);

    if (Number.isNaN(pid)) {
      return res.status(400).json({
        message: 'Mã sản phẩm không hợp lệ'
      });
    }

    const { pname, price, quantity } = req.body;

    if (
      pname === undefined &&
      price === undefined &&
      quantity === undefined
    ) {
      return res.status(400).json({
        message: 'Cần có ít nhất một thông tin để cập nhật'
      });
    }

    const data = {};

    if (pname !== undefined) {
      data.pname = String(pname).trim();
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          message: 'price phải là số không âm'
        });
      }

      data.price = numericPrice;
    }

    if (quantity !== undefined) {
      const numericQuantity = Number(quantity);

      if (
        !Number.isInteger(numericQuantity) ||
        numericQuantity < 0
      ) {
        return res.status(400).json({
          message: 'quantity phải là số nguyên không âm'
        });
      }

      data.quantity = numericQuantity;
    }

    const product = await prisma.product.update({
      where: {
        pid
      },
      data
    });

    return res.status(200).json({
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error(error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm'
      });
    }

    return res.status(500).json({
      message: 'Lỗi server khi cập nhật sản phẩm'
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const pid = Number(req.params.pid);

    if (Number.isNaN(pid)) {
      return res.status(400).json({
        message: 'Mã sản phẩm không hợp lệ'
      });
    }

    const product = await prisma.product.delete({
      where: {
        pid
      }
    });

    return res.status(200).json({
      message: 'Xóa sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error(error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm'
      });
    }

    return res.status(500).json({
      message: 'Lỗi server khi xóa sản phẩm'
    });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};