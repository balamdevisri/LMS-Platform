import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import url from 'url';

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const port = 8085;
const redirectUri = `http://localhost:${port}`;

if (!clientId || !clientSecret) {
  console.error('❌ Error: GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET is missing from backend/.env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/presentations'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes
});

console.log('\n================================================================');
console.log('⚡ GOOGLE SLIDES OAUTH REFRESH TOKEN GENERATOR ⚡');
console.log('================================================================');
console.log('\n👉 1. Please open the following URL in your browser to authorize access:\n');
console.log(authUrl);
console.log('\n⌛ 2. Waiting for your authorization callback on http://localhost:8085 ...');

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url || '', true);
    if (parsedUrl.pathname === '/') {
      const code = parsedUrl.query.code as string;
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Authorization Code Missing</h1>');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Success!</h1><p>Authorization successful. You can close this tab now.</p>');
      
      console.log('\n✅ Authorization code captured successfully.');
      console.log('🔄 Exchanging authorization code for tokens...');

      const { tokens } = await oauth2Client.getToken(code);
      const refreshToken = tokens.refresh_token;

      if (refreshToken) {
        console.log('\n================================================================');
        console.log('🎉 GOOGLE REFRESH TOKEN GENERATED SUCCESSFULLY 🎉');
        console.log('================================================================\n');
        console.log(refreshToken);
        console.log('\n================================================================');
        console.log('👉 Copy the token above and set it in your backend/.env:');
        console.log('GOOGLE_OAUTH_REFRESH_TOKEN=your_token_value_above');
        console.log('================================================================\n');
      } else {
        console.error('\n❌ Error: Google did not return a refresh token. Make sure you revoke access first or clear application permissions so Google prompts for consent again.');
      }

      res.end();
      server.close(() => {
        process.exit(0);
      });
    }
  } catch (err: any) {
    console.error('❌ Error during OAuth code exchange:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Server Error</h1>');
    server.close(() => {
      process.exit(1);
    });
  }
});

server.listen(port, () => {
  // Server is listening
});
