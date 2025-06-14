const Reserva = require('../models/Reserva');
const { generarQRCode } = require('../utils/qr');
const { enviarCorreoReserva } = require('../utils/mailer');

/**
 * Crear nueva reserva
 * -------------------
 * Guarda la reserva, verifica disponibilidad y envía confirmación.
 */
exports.crearReserva = async (req, res) => {
  try {
    const {
      habitacion,
      inicio,
      fin,
      adultos,
      ninos,
      nombre,
      correo,
      telefono,
      total,
    } = req.body;

    if (!habitacion || !inicio || !fin || adultos == null || ninos == null) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const habitacionNum = parseInt(habitacion, 10);
    if (isNaN(habitacionNum)) {
      return res.status(400).json({ error: 'Número de habitación inválido' });
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    // Verificar si ya existe una reserva en conflicto
    const existe = await Reserva.findOne({
      habitacion: habitacionNum,
      $or: [
        { inicio: { $lt: fechaFin }, fin: { $gt: fechaInicio } },
      ],
    });

    if (existe) {
      return res.status(409).json({ error: 'Habitación ocupada en ese rango de fechas' });
    }

    // Crear nueva reserva
    const nuevaReserva = new Reserva({
      habitacion: habitacionNum,
      inicio: fechaInicio,
      fin: fechaFin,
      adultos,
      ninos,
      nombre,
      correo,
      telefono,
      total,
    });

    // Si hay datos de contacto, generar QR y enviar correo
    if (nombre && correo) {
      const qrTexto = `Reserva: ${nombre}, Habitación ${habitacionNum}, ${inicio} - ${fin}`;
      const qrCode = await generarQRCode(qrTexto);
      nuevaReserva.qrCode = qrCode;

      await enviarCorreoReserva(nuevaReserva);
    }

    await nuevaReserva.save();

    res.status(201).json({ message: 'Reserva confirmada', reserva: nuevaReserva });
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al procesar la reserva' });
  }
};

/**
 * Obtener disponibilidad por tipo
 * -------------------------------
 * Devuelve IDs de habitaciones ocupadas para un tipo en un rango.
 */
exports.obtenerDisponibilidad = async (req, res) => {
  try {
    const { tipoHabitacion, inicio, fin } = req.query;

    if (!tipoHabitacion || !inicio || !fin) {
      return res.status(400).json({ error: 'Parámetros incompletos' });
    }

    const mapaHabitaciones = {
      '1': [1, 2, 3],
      '2': [4, 5, 6],
      '3': [7, 8],
    };

    const habitaciones = mapaHabitaciones[tipoHabitacion];
    if (!habitaciones) {
      return res.status(400).json({ error: 'Tipo de habitación inválido' });
    }

    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [
        { inicio: { $lt: new Date(fin) }, fin: { $gt: new Date(inicio) } },
      ],
    });

    const ocupadas = reservas.map((r) => r.habitacion);

    res.status(200).json({ ocupadas });
  } catch (error) {
    console.error('❌ Error al obtener disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
};