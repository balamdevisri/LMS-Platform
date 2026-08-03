import QRCode from 'qrcode';
import logger from '../../config/logger';

export class QRCodeService {
  /**
   * Generates a dynamic QR Code PNG buffer for verification URL
   */
  public async generateVerificationQRCodeBuffer(
    certificateId: string,
    studentId: string,
    verificationBaseUrl: string = 'https://verify.kaizenq.edu/credentials'
  ): Promise<Buffer> {
    try {
      const verificationUrl = `${verificationBaseUrl}/${certificateId}?studentId=${studentId}`;

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
