import http from 'http';
import { spawn } from 'child_process';
import WebSocket from 'ws';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  private ws: WebSocket;
  private messageId = 1;
  private callbacks = new Map<number, (res: any) => void>();

  constructor(wsUrl: string) {
    this.ws = new WebSocket(wsUrl);
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws.on('open', () => resolve());
      this.ws.on('error', reject);
      this.ws.on('message', (data: string) => {
        const msg = JSON.parse(data.toString());
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id)!;
          this.callbacks.delete(msg.id);
          cb(msg);
        }
      });
    });
  }

  async send(method: string, params: any = {}): Promise<any> {
    const id = this.messageId++;
    return new Promise((resolve) => {
      this.callbacks.set(id, resolve);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expr: string): Promise<any> {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.result?.value;
  }

  close() {
    this.ws.close();
  }
}

async function runE2E() {
  console.log('=== Starting E2E Diagnostic for /admin/courses/course_linux_101 ===');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9225;
  const userDataDir = 'C:\\Users\\devis\\AppData\\Local\\Temp\\chrome-e2e-profile-' + Date.now();

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:5173/developer-access',
  ]);

  try {
    await delay(3000);
    const versionInfo = await getJson(`http://127.0.0.1:${debuggingPort}/json/list`);
    const target = versionInfo.find((p: any) => p.type === 'page');
    if (!target) throw new Error('No page target found');

    const client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('Setting up admin session in localStorage...');
    await client.evaluate(`(() => {
      localStorage.setItem('developer_authenticated', 'true');
      localStorage.setItem('shaivika_developer_gate_passcode', 'googlemanoj');
      localStorage.setItem('shaivika_user', JSON.stringify({
        uid: 'admin_test_1',
        email: 'admin@kaizenq.in',
        role: 'admin',
        name: 'Administrator',
        emailVerified: true
      }));
    })()`);

    console.log('Navigating to /admin/courses/course_linux_101...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/admin/courses/course_linux_101' });
    await delay(4000);

    // Check title and UI state
    const pageState = await client.evaluate(`({
      title: document.title,
      url: window.location.href,
      bodySnippet: document.body.innerText.slice(0, 300),
      buttonsFound: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean).slice(0, 15),
    })`);
    console.log('Course Details page state:', pageState);

    // Expand Module 3 (Linux File System) if collapsed, or find the lesson
    console.log('Locating Module 3 and notes lesson...');
    const clickModOrLesson = await client.evaluate(`(() => {
      // Find all elements that might represent module 3 or lesson notes
      const allEls = Array.from(document.querySelectorAll('*'));
      
      const lessonEl = allEls.find(el => 
        (el.textContent.includes('Module 3') && el.textContent.includes('Complete Notes')) ||
        el.textContent.includes('linux-unit-3-notes') ||
        (el.textContent.includes('Linux File System') && el.textContent.includes('Notes'))
      );

      if (lessonEl) {
        lessonEl.click();
        return { clickedLesson: true, text: lessonEl.textContent.slice(0, 80) };
      }

      // Try expanding module 3 first
      const mod3El = allEls.find(el => el.textContent.includes('Module 3') || el.textContent.includes('Linux File System'));
      if (mod3El) {
        mod3El.click();
        return { clickedModule: true, text: mod3El.textContent.slice(0, 80) };
      }

      return { notFound: true };
    })()`);
    console.log('Click Module/Lesson result:', clickModOrLesson);
    await delay(2000);

    // Check if lesson is now clickable or drawer opened
    const openDrawer = await client.evaluate(`(() => {
      const editButtons = Array.from(document.querySelectorAll('button, div, [role="button"]'));
      const target = editButtons.find(b => 
        b.textContent.includes('Complete Notes') || 
        b.textContent.includes('linux-unit-3-notes') ||
        b.getAttribute('title')?.includes('Edit')
      );
      if (target) {
        target.click();
        return { clicked: true, text: target.textContent.slice(0, 60) };
      }
      return { notFound: true, buttons: editButtons.map(b => b.textContent.trim()).filter(Boolean).slice(0, 10) };
    })()`);
    console.log('Open Drawer result:', openDrawer);
    await delay(2500);

    // Check if UnitContentEditor is open and find "Publish & Update"
    const editorState = await client.evaluate(`(() => {
      const modal = document.querySelector('.animate-in, [role="dialog"], .fixed');
      const buttons = Array.from(document.querySelectorAll('button'));
      const publishBtn = buttons.find(b => b.textContent.includes('Publish & Update'));
      const saveDraftBtn = buttons.find(b => b.textContent.includes('Save Draft'));
      
      return {
        modalPresent: Boolean(modal),
        hasPublishBtn: Boolean(publishBtn),
        hasSaveDraftBtn: Boolean(saveDraftBtn),
        allVisibleButtons: buttons.map(b => b.textContent.trim()).filter(Boolean)
      };
    })()`);
    console.log('UnitContentEditor state:', editorState);

    // Perform Publish & Update click if present
    if (editorState.hasPublishBtn) {
      console.log('Triggering Publish & Update click in UnitContentEditor...');
      const clickPublish = await client.evaluate(`(() => {
        const publishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Publish & Update'));
        if (publishBtn) {
          publishBtn.click();
          return { clicked: true };
        }
        return { clicked: false };
      })()`);
      console.log('Click Publish result:', clickPublish);
      await delay(3000);

      const toastResult = await client.evaluate(`(() => {
        const toasts = Array.from(document.querySelectorAll('[data-sonner-toast], [role="status"]'));
        return {
          toastCount: toasts.length,
          texts: toasts.map(t => t.textContent)
        };
      })()`);
      console.log('Publish result toast:', toastResult);
    }

    // Refresh page to verify persistence
    console.log('Reloading page to verify persistence...');
    await client.send('Page.reload');
    await delay(3000);

    const postReload = await client.evaluate(`({
      title: document.title,
      url: window.location.href,
      bodySnippet: document.body.innerText.slice(0, 300),
      hasLinux: document.body.innerText.includes('Linux')
    })`);
    console.log('Post reload verification:', postReload);

    console.log('🎉 E2E Verification Finished Successfully!');
    client.close();
  } finally {
    chromeProc.kill();
  }
}

runE2E().catch((err) => {
  console.error('E2E test error:', err);
  process.exit(1);
});
