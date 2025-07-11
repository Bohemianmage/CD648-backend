exports.crearReserva = async (req, res) => {
  try {
    // Log de entrada
    console.log('📥 Body recibido en backend:');
    console.log(JSON.stringify(req.body, null, 2));

    const {
      tipoHabitacion,
      inicio,
      fin,
      adultos,
      ninos,
      total,
      cliente,
    } = req.body;

    if (!tipoHabitacion || !inicio || !fin || adultos == null || ninos == null || !cliente) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const idioma = reserva.cliente.idioma || 'es';

    const { nombre, email, telefono } = cliente;
    if (!nombre || !email || !telefono) {
      return res.status(400).json({ error: 'Faltan datos del cliente' });
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    if (isNaN(fechaInicio) || isNaN(fechaFin)) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    const mapaHabitaciones = {
      '1': [1, 2, 3],
      '2': [4, 5, 6],
      '3': [7, 8],
    };

    const habitaciones = mapaHabitaciones[String(tipoHabitacion)];
    if (!habitaciones) return res.status(400).json({ error: 'Tipo de habitación inválido' });

    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [{ inicio: { $lt: fechaFin }, fin: { $gt: fechaInicio } }],
    });

    const habitacionesOcupadas = new Set(reservas.map(r => r.habitacion));
    const habitacionLibre = habitaciones.find(h => !habitacionesOcupadas.has(h));
    if (!habitacionLibre) return res.status(409).json({ error: 'No hay habitaciones disponibles' });

    // Generar QR personalizado
    const payloadQR = {
      nombre,
      habitacion: habitacionLibre,
      inicio: fechaInicio.toISOString(),
      fin: fechaFin.toISOString(),
    };
    const qrCode = await generarQRCode(JSON.stringify(payloadQR));

    // Crear y guardar la reserva
    const nuevaReserva = new Reserva({
      habitacion: habitacionLibre,
      inicio: fechaInicio,
      fin: fechaFin,
      adultos,
      ninos,
      total,
      qrCode,
      cliente: {
        nombre,
        email,
        telefono,
      },
    });

    console.log('✅ Reserva a guardar:', nuevaReserva);
    await nuevaReserva.save();
    console.log('💾 Reserva guardada en base de datos');

    await enviarCorreoReserva(nuevaReserva, qrCode);

    res.status(201).json({ message: 'Reserva confirmada', reserva: nuevaReserva });
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al procesar la reserva' });
  }
};