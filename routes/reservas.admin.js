const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');

// Obtener todas las reservas (admin)
router.get('/reservas', async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ createdAt: -1 });
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas', details: err });
  }
});

// Eliminar reserva (admin)
router.delete('/reservas/:id', async (req, res) => {
  try {
    await Reserva.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Reserva eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar reserva', details: err });
  }
});

module.exports = router;