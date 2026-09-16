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

class CDPClient {
  private chromeProcess: ChildProcess | null = null;
  private ws: WebSocket | null = null;
  private id = 0;
  private callbacks = new Map<number, (res: any) => void>();
  public consoleLogs: string[] = [];
  public errors: string[] = [];
  public port = 9222;

  async launch(headless = true) {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const userDataDir = `C:\\Users\\devis\\AppData\\Local\\Temp\\chrome-debug-${Date.now()}`;

    this.chromeProcess = spawn(chromePath, [
      `--remote-debugging-port=${this.port}`,
      `--user-data-dir=${userDataDir}`,
      headless ? '--headless=new' : '',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      'about:blank',
    ]);

    let targets: any[] = [];
    for (let i = 0; i < 40; i++) {
      try {
        targets = await getJson(`http://127.0.0.1:${this.port}/json/list`);
        const pageTarget = targets.find((t: any) => t.type === 'page');
        if (pageTarget && pageTarget.webSocketDebuggerUrl) {
          targets = [pageTarget];
          break;
        }
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
        const text = msg.params?.message?.text || '';
        const level = msg.params?.message?.level;
        this.consoleLogs.push(`[${level}] ${text}`);
      }
    };

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

  async goto(url: string, waitMs = 3000) {
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

async function main() {
  const client = new CDPClient();
  try {
    await client.launch(true);
    await client.goto('http://localhost:5173');
    
    // Set developer session
    await client.evaluate(`
      localStorage.setItem('kz_dev_session_active', 'true');
      sessionStorage.setItem('kz_dev_session_active', 'true');
    `);

    console.log('Navigating to Kubernetes course page...');
    await client.goto('http://localhost:5173/courses/kubernetes-complete-course-beginner-to-advanced', 4000);

    const check = await client.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        const title = document.title;
        const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText);
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText);
        
        // Find Curriculum tab button and click it
        const curriculumTab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('curriculum'));
        if (curriculumTab) {
          curriculumTab.click();
        }

        return {
          title,
          url: window.location.href,
          h1s,
          buttonsCount: buttons.length,
          hasCurriculumTab: !!curriculumTab,
          bodySnippet: bodyText.slice(0, 400)
        };
      })()
    `);

    console.log('Course Page Initial Check:', check);
    await wait(2000);

    // Click the "Course Content (56)" tab
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const contentTab = btns.find(b => (b.innerText || '').includes('Course Content') || (b.innerText || '').includes('Curriculum'));
        if (contentTab) {
          contentTab.click();
          return true;
        }
        return false;
      })()
    `);
    await wait(2000);

    const fullCurriculumCheck = await client.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        
        // Find all module titles in the curriculum
        const moduleHeadings = [];
        for (let i = 1; i <= 15; i++) {
          const modPattern = new RegExp('Module\\\\s*' + i + '[:\\\\s-]', 'i');
          const found = modPattern.test(bodyText);
          moduleHeadings.push({ module: i, found });
        }

        // Expand all accordions
        const accordions = Array.from(document.querySelectorAll('button, div[role="button"]')).filter(b => {
          const t = b.innerText || '';
          return t.includes('Module') || t.includes('lessons');
        });
        accordions.forEach(a => (a as HTMLElement).click());

        return {
          foundModules: moduleHeadings.filter(m => m.found).length,
          totalChecked: 15,
          moduleDetails: moduleHeadings,
          totalAccordionButtons: accordions.length,
          snippet: bodyText.slice(0, 1000)
        };
      })()
    `);

    console.log('Full Curriculum Check (After clicking Course Content tab):', fullCurriculumCheck);
    await wait(1500);

    const postExpandCheck = await client.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        const lessonItems = Array.from(document.querySelectorAll('div, li, span')).filter(el => {
          const t = el.innerText || '';
          return t.startsWith('Lesson ') || t.startsWith('1.') || t.startsWith('2.');
        });
        return {
          bodyLength: bodyText.length,
          totalLessonElements: lessonItems.length,
          hasModule15: bodyText.includes('Module 15') || bodyText.includes('Production Readiness'),
          hasModule1: bodyText.includes('Module 1') || bodyText.includes('Architecture')
        };
      })()
    `);
    console.log('Post Expand Check:', postExpandCheck);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
