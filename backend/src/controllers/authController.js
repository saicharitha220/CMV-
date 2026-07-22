import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const admin = await Admin.findOne({ email });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });

  res.json({ token, admin: { id: admin._id, email: admin.email } });
};

const me = async (req, res) => {
  res.json({ admin: req.admin });
};

export { login, me };
