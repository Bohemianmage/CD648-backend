const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  habitacion: { type: Number, required: true },
  inicio: { type: Date, required: true },
  fin: { type: Date, required: true },
  adultos: { type: Number, required: true },
  ninos: { type: Number, required: true },
  total: Number,
  qrCode: String,
  cliente: {
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
  }
}, { timestamps: true });

module.exports = mongoose.model('Reserva', reservaSchema);