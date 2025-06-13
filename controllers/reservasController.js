const Reserva = require('../models/Reserva');
const { generarQRCode } = require('../utils/qr');
const { enviarCorreoReserva } = require('../utils/mailer');

/**
 * Crear nueva reserva
 * -------------------
 * Recibe los datos del cliente, verifica disponibilidad,
 * guarda la reserva y genera QR + correo de confirmación.
 */
exports.crearReserva = async (req, res) => {
  try {
    const {
      nombre,
      correo,
      telefono,
      tipoHabitacion,
      habitacionInterna,
      fechaInicio,
      fechaFin,
      adultos,
      ninos,
      total,
    } = req.body;

    // Verificar disponibilidad
    const reservaExistente = await Reserva.findOne({
      habitacionInterna,
      $or: [
        {
          fechaInicio: { $lt: new Date(fechaFin) },
          fechaFin: { $gt: new Date(fechaInicio) },
        },
      ],
    });

    if (reservaExistente) {
      return res.status(409).json({ error: 'Habitación ocupada en esas fechas' });
    }

    // Crear reserva
    const nuevaReserva = new Reserva({
      nombre,
      correo,
      telefono,
      tipoHabitacion,
      habitacionInterna,
      fechaInicio,
      fechaFin,
      adultos,
      ninos,
      total,
    });

    // Generar QR
    const qrData = `Reserva: ${nombre}, Hab: ${habitacionInterna}, ${fechaInicio} - ${fechaFin}`;
    const qrCode = await generarQRCode(qrData);
    nuevaReserva.qrCode = qrCode;

    // Guardar en BD
    await nuevaReserva.save();

    // Enviar correo de confirmación
    await enviarCorreoReserva(nuevaReserva);

    res.status(201).json({ message: 'Reserva confirmada', reserva: nuevaReserva });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al procesar la reserva' });
  }
};

/**
 * Obtener disponibilidad
 * ----------------------
 * Devuelve las habitaciones ocupadas para un tipo y rango de fechas.
 */
exports.obtenerDisponibilidad = async (req, res) => {
  try {
    const { tipoHabitacion, inicio, fin } = req.query;

    const reservas = await Reserva.find({
      tipoHabitacion: Number(tipoHabitacion),
      $or: [
        {
          fechaInicio: { $lt: new Date(fin) },
          fechaFin: { $gt: new Date(inicio) },
        },
      ],
    });

    const ocupadas = reservas.map((r) => r.habitacionInterna);

    res.status(200).json({ ocupadas });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
};