import{a as e}from"./rolldown-runtime-B0Z9INg1.js";import{g as t,r as n}from"./vendor-core-C8AASnmT.js";import{On as r,Z as i}from"./vendor-icons-DOzPDtsX.js";import{t as a}from"./PracticeChrome-BjgXGsVh.js";var o=e(t(),1),s=n(),c=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      padding: 24px;
      border-radius: 16px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 8px;
    }
    .badge {
      display: inline-block;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 16px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    button {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover {
      background: #0369a1;
      transform: scale(1.03);
    }
    #counter-display {
      font-size: 32px;
      font-weight: 900;
      color: #10b981;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="title">React & Web Studio</div>
    <div class="badge">Interactive Live Component</div>
    <div id="counter-display">0</div>
    <button id="btn-count">Increment Counter</button>
  </div>

  <script>
    let count = 0;
    const display = document.getElementById('counter-display');
    const btn = document.getElementById('btn-count');
    
    btn.addEventListener('click', () => {
      count++;
      display.textContent = count;
      display.style.transform = 'scale(1.2)';
      setTimeout(() => display.style.transform = 'scale(1)', 150);
    });
  <\/script>
</body>
</html>`,l=({title:e=`Web & React Live Playground`,description:t=`Live-reloading web environment with rendered HTML/CSS/JS and instant preview.`,initialHtml:n=c})=>{let[l,u]=(0,o.useState)(n.trim()),[d,f]=(0,o.useState)(!1),[p,m]=(0,o.useState)(`split`),h=(0,o.useRef)(null),g=()=>{if(!h.current)return;let e=h.current.contentDocument;e&&(e.open(),e.write(l),e.close())};return(0,o.useEffect)(()=>{let e=setTimeout(g,300);return()=>clearTimeout(e)},[l]),(0,s.jsx)(a,{title:e,tabLabel:`index.html`,badgeText:`Live Preview`,badgeColor:`emerald`,description:t,onReset:()=>{u(n.trim())},isMaximized:d,onToggleMaximize:()=>f(!d),rightActions:(0,s.jsxs)(`div`,{className:`flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px] font-bold`,children:[(0,s.jsx)(`button`,{onClick:()=>m(`split`),className:`px-2 py-0.5 rounded cursor-pointer ${p===`split`?`bg-sky-600 text-white`:`text-slate-400 hover:text-white`}`,children:`Split`}),(0,s.jsx)(`button`,{onClick:()=>m(`code`),className:`px-2 py-0.5 rounded cursor-pointer ${p===`code`?`bg-sky-600 text-white`:`text-slate-400 hover:text-white`}`,children:`Code`}),(0,s.jsx)(`button`,{onClick:()=>m(`preview`),className:`px-2 py-0.5 rounded cursor-pointer ${p===`preview`?`bg-sky-600 text-white`:`text-slate-400 hover:text-white`}`,children:`Preview`})]}),children:(0,s.jsxs)(`div`,{className:`flex flex-col md:flex-row min-h-[360px] bg-slate-950`,children:[(p===`split`||p===`code`)&&(0,s.jsxs)(`div`,{className:`${p===`split`?`w-full md:w-1/2 border-r border-slate-800`:`w-full`} flex flex-col`,children:[(0,s.jsxs)(`div`,{className:`px-4 py-1.5 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between`,children:[(0,s.jsx)(`span`,{children:`HTML / CSS / JS Source`}),(0,s.jsx)(`span`,{className:`text-[10px] text-slate-500`,children:`Live Reload Enabled`})]}),(0,s.jsx)(`textarea`,{value:l,onChange:e=>u(e.target.value),spellCheck:!1,className:`flex-1 p-4 font-mono text-xs sm:text-sm leading-relaxed bg-slate-950 text-sky-200 focus:outline-none resize-none min-h-[300px]`})]}),(p===`split`||p===`preview`)&&(0,s.jsxs)(`div`,{className:`${p===`split`?`w-full md:w-1/2`:`w-full`} flex flex-col bg-slate-900`,children:[(0,s.jsxs)(`div`,{className:`px-4 py-1.5 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between`,children:[(0,s.jsxs)(`span`,{className:`flex items-center gap-1`,children:[(0,s.jsx)(r,{className:`w-3.5 h-3.5 text-emerald-400`}),` Rendered Output`]}),(0,s.jsx)(`button`,{onClick:g,className:`p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white`,title:`Refresh Preview`,children:(0,s.jsx)(i,{className:`w-3 h-3`})})]}),(0,s.jsx)(`iframe`,{ref:h,title:`Live Component Preview`,sandbox:`allow-scripts allow-modals`,className:`w-full flex-1 min-h-[300px] bg-slate-950 border-0`})]})]})})};export{l as WebReactPlayground,l as default};