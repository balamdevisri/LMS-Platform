import{a as e}from"./rolldown-runtime-B0Z9INg1.js";import{g as t,r as n}from"./vendor-core-C8AASnmT.js";import{$n as r,Gn as i,at as a}from"./vendor-icons-DOzPDtsX.js";import{t as o}from"./PracticeChrome-BjgXGsVh.js";var s=e(t(),1),c=n(),l={c:`#include <stdio.h>

int main() {
    printf("Hello from C on KaizenQ!\\n");
    for (int i = 1; i <= 5; i++) {
        printf("Step %d: Processing element %d\\n", i, i * 10);
    }
    return 0;
}`,python:`# Python Object-Oriented Algorithm Example
class AlgorithmTester:
    def __init__(self, name):
        self.name = name
    
    def binary_search(self, arr, target):
        left, right = 0, len(arr) - 1
        while left <= right:
            mid = (left + right) // 2
            if arr[mid] == target:
                return mid
            elif arr[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1

tester = AlgorithmTester("BinarySearch")
data = [10, 20, 30, 40, 50, 60, 70, 80, 90]
target = 60
result = tester.binary_search(data, target)
print(f"Algorithm: {tester.name}")
print(f"Array: {data}")
print(f"Target {target} found at index: {result}")`,java:`public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 KaizenQ Java OOPs Execution Engine");
        
        String[] tracks = {"React Full-Stack", "Python AI", "DevOps & Cloud"};
        for (int i = 0; i < tracks.length; i++) {
            System.out.println("Track " + (i + 1) + ": " + tracks[i]);
        }
    }
}`,cpp:`#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 6, 8};
    std::sort(nums.begin(), nums.end());
    
    std::cout << "Sorted Array: ";
    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << "\\n";
    return 0;
}`,javascript:`// JavaScript In-Browser Runner
function calculateFibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

console.log("Fibonacci Sequence (10 terms):", calculateFibonacci(10));`},u={c:{language:`c`,version:`10.2.0`,file:`main.c`},python:{language:`python`,version:`3.10.0`,file:`main.py`},java:{language:`java`,version:`15.0.2`,file:`Main.java`},cpp:{language:`c++`,version:`10.2.0`,file:`main.cpp`},javascript:{language:`javascript`,version:`18.15.0`,file:`index.js`}},d=({title:e,description:t,language:n=`python`,initialCode:d})=>{let f=d||l[n]||l.python,[p,m]=(0,s.useState)(f.trim()),[h,g]=(0,s.useState)(!1),[_,v]=(0,s.useState)(null),[y,b]=(0,s.useState)(null),[x,S]=(0,s.useState)(null),[C,w]=(0,s.useState)(!1),[T,E]=(0,s.useState)(n),D=(0,s.useRef)(null),O=u[T]||u.python,k=e||`${O.language.toUpperCase()} Code Studio`,A=async()=>{if(!p.trim()||h)return;g(!0),v(null),b(null);let e=performance.now();try{let t=await(await fetch(`https://emkc.org/api/v2/piston/execute`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({language:O.language,version:O.version,files:[{name:O.file,content:p}]})})).json(),n=performance.now();S(Math.round(n-e)),t.run?(t.run.stdout&&v(t.run.stdout),t.run.stderr&&b(t.run.stderr),!t.run.stdout&&!t.run.stderr&&v(`Program executed successfully with no output.`)):t.message&&b(t.message)}catch(e){b(`Execution service error: ${e.message||`Failed to reach code execution server`}`)}finally{g(!1)}},j=e=>{if((e.ctrlKey||e.metaKey)&&e.key===`Enter`)e.preventDefault(),A();else if(e.key===`Tab`){e.preventDefault();let t=e.currentTarget,n=t.selectionStart,r=t.selectionEnd,i=p.substring(0,n)+`    `+p.substring(r);m(i),setTimeout(()=>{t.selectionStart=t.selectionEnd=n+4},0)}},M=()=>{m(f.trim()),v(null),b(null),S(null)},N=p.split(`
`).length,P=Array.from({length:Math.max(N,6)},(e,t)=>t+1);return(0,c.jsxs)(o,{title:k,tabLabel:O.file,badgeText:O.language.toUpperCase(),badgeColor:T===`python`?`sky`:T===`c`?`blue`:T===`java`?`rose`:`emerald`,description:t||`Write, compile, and execute code with real compiler stdout/stderr output.`,onReset:M,isMaximized:C,onToggleMaximize:()=>w(!C),rightActions:(0,c.jsx)(`div`,{className:`flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px] font-bold`,children:[`c`,`python`,`java`,`cpp`,`javascript`].map(e=>(0,c.jsx)(`button`,{onClick:()=>{E(e),m(l[e]||``)},className:`px-2 py-0.5 rounded transition-colors cursor-pointer uppercase ${T===e?`bg-indigo-600 text-white font-black`:`text-slate-400 hover:text-white`}`,children:e},e))}),children:[(0,c.jsxs)(`div`,{className:`relative flex bg-slate-950 min-h-[220px]`,children:[(0,c.jsx)(`div`,{className:`w-10 py-4 select-none font-mono text-xs text-slate-600 text-right pr-3 bg-slate-950/80 border-r border-slate-800/80 shrink-0`,children:P.map(e=>(0,c.jsx)(`div`,{className:`leading-relaxed`,children:e},e))}),(0,c.jsx)(`textarea`,{ref:D,value:p,onChange:e=>m(e.target.value),onKeyDown:j,spellCheck:!1,className:`flex-1 p-4 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-sky-200 focus:outline-none resize-none min-h-[200px]`,placeholder:`Write your code here...`})]}),(0,c.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/90 border-t border-slate-800`,children:[(0,c.jsxs)(`span`,{className:`text-[11px] font-mono text-slate-500 hidden sm:inline`,children:[`Press `,(0,c.jsx)(`strong`,{children:`Ctrl + Enter`}),` to compile & run`]}),(0,c.jsx)(`button`,{onClick:A,disabled:h||!p.trim(),className:`px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`,children:h?(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`span`,{className:`w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin`}),(0,c.jsx)(`span`,{children:`Compiling & Running...`})]}):(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(a,{className:`w-3.5 h-3.5 fill-current`}),(0,c.jsx)(`span`,{children:`Run Code`})]})})]}),(_!==null||y!==null)&&(0,c.jsxs)(`div`,{className:`border-t border-slate-800 bg-slate-950 font-mono text-xs`,children:[(0,c.jsxs)(`div`,{className:`flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400`,children:[(0,c.jsx)(`span`,{className:`font-bold text-slate-300`,children:`Program Output (stdout / stderr)`}),x!==null&&(0,c.jsxs)(`span`,{className:`text-emerald-400 flex items-center gap-1 text-[10px]`,children:[(0,c.jsx)(i,{className:`w-3 h-3`}),` `,x,`ms`]})]}),(0,c.jsxs)(`div`,{className:`p-4 space-y-2 max-h-60 overflow-y-auto`,children:[_&&(0,c.jsx)(`pre`,{className:`text-slate-200 whitespace-pre-wrap`,children:_}),y&&(0,c.jsxs)(`div`,{className:`p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300`,children:[(0,c.jsxs)(`div`,{className:`font-bold flex items-center gap-1.5 mb-1 text-red-400`,children:[(0,c.jsx)(r,{className:`w-3.5 h-3.5`}),` Compiler / Runtime Error:`]}),(0,c.jsx)(`pre`,{className:`whitespace-pre-wrap`,children:y})]})]})]})]})};export{d as CodeEditorRunner,d as default};