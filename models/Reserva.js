const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  habitacionId: Number,
  nombre: String,
  email: String,
  telefono: String,
  personas: Number,
  rangoFechas: {
    inicio: Date,
    fin: Date
  },
  montoPagado: Number,
  status: { type: String, default: 'confirmada' },
  stripeId: String,
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);
