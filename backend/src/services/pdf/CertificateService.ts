import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export class CertificateService {
  /**
   * Generates a high-quality PDF certificate with standard layout formatting
   */
  public static async generateCertificatePdf(
    studentName: string,
    courseTitle: string,
    instructorName: string,
    certNumber: string,
    issueDate: string,
    verificationId: string
  ): Promise<Buffer> {
    // 1. Create a PDF document (standard Landscape Letter page size: 792 x 612)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([792, 612]);
    const { width, height } = page.getSize();

    // 2. Load Standard fonts
    const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontTimesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // 3. Draw border styling (outer boundary and inner gold line)
    // Outer border (Dark navy blue background fill or lines)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.06, 0.16, 0.38), // #0F2A60
      borderWidth: 8,
    });

    // Inner gold thin border
    page.drawRectangle({
      x: 32,
      y: 32,
      width: width - 64,
      height: height - 64,
      borderColor: rgb(0.83, 0.69, 0.22), // Gold
      borderWidth: 2,
    });

    // 4. Header title: SHAIVIKA GROUPS / KAIZENQ AI
    page.drawText('SHAIVIKA GROUPS & KAIZENQ AI', {
      x: width / 2 - 150,
      y: height - 85,
      size: 18,
      font: fontHelveticaBold,
      color: rgb(0.06, 0.16, 0.38),
    });

    page.drawText('INTERNATIONAL CERTIFICATE OF COMPLETION', {
      x: width / 2 - 200,
      y: height - 120,
      size: 14,
      font: fontHelveticaBold,
      color: rgb(0.47, 0.55, 0.69), // #7888A5
    });

    // Decorative line below header
    page.drawLine({
      start: { x: width / 2 - 100, y: height - 135 },
      end: { x: width / 2 + 100, y: height - 135 },
      color: rgb(0.83, 0.69, 0.22),
      thickness: 1.5,
    });

    // 5. Presentational text
    page.drawText('This certificate is proudly presented to', {
      x: width / 2 - 120,
      y: height - 180,
      size: 12,
      font: fontTimesItalic,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Student Name (Bold & Large)
    const nameWidth = fontHelveticaBold.widthOfTextAtSize(studentName, 32);
    page.drawText(studentName, {
      x: width / 2 - nameWidth / 2,
      y: height - 230,
      size: 32,
      font: fontHelveticaBold,
      color: rgb(0.06, 0.16, 0.38),
    });

    // Middle descriptive text
    page.drawText('for successfully completing all academic requirements, quizzes, labs and projects for', {
      x: width / 2 - 240,
      y: height - 280,
      size: 11,
      font: fontHelvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Course Title (Bold)
    const courseWidth = fontHelveticaBold.widthOfTextAtSize(courseTitle, 20);
    page.drawText(courseTitle, {
      x: width / 2 - courseWidth / 2,
      y: height - 320,
      size: 20,
      font: fontHelveticaBold,
      color: rgb(0.31, 0.27, 0.9), // Purpleish Blue
    });

    // 6. Signatures & Metadata layout (bottom of certificate)
    // Left: Instructor Signature
    page.drawLine({
      start: { x: 80, y: 130 },
      end: { x: 280, y: 130 },
      color: rgb(0.6, 0.6, 0.6),
      thickness: 1,
    });
    page.drawText(instructorName, {
      x: 100,
      y: 110,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText('Course Instructor', {
      x: 100,
      y: 95,
      size: 10,
      font: fontHelvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Right: Date & Verification metadata
    page.drawText(`Issue Date: ${issueDate}`, {
      x: 480,
      y: 145,
      size: 10,
      font: fontHelvetica,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`Certificate ID: ${certNumber}`, {
      x: 480,
      y: 130,
      size: 10,
      font: fontHelveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`Verification ID: ${verificationId}`, {
      x: 480,
      y: 115,
      size: 10,
      font: fontHelvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText('Securely Verified by SHAIVIKA Trust Engine', {
      x: 480,
      y: 95,
      size: 9,
      font: fontHelvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    // 7. Dynamic QR Code generation & embedding
    try {
      const verifyUrl = `https://shaivika-lms.vercel.app/verify/certificate/${verificationId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        width: 150,
      });

      // Embed QR code image in PDF
      const qrImageBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      const qrImage = await pdfDoc.embedPng(qrImageBytes);

      // Draw QR image (centered bottom or right corner)
      page.drawImage(qrImage, {
        x: width / 2 - 40,
        y: 65,
        width: 80,
        height: 80,
      });
    } catch (qrErr) {
      console.warn('CertificateService: Failed to draw verification QR code:', qrErr);
    }

    // 8. Output as Buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
