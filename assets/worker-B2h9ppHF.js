var b=Object.defineProperty;var v=(i,o,c)=>o in i?b(i,o,{enumerable:!0,configurable:!0,writable:!0,value:c}):i[o]=c;var m=(i,o,c)=>v(i,typeof o!="symbol"?o+"":o,c);(function(){"use strict";function i(a,r){class n extends AudioWorkletProcessor{constructor({processorOptions:s}){super();m(this,"toneOscilator");m(this,"midiMessages",[]);this.toneOscilator=r(s.sampleRate),this.toneOscilator.next(),this.port.onmessage=u=>{this.midiMessages.push(u.data)}}process(s,u,y){var h;const l=(h=u[0])==null?void 0:h[0];if(!l)throw new Error("Missing channel.");for(let f=0;f<l.length;f++)l[f]=this.toneOscilator.next(this.midiMessages.shift()).value;return!0}}registerProcessor(a,n)}function o(a){return function*(){const r=new Map;let n=0;for(;;){const t=yield n;if(t){let e=r.get(t.number);e||(e=a(sampleRate),r.set(t.number,e),e.next())}n=[...r.entries()].map(([e,s])=>s.next(e===(t==null?void 0:t.number)?t:void 0).value).reduce((e,s)=>e+s,0)}}}function c(a){return 440*Math.pow(2,(a-69)/12)}const p="square-wave";function*d(a){let r=1,n=0,t=1;for(;;){for(let e=0;e<t;++e){const s=yield r*n*.15;if(s)switch(s.type){case"noteon":{const u=c(s.number);t=a/u*.5,n=1;break}case"noteoff":{n=0;break}}}r*=-1}}function g(){i(p,o(d))}g()})();
