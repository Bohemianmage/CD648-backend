exports.crearReserva = async (req, res) => {
  try {
    // Log completo del body recibido para debug
    console.log('📥 Body recibido en backend:');
    console.log(JSON.stringify(req.body, null, 2));

    const {
      tipoHabitacion,
      inicio,
      fin,
      adultos,
      ninos,
      total,
      cliente: datosCliente,
    } = req.body;

    // Validación básica de campos generales
    if (!tipoHabitacion || !inicio || !fin || adultos == null || ninos == null || !datosCliente) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Desestructurar los campos del cliente
    const { nombre, email, telefono } = datosCliente;

    // Validar que todos los campos del cliente estén presentes
    if (!nombre || !email || !telefono) {
      return res.status(400).json({ error: 'Faltan datos del cliente' });
    }

    // Convertir fechas y validar formato
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    if (isNaN(fechaInicio) || isNaN(fechaFin)) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    // Mapeo de tipos de habitación a habitaciones físicas
    const mapaHabitaciones = {
      '1': [1, 2, 3],
      '2': [4, 5, 6],
      '3': [7, 8],
    };

    const habitaciones = mapaHabitaciones[String(tipoHabitacion)];
    if (!habitaciones) {
      return res.status(400).json({ error: 'Tipo de habitación inválido' });
    }

    // Buscar reservas existentes que se crucen con las fechas solicitadas
    const reservas = await Reserva.find({
      habitacion: { $in: habitaciones },
      $or: [
        { inicio: { $lt: fechaFin }, fin: { $gt: fechaInicio } }
      ]
    });

    // Detectar habitaciones ocupadas
    const habitacionesOcupadas = new Set(reservas.map(r => r.habitacion));
    const habitacionLibre = habitaciones.find(h => !habitacionesOcupadas.has(h));

    if (!habitacionLibre) {
      return res.status(409).json({ error: 'No hay habitaciones disponibles' });
    }

    // Generar código QR con los datos clave
    const payloadQR = {
      nombre,
      habitacion: habitacionLibre,
      inicio: fechaInicio.toISOString(),
      fin: fechaFin.toISOString(),
    };
    const qrCode = await generarQRCode(JSON.stringify(payloadQR));

    // Crear y guardar la nueva reserva
    const nuevaReserva = new Reserva({
      habitacion: habitacionLibre,
      inicio: fechaInicio,
      fin: fechaFin,
      adultos,
      ninos,
      total,
      qrCode,
      cliente: { nombre, email, telefono }, // ✅ Forma esperada por Mongoose
    });

    console.log('✅ Reserva a guardar:', nuevaReserva);

    await nuevaReserva.save();
    console.log('💾 Reserva guardada en base de datos');

    // Enviar correo con el QR
    await enviarCorreoReserva(nuevaReserva, qrCode);

    res.status(201).json({ message: 'Reserva confirmada', reserva: nuevaReserva });
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al procesar la reserva' });
  }
};