const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 }, // 1 hora
  })
);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/data', authRoutes);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});