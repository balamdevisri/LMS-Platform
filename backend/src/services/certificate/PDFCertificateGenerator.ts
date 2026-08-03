import PDFDocument from 'pdfkit';
import logger from '../../config/logger';

export interface CertificateData {
  certificateId: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  instructorName?: string;
  completionDate: string;
  courseDuration?: string;
  modulesCount?: number;
  qrCodeBuffer: Buffer;
}

export class PDFCertificateGenerator {
  /**
   * Generates a high-quality vector PDF Certificate as an In-Memory Buffer
   */
  public async generateCertificateBuffer(data: CertificateData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Landscape A4 Page Dimensions in PDF points: 841.89 x 595.28
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 0,
          info: {
            Title: `Certificate of Completion - ${data.courseTitle}`,
            Author: 'KaizenQ AI LMS',
            Subject: `Official Credential for ${data.studentName}`,
            Keywords: `KaizenQ, LMS, Certificate, ${data.certificateId}`,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          logger.info(`[PDF GENERATOR] ✅ Generated Certificate PDF Buffer (${pdfBuffer.length} bytes) for ${data.studentName}`);
          resolve(pdfBuffer);
        });
        doc.on('error', (err) => {
          logger.error(`[PDF GENERATOR] ❌ Error generating PDF: ${err.message}`);
          reject(err);
        });

        const width = 841.89;
        const height = 595.28;

        // Background
        doc.rect(0, 0, width, height).fill('#ffffff');

        // Top Left Gold Trim Sweep
        doc
          .save()
          .moveTo(0, 0)
          .lineTo(160, 0)
          .lineTo(0, 160)
          .closePath()
          .fill('#d4af37');

        // Top Left Royal Blue Sweep
        doc
          .save()
          .moveTo(0, 0)
          .lineTo(150, 0)
          .lineTo(0, 150)
          .closePath()
          .fill('#002277');

        // Bottom Right Gold Trim Sweep
        doc
          .save()
          .moveTo(width, height)
          .lineTo(width - 170, height)
          .lineTo(width, height - 170)
          .closePath()
          .fill('#d4af37');

        // Bottom Right Royal Blue Sweep
        doc
          .save()
          .moveTo(width, height)
          .lineTo(width - 160, height)
          .lineTo(width, height - 160)
          .closePath()
          .fill('#002277');

        // Double Gold Border
        doc
          .rect(16, 16, width - 32, height - 32)
          .lineWidth(2)
          .stroke('#d4af37');

        doc
          .rect(22, 22, width - 44, height - 44)
          .lineWidth(1)
          .stroke('#cbd5e1');

        // Top Left Gold Seal Badge
        doc
          .save()
          .circle(55, 55, 30)
          .fill('#d4af37');
        doc
          .circle(55, 55, 27)
          .lineWidth(2)
          .stroke('#ffffff');

        doc
          .fillColor('#0b1a30')
          .fontSize(6)
          .font('Helvetica-Bold')
          .text('★ KAIZEN Q ★', 25, 45, { width: 60, align: 'center' })
          .text('AI-POWERED', 25, 53, { width: 60, align: 'center' })
          .text('LMS', 25, 61, { width: 60, align: 'center' });

        // Header Branding
        doc
          .fillColor('#0b1a30')
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('Kaizen Q', 0, 40, { width, align: 'center' });

        doc
          .fillColor('#0044cc')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('AI-POWERED LMS', 0, 58, { width, align: 'center' });

        // Certificate Main Title
        doc
          .fillColor('#0b1a30')
          .fontSize(30)
          .font('Helvetica-Bold')
          .text('CERTIFICATE', 0, 85, { width, align: 'center' });

        doc
          .fillColor('#b8860b')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('O F   C O M P L E T I O N', 0, 118, { width, align: 'center' });

        // Center Gold Accent Line
        doc
          .moveTo(width / 2 - 100, 135)
          .lineTo(width / 2 + 100, 135)
          .lineWidth(1.5)
          .stroke('#d4af37');

        // Subtitle
        doc
          .fillColor('#475569')
          .fontSize(11)
          .font('Helvetica')
          .text('This is to certify that', 0, 155, { width, align: 'center' });

        // Student Name
        doc
          .fillColor('#0b1a30')
          .fontSize(28)
          .font('Times-Bold')
          .text(data.studentName, 0, 180, { width, align: 'center' });

        // Underline Filigree
        doc
          .moveTo(width / 2 - 140, 215)
          .lineTo(width / 2 + 140, 215)
          .lineWidth(1)
          .stroke('#e2e8f0');

        doc
          .moveTo(width / 2 - 80, 218)
          .lineTo(width / 2 + 80, 218)
          .lineWidth(1.5)
          .stroke('#d4af37');

        // Course Text
        doc
          .fillColor('#475569')
          .fontSize(11)
          .font('Helvetica')
          .text('has successfully completed the course', 0, 235, { width, align: 'center' });

