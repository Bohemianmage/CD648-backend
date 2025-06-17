const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');

/**
 * POST /api/reservas
 * ------------------
 * Crea una nueva reserva automáticamente asignando una habitación física libre según el tipo.
 */
router.post('/reservas', async (req, res) => {
  try {
    const {
      tipoHabitacion,
      inicio,
      fin,
      adultos,
      ninos,
      total,
    } = req.body;

    console.log('📥 Solicitud de reserva recibida:', req.body);

    if (!tipoHabitacion || !inicio || !fin || adultos == null || ninos == null) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    const mapaHabitaciones = {
      '1': [1, 2, 3],
      '2': [4, 5, 6],
      '3': [7, 8],
    };

    const habitaciones = mapaHabitaciones[String(tipoHabitacion)];
    if (!habitaciones) {
      return res.status(400).json({ error: 'Tipo de habitación inválido' });
    }

    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [
        { inicio: { $lt: fechaFin }, fin: { $gt: fechaInicio } },
      ],
    });

    console.log(`🔍 Reservas encontradas para tipo ${tipoHabitacion}:`);
    reservas.forEach(r => {
      console.log(`- Habitación ${r.habitacion}: ${r.inicio.toISOString()} → ${r.fin.toISOString()}`);
    });

    const habitacionesOcupadas = new Set(reservas.map(r => r.habitacion));
    const habitacionLibre = habitaciones.find(h => !habitacionesOcupadas.has(h));

    if (!habitacionLibre) {
      return res.status(409).json({ error: 'No hay habitaciones disponibles en ese rango' });
    }

    const nuevaReserva = new Reserva({
      habitacion: habitacionLibre,
      inicio: fechaInicio,
      fin: fechaFin,
      adultos,
      ninos,
      total,
    });

    await nuevaReserva.save();
    console.log(`✅ Reserva confirmada en habitación ${habitacionLibre}`);
    res.status(201).json({ message: 'Reserva confirmada', reserva: nuevaReserva });

  } catch (err) {
    console.error('❌ Error al crear reserva:', err);
    res.status(500).json({ error: 'Error al procesar la reserva' });
  }
});

/**
 * GET /api/disponibilidad/:tipoId
 * -------------------------------
 * Devuelve fechas ocupadas por tipo de habitación.
 */
router.get('/disponibilidad/:tipoId', async (req, res) => {
  const { tipoId } = req.params;
  const { inicio, fin } = req.query;

  if (!inicio || !fin) {
    return res.status(400).json({ error: 'Fechas requeridas' });
  }

  const mapaHabitaciones = {
    '1': [1, 2, 3],
    '2': [4, 5, 6],
    '3': [7, 8],
  };

  const habitaciones = mapaHabitaciones[tipoId];
  if (!habitaciones) {
    return res.status(400).json({ error: 'Tipo de habitación inválido' });
  }

  try {
    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [
        { inicio: { $lte: new Date(fin) }, fin: { $gte: new Date(inicio) } },
      ],
    });

    const resultado = reservas
      .filter(r => r.inicio && r.fin)
      .map(r => ({
        from: r.inicio.toISOString().split('T')[0],
        to: r.fin.toISOString().split('T')[0],
      }));

    res.json(resultado);
  } catch (err) {
    console.error('❌ Error al consultar disponibilidad:', err);
    res.status(500).json({ error: 'Error al consultar disponibilidad' });
  }
});

/**
 * GET /api/reservas
 * -----------------
 * Devuelve todas las reservas (uso administrativo).
 */
router.get('/reservas', async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ createdAt: -1 });
    res.json(reservas);
  } catch (err) {
    console.error('❌ Error al obtener reservas:', err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

module.exports = router;