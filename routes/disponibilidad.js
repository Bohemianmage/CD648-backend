const express = require('express');
const router = express.Router();
const { verificarDisponibilidad } = require('../controllers/disponibilidadController');

router.get('/:tipoHabitacion', verificarDisponibilidad);

module.exports = router;