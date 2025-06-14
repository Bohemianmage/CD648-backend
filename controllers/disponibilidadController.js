const Reserva = require('../models/Reserva');

exports.verificarDisponibilidad = async (req, res) => {
  const { tipoHabitacion } = req.params;
  const { inicio, fin } = req.query;

  if (!inicio || !fin) {
    return res.status(400).json({ error: 'Parámetros de fecha incompletos' });
  }

  // Habitaciones disponibles según tipo
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
    // Buscar reservas que se crucen con el rango solicitado
    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [
        { inicio: { $lte: fin }, fin: { $gte: inicio } } // cruce de rangos
      ]
    });

    // Solo devolver rangos válidos
    const resultado = reservas
      .filter(r => r.inicio && r.fin)
      .map(r => ({
        from: r.inicio.toISOString().split('T')[0],
        to: r.fin.toISOString().split('T')[0]
      }));

    res.json(resultado);
  } catch (err) {
    console.error('❌ Error al verificar disponibilidad:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};