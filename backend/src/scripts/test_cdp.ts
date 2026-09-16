import { spawn, ChildProcess } from 'child_process';
import http from 'http';

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url: string, method = 'GET'): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

class CDPBrowser {
  private chromeProcess: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private id = 0;
  private callbacks = new Map<number, (res: any) => void>();
  public consoleLogs: string[] = [];
  public errors: string[] = [];
  public networkRequests: { url: string; status: number; method: string }[] = [];

  async launch(headless = true) {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const port = 9222;
    const userDataDir = `C:\\Users\\devis\\AppData\\Local\\Temp\\chrome-smoke-${Date.now()}`;

    this.chromeProcess = spawn(chromePath, [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      headless ? '--headless=new' : '',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ]);

    // Wait for CDP endpoint to be ready
    let targets: any[] = [];
    for (let i = 0; i < 30; i++) {
      try {
        targets = await getJson(`http://127.0.0.1:${port}/json/list`);
        if (targets && targets.length > 0 && targets[0].webSocketDebuggerUrl) break;
      } catch (e) {
        await wait(200);
      }
    }

    if (!targets || targets.length === 0 || !targets[0].webSocketDebuggerUrl) {
      throw new Error('Failed to connect to Chrome DevTools endpoint.');
    }

    const pageWsUrl = targets[0].webSocketDebuggerUrl;

    this.ws = new WebSocket(pageWsUrl);
    await new Promise<void>((resolve, reject) => {
      this.ws!.onopen = () => resolve();
      this.ws!.onerror = (err) => reject(err);
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.id && this.callbacks.has(msg.id)) {
        const cb = this.callbacks.get(msg.id)!;
        this.callbacks.delete(msg.id);
        cb(msg);
      }

      if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params?.exceptionDetails?.exception?.description || msg.params?.exceptionDetails?.text;
        this.errors.push(`Runtime Exception: ${desc}`);
      }

      if (msg.method === 'Console.messageAdded') {
        const text = msg.params?.message?.text;
        const level = msg.params?.message?.level;
        if (level === 'error') {
          this.errors.push(`Console Error: ${text}`);
        }
        this.consoleLogs.push(`[${level}] ${text}`);
      }

      if (msg.method === 'Network.responseReceived') {
        this.networkRequests.push({
          url: msg.params?.response?.url,
          status: msg.params?.response?.status,
          method: msg.params?.response?.requestHeaders?.[':method'] || 'GET',
        });
      }
    };

    // Enable domains
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Console.enable');
    await this.send('Network.enable');
  }

  async send(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const callId = ++this.id;
      this.callbacks.set(callId, (res) => {
        if (res.error) {
          reject(new Error(`CDP Error in ${method}: ${JSON.stringify(res.error)}`));
        } else {
          resolve(res.result);
        }
      });
      this.ws!.send(JSON.stringify({ id: callId, method, params }));
    });
  }

  async goto(url: string, waitMs = 2500) {
    await this.send('Page.navigate', { url });
    await wait(waitMs);
  }

  async evaluate(expression: string): Promise<any> {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }

  async close() {
    try {
      this.ws?.close();
    } catch {}
    try {
      this.chromeProcess?.kill();
    } catch {}
  }
}

async function runTest() {
  const browser = new CDPBrowser();
  try {
    console.log('Launching real Chrome...');
    await browser.launch(true);
    console.log('Navigating to http://localhost:5173...');
    await browser.goto('http://localhost:5173');
    const title = await browser.evaluate('document.title');
    const bodyText = await browser.evaluate('document.body.innerText.slice(0, 200)');
    console.log('Page Title:', title);
    console.log('Body Preview:', bodyText);
    console.log('Console Logs:', browser.consoleLogs.slice(0, 5));
    console.log('Errors:', browser.errors);
    console.log('Real Chrome test passed!');
  } finally {
    await browser.close();
  }
}

runTest().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
