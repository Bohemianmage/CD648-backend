const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  telefono: String,
  tipoHabitacion: String, // 1, 2, 3
  adultos: Number,
  ninos: Number,
  fechaInicio: String, // formato YYYY-MM-DD
  fechaFin: String,
});

module.exports = mongoose.model('Reserva', reservaSchema);