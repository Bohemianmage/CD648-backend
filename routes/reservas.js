const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');

// Crear una nueva reserva
router.post('/reservas', async (req, res) => {
  const { habitacion, inicio, fin, adultos, ninos } = req.body;

  // Validación básica
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

  try {
    const nuevaReserva = new Reserva({
      habitacion: habitacionNum,
      inicio: fechaInicio,
      fin: fechaFin,
      adultos,
      ninos,
    });

    await nuevaReserva.save();
    res.status(201).json(nuevaReserva);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear reserva', details: err });
  }
});

// Obtener reservas ocupadas por tipo de habitación y rango de fechas
router.get('/disponibilidad/:tipoId', async (req, res) => {
  const { tipoId } = req.params;
  const { inicio, fin } = req.query;

  if (!inicio || !fin) {
    return res.status(400).json({ error: 'Fechas requeridas' });
  }

  // Mapear tipos a IDs de habitaciones reales
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
        { inicio: { $lte: fin }, fin: { $gte: inicio } },
      ],
    });

    // Solo devolver fechas bien formateadas
    const resultado = reservas
      .filter(r => r.inicio && r.fin)
      .map(r => ({
        from: r.inicio.toISOString().split('T')[0],
        to: r.fin.toISOString().split('T')[0],
      }));

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar disponibilidad', details: err });
  }
});

// Obtener todas las reservas
router.get('/reservas', async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ createdAt: -1 });
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas', details: err });
  }
});

module.exports = router;