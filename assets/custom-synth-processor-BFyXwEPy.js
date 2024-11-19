var L=Object.defineProperty;var S=(o,t,c)=>t in o?L(o,t,{enumerable:!0,configurable:!0,writable:!0,value:c}):o[t]=c;var i=(o,t,c)=>S(o,typeof t!="symbol"?t+"":t,c);(function(){"use strict";function o(s,e){class r extends AudioWorkletProcessor{constructor({processorOptions:l}){super();i(this,"toneOscilator");i(this,"midiMessages",[]);this.toneOscilator=e(l.sampleRate),this.toneOscilator.next(),this.port.onmessage=n=>{this.midiMessages.push(n.data)}}process(l,n,h){var m;const p=(m=n[0])==null?void 0:m[0];if(!p)throw new Error("Missing channel.");for(let a=0;a<p.length;a++)p[a]=this.toneOscilator.next(this.midiMessages.shift()).value;return!0}}registerProcessor(s,r)}const t="custom-synth-processor";function c(s){return 440*Math.pow(2,(s-69)/12)}class f{constructor(e){i(this,"cursor");i(this,"samples");if(!e)throw new Error("A delay line must have a size.");this.cursor=0,this.samples=[];for(let r=0;r<e;++r)this.samples[r]=0}read(){return this.samples[this.cursor]}write(e){this.samples[this.cursor]=e}step(){this.cursor=(this.cursor+1)%this.samples.length}}class y{constructor(e){i(this,"delayLines");this.delayLines=[new f(e),new f(e)]}read(){return[this.delayLines[0].read(),this.delayLines[1].read()]}write(e){this.delayLines[0].write(e[0]),this.delayLines[1].write(e[1])}step(){this.delayLines[0].step(),this.delayLines[1].step()}}function w(s,e){return Math.max(-e,Math.min(e,s))}class g{constructor(){i(this,"pressure",0);i(this,"pressureDelta",0)}step(e,r){const l=.01*(-1+2*Math.random()),n=this.pressure+this.pressureDelta*.03,h=this.pressureDelta-(this.pressure+r)*.03;return this.pressure=w(n+l,e),this.pressureDelta=h*.99,this.pressure}}function*M(s){const r=s/343,d=.75;let u=new y(1);const l=new g;let n=0;for(;;){const[h,p]=u.read(),m=l.step(n,p);u.write([m+p*d,h*-d]),u.step();const a=yield h;if(a)switch(a.type){case"noteon":{const O=343/c(a.number);u=new y(O*r),n=1;break}case"noteoff":{n=0;break}}}}o(t,M)})();
