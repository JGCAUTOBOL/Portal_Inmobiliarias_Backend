const jwt = require('jsonwebtoken');
const secretKey = 'g6E]=wfb&yH-2L>n`A9KN%';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // Obtener el token de la cookie

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
    req.user = user; // Adjuntar los datos del usuario al request
    next();
  });
};

module.exports = authenticateToken;