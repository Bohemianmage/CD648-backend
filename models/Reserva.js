const mongoose = require('mongoose');

/**
 * Modelo de Reserva
 * -----------------
 * Representa una reserva con fechas, habitación, huéspedes, y estado de check-in.
 */
const reservaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    telefono: { type: String, required: false },

    tipoHabitacion: { type: Number, required: true }, // 1, 2 o 3
    habitacionInterna: { type: Number, required: true }, // 1 a 8

    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },

    adultos: { type: Number, required: true, min: 1 },
    ninos: { type: Number, default: 0 },

    total: { type: Number, required: true },

    checkinConfirmado: { type: Boolean, default: false },
    qrCode: { type: String }, // Base64 del código QR
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reserva', reservaSchema);