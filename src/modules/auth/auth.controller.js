const bcrypt = require('bcryptjs');

const prisma = require('../../database/prisma');
const { generateToken } = require('../../config/jwt');

async function register(req, res) {
  try {
    const { username, fullname, password } = req.body;

    if (!username || !fullname || !password) {
      return res.status(400).json({
        message: 'username, fullname và password là bắt buộc'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { username }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Username đã tồn tại'
      });
    }

    let role = await prisma.role.findFirst({
      where: { rolename: 'normal' }
    });

    if (!role) {
      role = await prisma.role.create({
        data: { rolename: 'normal' }
      });
    }

    let membership = await prisma.memberShip.findFirst({
      where: { mname: 'normal' }
    });

    if (!membership) {
      membership = await prisma.memberShip.create({
        data: {
          mname: 'normal',
          score: 10
        }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        fullname,
        password: hashedPassword,
        roleid: role.roleid,
        mid: membership.mid
      },
      include: {
        role: true,
        membership: true
      }
    });

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      data: {
        uid: user.uid,
        username: user.username,
        fullname: user.fullname,
        role: user.role.rolename,
        score: user.membership.score
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Lỗi server khi đăng ký'
    });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { username },
      include: {
        role: true,
        membership: true
      }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Username hoặc password không đúng'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: 'Username hoặc password không đúng'
      });
    }

    const token = generateToken({
      uid: user.uid,
      username: user.username,
      role: user.role.rolename
    });

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        uid: user.uid,
        username: user.username,
        fullname: user.fullname,
        role: user.role.rolename,
        score: user.membership.score
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Lỗi server khi đăng nhập'
    });
  }
}

module.exports = {
  register,
  login
};