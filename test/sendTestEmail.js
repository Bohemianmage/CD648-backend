
require('dotenv').config();
const { enviarCorreoReserva } = require('../utils/mailer');

/**
 * Test de envío de correo con QR.
 * Reemplaza los valores de ejemplo por tu correo y nombre reales.
 */
async function test() {
  try {
    await enviarCorreoReserva({
      email: 'jeanclaudes.1992@gmail.com',       // ⚠️ Reemplaza esto
      nombre: 'Jean Claude Martell',       // ⚠️ Reemplaza esto
      codigoReserva: 'CD648-TEST-123456',  // Código de prueba
    });
    console.log('✅ Correo enviado correctamente.');
  } catch (err) {
    console.error('❌ Error al enviar el correo:', err);
  }
}

test();