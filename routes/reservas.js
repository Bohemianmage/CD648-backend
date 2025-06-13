const express = require('express');
const router = express.Router();
const { crearReserva } = require('../controllers/reservasController');

router.post('/', crearReserva);

module.exports = router;
