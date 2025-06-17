const Reserva = require('../models/Reserva');

exports.verificarDisponibilidad = async (req, res) => {
  const { tipoHabitacion } = req.params;
  const { inicio, fin } = req.query;

  if (!inicio || !fin) {
    return res.status(400).json({ error: 'Parámetros de fecha incompletos' });
  }

  const mapaHabitaciones = {
    '1': [1, 2, 3],
    '2': [4, 5, 6],
    '3': [7, 8]
  };

  const habitaciones = mapaHabitaciones[tipoHabitacion];
  if (!habitaciones) {
    return res.status(400).json({ error: 'Tipo de habitación inválido' });
  }

  try {
    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [
        { inicio: { $lt: new Date(fin) }, fin: { $gt: new Date(inicio) } }
      ]
    });

    // ⬅️ ¡Aquí devolvemos cada reserva con su habitación, como espera el frontend!
    const resultado = reservas.map((r) => ({
      from: r.inicio.toISOString().split('T')[0],
      to: r.fin.toISOString().split('T')[0],
      habitacion: r.habitacion,
    }));

    res.status(200).json(resultado);
  } catch (err) {
    console.error('❌ Error al verificar disponibilidad:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};