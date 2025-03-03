const solicitudService = require('../services/solicitud.service');
const googleSheetsService = require('../services/google-sheets.service');
const jwt = require('jsonwebtoken');
const CODE = 'jshhsbshs6767ahhh'; // Código fijo
const secretKey = 'g6E]=wfb&yH-2L>n`A9KN%';

exports.validateEmail = async(req, res) => {
  const { email } = req.body;
  // Validación simple de correo electrónico
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Correo inválido' });
  }

  // Guardar el correo en la sesión
  try {
    const response = await googleSheetsService.validateEmail(email);
    if (response.status === 'Access') {
      req.session.email = email; // Guarda el correo en la sesión
      req.session.poliza = response.poliza; // Guarda la póliza en la sesión
      req.session.nombre = response.nombre;
      return res.json({
        message: 'Access',
        poliza: response.poliza,
        nombre: response.nombre,
      });
    } else {
      return res.status(403).json({ message: 'Restricción: Correo no autorizado' });
    }
  } catch (error) {
    console.error('Error al validar el correo:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.validateCode = (req, res) => {
  const { code } = req.body;
  if (!code || !req.session.email) {
    return res.status(400).json({ message: 'Sesión inválida o código requerido' });
  }

  if (code === CODE) {
    req.session.isAuthenticated = true;
    const token = jwt.sign(
      { email: req.session.email }, // Datos del usuario
      secretKey, // Clave secreta (usa una clave segura en producción)
      { expiresIn: '1h' } // Tiempo de expiración
    );
    console.log("Usuario autenticado:", req.session.email);
    return res.json({ message: 'Código Correcto', token });
  }
  res.status(400).json({ message: 'Código inválido' });
};

exports.logout = (req, res) => {
  // Destruir la sesión
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir la sesión:', err);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.json({ message: 'Sesión cerrada' });
  });
};

exports.getSolicitudes = async (req, res) => {
  try {
    const { numeroPoliza } = req.body;

    if (!numeroPoliza) {
      return res.status(400).json({ message: 'Número de póliza requerido' });
    }

    const solicitudes = await solicitudService.getSolicitudes(numeroPoliza);
    console.log(solicitudes)
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};