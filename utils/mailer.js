const nodemailer = require('nodemailer');

// Configura tu transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * enviarCorreoReserva
 * -------------------
 * Envía un correo con la confirmación de la reserva y el código QR embebido.
 *
 * @param {Object} reserva - Reserva completa con datos del cliente
 * @param {string} qrCode - Imagen en base64 del QR generado
 */
async function enviarCorreoReserva(reserva, qrCode) {
  try {
    const { cliente, tipoHabitacion, inicio, fin, total } = reserva;

    // Idioma y fecha
    const idioma = cliente.idioma === 'en' ? 'en' : 'es';
    const fechaInicio = new Date(inicio).toLocaleDateString(idioma === 'es' ? 'es-MX' : 'en-US');
    const fechaFin = new Date(fin).toLocaleDateString(idioma === 'es' ? 'es-MX' : 'en-US');

    // Mapeo tipo de habitación
    const tiposHabitacion = {
      1: { es: 'Ejecutiva', en: 'Executive' },
      2: { es: 'Suite con Terraza', en: 'Suite with Terrace' },
      3: { es: 'Estancia Compacta', en: 'Compact Stay' },
    };

    const nombreHabitacion = tiposHabitacion[tipoHabitacion]?.[idioma] || `Tipo ${tipoHabitacion}`;

    // Plantilla HTML según idioma
    const html = idioma === 'es' ? `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Gracias por tu reserva, ${cliente.nombre}!</h2>
        <p>Tu reserva ha sido confirmada en el Hotel CD648.</p>
        <ul>
          <li><strong>Habitación:</strong> ${nombreHabitacion}</li>
          <li><strong>Fechas:</strong> ${fechaInicio} al ${fechaFin}</li>
          <li><strong>Total:</strong> $${total.toLocaleString('es-MX')}</li>
        </ul>
        <p>Este es tu código QR para realizar el check-in:</p>
        <img src="${qrCode}" alt="Código QR" style="width:200px; margin: 20px 0;" />
        <p>Por favor muéstralo al llegar.</p>
        <br/>
        <p style="font-size: 0.9em;">Este correo fue generado automáticamente. Si tienes preguntas, contáctanos.</p>
      </div>
    ` : `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Thanks for your reservation, ${cliente.nombre}!</h2>
        <p>Your booking at CD648 Hotel has been confirmed.</p>
        <ul>
          <li><strong>Room:</strong> ${nombreHabitacion}</li>
          <li><strong>Dates:</strong> ${fechaInicio} to ${fechaFin}</li>
          <li><strong>Total:</strong> $${total.toLocaleString('en-US')} MXN</li>
        </ul>
        <p>This is your QR code for check-in:</p>
        <img src="${qrCode}" alt="QR Code" style="width:200px; margin: 20px 0;" />
        <p>Please show it upon arrival.</p>
        <br/>
        <p style="font-size: 0.9em;">This email was generated automatically. Contact us if you have any questions.</p>
      </div>
    `;

    // Configuración del mensaje
    const mailOptions = {
      from: `"CD648" <${process.env.SMTP_USER}>`,
      to: cliente.email,
      subject: idioma === 'es'
        ? 'Confirmación de tu reserva en CD648'
        : 'Your reservation at CD648 Hotel',
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Correo enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error al enviar correo de reserva:', error);
    throw new Error('No se pudo enviar el correo de confirmación');
  }
}

module.exports = { enviarCorreoReserva };