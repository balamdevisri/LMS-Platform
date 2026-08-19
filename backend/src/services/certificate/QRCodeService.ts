import QRCode from 'qrcode';
import logger from '../../config/logger';

export class QRCodeService {
  /**
   * Generates a dynamic QR Code PNG buffer for verification URL
   */
  public async generateVerificationQRCodeBuffer(
    certificateId: string,
    studentId: string,
    verificationBaseUrl?: string
  ): Promise<Buffer> {
    try {
      const primaryFrontend = (process.env.FRONTEND_URL || 'https://www.kaizenq.in').split(',')[0].trim();
      const baseUrl = verificationBaseUrl || `${primaryFrontend}/verify-certificate`;
      const verificationUrl = `${baseUrl}/${certificateId}?studentId=${studentId}`;

      const qrBuffer = await QRCode.toBuffer(verificationUrl, {
        type: 'png',
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#0b1a30',
          light: '#ffffff',
        },
      });

      logger.info(`[QR CODE SERVICE] ✅ Dynamic QR Code Buffer generated for Certificate ID: ${certificateId}`);
      return qrBuffer;
    } catch (err: any) {
      logger.error(`[QR CODE SERVICE] ❌ Failed to generate QR Code: ${err?.message || err}`);
      throw new Error(`QR Code Generation Failed: ${err?.message || err}`);
    }
  }
}

export const qrCodeService = new QRCodeService();
