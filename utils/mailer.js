const nodemailer = require('nodemailer');
const { generarQRCode } = require('./qr');

// Configura tu transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * enviarCorreoReserva
 * -------------------
 * Envía un correo con la confirmación de la reserva y un código QR embebido.
 *
 * @param {Object} datosReserva - Información relevante de la reserva
 * @param {string} datosReserva.email - Correo del huésped
 * @param {string} datosReserva.nombre - Nombre del huésped
 * @param {string} datosReserva.codigoReserva - Código único de la reserva
 */
async function enviarCorreoReserva({ email, nombre, codigoReserva }) {
  try {
    const qrBase64 = await generarQRCode(codigoReserva);

    const mailOptions = {
      from: `"CD648" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Confirmación de reserva - CD648',
      html: `
        <h2>Gracias por tu reserva, ${nombre}!</h2>
        <p>Este es tu código QR para el check-in:</p>
        <img src="${qrBase64}" alt="Código QR de reserva" style="width:200px;" />
        <p>Código de reserva: <strong>${codigoReserva}</strong></p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo de reserva:', error);
    throw new Error('No se pudo enviar el correo de confirmación');
  }
}

module.exports = { enviarCorreoReserva };