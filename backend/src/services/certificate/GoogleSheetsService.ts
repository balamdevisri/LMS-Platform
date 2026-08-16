import { env } from '../../config/env';
import logger from '../../config/logger';

export interface CertificateRegistryData {
  certificateId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  completionDate: string;
  issueDate: string;
  certificateStatus: string;
  emailStatus: string;
  generatedTimestamp: string;
  downloadCount?: number;
}

export class GoogleSheetsService {
  private scriptUrl: string;

  constructor() {
    this.scriptUrl = env.GOOGLE_SHEETS_SCRIPT_URL;
  }

  /**
   * Search for a certificate by its unique Certificate ID using the Google Apps Script Web App
   */
  public async getCertificateById(certificateId: string): Promise<CertificateRegistryData | null> {
    try {
      logger.info(`[GOOGLE SHEETS WEB APP] Searching Certificate ID ${certificateId} via HTTP GET/POST...`);

      // 1. Try HTTP GET request first (Standard Apps Script doGet)
      const getUrl = `${this.scriptUrl}?action=get&certificateId=${encodeURIComponent(certificateId)}`;
      try {
        const response = await fetch(getUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          const resText = await response.text();
          try {
            const data = JSON.parse(resText);
            if (data && data.success && data.data) {
              logger.info(`[GOOGLE SHEETS WEB APP] ✅ Verified Certificate ID ${certificateId} via GET.`);
              return this.parseRowToRegistryData(data.data);
            }
            if (data && data.certificateId) {
              logger.info(`[GOOGLE SHEETS WEB APP] ✅ Verified Certificate ID ${certificateId} via GET (flat response).`);
              return this.parseRowToRegistryData(data);
            }
          } catch (e) {
            // response was not JSON or returned error payload
          }
        }
      } catch (getErr: any) {
        logger.warn(`[GOOGLE SHEETS WEB APP] GET search fallback trial failed: ${getErr?.message || getErr}`);
      }

      // 2. Try HTTP POST request fallback (Standard Apps Script doPost)
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get',
          certificateId,
        }),
      });

      if (!response.ok) {
        logger.warn(`[GOOGLE SHEETS WEB APP] POST request returned non-OK status: ${response.status}`);
        return null;
      }

      const resText = await response.text();
      const data = JSON.parse(resText);

      if (data && data.success && data.data) {
        logger.info(`[GOOGLE SHEETS WEB APP] ✅ Verified Certificate ID ${certificateId} via POST.`);
        return this.parseRowToRegistryData(data.data);
      }

      if (data && data.certificateId) {
        logger.info(`[GOOGLE SHEETS WEB APP] ✅ Verified Certificate ID ${certificateId} via POST (flat response).`);
        return this.parseRowToRegistryData(data);
      }

      return null;
    } catch (err: any) {
      logger.error(`[GOOGLE SHEETS WEB APP] ❌ Error searching certificate: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Appends a new certificate row to the Certificates registry sheet via the Google Apps Script Web App
   */
  public async appendCertificateRow(data: CertificateRegistryData): Promise<boolean> {
    try {
      logger.info(`[GOOGLE SHEETS WEB APP] Appending Certificate ID ${data.certificateId} via HTTP POST...`);

      // Check if it already exists to prevent duplicate entries
      const existing = await this.getCertificateById(data.certificateId);
      if (existing) {
        logger.warn(`[GOOGLE SHEETS WEB APP] ⚠️ Certificate ID ${data.certificateId} already registered. Skipping append.`);
        return false;
      }

      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append',
          ...data,
        }),
      });

      if (!response.ok) {
        logger.error(`[GOOGLE SHEETS WEB APP] ❌ HTTP error response on append: ${response.status}`);
        return false;
      }

      const resText = await response.text();
      try {
        const resJson = JSON.parse(resText);
        if (!resJson || resJson.success !== true) {
          logger.error(`[GOOGLE SHEETS WEB APP] ❌ Apps Script reported failure: ${resJson?.error || 'Unknown error'}`);
          return false;
        }
      } catch (err: any) {
        logger.error(`[GOOGLE SHEETS WEB APP] ❌ Failed to parse Apps Script response as JSON: ${err.message}. Response snippet: ${resText.substring(0, 200)}`);
        return false;
      }

      logger.info(`[GOOGLE SHEETS WEB APP] 📝 Logged Certificate ${data.certificateId} successfully.`);
      return true;
    } catch (err: any) {
      logger.error(`[GOOGLE SHEETS WEB APP] ❌ Error appending certificate row: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Check if a certificate already exists in the sheet registry for a specific student email and course ID
   */
  public async checkCertificateExists(studentEmail: string, courseId: string): Promise<CertificateRegistryData | null> {
    try {
      logger.info(`[GOOGLE SHEETS WEB APP] Checking if certificate exists for ${studentEmail} in course ${courseId}...`);

      // 1. Try HTTP GET request first
      const getUrl = `${this.scriptUrl}?action=check&studentEmail=${encodeURIComponent(studentEmail)}&courseId=${encodeURIComponent(courseId)}`;
      try {
        const response = await fetch(getUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          const resText = await response.text();
          try {
            const data = JSON.parse(resText);
            if (data && data.success && data.data) {
              logger.info(`[GOOGLE SHEETS WEB APP] ✅ Certificate exists for ${studentEmail} (via GET).`);
              return this.parseRowToRegistryData(data.data);
            }
          } catch (e) {}
        }
      } catch (getErr: any) {
        logger.warn(`[GOOGLE SHEETS WEB APP] GET check trial failed: ${getErr?.message || getErr}`);
      }

      // 2. Try HTTP POST request fallback
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check',
          studentEmail,
          courseId,
        }),
      });

      if (response.ok) {
        const resText = await response.text();
        const data = JSON.parse(resText);
        if (data && data.success && data.data) {
          logger.info(`[GOOGLE SHEETS WEB APP] ✅ Certificate exists for ${studentEmail} (via POST).`);
          return this.parseRowToRegistryData(data.data);
        }
      }

      return null;
    } catch (err: any) {
      logger.warn(`[GOOGLE SHEETS WEB APP] checkCertificateExists failed: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Search for all certificates matching a student email using the Google Apps Script Web App
   */
  public async getCertificatesByEmail(studentEmail: string): Promise<CertificateRegistryData[]> {
    try {
      logger.info(`[GOOGLE SHEETS WEB APP] Searching Certificates for ${studentEmail} via HTTP GET/POST...`);

      // 1. Try HTTP GET request first
      const getUrl = `${this.scriptUrl}?action=list&studentEmail=${encodeURIComponent(studentEmail)}`;
      try {
        const response = await fetch(getUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          const resText = await response.text();
          try {
            const data = JSON.parse(resText);
            if (data && data.success && Array.isArray(data.data)) {
              logger.info(`[GOOGLE SHEETS WEB APP] ✅ Found ${data.data.length} certificates via GET.`);
              return data.data.map((r: any) => this.parseRowToRegistryData(r));
            }
          } catch (e) {}
        }
      } catch (getErr: any) {
        logger.warn(`[GOOGLE SHEETS WEB APP] GET list trial failed: ${getErr?.message || getErr}`);
      }

      // 2. Try HTTP POST request fallback
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          studentEmail,
        }),
      });

      if (response.ok) {
        const resText = await response.text();
        const data = JSON.parse(resText);
        if (data && data.success && Array.isArray(data.data)) {
          logger.info(`[GOOGLE SHEETS WEB APP] ✅ Found ${data.data.length} certificates via POST.`);
          return data.data.map((r: any) => this.parseRowToRegistryData(r));
        }
      }

      return [];
    } catch (err: any) {
      logger.warn(`[GOOGLE SHEETS WEB APP] getCertificatesByEmail failed: ${err?.message || err}`);
      return [];
    }
  }

  /**
   * Helper parser to format dynamic return structures into strict Registry Data
   */
  private parseRowToRegistryData(raw: any): CertificateRegistryData {
    return {
      certificateId: raw.certificateId || raw.CertificateID || raw[0] || '',
      studentId: raw.studentId || raw.StudentID || raw[1] || '',
      studentName: raw.studentName || raw.StudentName || raw[2] || '',
      studentEmail: raw.studentEmail || raw.StudentEmail || raw[3] || '',
      courseId: raw.courseId || raw.CourseID || raw[4] || '',
      courseName: raw.courseName || raw.CourseName || raw[5] || '',
      completionDate: raw.completionDate || raw.CompletionDate || raw[6] || '',
      issueDate: raw.issueDate || raw.IssueDate || raw[7] || '',
      certificateStatus: raw.certificateStatus || raw.CertificateStatus || raw[8] || 'Issued',
      emailStatus: raw.emailStatus || raw.EmailStatus || raw[9] || 'Sent',
      generatedTimestamp: raw.generatedTimestamp || raw.GeneratedTimestamp || raw[10] || '',
      downloadCount: Number(raw.downloadCount || raw.DownloadCount || raw[11] || 0),
    };
  }
}

export const googleSheetsService = new GoogleSheetsService();
