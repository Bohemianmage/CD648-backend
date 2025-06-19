require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const reservasRoutes = require('./routes/reservas');             // Rutas públicas
const reservasAdminRoutes = require('./routes/reservas.admin');  // Rutas protegidas

const app = express();
const PORT = process.env.PORT;

// Middleware global
app.use(cors());
app.use(express.json());

// Ruta de diagnóstico pública
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CD648 backend is up and running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));

// Rutas públicas (clientes)
app.use('/api', reservasRoutes);

// Middleware para proteger rutas administrativas
app.use('/api/admin', (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
});

// Rutas administrativas protegidas
app.use('/api/admin', reservasAdminRoutes);

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`✅ CD648 backend iniciado en puerto ${PORT} [Build #2]`);
});