        // Course Title
        doc
          .fillColor('#0033aa')
          .fontSize(17)
          .font('Helvetica-Bold')
          .text(data.courseTitle, 60, 255, { width: width - 120, align: 'center' });

        doc
          .fillColor('#1e293b')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('offered by Kaizen Q – AI-Powered LMS.', 0, 282, { width, align: 'center' });

        // Description Paragraph
        doc
          .fillColor('#64748b')
          .fontSize(9.5)
          .font('Helvetica')
          .text(
            'The student has demonstrated outstanding dedication, completed all modules, passed all assessments, and has acquired strong knowledge and skills in the subject.',
            120,
            302,
            { width: width - 240, align: 'center', lineGap: 3 }
          );

        // QR Code Box (Middle Right)
        const qrBoxX = width - 165;
        const qrBoxY = 175;

        doc
          .rect(qrBoxX, qrBoxY, 115, 135)
          .lineWidth(1)
          .dash(4, { space: 3 })
          .stroke('#d4af37');
        doc.undash();

        doc
          .fillColor('#0033aa')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('SCAN TO VERIFY', qrBoxX, qrBoxY + 10, { width: 115, align: 'center' });

        // Embed QR Code PNG Buffer
        try {
          doc.image(data.qrCodeBuffer, qrBoxX + 17.5, qrBoxY + 24, { width: 80, height: 80 });
        } catch (imgErr: any) {
          logger.warn(`[PDF GENERATOR] Failed to embed QR code image: ${imgErr?.message}`);
        }

        doc
          .fillColor('#475569')
          .fontSize(6.5)
          .font('Helvetica-Bold')
          .text(`ID: ${data.certificateId}`, qrBoxX + 5, qrBoxY + 108, { width: 105, align: 'center' })
          .text(`Student: ${data.studentId}`, qrBoxX + 5, qrBoxY + 118, { width: 105, align: 'center' });

        // 4 Metric Pillars
        const pillarY = 360;
        const pillarWidth = 140;
        const startX = (width - pillarWidth * 4) / 2;

        const pillars = [
          { label: 'COURSE DURATION', val: data.courseDuration || '24 Hours' },
          { label: 'MODULES COMPLETED', val: `${data.modulesCount || 8} / ${data.modulesCount || 8} Modules` },
          { label: 'ACHIEVEMENT', val: '100% Score • Mastery' },
          { label: 'COMPLETED ON', val: data.completionDate },
        ];

        pillars.forEach((p, idx) => {
          const pX = startX + idx * pillarWidth;
          doc
            .fillColor('#0033aa')
            .fontSize(7)
            .font('Helvetica-Bold')
            .text(p.label, pX, pillarY, { width: pillarWidth, align: 'center' });

          doc
            .fillColor('#0b1a30')
            .fontSize(9.5)
            .font('Helvetica-Bold')
            .text(p.val, pX, pillarY + 12, { width: pillarWidth, align: 'center' });

          if (idx < 3) {
            doc
              .moveTo(pX + pillarWidth, pillarY)
              .lineTo(pX + pillarWidth, pillarY + 26)
              .lineWidth(0.5)
              .stroke('#cbd5e1');
          }
        });

        // Horizontal Footer Separator
        doc
          .moveTo(80, 420)
          .lineTo(width - 80, 420)
          .lineWidth(0.5)
          .stroke('#e2e8f0');

        // Signatures Row
        const sigY = 445;

        // Left Signature
        doc
          .fillColor('#0b1a30')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Certified By', 80, sigY, { width: 160, align: 'center' });
        doc
          .moveTo(80, sigY + 16)
          .lineTo(240, sigY + 16)
          .lineWidth(0.5)
          .stroke('#94a3b8');
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('SHAIVIKA GROUPS', 80, sigY + 20, { width: 160, align: 'center' });

        // Center Company Logo
        doc
          .fillColor('#0033aa')
          .fontSize(13)
          .font('Helvetica-Bold')
          .text('SHAIVIKA GROUPS', 0, sigY, { width, align: 'center' });
        doc
          .fillColor('#b8860b')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('LEARN  •  GROW  •  SUCCEED', 0, sigY + 16, { width, align: 'center' });

        // Right Signature
        doc
          .fillColor('#0b1a30')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Awarded By', width - 240, sigY, { width: 160, align: 'center' });
        doc
          .moveTo(width - 240, sigY + 16)
          .lineTo(width - 80, sigY + 16)
          .lineWidth(0.5)
          .stroke('#94a3b8');
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('KAIZENQ TEAM', width - 240, sigY + 20, { width: 160, align: 'center' });

        doc.end();
      } catch (err: any) {
        logger.error(`[PDF GENERATOR] ❌ Exception in PDF generation: ${err?.message || err}`);
        reject(err);
      }
    });
  }
}

export const pdfCertificateGenerator = new PDFCertificateGenerator();
