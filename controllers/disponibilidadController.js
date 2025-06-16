const Reserva = require('../models/Reserva');
const { eachDayOfInterval } = require('date-fns');

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
    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [
        { inicio: { $lte: new Date(fin) }, fin: { $gte: new Date(inicio) } }
      ]
    });

    // Contador de fechas ocupadas
    const conteoFechas = {};

    for (const r of reservas) {
      const start = new Date(r.inicio);
      const end = new Date(r.fin);

      const dias = eachDayOfInterval({ start, end });
      for (const dia of dias) {
        const clave = dia.toISOString().split('T')[0];
        conteoFechas[clave] = (conteoFechas[clave] || 0) + 1;
      }
    }

    // Fechas en que TODAS las habitaciones están ocupadas
    const fechasBloqueadas = Object.entries(conteoFechas)
      .filter(([_, conteo]) => conteo >= habitaciones.length)
      .map(([fecha]) => fecha);

    res.json({ fechasBloqueadas });
  } catch (err) {
    console.error('❌ Error al verificar disponibilidad:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};