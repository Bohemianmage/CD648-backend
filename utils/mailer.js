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
    const { cliente, habitacion, inicio, fin, total } = reserva;
    const fechaInicio = new Date(inicio).toLocaleDateString('es-MX');
    const fechaFin = new Date(fin).toLocaleDateString('es-MX');

    const mailOptions = {
      from: `"CD648" <${process.env.SMTP_USER}>`,
      to: cliente.email,
      subject: 'Confirmación de tu reserva en CD648',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Gracias por tu reserva, ${cliente.nombre}!</h2>
          <p>Tu reserva ha sido confirmada en el Hotel CD648.</p>
          <ul>
            <li><strong>Habitación:</strong> ${habitacion}</li>
            <li><strong>Fechas:</strong> ${fechaInicio} al ${fechaFin}</li>
            <li><strong>Total:</strong> $${total.toLocaleString('es-MX')}</li>
          </ul>
          <p>Este es tu código QR para realizar el check-in:</p>
          <img src="${qrCode}" alt="Código QR" style="width:200px; margin: 20px 0;" />
          <p>Por favor muéstralo al llegar.</p>
          <br/>
          <p style="font-size: 0.9em;">Este correo fue generado automáticamente. Si tienes preguntas, contáctanos.</p>
        </div>
      `,
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