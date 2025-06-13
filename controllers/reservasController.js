const Reserva = require('../models/Reserva');

exports.crearReserva = async (req, res) => {
  try {
    const {
      habitacionId,
      nombre,
      email,
      telefono,
      personas,
      rangoFechas,
      montoPagado,
      stripeId
    } = req.body;

    if (!stripeId || !habitacionId || !rangoFechas?.inicio || !rangoFechas?.fin) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const reserva = new Reserva({
      habitacionId,
      nombre,
      email,
      telefono,
      personas,
      rangoFechas,
      montoPagado,
      stripeId
    });

    await reserva.save();

    res.status(201).json({ message: 'Reserva guardada con éxito' });
  } catch (err) {
    console.error('Error al crear reserva:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
