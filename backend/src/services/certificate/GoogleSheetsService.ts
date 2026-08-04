import { google, sheets_v4 } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';
import logger from '../../config/logger';

export interface CertificateRegistryData {
  certificateId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseId: string;
  completionDate: string;
  issueDate: string;
  certificateStatus: string;
  emailStatus: string;
  downloadCount: number;
}

export class GoogleSheetsService {
  private sheetsClient?: sheets_v4.Sheets;
  private isConnected = false;
  private spreadsheetId?: string;

  constructor() {
    this.spreadsheetId = env.GOOGLE_SHEET_ID;
  }

  /**
   * Connect to Google Sheets API using the service account credentials
   */
  public async connectGoogleSheets(): Promise<boolean> {
    if (this.isConnected && this.sheetsClient) return true;

    try {
      const possiblePaths = [
        path.resolve(process.cwd(), 'config/google-drive.json'),
        path.resolve(process.cwd(), '../config/google-drive.json'),
        path.join(__dirname, '../../config/google-drive.json'),
        path.join(__dirname, '../../../config/google-drive.json'),
      ];

      let keyFilePath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          keyFilePath = p;
          break;
        }
      }

      let auth: any;

      if (keyFilePath) {
        const jsonContent = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
        auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: jsonContent.client_email,
            private_key: jsonContent.private_key,
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      } else if (env.GOOGLE_DRIVE_CLIENT_EMAIL && env.GOOGLE_DRIVE_PRIVATE_KEY) {
        let privateKey = env.GOOGLE_DRIVE_PRIVATE_KEY;
        if (privateKey.includes('\\n')) {
          privateKey = privateKey.replace(/\\n/g, '\n');
        }
        auth = new google.auth.JWT({
          email: env.GOOGLE_DRIVE_CLIENT_EMAIL,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      } else {
        logger.error('[GOOGLE SHEETS] ❌ Connection Failed: No credentials found.');
        this.isConnected = false;
        return false;
      }

      this.sheetsClient = google.sheets({ version: 'v4', auth });
      this.isConnected = true;
      logger.info('[GOOGLE SHEETS] ✅ Initialized Google Sheets API Client.');
      return true;
    } catch (err: any) {
      logger.error(`[GOOGLE SHEETS] ❌ Connection error: ${err?.message || err}`);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Ensures the "Certificates" worksheet exists with the correct headers
   */
  public async ensureCertificatesSheet(): Promise<boolean> {
    const connected = await this.connectGoogleSheets();
    if (!connected || !this.sheetsClient || !this.spreadsheetId) {
      logger.error('[GOOGLE SHEETS] ❌ Cannot verify sheet structure: Client or Sheet ID missing.');
      return false;
    }

    try {
      // Get spreadsheet metadata to check worksheets
      const meta = await this.sheetsClient.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheetNames = meta.data.sheets?.map(s => s.properties?.title) || [];
      const hasCertificates = sheetNames.includes('Certificates');

      if (!hasCertificates) {
        logger.info("[GOOGLE SHEETS] Worksheet 'Certificates' not found. Creating it...");
        await this.sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: 'Certificates',
                  },
                },
              },
            ],
          },
        });

        // Set Headers
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Certificates!A1:J1',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[
              'Certificate ID',
              'Student Name',
              'Student Email',
              'Course Name',
              'Course ID',
              'Completion Date',
              'Issue Date',
              'Certificate Status',
              'Email Status',
              'Download Count'
            ]],
          },
        });

        logger.info("[GOOGLE SHEETS] ✅ Created worksheet 'Certificates' and added headers.");
      }
      return true;
    } catch (err: any) {
      logger.error(`[GOOGLE SHEETS] ❌ Error in ensureCertificatesSheet: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Search for a certificate by its unique Certificate ID
   */
  public async getCertificateById(certificateId: string): Promise<CertificateRegistryData | null> {
    const connected = await this.connectGoogleSheets();
    if (!connected || !this.sheetsClient || !this.spreadsheetId) return null;

    try {
      await this.ensureCertificatesSheet();

      const response = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Certificates!A:J',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return null; // No rows or only header

      // Index 0 is Certificate ID
      const match = rows.find(r => r[0] === certificateId);
      if (!match) return null;

      return {
        certificateId: match[0] || '',
        studentName: match[1] || '',
        studentEmail: match[2] || '',
        courseName: match[3] || '',
        courseId: match[4] || '',
        completionDate: match[5] || '',
        issueDate: match[6] || '',
        certificateStatus: match[7] || '',
        emailStatus: match[8] || '',
        downloadCount: Number(match[9] || 0),
      };
    } catch (err: any) {
      logger.error(`[GOOGLE SHEETS] ❌ Error in getCertificateById: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Appends a new certificate row to the Certificates registry sheet
   */
  public async appendCertificateRow(data: CertificateRegistryData): Promise<boolean> {
    const connected = await this.connectGoogleSheets();
    if (!connected || !this.sheetsClient || !this.spreadsheetId) {
      logger.error('[GOOGLE SHEETS] ❌ Cannot append row: Connection failed.');
      return false;
    }

    try {
      await this.ensureCertificatesSheet();

      // Check if it already exists to prevent duplicate entries
      const existing = await this.getCertificateById(data.certificateId);
      if (existing) {
        logger.warn(`[GOOGLE SHEETS] ⚠️ Certificate ID ${data.certificateId} already registered. Skipping append.`);
        return false;
      }

      await this.sheetsClient.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Certificates!A:J',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            data.certificateId,
            data.studentName,
            data.studentEmail,
            data.courseName,
            data.courseId,
            data.completionDate,
            data.issueDate,
            data.certificateStatus,
            data.emailStatus,
            data.downloadCount
          ]],
        },
      });

      logger.info(`[GOOGLE SHEETS] 📝 Appended Certificate ${data.certificateId} to Registry.`);
      return true;
    } catch (err: any) {
      logger.error(`[GOOGLE SHEETS] ❌ Error in appendCertificateRow: ${err?.message || err}`);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
