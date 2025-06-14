const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');

// Crear una nueva reserva
router.post('/reservas', async (req, res) => {
  try {
    const nuevaReserva = new Reserva(req.body);
    await nuevaReserva.save();
    res.status(201).json(nuevaReserva);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear reserva', details: err });
  }
});

// Obtener reservas por tipo de habitación y fechas (disponibilidad)
router.get('/disponibilidad/:tipoId', async (req, res) => {
  const { tipoId } = req.params;
  const { inicio, fin } = req.query;

  if (!inicio || !fin) {
    return res.status(400).json({ error: 'Fechas requeridas' });
  }

  try {
    const reservas = await Reserva.find({
      habitacion: tipoId,
      $or: [
        { inicio: { $lte: fin, $gte: inicio } },
        { fin: { $gte: inicio, $lte: fin } },
        { inicio: { $lte: inicio }, fin: { $gte: fin } },
      ],
    });
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar reservas', details: err });
  }
});

// Obtener todas las reservas (para panel administrativo)
router.get('/reservas', async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ createdAt: -1 });
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas', details: err });
  }
});

module.exports = router;