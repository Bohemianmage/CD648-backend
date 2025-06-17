const Reserva = require('../models/Reserva');
const { generarQRCode } = require('../utils/qr');
const { enviarCorreoReserva } = require('../utils/mailer');

/**
 * Crear nueva reserva
 * -------------------
 * Asigna automáticamente una habitación libre dentro del tipo seleccionado.
 */
exports.crearReserva = async (req, res) => {
  try {
    console.log('📥 Solicitud de reserva recibida:', req.body);

    const {
      tipoHabitacion,
      inicio,
      fin,
      adultos,
      ninos,
      total,
    } = req.body;

    if (!tipoHabitacion || !inicio || !fin || adultos == null || ninos == null) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    // Matriz de habitaciones por tipo
    const mapaHabitaciones = {
      '1': [1, 2, 3],
      '2': [4, 5, 6],
      '3': [7, 8],
    };

    const habitaciones = mapaHabitaciones[String(tipoHabitacion)];
    if (!habitaciones) {
      return res.status(400).json({ error: 'Tipo de habitación inválido' });
    }

    // Buscar reservas que se crucen con las fechas
    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [
        { inicio: { $lt: fechaFin }, fin: { $gt: fechaInicio } },
      ],
    });

console.log('\n📅 Checando conflictos con la reserva solicitada:');
console.log('→ Rango solicitado:', fechaInicio.toISOString(), '-', fechaFin.toISOString());

reservas.forEach(r => {
  console.log(`→ Habitación ${r.habitacion}: ${new Date(r.inicio).toISOString()} - ${new Date(r.fin).toISOString()}`);

  const inicioExistente = new Date(r.inicio);
  const finExistente = new Date(r.fin);

  const hayCruce =
    fechaInicio < finExistente && fechaFin > inicioExistente;

  console.log(`   ↳ ¿Hay conflicto? ${hayCruce ? '🟥 SÍ' : '🟩 NO'}`);
});

    const habitacionesOcupadas = new Set(reservas.map((r) => r.habitacion));

    // 🔍 Logs de depuración clave
    console.log('🏨 Habitaciones del tipo seleccionado:', habitaciones);
    console.log('🚫 Habitaciones ocupadas:', [...habitacionesOcupadas]);

    const habitacionLibre = habitaciones.find((h) => !habitacionesOcupadas.has(h));
    console.log('✅ Habitación asignada:', habitacionLibre);

    if (!habitacionLibre || isNaN(habitacionLibre)) {
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
    console.log('💾 Reserva guardada exitosamente:', nuevaReserva);

    res.status(201).json({ message: 'Reserva confirmada', reserva: nuevaReserva });
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al procesar la reserva' });
  }
};

/**
 * Obtener disponibilidad por tipo
 * -------------------------------
 * Devuelve IDs de habitaciones ocupadas para un tipo en un rango.
 */
exports.obtenerDisponibilidad = async (req, res) => {
  try {
    const { tipoHabitacion, inicio, fin } = req.query;

    if (!tipoHabitacion || !inicio || !fin) {
      return res.status(400).json({ error: 'Parámetros incompletos' });
    }

    const mapaHabitaciones = {
      '1': [1, 2, 3],
      '2': [4, 5, 6],
      '3': [7, 8],
    };

    const habitaciones = mapaHabitaciones[tipoHabitacion];
    if (!habitaciones) {
      return res.status(400).json({ error: 'Tipo de habitación inválido' });
    }

    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [
        { inicio: { $lt: new Date(fin) }, fin: { $gt: new Date(inicio) } },
      ],
    });

    const ocupadas = reservas.map((r) => r.habitacion);

    res.status(200).json({ ocupadas });
  } catch (error) {
    console.error('❌ Error al obtener disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
};