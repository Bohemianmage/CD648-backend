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

// Obtener reservas por tipo de habitación
router.get('/disponibilidad/:tipoId', async (req, res) => {
  const { tipoId } = req.params;
  const { inicio, fin } = req.query;

  if (!inicio || !fin) {
    return res.status(400).json({ error: 'Fechas requeridas' });
  }

  try {
    const reservas = await Reserva.find({
      tipoHabitacion: tipoId,
      $or: [
        { fechaInicio: { $lte: fin, $gte: inicio } },
        { fechaFin: { $gte: inicio, $lte: fin } },
        { fechaInicio: { $lte: inicio }, fechaFin: { $gte: fin } },
      ],
    });
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar reservas', details: err });
  }
});

module.exports = router;