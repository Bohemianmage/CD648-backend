const QRCode = require('qrcode');

/**
 * generarQRReserva
 * ----------------
 * Genera un código QR en base64 a partir del ID de la reserva
 * o cualquier contenido que desees codificar (puede ser el nombre, fecha, etc.)
 * 
 * @param {Object} reserva - Objeto de reserva guardado
 * @returns {Promise<string>} - Imagen QR en formato base64 para usar en correos
 */
async function generarQRReserva(reserva) {
  const contenidoQR = `Reserva ${reserva._id} - Cliente: ${reserva.cliente.nombre}`;
  return await QRCode.toDataURL(contenidoQR);
}

module.exports = { generarQRReserva };