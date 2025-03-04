const solicitudService = require('../services/solicitud.service');
const googleSheetsService = require('../services/google-sheets.service');
const GmailService = require('../services/gmail.service');
const jwt = require('jsonwebtoken');
const secretKey = 'g6E]=wfb&yH-2L>n`A9KN%';

exports.validateEmail = async(req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Correo inválido' });
  }

  // Guardar el correo en la sesión
  try {
    const response = await googleSheetsService.validateEmail(email);
    if (response.status === 'Access') {
      const subject = 'Tu Código OTP';
      const CODE = generateOTP();
      const expiryTime = calculateExpiryTime();
      const htmlContent = GmailService.generateEmailHTML(CODE);
      await GmailService.sendEmail(email, subject, htmlContent);
      req.session.code = CODE;
      req.session.expiryTime = expiryTime;
      req.session.email = email;
      req.session.poliza = response.poliza;
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

  const storedCode = req.session.code;
  const expiryTimeString = req.session.expiryTime;

  if (!storedCode || !expiryTimeString) {
    return res.status(400).json({ message: 'Código OTP no generado o expirado' });
  }

  const expiryTime = new Date(expiryTimeString);
  const now = new Date();
  if (now > expiryTime) {
    return res.status(400).json({ message: 'El código OTP ha expirado' });
  }

  if (code === storedCode) {
    req.session.isAuthenticated = true;
    const token = jwt.sign(
      { email: req.session.email },
      secretKey,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 3600000,
    });
    console.log("Usuario autenticado:", req.session.email);
    return res.json({ message: 'Código Correcto' });
  }
  res.status(400).json({ message: 'Código inválido' });
};

exports.logout = (req, res) => {
  // Destruir la sesión
  res.clearCookie('token'); // Eliminar la cookie
  res.json({ message: 'Sesión cerrada' });
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

exports.checkAuth = (req, res) => {
  const token = req.cookies.token; // Obtener el token de la cookie

  if (!token) {
    return res.status(401).json({ authenticated: false, message: 'Token no proporcionado.' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ authenticated: false, message: 'Token inválido o expirado.' });
    }
    return res.json({ authenticated: true, user });
  });
};

const generateOTP = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Letras mayúsculas y números
  let otp = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters[randomIndex];
  }
  return otp;
};

const calculateExpiryTime = () => {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 5 * 60 * 1000);
  return expiryTime;
};