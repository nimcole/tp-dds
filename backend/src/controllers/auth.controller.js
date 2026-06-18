const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const usuario = await authService.register({ nombre, email, password, rol });
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const resultado = await authService.login({ email, password });
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };