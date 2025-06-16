const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  habitacion: { type: Number, required: true },
  inicio: { type: Date, required: true },
  fin: { type: Date, required: true },
  adultos: { type: Number, required: true },
  ninos: { type: Number, required: true },
  total: Number,
  qrCode: String,
}, { timestamps: true });

module.exports = mongoose.model('Reserva', reservaSchema);