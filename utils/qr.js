const QRCode = require('qrcode');

/**
 * generarQRCode
 * -------------
 * Genera un código QR en formato base64 a partir del texto proporcionado.
 *
 * @param {string} texto - Contenido que irá codificado en el QR
 * @returns {Promise<string>} Imagen base64 del QR generado
 */
async function generarQRCode(texto) {
  try {
    const qrImage = await QRCode.toDataURL(texto, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 300,
    });
    return qrImage;
  } catch (error) {
    console.error('Error al generar código QR:', error);
    throw new Error('No se pudo generar el código QR');
  }
}

module.exports = { generarQRCode };