"use strict";const $=require("siyuan");let ri={};function ns(n){ri=n&&typeof n=="object"?n:{}}function g(n,t){const e=ri[n],i=typeof e=="string"?e:n;return t?i.replace(/\{(\w+)\}/g,(s,o)=>o in t?String(t[o]):s):i}const Zt="siyuan-excali-studio";function is(){return new URL(`plugins/${Zt}/`,`${location.origin}/`).href}function ss(){const n=is();return window.EXCALIDRAW_ASSET_PATH=n,n}function os(...n){return n.map(e=>String(e??"").trim()).filter(e=>e!=="").join("/").replace(/\/{2,}/g,"/")}function as(){try{const t=window.siyuan?.config?.system?.dataDir;return typeof t=="string"?t.trim():""}catch{return""}}const ct="iconExcaliStudio",rs=`<symbol id="${ct}" viewBox="0 0 1024 1024"><g fill="none" stroke="currentColor" stroke-width="56" stroke-linecap="round" stroke-linejoin="round"><rect x="128" y="168" width="768" height="588" rx="56"/><path d="M272 616c72-152 148 92 224-56 44-88 96-36 152-72"/></g></symbol>`;function Ze(n){return`<div class="b3-list-item__first"><svg class="b3-list-item__graphic"><use xlink:href="#${ct}"></use></svg><span class="b3-list-item__text">${n}</span></div>`}function Et(n){let t=n.length;for(;--t>=0;)n[t]=0}const ls=3,cs=258,li=29,ds=256,fs=ds+1+li,ci=30,hs=512,us=new Array((fs+2)*2);Et(us);const ps=new Array(ci*2);Et(ps);const gs=new Array(hs);Et(gs);const ms=new Array(cs-ls+1);Et(ms);const ys=new Array(li);Et(ys);const bs=new Array(ci);Et(bs);const xs=(n,t,e,i)=>{let s=n&65535|0,o=n>>>16&65535|0,a=0;for(;e!==0;){a=e>2e3?2e3:e,e-=a;do s=s+t[i++]|0,o=o+s|0;while(--a);s%=65521,o%=65521}return s|o<<16|0};var Ie=xs;const ws=()=>{let n,t=[];for(var e=0;e<256;e++){n=e;for(var i=0;i<8;i++)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n}return t},Ss=new Uint32Array(ws()),ks=(n,t,e,i)=>{const s=Ss,o=i+e;n^=-1;for(let a=i;a<o;a++)n=n>>>8^s[(n^t[a])&255];return n^-1};var V=ks,Ce={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},di={Z_NO_FLUSH:0,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_DEFLATED:8};const Es=(n,t)=>Object.prototype.hasOwnProperty.call(n,t);var vs=function(n){const t=Array.prototype.slice.call(arguments,1);for(;t.length;){const e=t.shift();if(e){if(typeof e!="object")throw new TypeError(e+"must be non-object");for(const i in e)Es(e,i)&&(n[i]=e[i])}}return n},_s=n=>{let t=0;for(let i=0,s=n.length;i<s;i++)t+=n[i].length;const e=new Uint8Array(t);for(let i=0,s=0,o=n.length;i<o;i++){let a=n[i];e.set(a,s),s+=a.length}return e},fi={assign:vs,flattenChunks:_s};let hi=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{hi=!1}const Rt=new Uint8Array(256);for(let n=0;n<256;n++)Rt[n]=n>=252?6:n>=248?5:n>=240?4:n>=224?3:n>=192?2:1;Rt[254]=Rt[254]=1;var As=n=>{let t,e,i,s,o,a=n.length,r=0;for(s=0;s<a;s++)e=n.charCodeAt(s),(e&64512)===55296&&s+1<a&&(i=n.charCodeAt(s+1),(i&64512)===56320&&(e=65536+(e-55296<<10)+(i-56320),s++)),r+=e<128?1:e<2048?2:e<65536?3:4;for(t=new Uint8Array(r),o=0,s=0;o<r;s++)e=n.charCodeAt(s),(e&64512)===55296&&s+1<a&&(i=n.charCodeAt(s+1),(i&64512)===56320&&(e=65536+(e-55296<<10)+(i-56320),s++)),e<128?t[o++]=e:e<2048?(t[o++]=192|e>>>6,t[o++]=128|e&63):e<65536?(t[o++]=224|e>>>12,t[o++]=128|e>>>6&63,t[o++]=128|e&63):(t[o++]=240|e>>>18,t[o++]=128|e>>>12&63,t[o++]=128|e>>>6&63,t[o++]=128|e&63);return t};const Ms=(n,t)=>{if(t<65534&&n.subarray&&hi)return String.fromCharCode.apply(null,n.length===t?n:n.subarray(0,t));let e="";for(let i=0;i<t;i++)e+=String.fromCharCode(n[i]);return e};var $s=(n,t)=>{let e,i;const s=t||n.length,o=new Array(s*2);for(i=0,e=0;e<s;){let a=n[e++];if(a<128){o[i++]=a;continue}let r=Rt[a];if(r>4){o[i++]=65533,e+=r-1;continue}for(a&=r===2?31:r===3?15:7;r>1&&e<s;)a=a<<6|n[e++]&63,r--;if(r>1){o[i++]=65533;continue}a<65536?o[i++]=a:(a-=65536,o[i++]=55296|a>>10&1023,o[i++]=56320|a&1023)}return Ms(o,i)},Is=(n,t)=>{t=t||n.length,t>n.length&&(t=n.length);let e=t-1;for(;e>=0&&(n[e]&192)===128;)e--;return e<0||e===0?t:e+Rt[n[e]]>t?e:t},Re={string2buf:As,buf2string:$s,utf8border:Is};function Cs(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}var Rs=Cs;const Ot=30,Ts=12;var Ls=function(t,e){let i,s,o,a,r,d,l,c,p,h,f,u,x,b,m,y,w,k,S,v,E,I,M,_;const A=t.state;i=t.next_in,M=t.input,s=i+(t.avail_in-5),o=t.next_out,_=t.output,a=o-(e-t.avail_out),r=o+(t.avail_out-257),d=A.dmax,l=A.wsize,c=A.whave,p=A.wnext,h=A.window,f=A.hold,u=A.bits,x=A.lencode,b=A.distcode,m=(1<<A.lenbits)-1,y=(1<<A.distbits)-1;t:do{u<15&&(f+=M[i++]<<u,u+=8,f+=M[i++]<<u,u+=8),w=x[f&m];e:for(;;){if(k=w>>>24,f>>>=k,u-=k,k=w>>>16&255,k===0)_[o++]=w&65535;else if(k&16){S=w&65535,k&=15,k&&(u<k&&(f+=M[i++]<<u,u+=8),S+=f&(1<<k)-1,f>>>=k,u-=k),u<15&&(f+=M[i++]<<u,u+=8,f+=M[i++]<<u,u+=8),w=b[f&y];n:for(;;){if(k=w>>>24,f>>>=k,u-=k,k=w>>>16&255,k&16){if(v=w&65535,k&=15,u<k&&(f+=M[i++]<<u,u+=8,u<k&&(f+=M[i++]<<u,u+=8)),v+=f&(1<<k)-1,v>d){t.msg="invalid distance too far back",A.mode=Ot;break t}if(f>>>=k,u-=k,k=o-a,v>k){if(k=v-k,k>c&&A.sane){t.msg="invalid distance too far back",A.mode=Ot;break t}if(E=0,I=h,p===0){if(E+=l-k,k<S){S-=k;do _[o++]=h[E++];while(--k);E=o-v,I=_}}else if(p<k){if(E+=l+p-k,k-=p,k<S){S-=k;do _[o++]=h[E++];while(--k);if(E=0,p<S){k=p,S-=k;do _[o++]=h[E++];while(--k);E=o-v,I=_}}}else if(E+=p-k,k<S){S-=k;do _[o++]=h[E++];while(--k);E=o-v,I=_}for(;S>2;)_[o++]=I[E++],_[o++]=I[E++],_[o++]=I[E++],S-=3;S&&(_[o++]=I[E++],S>1&&(_[o++]=I[E++]))}else{E=o-v;do _[o++]=_[E++],_[o++]=_[E++],_[o++]=_[E++],S-=3;while(S>2);S&&(_[o++]=_[E++],S>1&&(_[o++]=_[E++]))}}else if(k&64){t.msg="invalid distance code",A.mode=Ot;break t}else{w=b[(w&65535)+(f&(1<<k)-1)];continue n}break}}else if(k&64)if(k&32){A.mode=Ts;break t}else{t.msg="invalid literal/length code",A.mode=Ot;break t}else{w=x[(w&65535)+(f&(1<<k)-1)];continue e}break}}while(i<s&&o<r);S=u>>3,i-=S,u-=S<<3,f&=(1<<u)-1,t.next_in=i,t.next_out=o,t.avail_in=i<s?5+(s-i):5-(i-s),t.avail_out=o<r?257+(r-o):257-(o-r),A.hold=f,A.bits=u};const pt=15,qe=852,Ke=592,Je=0,de=1,Ve=2,Ps=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),Os=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),Ds=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),Bs=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]),Ns=(n,t,e,i,s,o,a,r)=>{const d=r.bits;let l=0,c=0,p=0,h=0,f=0,u=0,x=0,b=0,m=0,y=0,w,k,S,v,E,I=null,M=0,_;const A=new Uint16Array(pt+1),R=new Uint16Array(pt+1);let D=null,P=0,T,L,j;for(l=0;l<=pt;l++)A[l]=0;for(c=0;c<i;c++)A[t[e+c]]++;for(f=d,h=pt;h>=1&&A[h]===0;h--);if(f>h&&(f=h),h===0)return s[o++]=1<<24|64<<16|0,s[o++]=1<<24|64<<16|0,r.bits=1,0;for(p=1;p<h&&A[p]===0;p++);for(f<p&&(f=p),b=1,l=1;l<=pt;l++)if(b<<=1,b-=A[l],b<0)return-1;if(b>0&&(n===Je||h!==1))return-1;for(R[1]=0,l=1;l<pt;l++)R[l+1]=R[l]+A[l];for(c=0;c<i;c++)t[e+c]!==0&&(a[R[t[e+c]]++]=c);if(n===Je?(I=D=a,_=19):n===de?(I=Ps,M-=257,D=Os,P-=257,_=256):(I=Ds,D=Bs,_=-1),y=0,c=0,l=p,E=o,u=f,x=0,S=-1,m=1<<f,v=m-1,n===de&&m>qe||n===Ve&&m>Ke)return 1;for(;;){T=l-x,a[c]<_?(L=0,j=a[c]):a[c]>_?(L=D[P+a[c]],j=I[M+a[c]]):(L=96,j=0),w=1<<l-x,k=1<<u,p=k;do k-=w,s[E+(y>>x)+k]=T<<24|L<<16|j|0;while(k!==0);for(w=1<<l-1;y&w;)w>>=1;if(w!==0?(y&=w-1,y+=w):y=0,c++,--A[l]===0){if(l===h)break;l=t[e+a[c]]}if(l>f&&(y&v)!==S){for(x===0&&(x=f),E+=p,u=l-x,b=1<<u;u+x<h&&(b-=A[u+x],!(b<=0));)u++,b<<=1;if(m+=1<<u,n===de&&m>qe||n===Ve&&m>Ke)return 1;S=y&v,s[S]=f<<24|u<<16|E-o|0}}return y!==0&&(s[E+y]=l-x<<24|64<<16|0),r.bits=f,0};var $t=Ns;const Fs=0,ui=1,pi=2,{Z_FINISH:Qe,Z_BLOCK:js,Z_TREES:Dt,Z_OK:dt,Z_STREAM_END:Hs,Z_NEED_DICT:zs,Z_STREAM_ERROR:K,Z_DATA_ERROR:gi,Z_MEM_ERROR:mi,Z_BUF_ERROR:Xs,Z_DEFLATED:tn}=di,yi=1,en=2,nn=3,sn=4,on=5,an=6,rn=7,ln=8,cn=9,dn=10,Vt=11,tt=12,fe=13,fn=14,he=15,hn=16,un=17,pn=18,gn=19,Bt=20,Nt=21,mn=22,yn=23,bn=24,xn=25,wn=26,ue=27,Sn=28,kn=29,N=30,bi=31,Us=32,Ys=852,Gs=592,Ws=15,Zs=Ws,En=n=>(n>>>24&255)+(n>>>8&65280)+((n&65280)<<8)+((n&255)<<24);function qs(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const xi=n=>{if(!n||!n.state)return K;const t=n.state;return n.total_in=n.total_out=t.total=0,n.msg="",t.wrap&&(n.adler=t.wrap&1),t.mode=yi,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new Int32Array(Ys),t.distcode=t.distdyn=new Int32Array(Gs),t.sane=1,t.back=-1,dt},wi=n=>{if(!n||!n.state)return K;const t=n.state;return t.wsize=0,t.whave=0,t.wnext=0,xi(n)},Si=(n,t)=>{let e;if(!n||!n.state)return K;const i=n.state;return t<0?(e=0,t=-t):(e=(t>>4)+1,t<48&&(t&=15)),t&&(t<8||t>15)?K:(i.window!==null&&i.wbits!==t&&(i.window=null),i.wrap=e,i.wbits=t,wi(n))},ki=(n,t)=>{if(!n)return K;const e=new qs;n.state=e,e.window=null;const i=Si(n,t);return i!==dt&&(n.state=null),i},Ks=n=>ki(n,Zs);let vn=!0,pe,ge;const Js=n=>{if(vn){pe=new Int32Array(512),ge=new Int32Array(32);let t=0;for(;t<144;)n.lens[t++]=8;for(;t<256;)n.lens[t++]=9;for(;t<280;)n.lens[t++]=7;for(;t<288;)n.lens[t++]=8;for($t(ui,n.lens,0,288,pe,0,n.work,{bits:9}),t=0;t<32;)n.lens[t++]=5;$t(pi,n.lens,0,32,ge,0,n.work,{bits:5}),vn=!1}n.lencode=pe,n.lenbits=9,n.distcode=ge,n.distbits=5},Ei=(n,t,e,i)=>{let s;const o=n.state;return o.window===null&&(o.wsize=1<<o.wbits,o.wnext=0,o.whave=0,o.window=new Uint8Array(o.wsize)),i>=o.wsize?(o.window.set(t.subarray(e-o.wsize,e),0),o.wnext=0,o.whave=o.wsize):(s=o.wsize-o.wnext,s>i&&(s=i),o.window.set(t.subarray(e-i,e-i+s),o.wnext),i-=s,i?(o.window.set(t.subarray(e-i,e),0),o.wnext=i,o.whave=o.wsize):(o.wnext+=s,o.wnext===o.wsize&&(o.wnext=0),o.whave<o.wsize&&(o.whave+=s))),0},Vs=(n,t)=>{let e,i,s,o,a,r,d,l,c,p,h,f,u,x,b=0,m,y,w,k,S,v,E,I;const M=new Uint8Array(4);let _,A;const R=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(!n||!n.state||!n.output||!n.input&&n.avail_in!==0)return K;e=n.state,e.mode===tt&&(e.mode=fe),a=n.next_out,s=n.output,d=n.avail_out,o=n.next_in,i=n.input,r=n.avail_in,l=e.hold,c=e.bits,p=r,h=d,I=dt;t:for(;;)switch(e.mode){case yi:if(e.wrap===0){e.mode=fe;break}for(;c<16;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if(e.wrap&2&&l===35615){e.check=0,M[0]=l&255,M[1]=l>>>8&255,e.check=V(e.check,M,2,0),l=0,c=0,e.mode=en;break}if(e.flags=0,e.head&&(e.head.done=!1),!(e.wrap&1)||(((l&255)<<8)+(l>>8))%31){n.msg="incorrect header check",e.mode=N;break}if((l&15)!==tn){n.msg="unknown compression method",e.mode=N;break}if(l>>>=4,c-=4,E=(l&15)+8,e.wbits===0)e.wbits=E;else if(E>e.wbits){n.msg="invalid window size",e.mode=N;break}e.dmax=1<<e.wbits,n.adler=e.check=1,e.mode=l&512?dn:tt,l=0,c=0;break;case en:for(;c<16;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if(e.flags=l,(e.flags&255)!==tn){n.msg="unknown compression method",e.mode=N;break}if(e.flags&57344){n.msg="unknown header flags set",e.mode=N;break}e.head&&(e.head.text=l>>8&1),e.flags&512&&(M[0]=l&255,M[1]=l>>>8&255,e.check=V(e.check,M,2,0)),l=0,c=0,e.mode=nn;case nn:for(;c<32;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}e.head&&(e.head.time=l),e.flags&512&&(M[0]=l&255,M[1]=l>>>8&255,M[2]=l>>>16&255,M[3]=l>>>24&255,e.check=V(e.check,M,4,0)),l=0,c=0,e.mode=sn;case sn:for(;c<16;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}e.head&&(e.head.xflags=l&255,e.head.os=l>>8),e.flags&512&&(M[0]=l&255,M[1]=l>>>8&255,e.check=V(e.check,M,2,0)),l=0,c=0,e.mode=on;case on:if(e.flags&1024){for(;c<16;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}e.length=l,e.head&&(e.head.extra_len=l),e.flags&512&&(M[0]=l&255,M[1]=l>>>8&255,e.check=V(e.check,M,2,0)),l=0,c=0}else e.head&&(e.head.extra=null);e.mode=an;case an:if(e.flags&1024&&(f=e.length,f>r&&(f=r),f&&(e.head&&(E=e.head.extra_len-e.length,e.head.extra||(e.head.extra=new Uint8Array(e.head.extra_len)),e.head.extra.set(i.subarray(o,o+f),E)),e.flags&512&&(e.check=V(e.check,i,f,o)),r-=f,o+=f,e.length-=f),e.length))break t;e.length=0,e.mode=rn;case rn:if(e.flags&2048){if(r===0)break t;f=0;do E=i[o+f++],e.head&&E&&e.length<65536&&(e.head.name+=String.fromCharCode(E));while(E&&f<r);if(e.flags&512&&(e.check=V(e.check,i,f,o)),r-=f,o+=f,E)break t}else e.head&&(e.head.name=null);e.length=0,e.mode=ln;case ln:if(e.flags&4096){if(r===0)break t;f=0;do E=i[o+f++],e.head&&E&&e.length<65536&&(e.head.comment+=String.fromCharCode(E));while(E&&f<r);if(e.flags&512&&(e.check=V(e.check,i,f,o)),r-=f,o+=f,E)break t}else e.head&&(e.head.comment=null);e.mode=cn;case cn:if(e.flags&512){for(;c<16;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if(l!==(e.check&65535)){n.msg="header crc mismatch",e.mode=N;break}l=0,c=0}e.head&&(e.head.hcrc=e.flags>>9&1,e.head.done=!0),n.adler=e.check=0,e.mode=tt;break;case dn:for(;c<32;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}n.adler=e.check=En(l),l=0,c=0,e.mode=Vt;case Vt:if(e.havedict===0)return n.next_out=a,n.avail_out=d,n.next_in=o,n.avail_in=r,e.hold=l,e.bits=c,zs;n.adler=e.check=1,e.mode=tt;case tt:if(t===js||t===Dt)break t;case fe:if(e.last){l>>>=c&7,c-=c&7,e.mode=ue;break}for(;c<3;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}switch(e.last=l&1,l>>>=1,c-=1,l&3){case 0:e.mode=fn;break;case 1:if(Js(e),e.mode=Bt,t===Dt){l>>>=2,c-=2;break t}break;case 2:e.mode=un;break;case 3:n.msg="invalid block type",e.mode=N}l>>>=2,c-=2;break;case fn:for(l>>>=c&7,c-=c&7;c<32;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if((l&65535)!==(l>>>16^65535)){n.msg="invalid stored block lengths",e.mode=N;break}if(e.length=l&65535,l=0,c=0,e.mode=he,t===Dt)break t;case he:e.mode=hn;case hn:if(f=e.length,f){if(f>r&&(f=r),f>d&&(f=d),f===0)break t;s.set(i.subarray(o,o+f),a),r-=f,o+=f,d-=f,a+=f,e.length-=f;break}e.mode=tt;break;case un:for(;c<14;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if(e.nlen=(l&31)+257,l>>>=5,c-=5,e.ndist=(l&31)+1,l>>>=5,c-=5,e.ncode=(l&15)+4,l>>>=4,c-=4,e.nlen>286||e.ndist>30){n.msg="too many length or distance symbols",e.mode=N;break}e.have=0,e.mode=pn;case pn:for(;e.have<e.ncode;){for(;c<3;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}e.lens[R[e.have++]]=l&7,l>>>=3,c-=3}for(;e.have<19;)e.lens[R[e.have++]]=0;if(e.lencode=e.lendyn,e.lenbits=7,_={bits:e.lenbits},I=$t(Fs,e.lens,0,19,e.lencode,0,e.work,_),e.lenbits=_.bits,I){n.msg="invalid code lengths set",e.mode=N;break}e.have=0,e.mode=gn;case gn:for(;e.have<e.nlen+e.ndist;){for(;b=e.lencode[l&(1<<e.lenbits)-1],m=b>>>24,y=b>>>16&255,w=b&65535,!(m<=c);){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if(w<16)l>>>=m,c-=m,e.lens[e.have++]=w;else{if(w===16){for(A=m+2;c<A;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if(l>>>=m,c-=m,e.have===0){n.msg="invalid bit length repeat",e.mode=N;break}E=e.lens[e.have-1],f=3+(l&3),l>>>=2,c-=2}else if(w===17){for(A=m+3;c<A;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}l>>>=m,c-=m,E=0,f=3+(l&7),l>>>=3,c-=3}else{for(A=m+7;c<A;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}l>>>=m,c-=m,E=0,f=11+(l&127),l>>>=7,c-=7}if(e.have+f>e.nlen+e.ndist){n.msg="invalid bit length repeat",e.mode=N;break}for(;f--;)e.lens[e.have++]=E}}if(e.mode===N)break;if(e.lens[256]===0){n.msg="invalid code -- missing end-of-block",e.mode=N;break}if(e.lenbits=9,_={bits:e.lenbits},I=$t(ui,e.lens,0,e.nlen,e.lencode,0,e.work,_),e.lenbits=_.bits,I){n.msg="invalid literal/lengths set",e.mode=N;break}if(e.distbits=6,e.distcode=e.distdyn,_={bits:e.distbits},I=$t(pi,e.lens,e.nlen,e.ndist,e.distcode,0,e.work,_),e.distbits=_.bits,I){n.msg="invalid distances set",e.mode=N;break}if(e.mode=Bt,t===Dt)break t;case Bt:e.mode=Nt;case Nt:if(r>=6&&d>=258){n.next_out=a,n.avail_out=d,n.next_in=o,n.avail_in=r,e.hold=l,e.bits=c,Ls(n,h),a=n.next_out,s=n.output,d=n.avail_out,o=n.next_in,i=n.input,r=n.avail_in,l=e.hold,c=e.bits,e.mode===tt&&(e.back=-1);break}for(e.back=0;b=e.lencode[l&(1<<e.lenbits)-1],m=b>>>24,y=b>>>16&255,w=b&65535,!(m<=c);){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if(y&&!(y&240)){for(k=m,S=y,v=w;b=e.lencode[v+((l&(1<<k+S)-1)>>k)],m=b>>>24,y=b>>>16&255,w=b&65535,!(k+m<=c);){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}l>>>=k,c-=k,e.back+=k}if(l>>>=m,c-=m,e.back+=m,e.length=w,y===0){e.mode=wn;break}if(y&32){e.back=-1,e.mode=tt;break}if(y&64){n.msg="invalid literal/length code",e.mode=N;break}e.extra=y&15,e.mode=mn;case mn:if(e.extra){for(A=e.extra;c<A;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}e.length+=l&(1<<e.extra)-1,l>>>=e.extra,c-=e.extra,e.back+=e.extra}e.was=e.length,e.mode=yn;case yn:for(;b=e.distcode[l&(1<<e.distbits)-1],m=b>>>24,y=b>>>16&255,w=b&65535,!(m<=c);){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if(!(y&240)){for(k=m,S=y,v=w;b=e.distcode[v+((l&(1<<k+S)-1)>>k)],m=b>>>24,y=b>>>16&255,w=b&65535,!(k+m<=c);){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}l>>>=k,c-=k,e.back+=k}if(l>>>=m,c-=m,e.back+=m,y&64){n.msg="invalid distance code",e.mode=N;break}e.offset=w,e.extra=y&15,e.mode=bn;case bn:if(e.extra){for(A=e.extra;c<A;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}e.offset+=l&(1<<e.extra)-1,l>>>=e.extra,c-=e.extra,e.back+=e.extra}if(e.offset>e.dmax){n.msg="invalid distance too far back",e.mode=N;break}e.mode=xn;case xn:if(d===0)break t;if(f=h-d,e.offset>f){if(f=e.offset-f,f>e.whave&&e.sane){n.msg="invalid distance too far back",e.mode=N;break}f>e.wnext?(f-=e.wnext,u=e.wsize-f):u=e.wnext-f,f>e.length&&(f=e.length),x=e.window}else x=s,u=a-e.offset,f=e.length;f>d&&(f=d),d-=f,e.length-=f;do s[a++]=x[u++];while(--f);e.length===0&&(e.mode=Nt);break;case wn:if(d===0)break t;s[a++]=e.length,d--,e.mode=Nt;break;case ue:if(e.wrap){for(;c<32;){if(r===0)break t;r--,l|=i[o++]<<c,c+=8}if(h-=d,n.total_out+=h,e.total+=h,h&&(n.adler=e.check=e.flags?V(e.check,s,h,a-h):Ie(e.check,s,h,a-h)),h=d,(e.flags?l:En(l))!==e.check){n.msg="incorrect data check",e.mode=N;break}l=0,c=0}e.mode=Sn;case Sn:if(e.wrap&&e.flags){for(;c<32;){if(r===0)break t;r--,l+=i[o++]<<c,c+=8}if(l!==(e.total&4294967295)){n.msg="incorrect length check",e.mode=N;break}l=0,c=0}e.mode=kn;case kn:I=Hs;break t;case N:I=gi;break t;case bi:return mi;case Us:default:return K}return n.next_out=a,n.avail_out=d,n.next_in=o,n.avail_in=r,e.hold=l,e.bits=c,(e.wsize||h!==n.avail_out&&e.mode<N&&(e.mode<ue||t!==Qe))&&Ei(n,n.output,n.next_out,h-n.avail_out),p-=n.avail_in,h-=n.avail_out,n.total_in+=p,n.total_out+=h,e.total+=h,e.wrap&&h&&(n.adler=e.check=e.flags?V(e.check,s,h,n.next_out-h):Ie(e.check,s,h,n.next_out-h)),n.data_type=e.bits+(e.last?64:0)+(e.mode===tt?128:0)+(e.mode===Bt||e.mode===he?256:0),(p===0&&h===0||t===Qe)&&I===dt&&(I=Xs),I},Qs=n=>{if(!n||!n.state)return K;let t=n.state;return t.window&&(t.window=null),n.state=null,dt},to=(n,t)=>{if(!n||!n.state)return K;const e=n.state;return e.wrap&2?(e.head=t,t.done=!1,dt):K},eo=(n,t)=>{const e=t.length;let i,s,o;return!n||!n.state||(i=n.state,i.wrap!==0&&i.mode!==Vt)?K:i.mode===Vt&&(s=1,s=Ie(s,t,e,0),s!==i.check)?gi:(o=Ei(n,t,e,e),o?(i.mode=bi,mi):(i.havedict=1,dt))};var no=wi,io=Si,so=xi,oo=Ks,ao=ki,ro=Vs,lo=Qs,co=to,fo=eo,ho="pako inflate (from Nodeca project)",et={inflateReset:no,inflateReset2:io,inflateResetKeep:so,inflateInit:oo,inflateInit2:ao,inflate:ro,inflateEnd:lo,inflateGetHeader:co,inflateSetDictionary:fo,inflateInfo:ho};function uo(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}var po=uo;const vi=Object.prototype.toString,{Z_NO_FLUSH:go,Z_FINISH:mo,Z_OK:Tt,Z_STREAM_END:me,Z_NEED_DICT:ye,Z_STREAM_ERROR:yo,Z_DATA_ERROR:_n,Z_MEM_ERROR:bo}=di;function se(n){this.options=fi.assign({chunkSize:1024*64,windowBits:15,to:""},n||{});const t=this.options;t.raw&&t.windowBits>=0&&t.windowBits<16&&(t.windowBits=-t.windowBits,t.windowBits===0&&(t.windowBits=-15)),t.windowBits>=0&&t.windowBits<16&&!(n&&n.windowBits)&&(t.windowBits+=32),t.windowBits>15&&t.windowBits<48&&(t.windowBits&15||(t.windowBits|=15)),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Rs,this.strm.avail_out=0;let e=et.inflateInit2(this.strm,t.windowBits);if(e!==Tt)throw new Error(Ce[e]);if(this.header=new po,et.inflateGetHeader(this.strm,this.header),t.dictionary&&(typeof t.dictionary=="string"?t.dictionary=Re.string2buf(t.dictionary):vi.call(t.dictionary)==="[object ArrayBuffer]"&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(e=et.inflateSetDictionary(this.strm,t.dictionary),e!==Tt)))throw new Error(Ce[e])}se.prototype.push=function(n,t){const e=this.strm,i=this.options.chunkSize,s=this.options.dictionary;let o,a,r;if(this.ended)return!1;for(t===~~t?a=t:a=t===!0?mo:go,vi.call(n)==="[object ArrayBuffer]"?e.input=new Uint8Array(n):e.input=n,e.next_in=0,e.avail_in=e.input.length;;){for(e.avail_out===0&&(e.output=new Uint8Array(i),e.next_out=0,e.avail_out=i),o=et.inflate(e,a),o===ye&&s&&(o=et.inflateSetDictionary(e,s),o===Tt?o=et.inflate(e,a):o===_n&&(o=ye));e.avail_in>0&&o===me&&e.state.wrap>0&&n[e.next_in]!==0;)et.inflateReset(e),o=et.inflate(e,a);switch(o){case yo:case _n:case ye:case bo:return this.onEnd(o),this.ended=!0,!1}if(r=e.avail_out,e.next_out&&(e.avail_out===0||o===me))if(this.options.to==="string"){let d=Re.utf8border(e.output,e.next_out),l=e.next_out-d,c=Re.buf2string(e.output,d);e.next_out=l,e.avail_out=i-l,l&&e.output.set(e.output.subarray(d,d+l),0),this.onData(c)}else this.onData(e.output.length===e.next_out?e.output:e.output.subarray(0,e.next_out));if(!(o===Tt&&r===0)){if(o===me)return o=et.inflateEnd(this.strm),this.onEnd(o),this.ended=!0,!0;if(e.avail_in===0)break}}return!0};se.prototype.onData=function(n){this.chunks.push(n)};se.prototype.onEnd=function(n){n===Tt&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=fi.flattenChunks(this.chunks)),this.chunks=[],this.err=n,this.msg=this.strm.msg};function xo(n,t){const e=new se(t);if(e.push(n),e.err)throw e.msg||Ce[e.err];return e.result}var wo=xo,So={inflate:wo};const{inflate:ko}=So;var _i=ko;const Eo="svg-source:excalidraw",vo="application/vnd.excalidraw+json",Ai=/<!-- payload-start -->\s*([\s\S]+?)\s*<!-- payload-end -->/,_o=/<!-- payload-version:(\d+) -->/;class Y extends Error{constructor(t,e){super(`scene:${t}${e?` (${e})`:""}`),this.reason=t,this.detail=e,this.name="SceneError"}}function He(n){const t=new Uint8Array(n.length);for(let e=0;e<n.length;e++)t[e]=n.charCodeAt(e)&255;return t}function Mi(n){return new TextDecoder("utf-8").decode(He(n))}function Ao(n,t){const e=atob(n);return t?_i(He(e),{to:"string"}):Mi(e)}function $i(n){return n.includes(Eo)&&Ai.test(n)}function Mo(n){if(!$i(n))return!1;try{return Ii(n).elements.length>0}catch{return!1}}function Ii(n){if(!n.includes(vo))throw new Y("no-payload");const t=_o.exec(n),e=t?Number(t[1]):1,i=Ai.exec(n);if(!i)throw new Y("no-payload","缺 payload-start/end 标记");let s;try{s=e===1?Ao(i[1],!1):atob(i[1])}catch(d){throw new Y("bad-payload",d instanceof Error?d.message:String(d))}let o;try{o=JSON.parse(s)}catch{throw new Y("bad-payload","载荷不是合法 JSON")}if(!o||typeof o!="object")throw new Y("bad-payload","载荷不是对象");const a=$o(o);if(a.type!=="excalidraw")throw new Y("wrong-type",String(a.type));if(!Array.isArray(a.elements))throw new Y("bad-payload","scene 缺 elements 数组");return{elements:a.elements,appState:a.appState&&typeof a.appState=="object"?a.appState:{},files:a.files&&typeof a.files=="object"?a.files:{}}}function $o(n){if(!("encoded"in n)){if(n.type==="excalidraw")return n;throw new Y("wrong-type",typeof n.type=="string"?n.type:"unknown")}const t=n.encoding;if(t!=="bstring")throw new Y("unsupported-encoding",String(t));const e=n.encoded;if(typeof e!="string")throw new Y("bad-payload","encoded 字段不是字符串");const i=n.compressed===!0;let s;try{s=i?_i(He(e),{to:"string"}):Mi(e)}catch(a){throw new Y("bad-payload",a instanceof Error?a.message:String(a))}let o;try{o=JSON.parse(s)}catch{throw new Y("bad-payload","scene JSON 解析失败")}if(!o||typeof o!="object")throw new Y("bad-payload","scene 不是对象");return o}function Te(n){if(Array.isArray(n))return n.map(Te);if(n&&typeof n=="object"){const t={},e=n;for(const i of Object.keys(e).sort()){const s=e[i];s!=null&&(i==="boundElements"&&Array.isArray(s)&&s.length===0||(t[i]=Te(s)))}return t}return n}function An(n){if(!$i(n))return null;try{const t=Ii(n);return JSON.stringify(Te({elements:t.elements,appState:t.appState,files:t.files}))}catch{return null}}function Io(n,t){if(n===t)return!0;const e=An(n),i=An(t);return e!==null&&e===i}const Co=".excalidrawlib",Ro=`local${Co}`;function Mn(n){let t=[];try{const e=JSON.parse(n);if(Array.isArray(e))t=e;else if(e&&typeof e=="object"){const i=e;Array.isArray(i.libraryItems)?t=i.libraryItems:Array.isArray(i.library)&&(t=i.library)}}catch{}return Po(t)}function To(n){if(!n||typeof n!="object")return"";const t=n;return`${typeof t.id=="string"?t.id:""}:${typeof t.versionNonce=="number"?t.versionNonce:""}`}function be(n){const t=n.map(To).sort().join("|");let e=2166136261,i=2166136261;for(let s=0;s<t.length;s++){const o=t.charCodeAt(s);e=Math.imul(e^o,16777619)>>>0,i=Math.imul(i^o,2246822507)>>>0}return`lib-${e.toString(16).padStart(8,"0")}${i.toString(16).padStart(8,"0")}`}function Le(n){return!!n&&typeof n=="object"&&typeof n.type=="string"}function Lo(n){return Object.keys(n).filter(t=>/^\d+$/.test(t)).sort((t,e)=>Number(t)-Number(e)).map(t=>n[t]).filter(Le)}function Po(n,t="published"){const e=[];for(const i of n){if(Array.isArray(i)){const s=i.filter(Le);if(s.length===0)continue;e.push({id:be(s),status:t,elements:s,created:Date.now()});continue}if(i&&typeof i=="object"){const s=i;if(Array.isArray(s.elements)){const a=s.elements.filter(Le);if(a.length===0)continue;e.push({...s,elements:a,id:typeof s.id=="string"&&s.id!==""?s.id:be(a),status:typeof s.status=="string"?s.status:t,created:typeof s.created=="number"?s.created:Date.now()});continue}const o=Lo(s);o.length>0&&e.push({id:be(o),status:t,elements:o,created:Date.now()});continue}}return e}function $n(n,t="siyuan-excali-studio"){return JSON.stringify({type:"excalidrawlib",version:2,source:t,libraryItems:n},null,2)}function qt(n){if(n&&typeof n=="object"){const t=n.id;if(typeof t=="string"&&t!=="")return t}return null}function Oo(n){const t=[],e=new Map,i=new Map,s=n[0]?.path??"";for(const o of n){i.set(o.path,o.items);const a=o.path===s;for(const r of o.items){const d=qt(r);if(d!==null&&e.has(d)){console.warn(`[excali-studio] 模板库条目 id 重复（${d}，来自 ${o.path}），保留先到的一份`);continue}d!==null&&e.set(d,o.path),t.push(a?r:{...r,status:"published"})}}return{items:t,sourceOf:e,byPath:i}}function Do(n,t,e){const i=new Map,s=[];for(const r of t){const d=qt(r);if(d===null){s.push(r);continue}n.sourceOf.has(d)||s.push(r),i.set(d,r)}const o=new Set;for(const r of n.items){const d=qt(r),l=d!==null&&n.sourceOf.get(d)||e,c=d!==null?i.get(d):void 0;(!c||JSON.stringify(c)!==JSON.stringify(r))&&o.add(l)}s.length>0&&o.add(e);const a=[];for(const r of[...o].sort()){const d=n.byPath.get(r)??[],l=[];for(const c of d){const p=qt(c);if(p!==null&&n.sourceOf.get(p)!==r){l.push(c);continue}const h=p!==null?i.get(p):void 0;h&&l.push(r===e?h:{...h,status:"published"})}if(r===e)for(const c of s)l.unshift(c);a.push({path:r,items:l})}return a}const In="exs:script-pin-changed",xe="exs:rail-view-changed",Bo="exs:highlighter-changed",No=0,Kt={color:"#ffd43b",width:4,opacity:45},Fo=/^#[0-9a-fA-F]{6}$/;function Cn(n,t,e,i){return Number.isFinite(n)?Math.min(e,Math.max(t,n)):i}function Qt(n){const t=n&&typeof n=="object"?n:{};return{color:typeof t.color=="string"&&Fo.test(t.color.trim())?t.color.trim().toLowerCase():Kt.color,width:Cn(Number(t.width),1,12,Kt.width),opacity:Cn(Number(t.opacity),10,100,Kt.opacity)}}const jo="M4,7L4,17A2,2 0 0 0 6,19L18,19A2,2 0 0 0 20,17L20,7A2,2 0 0 0 18,5L6,5A2,2 0 0 0 4,7ZM12,9.5L12,14.5M9.5,12L14.5,12",Ho="M3.5,6A2.5,2.5 0 0 1 6,3.5L12,3.5A2.5,2.5 0 0 1 14.5,6L14.5,12A2.5,2.5 0 0 1 12,14.5L6,14.5A2.5,2.5 0 0 1 3.5,12ZM22,18A3.5,3.5 0 1 1 15,18A3.5,3.5 0 1 1 22,18",zo="M4,9L4,6A2,2 0 0 1 6,4L9,4M20,15L20,18A2,2 0 0 1 18,20L15,20M15.6,6.4L19.6,10.4L11,19L6.4,20L7.4,15.4ZM13.6,8.4L17.6,12.4",Rn="M8.4,12A3.6,3.6 0 1 0 15.6,12A3.6,3.6 0 1 0 8.4,12M12,3.5L12,6M12,18L12,20.5M3.5,12L6,12M18,12L20.5,12M5.9,5.9L7.7,7.7M16.3,16.3L18.1,18.1M18.1,5.9L16.3,7.7M7.7,16.3L5.9,18.1",Xo="M4.5,19.5L4.5,16.3L12.8,8.0L16.2,11.4L8.0,19.5ZM10.2,10.6L13.6,14.0",Uo="M5,6L7.5,6M10.5,6L19,6M5,12L7.5,12M10.5,12L19,12M5,18L7.5,18M10.5,18L19,18",Yo="M3.5,5.5L20.5,5.5L20.5,18.5L3.5,18.5ZM7,9.5L11,9.5L11,13.5L7,13.5ZM13.5,11L17,11L17,15L13.5,15Z",Go="M3.5,5L20.5,5L20.5,19L3.5,19ZM9,9.8L12,12.8L15,9.8",Wo="M4.5,5.8L7.6,7L4.5,8.2ZM9.8,7L20,7M9.8,11.5L16.5,11.5M9.8,16L18.5,16",Zo={"text-numbering.md":Uo,"box-selection.md":Yo,"highlighter.md":Xo,"frame-collapse.md":Go,"selection-fold.md":Wo},Tn="M9.5,3.5L14.5,3.5L16,7L8,7ZM10,7L10.8,14L13.2,14L14,7M12,14L12,20.5",qo="M3.5,4L20.5,4L20.5,14.5L3.5,14.5ZM12,14.5L12,19M8.5,20.5L15.5,20.5M10.5,7L15,9.25L10.5,11.5Z",ze="insert-board-card",Ci="outline-color",Ri="image-to-material",Ti="presentation";function we(n){return n.mount??"rail"}const Xe=[{id:ze,title:"插入白板卡片",titleEn:"Insert board card",desc:"从白板库挑一块，在当前画布中心插一张能点开的卡片",icon:jo},{id:Ci,title:"仅外框颜色",titleEn:"Outline color",desc:"只改选中图形的边框色，文字颜色保持不变",icon:Ho},{id:Ri,title:"图片转笔画素材",titleEn:"Image to strokes",desc:"把选中的图片描成可改色的原生笔画，可替换到画布或加入素材库",icon:zo},{id:Ti,title:"演示模式",titleEn:"Presentation mode",desc:"把画布里的画框当幻灯片，逐页放映；点图钉固定到画布右上角",icon:qo,mount:"top-right"}],Li=[ze];function Pe(n){return typeof n=="string"&&Xe.some(t=>t.id===n)}function Ln(n){return Xe.find(t=>t.id===n)??null}function Ko(n){if(!Array.isArray(n))return[...Li];const t=[];for(const e of n)Pe(e)&&!t.includes(e)&&t.push(e);return t}const Jo=["agent","mcp","cli","script"],Pi={agent:!0,mcp:!0,cli:!0,script:!0};function Vo(n){const t=n&&typeof n=="object"?n:{},e={...Pi};for(const i of Jo)t[i]===!1?e[i]=!1:t[i]===!0&&(e[i]=!0);return e}const yt="assets/excali";function Oi(n){return String(n??"").trim().replace(/\\/g,"/").replace(/^\/+/,"").replace(/^data\//i,"").replace(/\/+$/,"")}const Di={scrim:!0,reveal:!0,typewriter:!1,cursor:!1,speed:28,fit:.95,autoAdvance:0,fullscreen:!0,directional:!1};function gt(n,t){return typeof n=="boolean"?n:t}function Se(n,t,e,i){return typeof n!="number"||!Number.isFinite(n)?i:Math.min(e,Math.max(t,n))}function Bi(n){const t=n&&typeof n=="object"?n:{},e=Di;return{scrim:gt(t.scrim,e.scrim),reveal:gt(t.reveal,e.reveal),typewriter:gt(t.typewriter,e.typewriter),cursor:gt(t.cursor,e.cursor),speed:Math.round(Se(t.speed,8,200,e.speed)),fit:Se(t.fit,.5,1,e.fit),autoAdvance:Math.round(Se(t.autoAdvance,0,300,e.autoAdvance)),fullscreen:gt(t.fullscreen,e.fullscreen),directional:gt(t.directional,e.directional)}}const X={saveDir:yt,accentStroke:!0,showWelcome:!0,gridModeEnabled:!1,stencilMigrated:!1,pinnedScripts:[],pinnedActions:[...Li],scriptRailCollapsed:!1,scriptRailTop:.09,scriptSettings:{},builtinSnapshot:{},highlighter:{...Kt},imageBaseUrl:"",imageModel:"gpt-image-1",imageApiKey:"",imageSize:"1024x1024",aiChannels:{...Pi},presentation:{...Di}};function mt(n){const t=n&&typeof n=="object"?n:{},e=typeof t.saveDir=="string"?Oi(t.saveDir):"",i=e!==""?e:X.saveDir,s={};if(t.scriptSettings&&typeof t.scriptSettings=="object")for(const[a,r]of Object.entries(t.scriptSettings).slice(0,50)){if(!r||typeof r!="object")continue;const d={};for(const[l,c]of Object.entries(r).slice(0,20))(typeof c=="string"||typeof c=="number"||typeof c=="boolean")&&(d[l]=c);s[a]=d}const o={};if(t.builtinSnapshot&&typeof t.builtinSnapshot=="object")for(const[a,r]of Object.entries(t.builtinSnapshot).slice(0,100))a!==""&&typeof r=="number"&&Number.isFinite(r)&&(o[a]=r);return{saveDir:i,accentStroke:typeof t.accentStroke=="boolean"?t.accentStroke:X.accentStroke,showWelcome:typeof t.showWelcome=="boolean"?t.showWelcome:X.showWelcome,gridModeEnabled:typeof t.gridModeEnabled=="boolean"?t.gridModeEnabled:X.gridModeEnabled,stencilMigrated:typeof t.stencilMigrated=="boolean"?t.stencilMigrated:X.stencilMigrated,pinnedScripts:Array.isArray(t.pinnedScripts)?t.pinnedScripts.filter(a=>typeof a=="string"&&a!==""):X.pinnedScripts,pinnedActions:Ko(t.pinnedActions),scriptRailCollapsed:typeof t.scriptRailCollapsed=="boolean"?t.scriptRailCollapsed:X.scriptRailCollapsed,scriptRailTop:typeof t.scriptRailTop=="number"&&Number.isFinite(t.scriptRailTop)&&t.scriptRailTop>=0&&t.scriptRailTop<=.85?t.scriptRailTop:X.scriptRailTop,scriptSettings:s,builtinSnapshot:o,highlighter:Qt(t.highlighter),imageBaseUrl:typeof t.imageBaseUrl=="string"?t.imageBaseUrl.trim().replace(/\/+$/,"").slice(0,500):X.imageBaseUrl,imageModel:typeof t.imageModel=="string"&&t.imageModel.trim()!==""?t.imageModel.trim().slice(0,100):X.imageModel,imageApiKey:typeof t.imageApiKey=="string"?t.imageApiKey.trim().slice(0,500):X.imageApiKey,imageSize:typeof t.imageSize=="string"&&t.imageSize.trim()!==""?t.imageSize.trim().slice(0,32):X.imageSize,aiChannels:Vo(t.aiChannels),presentation:Bi(t.presentation)}}const Pn="board";function C(n){const t=n.replace(/^\/+/,"");return t==="data"||t.startsWith("data/")?`/${t}`:`/data/${t}`}function U(n){return n.replace(/^\/+/,"").replace(/^data\//,"")}function Qo(n){return C(n)}function ta(n){return`/${U(n)}`}function B(n){return U(n).split("/").pop()||n}function ot(n,t){const e=n.trim().replace(/\\/g,"/").replace(/^\/+/,"").replace(/\/+$/,"");return`${e===""?"assets":e}/${t}`}function ke(n,t="excali-board.svg"){return`${(String(n??"").replace(/[\\/:*?"<>|\u0000-\u001f]/g,"").replace(/^\.+/,"").trim().replace(/\.svg$/i,"")||t.replace(/\.svg$/i,"")).slice(0,80)}.svg`}const Ni=3;function Jt(n,t=1){const e=n.replace(/\.svg$/i,"");return t<=1?`${e}.svg.bak.svg`:`${e}.svg.bak${t}.svg`}function Fi(n){const t=C(n);return Array.from({length:Ni},(e,i)=>Jt(t,i+1))}function Ue(n){return/\.bak\d*\.svg$/i.test(n)}async function Ee(n,t,e){const i=t.replace(/\.svg$/i,"");for(let s=0;s<50;s++){const o=C(ot(n,s===0?t:`${i}_${s-1}.svg`));if(e&&o===e||!await st(o))return o}return C(ot(n,t))}async function It(n,t){const e=C(n),i=new FormData;i.append("path",e),i.append("isDir","false"),i.append("file",new Blob([t],{type:"image/svg+xml;charset=utf-8"}),e.split("/").pop()||"x.svg");const s=await fetch("/api/file/putFile",{method:"POST",body:i}),o=await s.json().catch(()=>null);if(!s.ok||!o||o.code!==0)throw new Error(o?.msg||`putFile HTTP ${s.status}`);return e}async function q(n){const t=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:C(n)})});if(!t.ok)throw new Error(`getFile HTTP ${t.status}`);const e=await t.text();if((t.headers.get("content-type")||"").includes("application/json")){let i=null;try{i=JSON.parse(e)}catch{return e}if(i&&typeof i=="object"&&"code"in i&&i.code!==0){const s=i.msg;throw new Error(s||`getFile code ${i.code}`)}}return e}async function st(n){try{const t=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:C(n)})});if(!t.ok)return!1;if((t.headers.get("content-type")||"").includes("application/json")){const e=await t.json().catch(()=>null);return!e||e.code===0}return!0}catch{return!1}}async function Ye(n,t){const e=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),i=await e.json().catch(()=>null);if(!e.ok||!i||i.code!==0)throw new Error(i?.msg||`${n} HTTP ${e.status}`);return i.data}function ea(n){return typeof n!="number"||!Number.isFinite(n)||n<=0?0:n<1e12?n*1e3:n}async function _t(n){const t=n.trim().replace(/\\/g,"/").replace(/^\/+/,"").replace(/\/+$/,""),e=t===""?"assets":t,i=await Ye("/api/file/readDir",{path:C(e)});return(Array.isArray(i)?i.filter(o=>o&&o.isDir!==!0&&typeof o.name=="string"&&/\.svg$/i.test(o.name)&&!Ue(o.name)):[]).map(o=>({path:`${e}/${o.name}`,updated:ea(o.updated)})).sort((o,a)=>a.updated-o.updated)}async function ve(n,t){const e=n.trim().replace(/\\/g,"/").replace(/^\/+/,"").replace(/\/+$/,""),i=e===""?"assets":e,s=await Ye("/api/file/readDir",{path:C(i)});return Array.isArray(s)?s.filter(o=>o&&o.isDir!==!0&&typeof o.name=="string"&&(!t||t.test(o.name))).map(o=>`${i}/${o.name}`):[]}async function bt(n){await Ye("/api/file/removeFile",{path:C(n)})}async function On(n,t){const e=C(n),i=C(t),s=await q(e),o=await It(i,s);if(o!==e){await bt(e);for(let a=1;a<=Ni;a++)try{const r=await q(Jt(e,a));await It(Jt(o,a),r),await bt(Jt(e,a))}catch{}}return o}async function xt(n,t){const e=C(n),i=new FormData;i.append("path",e),i.append("isDir","false"),i.append("file",new Blob([t],{type:"application/json;charset=utf-8"}),e.split("/").pop()||"x.json");const s=await fetch("/api/file/putFile",{method:"POST",body:i}),o=await s.json().catch(()=>null);if(!s.ok||!o||o.code!==0)throw new Error(o?.msg||`putFile HTTP ${s.status}`);return e}async function na(n,t,e){const i=C(n),s=new FormData;s.append("path",i),s.append("isDir","false"),s.append("file",new Blob([t],{type:e}),i.split("/").pop()||"x.bin");const o=await fetch("/api/file/putFile",{method:"POST",body:s}),a=await o.json().catch(()=>null);if(!o.ok||!a||a.code!==0)throw new Error(a?.msg||`putFile HTTP ${o.status}`);return i}async function ia(n){const t=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:C(n)})});if(!t.ok)throw new Error(`getFile HTTP ${t.status}`);if((t.headers.get("content-type")||"").includes("application/json")){const e=await t.json().catch(()=>null);throw new Error(e?.msg||`getFile code ${e?.code??"?"}`)}return new Uint8Array(await t.arrayBuffer())}function Dn(){return!!window.siyuan?.mobile}function sa(n){const t=document.createElement("div");t.className="exs-mobile-shell";const e=document.createElement("div");e.className="exs-mobile-header";const i=document.createElement("div");i.className="exs-mobile-title",i.textContent=n.data.dataPath?B(n.data.dataPath):g("未命名白板");const s=document.createElement("button");s.type="button",s.className="exs-mobile-close",s.setAttribute("aria-label",g("关闭")),s.textContent="✕",e.append(i,s);const o=document.createElement("div");o.className="exs-mobile-body exs-panel";const a=document.createElement("div");a.className="exs-loading",a.textContent=g("正在打开白板…"),o.appendChild(a),t.append(e,o),document.body.appendChild(t),document.body.classList.add("exs-mobile-open");const r=()=>{document.querySelectorAll(".exs-mobile-shell").forEach(f=>{f!==t&&(f.style.display="none")}),t.style.display="flex"};r();let d=null,l=!1;const c=()=>{if(!l){l=!0;try{d?.dispose()}finally{d=null,t.remove(),document.querySelector(".exs-mobile-shell")||document.body.classList.remove("exs-mobile-open"),n.onDispose()}}},p={headElement:e,updateTitle:f=>{i.textContent=f},close:c,parent:{switchTab:()=>r()}},h={element:o,data:n.data,tab:p};return s.addEventListener("click",f=>{d||(f.preventDefault(),f.stopPropagation(),c())}),{custom:h,body:o,mount:f=>{d=f},showError:f=>{o.replaceChildren();const u=document.createElement("div");u.className="exs-loaderror";const x=document.createElement("div");x.textContent=f,u.appendChild(x),o.appendChild(u)},close:c,isClosed:()=>l}}const oa="assets/excali-media";function aa(n){const t=/^data:([^;,]+)(?:;charset=[^;,]+)?;base64,([\s\S]+)$/.exec(n.trim());if(!t)return null;const e=atob(t[2]),i=new Uint8Array(e.length);for(let s=0;s<e.length;s++)i[s]=e.charCodeAt(s)&255;return{mime:t[1]||"application/octet-stream",bytes:i}}function ra(n){return{"image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/gif":"gif","image/svg+xml":"svg","image/bmp":"bmp","image/avif":"avif"}[n]||"bin"}async function la(n,t){const e=await crypto.subtle.digest("SHA-1",n);return`${Array.from(new Uint8Array(e.slice(0,8))).map(s=>s.toString(16).padStart(2,"0")).join("")}.${ra(t)}`}function ca(n,t){let e="";for(let s=0;s<n.length;s+=32768)e+=String.fromCharCode(...n.subarray(s,s+32768));return`data:${t};base64,${btoa(e)}`}function da(){let n="";try{n=getComputedStyle(document.documentElement).getPropertyValue("--b3-theme-primary").trim()}catch{return null}return n&&/^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i.test(n)?n:null}function fa(n){return n.map(t=>({dataPath:C(t.path),name:B(t.path),updated:t.updated}))}function te(n){return n.name.replace(/\.svg$/i,"")}function ha(n,t){return n.map(e=>`${e.dataPath}\0${e.name}\0${e.updated}\0${t.has(e.dataPath)?1:0}`).join("")}function ua(n){return{svgPath:n.dataPath,bakPaths:Fi(n.dataPath)}}function pa(n){if(typeof n!="string")return null;const t=/^siyuan:(?:\/\/)?doc\/([A-Za-z0-9-]{10,})$/.exec(n.trim());return t?t[1]??null:null}function ga(n){if(typeof n!="string")return null;const t=/^siyuan:(?:\/\/)?block\/([0-9]{14}-[0-9a-zA-Z]{7})$/.exec(n.trim());return t?t[1]??null:null}const ma="application/x-siyuan-excali-board";function ya(n){return n.split("/").map(t=>{try{return decodeURIComponent(t)}catch{return t}}).join("/")}function ba(n){const t=String(n??"").trim().replace(/\\/g,"/");if(t==="")return null;const e=U(C(t));return!/\.svg$/i.test(e)||Ue(e)||e.split("/").some(i=>i===".."||i==="")?null:e}function xa(n){if(typeof n!="string")return null;const t=n.trim(),e=/^siyuan:(?:\/\/)?excali\/(.+)$/.exec(t);return e?ba(ya(e[1]??"")):null}function wa(n){const t=xa(n);return t?C(t):null}const Mt="assets";function Sa(n){return/^excali-\d{8}-\d{6}\.svg$/i.test(n)}function ka(n){const t=C(n).replace(/^\/data\//,""),e=t.lastIndexOf("/");return e<0?"":t.slice(0,e)}function Ea(n,t){return ka(n)===t.replace(/^\/+|\/+$/g,"")}function va(n,t=Mt){const e=t.replace(/^\/+|\/+$/g,""),i=[],s=new Set;for(const o of[...n.recent,...n.registry,...n.autoNamed]){if(typeof o!="string"||!/\.svg$/i.test(o)||Ue(o))continue;const a=C(o);!Ea(a,e)||s.has(a)||(s.add(a),i.push(a))}return i}function _a(n,t){const e=[],i=new Set;for(const s of n){const o=C(s),a=t.get(o)??o;i.has(a)||(i.add(a),e.push(a))}return e}const Ft=/^\d{14}-[0-9a-zA-Z]{7}$/,Bn=/^\d{14}-[0-9a-zA-Z]{7}$/;function Aa(n){const t=n.trim(),e=/^\[[^\]]*\]\(([^)]*)\)$/.exec(t);return e?(e[1]??"").trim():t}function Ma(n){const t=n.trim(),e=/^\(\(\s*([0-9A-Za-z-]+)\s*(?:['"][^'"]*['"])?\s*\)\)$/.exec(t);return e?e[1]??null:null}function $a(n){if(typeof n!="string")return null;let t=n.trim();if(t==="")return null;const e=Ma(t);if(e)return Ft.test(e)?{kind:"block",id:e}:null;if(t=Aa(t),t==="")return null;const i=/^siyuan:\/\/([0-9A-Za-z-]+)\/([0-9A-Za-z-]+)$/.exec(t);if(i){const a=i[1]??"",r=i[2]??"",d=a==="doc"||a==="blocks"||a==="block";if(!d&&Ft.test(r))return{kind:"block",id:r};if(!d)return null}const s=/^siyuan:\/\/(blocks|doc|block)\/([0-9A-Za-z-]+)$/.exec(t);if(s){const a=s[1]??"",r=s[2]??"";return a==="doc"?Bn.test(r)?{kind:"doc",id:r}:null:Ft.test(r)?{kind:"block",id:r}:null}const o=/^siyuan:(block|doc)\/([0-9A-Za-z-]+)$/.exec(t);if(o){const a=o[1]??"",r=o[2]??"";return a==="doc"?Bn.test(r)?{kind:"doc",id:r}:null:Ft.test(r)?{kind:"block",id:r}:null}return null}function Ia(n){const t=n.filter(e=>/^[0-9]{14}-[0-9a-zA-Z]{7}$/.test(e)).map(e=>`'${e.replace(/'/g,"''")}'`);return t.length===0?"":`select id, content, type, subtype from blocks where id in (${t.join(",")})`}function Ca(n){return String(n??"").replace(/'/g,"''")}function Ra(n){return n.replace(/[\\%_]/g,t=>`\\${t}`)}function Ta(n){return`SELECT id, content, hpath FROM blocks WHERE type='d' AND content LIKE '%${Ca(Ra(String(n??"").trim()))}%' ESCAPE '\\' ORDER BY id LIMIT 30`}function La(n){const t=n;if(!t||typeof t.id!="string"||t.id==="")return null;const e=String(t.content??"").replace(/\s+/g," ").trim(),i=String(t.hpath??"").replace(/\s+/g," ").trim();return{id:t.id,title:e===""?t.id:e,path:i}}let ee=null;function Pa(n){n.eventBus.on("switch-protyle",({detail:t})=>{ee=t.protyle}),n.eventBus.on("click-editorcontent",({detail:t})=>{ee=t.protyle})}function Oa(){if(ee?.wysiwyg?.element?.isConnected)return ee;const n=$.getAllEditor();for(let t=n.length-1;t>=0;t--){const e=n[t].protyle;if(e?.wysiwyg?.element?.isConnected)return e}return null}async function Da(n,t){const e=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),i=await e.json().catch(()=>null);if(!e.ok||!i||i.code!==0)throw new Error(i?.msg||`${n} HTTP ${e.status}`);return i}async function ji(n){const t=await Da("/api/query/sql",{stmt:n});return Array.isArray(t.data)?t.data:[]}function Ba(n){const t=n;return t?.protyle?.lute??t?.lute??window.Lute??null}async function Na(n){const t=Ia(n);if(!t)return{};try{const e=await ji(t),i={};for(const s of e)typeof s.id=="string"&&(i[s.id]={title:typeof s.content=="string"?s.content:"",type:typeof s.type=="string"?s.type:"",subtype:typeof s.subtype=="string"?s.subtype:""});return i}catch{return{}}}function _e(n){const t=ta(n);let e=0;return document.querySelectorAll("img").forEach(i=>{let s;try{s=new URL(i.src,location.href)}catch{return}decodeURIComponent(s.pathname)===t&&(s.searchParams.set("t",String(Date.now())),i.src=s.href,e++)}),e}function Fa(n){let t;try{t=new URL(n,location.href)}catch{return null}const e=decodeURIComponent(t.pathname);return e.startsWith("/assets/")?Qo(e.replace(/^\/+/,"")):null}function Nn(n){for(const t of n){const e=t.tagName==="IMG"?t:t.querySelector("img");if(!e)continue;const i=Fa(e.getAttribute("src")||e.dataset.src||"");if(i&&/\.svg$/i.test(i))return i}return null}async function ja(n){const t=String(n??"").trim();if(t==="")return[];try{const e=await ji(Ta(t)),i=[];for(const s of e){const o=La(s);o&&i.push(o)}return i}catch{return[]}}const Oe="data-exs-board-open",De="data-exs-board-badge",Ha='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5h10v10"/><path d="M19 5 8 16"/><path d="M18 14v5H5V6h5"/></svg>';function za(n,t){let e;try{e=n.querySelectorAll("img[data-src], img[src]")}catch{return}for(const i of e){const s=i.getAttribute("data-src")||i.getAttribute("src")||"";if(!s||!t.isBoardAsset(s))continue;const o=i.closest("[data-node-id]");if(!o||!o.isConnected)continue;const a=o.querySelector(".protyle-action");if(a&&!a.querySelector(`[${Oe}]`)){const d=document.createElement("span");d.className="protyle-icon ariaLabel",d.setAttribute("aria-label",g("用 Excali 白板打开")),d.setAttribute("data-position","4north"),d.setAttribute(Oe,""),d.innerHTML=Ha,d.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),t.openBoard(s)}),a.insertAdjacentElement("beforeend",d)}const r=o.querySelector(".protyle-attr");if(r&&!r.querySelector(`[${De}]`)){const d=document.createElement("span");d.className="exs-board-badge",d.setAttribute(De,""),d.textContent="Excali",r.prepend(d)}}Xa(n,t)}function Xa(n,t){let e;try{e=n.querySelectorAll(`[${Oe}], [${De}]`)}catch{return}for(const i of e){if(!i.isConnected)continue;const s=i.closest("[data-node-id]");s&&s.isConnected&&Ua(s,t)||i.remove()}}function Ua(n,t){for(const e of n.querySelectorAll("img[data-src], img[src]")){const i=e.getAttribute("data-src")||e.getAttribute("src")||"";if(i&&t.isBoardAsset(i))return!0}return!1}function Hi(n,t=new Date){if(!n)return"";const e=new Date(n),i=d=>String(d).padStart(2,"0"),s=`${i(e.getHours())}:${i(e.getMinutes())}`,o=d=>`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;if(o(e)===o(t))return`${g("今天")} ${s}`;const a=new Date(t);if(a.setDate(t.getDate()-1),o(e)===o(a))return`${g("昨天")} ${s}`;const r=`${i(e.getMonth()+1)}-${i(e.getDate())}`;return e.getFullYear()===t.getFullYear()?`${r} ${s}`:`${e.getFullYear()}-${r}`}function Ya(n,t){const e=t.trim().toLowerCase();return e===""?n:n.filter(i=>B(i.path).toLowerCase().includes(e))}const Ga={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function Ae(n){return n.replace(/[&<>"']/g,t=>Ga[t])}function Wa(n,t,e=g("打开白板…")){return new Promise(i=>{let s=!1,o=!1,a,r=n,d=-1;const l=m=>{s||(s=!0,a!==void 0&&window.clearTimeout(a),c.destroy(),i(m))},c=new $.Dialog({title:e,width:"560px",content:`<div class="exs-picker">
  <input class="b3-text-field fn__block exs-picker__search" placeholder="${g("搜索文件名…")}" />
  <div class="exs-picker__list b3-list b3-list--background"></div>
</div>`,destroyCallback:()=>l(null)}),p=c.element.querySelector(".exs-picker__search"),h=c.element.querySelector(".exs-picker__list"),f=()=>{if(r.length===0){h.innerHTML=`<div class="exs-picker__empty">${g("没有匹配的白板")}</div>`;return}h.innerHTML=r.map((m,y)=>{const w=`b3-list-item exs-picker__item${y===d?" b3-list-item--focus":""}`,k=t.has(C(m.path))?`<span class="exs-picker__badge">${g("已打开")}</span>`:"",S=Hi(m.updated),v=k||S?`<span class="b3-list-item__meta">${k}${Ae(S)}</span>`:"";return`<div class="${w}" data-idx="${y}" title="${Ae(m.path)}"><span class="exs-picker__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"></rect><path d="M3.5 9h17M9 9v11.5"></path></svg></span><span class="b3-list-item__text">${Ae(B(m.path))}</span>${v}</div>`}).join("")},u=m=>{const y=r[m];y&&l(y.path)},x=m=>{r.length!==0&&(d=d<0?m>0?0:r.length-1:(d+m+r.length)%r.length,f(),h.querySelector(".b3-list-item--focus")?.scrollIntoView({block:"nearest"}))},b=()=>{a!==void 0&&window.clearTimeout(a),a=window.setTimeout(()=>{a=void 0,r=Ya(n,p.value),d=-1,f()},120)};p.addEventListener("compositionstart",()=>{o=!0}),p.addEventListener("compositionend",()=>{o=!1,b()}),p.addEventListener("input",()=>{o||b()}),p.addEventListener("keydown",m=>{m.isComposing||m.keyCode===229||(m.key==="ArrowDown"?(m.preventDefault(),x(1)):m.key==="ArrowUp"?(m.preventDefault(),x(-1)):m.key==="Enter"?(m.preventDefault(),u(d>=0?d:0)):m.key==="Escape"&&(m.preventDefault(),l(null)))}),h.addEventListener("click",m=>{const y=m.target?.closest(".exs-picker__item");y&&u(Number(y.dataset.idx))}),p.focus(),f()})}const Za={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},jt=n=>n.replace(/[&<>"']/g,t=>Za[t]);function qa(n){const t=document.createElement("div");t.className="exs-dock",t.innerHTML=`
  <div class="block__icons exs-dock__head">
    <div class="block__logo fn__flex-1"><span class="fn__ellipsis">${g("白板库")}</span><span class="exs-dock__count" data-role="libcount"></span></div>
    <span class="fn__space"></span>
    <button class="block__icon block__icon--show ariaLabel" data-act="new" aria-label="${g("新建白板")}" data-position="north" title="${g("新建白板")}" type="button"><svg aria-hidden="true" focusable="false"><use xlink:href="#iconAdd"></use></svg></button>
    <button class="block__icon block__icon--show ariaLabel" data-act="delete-active" data-role="del-active" aria-label="${g("删除当前白板")}" data-position="north" title="${g("删除当前白板")}" type="button" disabled><svg aria-hidden="true" focusable="false"><use xlink:href="#iconTrashcan"></use></svg></button>
    <button class="block__icon block__icon--show ariaLabel" data-act="lib-refresh" aria-label="${g("刷新")}" data-position="north" title="${g("刷新")}" type="button"><svg aria-hidden="true" focusable="false"><use xlink:href="#iconRefresh"></use></svg></button>
  </div>
  <ul class="b3-list b3-list--background exs-dock__liblist" data-role="liblist"></ul>`;const e=t.querySelector('[data-role="libcount"]'),i=t.querySelector('[data-role="liblist"]'),s=t.querySelector('[data-role="del-active"]');let o="",a=[];const r=()=>{const c=n.getBoardFiles(),p=ha(c.files,c.opened);if(p!==o){if(o=p,a=c.files,e.textContent=c.files.length>0?String(c.files.length):"",c.files.length===0){i.innerHTML=`<li class="exs-lib__hint">${g("还没有白板")}</li>`;return}i.innerHTML=c.files.map(h=>{const f=c.opened.has(h.dataPath),u=Hi(h.updated),x=f?`<span class="exs-lib__badge">${g("已打开")}</span>`:"";return`<li class="b3-list-item b3-list-item--narrow b3-list-item--hide-action exs-lib__item${f?" is-open":""}" data-file="${jt(h.dataPath)}" title="${jt(h.dataPath)}" draggable="true">
          <button class="b3-list-item__text exs-lib__text" type="button">${jt(te(h))}</button>${x}
          <span class="fn__space"></span>
          <span class="exs-lib__meta">${jt(u)}</span>
          <button class="b3-list-item__action b3-tooltips b3-tooltips__w" data-act="row-rename" title="${g("重命名")}" type="button"><svg aria-hidden="true"><use xlink:href="#iconEdit"></use></svg></button>
          <button class="b3-list-item__action b3-tooltips b3-tooltips__w exs-lib__act--danger" data-act="row-delete" title="${g("删除…")}" type="button"><svg aria-hidden="true"><use xlink:href="#iconTrashcan"></use></svg></button>
        </li>`}).join("")}},d=()=>{r(),s.disabled=!n.hasActiveBoard()},l=c=>{const p=c.closest(".exs-lib__item");return p?a.find(f=>f.dataPath===p.dataset.file):void 0};return t.addEventListener("click",c=>{const p=c.target,h=p.closest("[data-act]");if(h&&!h.disabled)switch(h.dataset.act){case"new":n.openNew();return;case"delete-active":n.deleteActiveBoard();return;case"lib-refresh":n.refreshBoardLib();return;case"row-rename":{const u=l(h);u&&n.renameBoardFile(u);return}case"row-delete":{const u=l(h);u&&n.deleteBoardFile(u);return}}const f=p.closest(".exs-lib__item");if(f){const u=a.find(x=>x.dataPath===f.dataset.file);u&&n.openBoardFile(u)}}),t.addEventListener("dragstart",c=>{const p=c.target.closest(".exs-lib__item");if(!p)return;const h=a.find(x=>x.dataPath===p.dataset.file),f=c.dataTransfer;if(!h||!f)return;const u=U(h.dataPath);f.effectAllowed="copy",f.setData("text/plain",u),f.setData(ma,JSON.stringify({ref:u,title:te(h)}))}),t.addEventListener("contextmenu",c=>{const p=c.target.closest(".exs-lib__item");if(!p)return;const h=a.find(f=>f.dataPath===p.dataset.file);h&&(c.preventDefault(),n.openFileMenu(h,c.clientX,c.clientY))}),n.onRefresh(d),d(),{element:t,refresh:d}}const Ht="0.7.0",Fn="excali-studio-version";function Ka(n,t){const e=t.trim();if(!e)return"unknown-version";const i=(typeof n=="string"?n:"").trim();return i?i===e?"up-to-date":"show":"first-install"}function Ja(n){return`/data/plugins/${n}/CHANGELOG.md`}const Va={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function Qa(n){return n.replace(/[&<>"']/g,t=>Va[t])}function tr(n){return n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function er(n){const t=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:n})});if(!t.ok)throw new Error(`getFile HTTP ${t.status}`);const e=await t.text();if((t.headers.get("content-type")||"").includes("application/json")||/"code"\s*:\s*404/.test(e))throw new Error(`getFile 读不到文件：${n}`);return e}function nr(n,t){const e=t.trim();if(!e)return"";const i=new RegExp(`^##\\s+v?${tr(e)}(?![0-9.])`,"m").exec(n);if(!i)return"";const s=(()=>{const l=n.indexOf(`
`,i.index);return l<0?n.length:l+1})(),a=n.slice(s).search(/^##[ \t]/m),r=a<0?n.length:s+a;return n.slice(i.index,r).replace(/\s+$/,"").replace(/\n-{3,}$/,"").replace(/\s+$/,"")}function ir(n){const t=globalThis.Lute;if(t?.New)try{const e=t.New().Md2HTML?.(n);if(e)return e}catch{}return`<pre class="exs-changelog__plain">${Qa(n)}</pre>`}function sr(n){const t=[];let e=!1;for(const i of(n||"").split(/\r?\n/)){if(/^\s*```/.test(i)){e=!e;continue}if(e)continue;const s=i.match(/^(#{1,6})\s+(.+?)\s*$/);s&&t.push({level:s[1].length,text:s[2]})}return t}function or(n){const t=(n||"").split(/\r?\n/);let e=-1;for(let s=0;s<t.length;s++)if(/^\s*\|.*\|\s*$/.test(t[s])){e=s;break}if(e<0)return null;const i=[];for(let s=e;s<t.length;s++){const o=t[s];if(!/^\s*\|.*\|\s*$/.test(o))break;const a=o.replace(/^\s*\|/,"").replace(/\|\s*$/,"").split("|").map(r=>r.trim());a.every(r=>/^:?-{2,}:?$/.test(r))||i.push(a)}return i.length===0?null:{headers:i[0],rows:i.slice(1)}}function ar(n){const t=(n||"").split(/\r?\n/),e=[],i=[];for(const s of t){const o=s.match(/^(\s*)(?:[-*+]|\d+\.)\s+(.+?)\s*$/);if(!o){if(s.trim()===""||i.length===0)continue;continue}const a=Math.floor(o[1].replace(/\t/g,"  ").length/2),r={text:o[2],depth:a,children:[]};for(;i.length>a+1;)i.pop();if(a===0||i.length===0){if(a>0&&e.length===0){e.push(r),i.length=0,i.push(r);continue}e.push(r),i.length=0,i.push(r)}else(i[a-1]??i[i.length-1]).children.push(r),i[a]=r}return e}function rr(n){const t=(n||"").match(/```[a-zA-Z0-9]*\r?\n([\s\S]*?)```/);return t?t[1]:null}function lr(n){const t=(n||"").match(/^#\s+(.+?)\s*$/m)?.[1]??"",e=/@excalidraw-onload/.test(n||""),i=(rr(n)??(n||"").replace(/^#.*$/gm,"").replace(/@excalidraw-onload/g,"")).trim(),o=((n||"").split(/```/)[0]??"").split(`
`).filter(a=>!/^#\s/.test(a)&&!a.includes("@excalidraw-onload")).join(" ").replace(/\s+/g," ").trim();return{title:t,onload:e,code:i,description:o}}const W="assets/excali-scripts",cr=50,At={"text-numbering.md":[{key:"format",label:g("默认编号格式"),type:"select",default:"1",options:[{value:"1",label:g("数字（1. 2. 3.）")},{value:"2",label:g("罗马大写（I. II. III.）")},{value:"3",label:g("罗马小写（i. ii. iii.）")},{value:"4",label:g("字母大写（A. B. C.）")},{value:"5",label:g("字母小写（a. b. c.）")},{value:"6",label:g("无序列表（• • •）")}]}],"box-selection.md":[{key:"padding",label:g("外框边距（像素）"),type:"number",default:20,min:0,max:200}]};async function zi(n){const t=await fetch("/api/file/readDir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:C(n)})}),e=await t.json().catch(()=>null);return!t.ok||!e||e.code!==0?[]:Array.isArray(e.data)?e.data.filter(i=>i&&i.isDir!==!0&&typeof i.name=="string").map(i=>i.name):[]}async function Be(n){const t=await q(C(n));return lr(t)}async function zt(){let n=[];try{n=await zi(W)}catch{return[]}const t=[];for(const e of n.filter(i=>/\.md$/i.test(i)).sort().slice(0,cr)){const i=`${W}/${e}`;try{const s=await Be(i);t.push({path:i,name:e,title:s.title||e.replace(/\.md$/i,""),description:s.description,onload:s.onload,builtin:Tr.has(e)})}catch{}}return t}async function Xi(n){const t=new FormData;t.append("path",C(n)),t.append("isDir","true"),await fetch("/api/file/putFile",{method:"POST",body:t}).catch(()=>{})}async function dr(){let n=[];try{n=await zi(W)}catch{n=[]}const t=Pt.filter(i=>!n.includes(i.file));if(t.length===0)return 0;await Xi(W);let e=0;for(const i of t)try{await xt(C(`${W}/${i.file}`),i.content),e++}catch(s){console.warn("[excali-studio] 内置脚本写入失败",i.file,s)}return e}async function Ui(){const n=[];for(const t of Pt)try{(await q(C(`${W}/${t.file}`))).trim()!==t.content.trim()&&n.push(t.file)}catch{}return n}async function fr(){const n=new Set(await Ui());if(n.size===0)return 0;await Xi(W);let t=0;for(const e of Pt)if(n.has(e.file))try{await xt(C(`${W}/${e.file}`),e.content),t++}catch(i){console.warn("[excali-studio] 内置脚本重置失败",e.file,i)}return t}function Me(n){let t=5381;for(let e=0;e<n.length;e++)t=t*33^n.charCodeAt(e);return t>>>0}async function hr(n){const t={...n},e=[],i=[];for(const s of Pt){let o;try{o=await q(C(`${W}/${s.file}`))}catch{continue}if(o.trim()===s.content.trim()){t[s.file]=Me(o);continue}const a=t[s.file];if(a===void 0||a===Me(o))try{await xt(C(`${W}/${s.file}`),s.content),t[s.file]=Me(s.content),e.push(s.file)}catch(r){console.warn("[excali-studio] 内置脚本自动更新失败",s.file,r),i.push(s.file)}else i.push(s.file)}return{updated:e,drifted:i,snapshot:t}}const ur=`# 笔记标题 → 思维导图

把当前文档的标题（1~3 级）画成右侧树：根在左，逐级向右。连线用图形绑定
（拖动节点时箭头自动跟随），布局按子树叶子数自动摊开。
只读文档、不修改；生成后可用「缩放适应」看全貌。

\`\`\`js
const md = await ea.getDocMarkdown();
const headings = ea.utils.parseHeadings(md).filter((h) => h.level <= 3);
if (headings.length === 0) {
  ea.notify("当前文档没有 1~3 级标题");
} else {
  const root = { text: headings[0].text, level: 1, children: [] };
  const stack = [root];
  for (const h of headings.slice(1)) {
    const node = { text: h.text, level: h.level, children: [] };
    while (stack.length > 1 && stack[stack.length - 1].level >= h.level) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  const BOX_W = 150, BOX_H = 34, GAP_X = 230, GAP_Y = 54;
  let slot = 0;
  const walk = (node, depth) => {
    const mySlot = node.children.length === 0 ? slot++ : null;
    node.children.forEach((c) => walk(c, depth + 1));
    node.slot = mySlot !== null ? mySlot : (node.children[0].slot + node.children[node.children.length - 1].slot) / 2;
    node.id = ea.addRect({
      x: 40 + depth * GAP_X,
      y: node.slot * GAP_Y,
      width: BOX_W,
      height: BOX_H,
      backgroundColor: depth === 0 ? "#dbeafe" : "transparent",
      text: node.text,
    });
    node.children.forEach((c) => {
      ea.connectObjects(node.id, "right", c.id, "left", 8);
    });
  };
  walk(root, 0);
  ea.zoomToFit();
  ea.notify("思维导图已生成");
}
\`\`\`
`,pr=`# Markdown 表格 → 渲染表格

把 Markdown 表格直接画成画布上的渲染表格（表头浅蓝底、单元格白底、
列宽按内容自适应、长释义自动撑高行）。两种来源二选一：

① 画布上选中含竖线的文本元素（粘贴的 Markdown 表格草稿）→ 跑本脚本，
   原地生成表格并**替换掉原文本**（误删可 Ctrl+Z 撤回）；
② 不选中任何东西 → 读当前打开文档的第一个 Markdown 表格。

\`\`\`js
// 来源①：画布选中的文本元素（含竖线才算 Markdown 表格草稿）
const sourceIds = ea.getSelectedElements();
const consumed = sourceIds
  .map((id) => ea.getElement(id))
  .filter((el) => el && el.type === "text" && typeof el.text === "string" && el.text.includes("|"));
const selTexts = consumed.map((el) => el.text);
const fromCanvas = selTexts.length > 0;

const table = fromCanvas
  ? ea.utils.parseTable(selTexts.join("\\n"))
  : ea.utils.parseTable(await ea.getDocMarkdown());

if (!table) {
  ea.notify(
    fromCanvas
      ? "选中文本里没有 Markdown 表格（需要 | 分隔 + --- 分隔行）"
      : "当前文档没有 Markdown 表格",
  );
} else {
  // 去掉单元格里的行内 Markdown（**加粗**、*斜体*、\`代码\`），画出来更干净
  const plain = (s) =>
    s.replace(/\\*\\*([^*]*)\\*\\*/g, "$1").replace(/\\*([^*]*)\\*/g, "$1").replace(/\\\`([^\\\`]*)\\\`/g, "$1");
  const headers = table.headers.map(plain);
  const rows = table.rows.map((r) => r.map(plain));

  const FONT = 14;
  const colW = headers.map(
    (_, i) =>
      Math.min(280, Math.max(90, ...rows.map((r) => (r[i] || "").length), headers[i].length) * 12 + 24),
  );
  // 行高按换行后的行数自适应（长释义自动撑高，不再一排固定高度挤成一坨）
  const rowH = (cells) => {
    let n = 1;
    cells.forEach((cell, i) => {
      n = Math.max(n, ea.wrapText(cell, (colW[i] || 90) - 24, FONT).length);
    });
    return n * Math.ceil(FONT * 1.35) + 10;
  };

  // 来源①：表格画在原文本元素的位置（原地替换）；来源②：从 (40, 40) 起画
  const originEl = fromCanvas ? consumed[0] : null;
  const ox = originEl ? originEl.x : 40;
  const oy = originEl ? originEl.y : 40;

  const ids = [];
  let y = oy;
  const drawRow = (cells, isHead) => {
    let x = ox;
    const h = rowH(cells);
    cells.forEach((cell, i) => {
      ids.push(
        ea.addRect({
          x, y, width: colW[i], height: h,
          backgroundColor: isHead ? "#dbeafe" : "#ffffff",
          text: cell, fontSize: FONT,
        }),
      );
      x += colW[i];
    });
    y += h;
  };
  drawRow(headers, true);
  rows.forEach((r) => drawRow(r, false));

  if (fromCanvas) {
    ea.deleteElements(consumed.map((el) => el.id)); // 原文本已被表格取代（只删吃掉的草稿，同选的其它元素不动）
    ea.notify("表格已生成（原文本已删，误删可 Ctrl+Z 撤回）");
  } else {
    ea.notify("表格已生成");
  }
  ea.selectElements(ids);
  ea.zoomToFit();
}
\`\`\`
`,gr=`# 缩进列表 → 流程图

把当前文档第一个缩进列表（- 或 1.）画成纵向流程图：节点按子树叶子数摊开，
父节点在子节点上方居中，折线箭头向下。复杂流程建议生成后再手动调。

\`\`\`js
const md = await ea.getDocMarkdown();
const tree = ea.utils.parseList(md);
if (tree.length === 0) {
  ea.notify("当前文档没有列表");
} else {
  const BOX_W = 170, BOX_H = 34, GAP_Y = 60;
  let slot = 0;
  const walk = (node, depth) => {
    node.children.forEach((c) => walk(c, depth + 1));
    node.slot = node.children.length === 0 ? slot++ : (node.children[0].slot + node.children[node.children.length - 1].slot) / 2;
    node.x = 40 + depth * 240;
    node.y = node.slot * GAP_Y;
    ea.addRect({ x: node.x, y: node.y, width: BOX_W, height: BOX_H, text: node.text });
    node.children.forEach((c) => {
      ea.addArrow({
        x: node.x + BOX_W / 2, y: node.y + BOX_H,
        points: [
          [0, 0],
          [0, (c.slot - node.slot) * GAP_Y / 2],
          [c.x + BOX_W / 2 - (node.x + BOX_W / 2), (c.slot - node.slot) * GAP_Y / 2],
          [c.x + BOX_W / 2 - (node.x + BOX_W / 2), (c.slot - node.slot) * GAP_Y - BOX_H / 2],
        ],
      });
    });
  };
  tree.forEach((n) => walk(n, 0));
  ea.zoomToFit();
  ea.notify("流程图已生成");
}
\`\`\`
`,mr=`# 批量导入图片

把保存目录（默认 assets）里的图片全部插入画布，4 列网格排布。
目录可在插件设置里改；只会导入图片格式，其它文件跳过。

\`\`\`js
const dir = ea.settings.saveDir || "assets";
const files = await ea.listFiles(dir);
let n = 0;
for (const f of files) {
  if (!/\\.(png|jpe?g|webp|gif|bmp)$/i.test(f)) continue;
  try {
    await ea.addImageFromFile(f, { x: (n % 4) * 260, y: Math.floor(n / 4) * 210 });
    n++;
  } catch (e) {
    console.warn("跳过", f, e);
  }
}
ea.notify(\`已插入 \${n} 张图片\`);
\`\`\`
`,yr=`# 对齐与分布

对选中的元素（≥2 个）自动判断布局意图：
全部元素几乎在同一水平带 → 垂直居中对齐（y 对齐公共中心线）；
几乎在同一垂直带 → 水平居中对齐；否则 → 按 x 排序做等水平间距分布。

\`\`\`js
const ids = ea.getSelectedElements();
if (ids.length < 2) {
  ea.notify("请先选中至少 2 个元素");
} else {
  const els = ids.map((id) => ea.getElement(id)).filter(Boolean);
  const box = ea.getBoundingBox(ids);
  const avgH = els.reduce((s, e) => s + e.height, 0) / els.length;
  const avgW = els.reduce((s, e) => s + e.width, 0) / els.length;
  const sameBand = Math.max(...els.map((e) => e.y + e.height / 2)) - Math.min(...els.map((e) => e.y + e.height / 2));
  const sameColumn = Math.max(...els.map((e) => e.x + e.width / 2)) - Math.min(...els.map((e) => e.x + e.width / 2));
  if (sameBand < avgH * 0.5) {
    els.forEach((e) => ea.setPosition(e.id, e.x, box.cy - e.height / 2));
    ea.notify("已做垂直居中对齐");
  } else if (sameColumn < avgW * 0.5) {
    els.forEach((e) => ea.setPosition(e.id, box.cx - e.width / 2, e.y));
    ea.notify("已做水平居中对齐");
  } else {
    const sorted = els.slice().sort((a, b) => a.x - b.x);
    const totalW = sorted.reduce((s, e) => s + e.width, 0);
    const gap = (box.width - totalW) / (sorted.length - 1);
    let x = box.minX;
    sorted.forEach((e) => {
      ea.setPosition(e.id, x, e.y);
      x += e.width + gap;
    });
    ea.notify("已做等水平间距分布");
  }
}
\`\`\`
`,br=`# 序号标注

给选中的每个元素外加红色虚线框 + 红底白字序号徽标（①②③…按选择顺序），
适合演示、批注、走查图。

\`\`\`js
const ids = ea.getSelectedElements();
if (ids.length === 0) {
  ea.notify("请先选中要标注的元素");
} else {
  ids.forEach((id, i) => {
    const b = ea.getBoundingBox([id]);
    const pad = 8;
    ea.addRect({
      x: b.minX - pad, y: b.minY - pad,
      width: b.width + pad * 2, height: b.height + pad * 2,
      strokeColor: "#e03131", backgroundColor: "transparent",
      strokeStyle: "dashed", strokeWidth: 1.5,
    });
    ea.addEllipse({
      x: b.minX - pad - 22, y: b.minY - pad - 6,
      width: 22, height: 22,
      strokeColor: "#e03131", backgroundColor: "#e03131", roughness: 0,
    });
    ea.addText({
      x: b.minX - pad - 22, y: b.minY - pad - 6,
      width: 22, height: 22,
      text: String(i + 1), fontSize: 14,
      strokeColor: "#ffffff", textAlign: "center",
    });
  });
  ea.zoomToFit();
  ea.notify("已加 " + ids.length + " 个序号标注");
}
\`\`\`
`,xr=`# 智能连线

选中恰好 2 个图形，自动按几何方位在最近的两条边之间画绑定箭头
（之后拖动图形，箭头自动跟随）。替代手工拉线，怎么摆都不脱节。

\`\`\`js
const ids = ea.getSelectedElements();
if (ids.length !== 2) {
  ea.notify("请选中恰好 2 个图形");
} else {
  const arrowId = ea.connectObjects(ids[0], "auto", ids[1], "auto", 6);
  ea.notify(arrowId ? "已连线（绑定：拖动图形箭头跟随）" : "连线失败：元素不可绑定");
}
\`\`\`
`,wr=`# 任务清单 → 三列看板

把当前文档的任务列表画成「待办 / 进行中 / 完成」三列看板：
- [ ] 开头 → 待办；- [x] 开头 → 完成；其余列表项 → 进行中。
只读文档、不修改。

\`\`\`js
const md = await ea.getDocMarkdown();
const tree = ea.utils.parseList(md);
const flat = [];
const walk = (nodes) => nodes.forEach((n) => { flat.push(n.text); walk(n.children); });
walk(tree);
if (flat.length === 0) {
  ea.notify("当前文档没有列表");
} else {
  const todo = flat.filter((t) => /\\[\\s?\\]/.test(t)).map((t) => t.replace(/\\[\\s?\\]\\s*/, ""));
  const done = flat.filter((t) => /\\[[xX]\\]/.test(t)).map((t) => t.replace(/\\[[xX]\\]\\s*/, ""));
  const doing = flat.filter((t) => !/\\[[xX\\s?]\\]/.test(t));
  const columns = [
    { title: "待办", color: "#dbeafe", items: todo },
    { title: "进行中", color: "#fff3bf", items: doing },
    { title: "完成", color: "#d3f9d8", items: done },
  ];
  const COL_W = 220, HEAD_H = 40, CARD_H = 40, GAP = 10;
  columns.forEach((col, ci) => {
    const x = 40 + ci * (COL_W + GAP);
    ea.addRect({ x, y: 40, width: COL_W, height: HEAD_H, backgroundColor: col.color, text: col.title + "（" + col.items.length + "）" });
    col.items.forEach((t, i) => {
      ea.addRect({ x, y: 40 + HEAD_H + GAP + i * (CARD_H + GAP), width: COL_W, height: CARD_H, text: t, fontSize: 14 });
    });
  });
  ea.zoomToFit();
  ea.notify("看板已生成");
}
\`\`\`
`,Sr=`# 导出分步图

把选中的元素按出现顺序逐步显现，导出成 step-1.png、step-2.png…（N 张，
浏览器逐张下载）——演示时一张图讲完一个过程。

\`\`\`js
const ids = ea.getSelectedElements();
if (ids.length < 2) {
  ea.notify("请选中 2 个以上元素（将按它们在画布中的出现顺序逐步显现）");
} else {
  const sceneIds = ea.getElements().map((e) => e.id);
  const ordered = sceneIds.filter((id) => ids.includes(id));
  for (let k = 1; k <= ordered.length; k++) {
    const blob = await ea.exportPNG(2, ordered.slice(0, k));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "step-" + k + ".png";
    a.click();
    URL.revokeObjectURL(url);
  }
  ea.notify("已导出 " + ordered.length + " 张分步图");
}
\`\`\`
`,kr=`# 重复补间（选中 2 个）

在两个**同类型**元素之间线性插值出 N 个中间元素：位置、尺寸、角度渐变，
背景与描边颜色还会做 HSL 色相渐变——做色阶图、渐变进度条、明暗过渡一气呵成。
对标 Obsidian Excalidraw 的 Repeat Elements。

\`\`\`js
const picked = ea.getSelectedElements().map((id) => ea.getElement(id));
if (picked.length !== 2 || !picked[0] || !picked[1]) {
  ea.notify("请选中恰好 2 个元素");
  return;
}
const a = picked[0].x <= picked[1].x ? picked[0] : picked[1];
const b = a === picked[0] ? picked[1] : picked[0];
if (a.type !== b.type) {
  ea.notify("两个元素必须同类型（同是矩形/椭圆/箭头…）");
  return;
}
if (a.type === "image" || a.type === "frame") {
  ea.notify("暂不支持图像与画框，请选形状、箭头或文本");
  return;
}
const n = parseInt(await ea.utils.inputPrompt("补间数量（在两者之间插入几个）", "number", "5"), 10);
if (!n || n < 1) {
  ea.notify("请输入正整数（取消则中断）");
  return;
}

// hex(#rgb/#rrggbb/#rrggbbaa) <-> HSL；透明色不参与渐变（保持原色）
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const parseHex = (c) => {
  if (typeof c !== "string") return null;
  const m = c.replace("#", "");
  if (m.length === 3) return [parseInt(m[0] + m[0], 16), parseInt(m[1] + m[1], 16), parseInt(m[2] + m[2], 16), 1];
  if (m.length === 6) return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16), 1];
  if (m.length === 8) return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16), parseInt(m.slice(6, 8), 16) / 255];
  return null;
};
const rgbToHsl = (r, g, bl) => {
  r /= 255; g /= 255; bl /= 255;
  const max = Math.max(r, g, bl), min = Math.min(r, g, bl);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - bl) / d + (g < bl ? 6 : 0)) / 6;
    else if (max === g) h = ((bl - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s, l];
};
const hslToHex = (h, s, l) => {
  h = (((h % 360) + 360) % 360) / 360;
  const f = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, bl;
  if (s === 0) { r = l; g = l; bl = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = f(p, q, h + 1 / 3); g = f(p, q, h); bl = f(p, q, h - 1 / 3);
  }
  const to = (v) => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(bl);
};
const lerpColor = (c1, c2, t) => {
  const p1 = parseHex(c1), p2 = parseHex(c2);
  if (!p1 || !p2) return c1 ?? c2 ?? "#000000";
  const h1 = rgbToHsl(p1[0], p1[1], p1[2]);
  const h2 = rgbToHsl(p2[0], p2[1], p2[2]);
  let dh = h2[0] - h1[0];
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const alpha = p1[3] + (p2[3] - p1[3]) * t;
  const hex = hslToHex(h1[0] + dh * t, h1[1] + (h2[1] - h1[1]) * t, h1[2] + (h2[2] - h1[2]) * t);
  return alpha >= 1 ? hex : hex + Math.round(clamp(alpha, 0, 1) * 255).toString(16).padStart(2, "0");
};

const specs = [];
for (let i = 1; i <= n; i++) {
  const t = i / (n + 1);
  const spec = {
    type: a.type,
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    width: (a.width ?? 0) + ((b.width ?? 0) - (a.width ?? 0)) * t,
    height: (a.height ?? 0) + ((b.height ?? 0) - (a.height ?? 0)) * t,
    angle: (a.angle ?? 0) + ((b.angle ?? 0) - (a.angle ?? 0)) * t,
    strokeColor: lerpColor(a.strokeColor, b.strokeColor, t),
    backgroundColor: lerpColor(a.backgroundColor, b.backgroundColor, t),
    fillStyle: a.fillStyle,
    strokeWidth: (a.strokeWidth ?? 2) + ((b.strokeWidth ?? 2) - (a.strokeWidth ?? 2)) * t,
    strokeStyle: a.strokeStyle,
    roughness: a.roughness,
    opacity: a.opacity,
  };
  if (a.type === "text") {
    spec.text = a.text;
    spec.fontSize = a.fontSize;
    spec.fontFamily = a.fontFamily;
    spec.textAlign = a.textAlign;
  }
  if ((a.type === "arrow" || a.type === "line") && a.points && b.points && a.points.length === b.points.length) {
    spec.points = a.points.map((p, j) => [
      p[0] + (b.points[j][0] - p[0]) * t,
      p[1] + (b.points[j][1] - p[1]) * t,
    ]);
    spec.startArrowhead = a.startArrowhead;
    spec.endArrowhead = a.endArrowhead;
  }
  specs.push(spec);
}
const newIds = ea.addElements(specs);
ea.selectElements(newIds);
ea.notify("已生成 " + n + " 个补间元素");
\`\`\`
`,Er=`# 选区加外框

给选中的整组元素套一个大外框（虚线矩形、透明底、自动垫到最底层）——圈重点、
做分组卡片、给示意图框版都靠它；对标 Obsidian Excalidraw 的 Box Selected Elements。

\`\`\`js
const ids = ea.getSelectedElements();
if (ids.length === 0) {
  ea.notify("请先选中要加外框的元素");
  return;
}
const box = ea.getBoundingBox(ids);
if (!box) {
  ea.notify("选区没有可框的内容");
  return;
}
const parsed = parseInt(await ea.utils.inputPrompt("外框边距（像素）", "number", String(ea.getScriptSetting("padding", 20))), 10);
if (isNaN(parsed)) return; // 取消/无效输入 = 什么都不做
const pad = Math.max(0, parsed);
const rectId = ea.addRect({
  x: box.minX - pad,
  y: box.minY - pad,
  width: box.maxX - box.minX + pad * 2,
  height: box.maxY - box.minY + pad * 2,
  backgroundColor: "transparent",
  strokeStyle: "dashed",
  strokeWidth: 1,
});
ea.toBack([rectId]);
ea.notify("已加外框（边距 " + pad + "px）");
\`\`\`
`,vr=`# 统一尺寸（选中 2 个以上）

把选中的形状统一到选区里最大的宽高（中心保持不动）——流程图节点大小不一的救星；
对标 Obsidian Excalidraw 的 Uniform size。文本与箭头不参与（尺寸由内容/端点决定）。

\`\`\`js
const ids = ea.getSelectedElements();
const shapes = ids
  .map((id) => ea.getElement(id))
  .filter((e) => e && (e.type === "rectangle" || e.type === "diamond" || e.type === "ellipse" || e.type === "image"));
if (shapes.length < 2) {
  ea.notify("请选中 2 个以上可调尺寸的形状（矩形/菱形/椭圆/图片）");
  return;
}
const maxW = Math.max(...shapes.map((e) => e.width ?? 0));
const maxH = Math.max(...shapes.map((e) => e.height ?? 0));
let changed = 0;
for (const e of shapes) {
  const dw = maxW - (e.width ?? 0);
  const dh = maxH - (e.height ?? 0);
  if (dw === 0 && dh === 0) continue;
  ea.setStyle([e.id], { width: maxW, height: maxH });
  ea.moveBy([e.id], -dw / 2, -dh / 2); // 中心保持不动
  changed++;
}
ea.notify("已把 " + changed + " 个形状统一到 " + Math.round(maxW) + "×" + Math.round(maxH));
\`\`\`
`,_r=`# 反转箭头

把选中箭头的头尾对调（起端箭头帽与末端互换，几何不动）——画完流程图想改方向
不用重画；对标 Obsidian Excalidraw 的 Reverse arrows。

\`\`\`js
const ids = ea.getSelectedElements();
const arrows = ids.map((id) => ea.getElement(id)).filter((e) => e && e.type === "arrow");
if (arrows.length === 0) {
  ea.notify("请选中要反转的箭头");
  return;
}
for (const el of arrows) {
  ea.setStyle([el.id], {
    startArrowhead: el.endArrowhead ?? null,
    endArrowhead: el.startArrowhead ?? null,
  });
}
ea.notify("已反转 " + arrows.length + " 支箭头");
\`\`\`
`,Ar=`# 形状互转

把选中的矩形/椭圆/菱形一键换成目标形状（位置、尺寸、样式全保留）——
画流程图常改主意；对标 Obsidian Excalidraw 的 Change shape。
绑定了文字的形状暂不换形（文字会掉，先解绑或删除文字再跑）。

\`\`\`js
const target = (await ea.utils.inputPrompt("目标形状：rectangle / ellipse / diamond", "text", "ellipse")).trim().toLowerCase();
if (target === "") return; // 取消 = 什么都不做
if (!["rectangle", "ellipse", "diamond"].includes(target)) {
  ea.notify("只支持 rectangle / ellipse / diamond");
  return;
}
const ids = ea.getSelectedElements();
const convertible = ids
  .map((id) => ea.getElement(id))
  .filter((e) => e && ["rectangle", "ellipse", "diamond"].includes(e.type) && e.type !== target);
const skippable = new Set(convertible.filter((e) => (e.boundElements ?? []).some((x) => x.type === "text")).map((e) => e.id));
const doable = convertible.filter((e) => !skippable.has(e.id));
if (doable.length === 0) {
  ea.notify("选区里没有可换形的形状（矩形/椭圆/菱形；绑文字的已跳过）");
  return;
}
const createdIds = [];
for (const e of doable) {
  const newId = ea.addElements([
    {
      type: target,
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height,
      angle: e.angle,
      strokeColor: e.strokeColor,
      backgroundColor: e.backgroundColor,
      fillStyle: e.fillStyle,
      strokeWidth: e.strokeWidth,
      strokeStyle: e.strokeStyle,
      roughness: e.roughness,
      opacity: e.opacity,
    },
  ])[0];
  createdIds.push(newId);
}
ea.deleteElements(doable.map((e) => e.id));
if (createdIds.length) ea.selectElements(createdIds);
ea.notify("已换形 " + createdIds.length + " 个" + (skippable.size ? "（跳过绑文字的 " + skippable.size + " 个）" : ""));
\`\`\`
`,Mr=`# 文字编号（按选择顺序）

给选中的文字前面加序号——1. 2. 3. / I. II. III. / A. B. C. / • 列表都行。
**直接点按钮** = 按脚本库 ⚙ 设置里的格式编号（默认数字）；选中的文字全都带编号时再点一次 = 全部去掉编号；
**按住 Shift 点按钮** = 弹出格式菜单自选（预勾选当前默认格式，点空白 = 不动）；
用 Shift 逐个点选文字，点选顺序就是编号顺序（拖框选择不保证顺序）。

\`\`\`js
const PREFIX_RE = /^\\s*(?:(\\d{1,3}|[IVXLCDM]+|[ivxlcdm]+|[A-Za-z])[.、)．:：]|[•◦‣▪·])\\s*/;
const ids = ea.getSelectedElements();
const texts = ids
  .map((id) => ea.getElement(id))
  .filter((e) => e && e.type === "text" && !e.containerId);
if (texts.length === 0) {
  ea.notify("请先用 Shift 逐个点选要编号的文字（绑在图形上的说明文字不参与）");
  return;
}
const allNumbered = texts.every((t) => PREFIX_RE.test(String(t.text ?? "")));
let fmt;
if (ea.getModifiers().shift) {
  // Shift+点按钮 = 显式重编号：菜单选格式（预勾选脚本库默认格式）；
  // 点空白 / Esc / 点菜单外 = 什么都不做
  const picked = await ea.utils.selectOption({
    options: [
      { value: "1", label: "数字", hint: "1. 2. 3." },
      { value: "2", label: "罗马大写", hint: "I. II. III." },
      { value: "3", label: "罗马小写", hint: "i. ii. iii." },
      { value: "4", label: "字母大写", hint: "A. B. C." },
      { value: "5", label: "字母小写", hint: "a. b. c." },
      { value: "6", label: "无序列表", hint: "• • •" },
    ],
    current: String(ea.getScriptSetting("format", "1")),
  });
  if (picked === null) return;
  fmt = parseInt(picked, 10);
} else if (allNumbered) {
  // 不按 Shift 且全都带编号 = toggle off：去掉编号
  for (const t of texts) ea.setText(t.id, String(t.text ?? "").replace(PREFIX_RE, ""));
  ea.notify("已去掉 " + texts.length + " 条文字的编号");
  return;
} else {
  // 不按 Shift 且存在无编号文字 = 按脚本库设置直跑（getScriptSetting 已校验，脏值回落默认 "1"）
  const parsed = parseInt(String(ea.getScriptSetting("format", "1")), 10);
  fmt = [1, 2, 3, 4, 5, 6].includes(parsed) ? parsed : 1;
}
const toRoman = (n) => {
  const tab = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let s = "";
  for (const [v, r] of tab) { while (n >= v) { s += r; n -= v; } }
  return s;
};
const toAlpha = (n) => {
  let s = "";
  while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
};
const prefixOf = (n) =>
  fmt === 2 ? toRoman(n) + "." :
  fmt === 3 ? toRoman(n).toLowerCase() + "." :
  fmt === 4 ? toAlpha(n) + "." :
  fmt === 5 ? toAlpha(n).toLowerCase() + "." :
  fmt === 6 ? "•" :
  n + ".";
for (let i = 0; i < texts.length; i++) {
  const body = String(texts[i].text ?? "").replace(PREFIX_RE, "");
  ea.setText(texts[i].id, prefixOf(i + 1) + " " + body);
}
const skipped = ids.length - texts.length;
ea.notify(
  "已给 " + texts.length + " 条文字编号" +
  (skipped > 0 ? "（跳过 " + skipped + " 个非文字/绑定文字元素）" : ""),
);
\`\`\`
`,$r=`# 荧光笔

把笔刷切到荧光笔并进入手绘工具，之后直接在画布上拖拽就行——对标 Obsidian Excalidraw
的 Highlighter tool。

颜色 / 粗细 / 透明度读的是插件设置里那一份，和右缘竖条色板**同一个配置**（在色板改完
这里立刻跟着变）。脚本侧刻意不带参数：两处各存一套迟早打架，竖向色板是唯一的调色入口。

\`\`\`js
ea.highlighter();
const p = ea.getPen();
ea.notify("荧光笔：" + p.color + " · 约 " + Math.round(p.width * 4.25) + "px · " + p.opacity + "%");
\`\`\`
`,Ir=`# 素材配方（改色 / 重新生成）

把「图片转轮廓」生成的素材按配方重做一遍：换墨色、整体透明度、缩放，或调每一层的浓淡与
简化程度。选中一个素材元素组即可——配方会从元素上读回来（不必先入库）。

前提：素材必须由「右缘竖条 → 图片转素材 → 轮廓（高保真）」生成，也只有那种素材才带
配方。普通的矩形/椭圆/手绘元素没有配方，脚本会直接提示。

- 墨色填\`#1e1e1e\` 这类 16 进制值；留空表示不改。
- 缩放填倍数（\`1.5\` = 放大五成）；留空表示不改。
- 整体透明度填 0-100；留空表示不改。
- 分层浓淡留空 = 用原配方；填 \`浓,淡,很浓 这样按层给（逗号分隔，从最淡到最浓）。

改完按「替换选中」直接改画布，或按「另存为新素材」写进素材库（可反复复用）。

\`\`\`js
const RECIPE_KEY = "excaliRecipe";

const ids = ea.getSelectedElements();
if (ids.length === 0) {
  ea.notify("请先选中一个「图片转轮廓」生成的素材");
  return;
}

const els = ids.map((id) => ea.getElement(id)).filter(Boolean);
const recipe = els.map((e) => e[RECIPE_KEY]).find(Boolean);
if (!recipe || typeof recipe !== "object" || !Array.isArray(recipe.layers)) {
  ea.notify("选区里没有配方：请用「图片转素材 → 轮廓（高保真）」生成后再选中它");
  return;
}

const box = ea.getBoundingBox(ids);
if (!box) {
  ea.notify("选区没有可处理的内容");
  return;
}

// 逐层读回原来的浓度；新的整体透明度与颜色留空 = 不改
const baseOpacity = els.length ? els[0].opacity : 100;
const baseColor = els.length ? els[0].backgroundColor : "#1e1e1e";

const color = (await ea.utils.inputPrompt("墨色（16 进制，如 #1e1e1e；留空不改）", "text", "")).trim();
const scaleRaw = (await ea.utils.inputPrompt("缩放倍数（留空不改）", "text", "")).trim();
const opacityRaw = (await ea.utils.inputPrompt("整体透明度 0-100（留空不改）", "text", "")).trim();
const layersRaw = (await ea.utils.inputPrompt("分层浓淡（逗号分隔，从最淡到最浓；留空沿用原配方）", "text", "")).trim();

const opacity = opacityRaw === "" ? baseOpacity : Math.max(1, Math.min(100, parseFloat(opacityRaw) || baseOpacity));
const scale = scaleRaw === "" ? 1 : Math.max(0.05, parseFloat(scaleRaw) || 1);

let layers = recipe.layers.slice();
if (layersRaw !== "") {
  const parts = layersRaw.split(/[,，]/).map((s) => parseFloat(s)).filter((n) => !isNaN(n));
  if (parts.length > 0) {
    layers = layers.map((l, i) => (i < parts.length ? Object.assign({}, l, { opacity: Math.max(1, Math.min(100, parts[i])) }) : l));
  }
}

const fill = color !== "" && /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : baseColor;
const changes = [];
if (fill !== baseColor) changes.push("颜色 " + baseColor + " → " + fill);
if (opacity !== baseOpacity) changes.push("透明度 " + baseOpacity + "% → " + opacity + "%");
if (scale !== 1) changes.push("缩放 ×" + scale);
if (layersRaw !== "") changes.push("分层 " + layersRaw);
if (changes.length === 0) {
  ea.notify("没有改动任何参数，什么都没做");
  return;
}

const patch = { backgroundColor: fill, opacity: opacity };
ea.setStyle(ids, patch);
if (scale !== 1) {
  // 等比缩放：先按倍数挪左上角，再按倍数改宽高（points 由引擎按新尺寸重算）
  const w = Math.max(1, Math.round(box.width * scale));
  const h = Math.max(1, Math.round(box.height * scale));
  ea.setPosition(ids[0], box.minX, box.minY);
  ea.setStyle(ids, { width: w, height: h });
}

// 配方随元素一起带走：setStyle 走 updateScene，未知字段引擎会原样保留
const nextRecipe = Object.assign({}, recipe, {
  strokeColor: fill,
  layers: layers,
  v: 1,
});
ea.setStyle(ids, { excaliRecipe: nextRecipe });

const where = await ea.utils.selectOption({
  options: [
    { value: "canvas", label: "替换选中（改画布上这一份）" },
    { value: "library", label: "另存为新素材（写进素材库）" },
  ],
});

if (where === "library") {
  const now = Date.now();
  await ea.addLibraryItem({
    id: "lib-recipe-" + now.toString(36),
    name: "配方素材 " + new Date(now).toLocaleTimeString(),
    elements: ea.getElements().filter((e) => ids.indexOf(e.id) >= 0),
    excaliRecipe: nextRecipe,
  });
  ea.notify("已写入素材库：" + changes.join("，"));
  return;
}

ea.notify("已按配方重做：" + changes.join("，"));
\`\`\`
`,Cr=`# 选区折叠为列表

把框选的一批元素折成一条「列表项」：**最上面的文本当折叠头**，其余整体收进它的
自定义字段，画布上只剩头 + 头左侧的圆点控制钮。点头（圆点）= 收起 / 展开，
带淡入淡出动画；每一步都能 ⌘Z 撤销，存盘后折叠状态不丢。

四种跑法（同一个按钮，脚本自己看状态分流）：
1. **折叠**：框选「头 + 所有下属元素」→ 跑一次 → 成员收进头，只剩头 + 三角；
2. **并入**：已折叠好的组，再选中「折叠头 + 想加进去的元素」→ 跑一次 → 新成员直接
   进这个组（不用解散重建）；折叠态下新成员会一起被藏起来；
3. **恢复原样**：只选中折叠头（单选它就够，不用再框选下属）→ 再跑一次 → 快照成员
   按「头的当前位置 + 相对偏移」回到画布、头上的折叠字段与编组关系被清除——和折叠前
   一模一样；画布上只有一个折叠时，不选任何东西直接点按钮也行（按钮即开关）；
4. **日常收放**：之后不再用脚本，点头部左侧三角即可（收起/展开切换，带动画）；
   三角上**右键**还有「并入 / 解散」菜单。

移动与跟随：折叠时头与成员会被编成**原生编组**（展开态拖头，整组一起动，撤销也是
一步），并记下每个成员**相对头的偏移**——折叠态下把头拖走，之后展开时成员仍回到它
该在的位置（跟着头走）。

与「画框折叠」的分工：那个把元素收进画框（frame，整块场景收放）；本脚本把元素
收进普通文本（列表收放，不占画布结构）。两者可同时用。

已知边界：成员自带的**自定义字段**（如素材配方）不保留；普通元素（文本/位置/字号/
字体/行高/竖向对齐/绑定关系）无损，还原时按折叠时的层序排回原位。解散时快照里已在
画布上的成员不会重复插入（防同 id 两个元素）。

\`\`\`js
// 元素的 z 序（vendor 的 index：场景更新后是数字，早期版本是 "a3" 这类串）
const zIdx = (e) => {
  const raw = e && e.index;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const m = /^\\D*(\\d+)/.exec(raw);
    if (m) return Number(m[1]);
  }
  return Number.MAX_SAFE_INTEGER;
};
// 折叠组的原生编组 id（与头 id 派生，稳定）——头与成员同组，展开态拖头整组跟随
const groupIdFor = (headId) => "g-" + headId;
// 成员相对头的偏移（头动 → 成员跟着走的依据）
const offsetsOf = (head, members) =>
  members.map((m) => ({
    id: m.id,
    dx: (m.x || 0) - (head.x || 0),
    dy: (m.y || 0) - (head.y || 0),
  }));
// 按「头的当前位置 + 偏移」给快照成员定位置（展开/解散时用）
const placeByOffsets = (members, head, offsets) => {
  const map = new Map((offsets || []).map((o) => [o.id, o]));
  return members.map((m) => {
    const off = map.get(m.id);
    if (!off) return m;
    return { ...m, x: (head.x || 0) + off.dx, y: (head.y || 0) + off.dy };
  });
};
// 这个折叠头已经有哪些成员（并入时判重）
const memberIdsOf = (head) => {
  const tg = head.excaliToggle || {};
  if (Array.isArray(tg.offsets)) return tg.offsets.map((o) => o.id);
  if (Array.isArray(tg.memberIds)) return tg.memberIds.slice();
  if (Array.isArray(tg.elements)) return tg.elements.map((e) => e.id);
  return [];
};
const ids = ea.getSelectedElements();
let els = ids.map((id) => ea.getElement(id)).filter((e) => e && e.isDeleted !== true);
const allHeads = ea.getElements().filter(
  (e) => e.excaliToggle && typeof e.excaliToggle.collapsed === "boolean" && e.isDeleted !== true,
);
// 没选区也允许「再点一次」：画布上恰好只有一个折叠时，它就是这次的目标
if (els.length === 0 && allHeads.length === 1) els = allHeads.slice();

// ① 选区里已有折叠头 → 并入（头 + 其它元素）或解散（只选了头）
const heads = els.filter(
  (e) => e.excaliToggle && typeof e.excaliToggle.collapsed === "boolean",
);
if (heads.length > 0) {
  const alive = new Set(ea.getElements().map((e) => e.id));
  const head = heads[0];
  const snap = head.excaliToggle;
  const known = new Set(memberIdsOf(head));
  const outsiders = els.filter((e) => e.id !== head.id && !known.has(e.id));
  if (outsiders.length > 0) {
    // 并入：新成员进这个折叠组（不用解散重建）
    const gid = snap.groupId || groupIdFor(head.id);
    const offs = (snap.offsets || []).slice();
    const elements = snap.collapsed ? (snap.elements || []).slice() : [];
    const memberIds = snap.collapsed ? [] : (snap.memberIds || []).slice();
    for (const n of outsiders) {
      offs.push({ id: n.id, dx: (n.x || 0) - (head.x || 0), dy: (n.y || 0) - (head.y || 0) });
      if (snap.collapsed) {
        // 快照里带上编组关系（展开后成员才跟头走）——不必真去改画布上的成员
        elements.push(Object.assign(JSON.parse(JSON.stringify(n)), { groupIds: [gid] }));
      } else {
        memberIds.push(n.id);
      }
    }
    const next = { collapsed: snap.collapsed, groupId: gid, offsets: offs };
    if (snap.collapsed) next.elements = elements;
    else next.memberIds = memberIds;
    if (Array.isArray(snap.order)) next.order = snap.order;
    if (!snap.collapsed) {
      // 展开态：新成员留在画布上，得真给它们打上编组关系
      ea.setStyle(outsiders.map((e) => e.id), { groupIds: [gid] });
    }
    ea.setStyle([head.id], { groupIds: [gid], excaliToggle: next });
    if (snap.collapsed) ea.deleteElements(outsiders.map((n) => n.id));
    ea.notify("已并入 " + outsiders.length + " 个元素到这个折叠");
  } else {
    // 解散：成员按「头的当前位置 + 偏移」回场，字段与编组关系一并清掉
    const members = placeByOffsets((snap.elements || []).slice(), head, snap.offsets);
    const missing = members.filter((m) => !alive.has(m.id));
    if (missing.length > 0) ea.addElements(missing);
    if (Array.isArray(snap.order) && snap.order.length > 0) ea.reorderElements(snap.order);
    // 退出编组（拆组，否则留着半个空组）
    ea.setStyle([head.id], { groupIds: [] });
    if (members.length > 0) ea.setStyle(members.map((m) => m.id), { groupIds: [] });
    // undefined：内存里即时失效，存盘时 JSON.stringify 直接丢掉这个键——完全无痕
    ea.setStyle([head.id], { excaliToggle: undefined });
    ea.notify(
      "已恢复原样：" + heads.length + " 个折叠已消除" +
        (missing.length > 0 ? "，" + missing.length + " 个成员回到画布" : "（成员已在画布上）"),
    );
  }
} else if (els.length < 2) {
  ea.notify(
    allHeads.length > 1
      ? "画布上有 " + allHeads.length + " 个折叠：先选中要恢复的那个折叠头（单选即可），再跑一次"
      : "先框选至少 2 个元素：最上面的当折叠头，其余收进它",
  );
} else {
  // ② 折叠模式：最上的文本当头，其余收进快照后删除（先存后删防数据丢失）
  els.sort((a, b) => a.y - b.y || a.x - b.x);
  const head = els.find((e) => e.type === "text") ?? els[0];
  const members = els.filter((e) => e.id !== head.id).sort((a, b) => zIdx(a) - zIdx(b));
  // 原生编组：头与成员同组 ⇒ 展开态拖头，vendor 原生带着整组一起动（撤销也正确）
  // 编组关系直接写进快照（成员马上要被删，不必真去改画布上的它们）——折叠仍是 2 步撤销
  const gid = groupIdFor(head.id);
  const order = ea.getElements().map((e) => e.id);
  ea.setStyle([head.id], {
    groupIds: [gid],
    excaliToggle: {
      collapsed: true,
      groupId: gid,
      offsets: offsetsOf(head, members),
      elements: members.map((m) => Object.assign(JSON.parse(JSON.stringify(m)), { groupIds: [gid] })),
      order,
    },
  });
  ea.deleteElements(members.map((m) => m.id));
  const label = typeof head.text === "string" && head.text.trim() ? head.text.trim().slice(0, 12) : "元素";
  ea.notify("已把 " + members.length + " 个元素收进「" + label + "」，点头部左侧圆点展开 / 收起；再跑一次本脚本可恢复原样");
}
\`\`\`
`,Rr=`# 画框折叠 / 展开

选中一个画框（frame）后运行。**折叠** = 把框内元素整体收进画框的
自定义字段、画框缩成标签条；**展开** = 原样还原。可反复切换，
每一步都进撤销栈（⌘Z 可退），存盘后折叠状态不丢（成员在快照里）。

机制：快照 \`excaliCollapsed\` 挂在画框元素上（引擎 restore 的
\`...element\` 展开保证自定义字段往返存活），成员以绝对坐标深拷贝，
展开时按画框位移量整体平移归位、并重新挂回画框（frameId）。

已知边界（演示版）：成员还原后 frameId 会补挂，但自带自定义字段
（如素材配方 excaliRecipe）或绑定关系（绑定文字/箭头 boundElements）
不保留——普通元素无损。

\`\`\`js
const sel = ea.getSelectedElements().map((id) => ea.getElement(id)).filter(Boolean);
const frame = sel.find((e) => e.type === "frame");
if (!frame) {
  ea.notify("请先选中一个画框：点画框的边框/标签选中它（不要点进框内空白）");
} else {
  const snap = frame.excaliCollapsed;
  if (snap && Array.isArray(snap.elements) && snap.elements.length > 0) {
    // ---------- 展开 ----------
    const dx = frame.x - (snap.fx ?? frame.x);
    const dy = frame.y - (snap.fy ?? frame.y);
    ea.addElements(
      snap.elements.map((e) => ({ ...e, frameId: frame.id, x: e.x + dx, y: e.y + dy })),
    );
    ea.setStyle([frame.id], {
      excaliCollapsed: null,
      width: snap.fw ?? frame.width,
      height: snap.fh ?? frame.height,
      name: snap.name ?? null,
    });
    ea.notify("已展开 " + snap.elements.length + " 个元素归位");
  } else {
    // ---------- 折叠 ----------
    const members = ea
      .getElements()
      .filter((e) => e.frameId === frame.id && e.id !== frame.id && e.isDeleted !== true);
    if (members.length === 0) {
      ea.notify("这个画框是空的：往里拖元素（或框选后建组）才会归框");
    } else {
      // 必须先存快照再删成员——反了的话中途失败就是数据丢失
      const payload = {
        name: frame.name ?? null,
        fw: frame.width,
        fh: frame.height,
        fx: frame.x,
        fy: frame.y,
        elements: JSON.parse(JSON.stringify(members)),
      };
      ea.setStyle([frame.id], {
        excaliCollapsed: payload,
        height: 44,
        name: (frame.name || "画框") + "（" + members.length + "）",
      });
      ea.deleteElements(members.map((e) => e.id));
      ea.notify(
        "已折叠 " + members.length + " 个元素，画框缩成标签条；再跑一次还原",
      );
    }
  }
}
\`\`\`
`,Pt=[{file:"mindmap-from-headings.md",content:ur},{file:"table-from-markdown.md",content:pr},{file:"flowchart-from-list.md",content:gr},{file:"batch-import-images.md",content:mr},{file:"align-and-distribute.md",content:yr},{file:"number-badges.md",content:br},{file:"smart-connect.md",content:xr},{file:"kanban-from-list.md",content:wr},{file:"export-steps.md",content:Sr},{file:"repeat-tween.md",content:kr},{file:"box-selection.md",content:Er},{file:"uniform-size.md",content:vr},{file:"reverse-arrows.md",content:_r},{file:"change-shape.md",content:Ar},{file:"text-numbering.md",content:Mr},{file:"highlighter.md",content:$r},{file:"material-recipe.md",content:Ir},{file:"selection-fold.md",content:Cr},{file:"frame-collapse.md",content:Rr}],Tr=new Set(Pt.map(n=>n.file));async function jn(n,t,e){const i=[],s=r=>(...d)=>{try{i.push(`[${r}] ${d.map(l=>typeof l=="string"?l:JSON.stringify(l)).join(" ")}`)}catch{i.push(`[${r}] <无法序列化的输出>`)}},o={log:s("log"),warn:s("warn"),error:s("error"),info:s("log"),debug:s("log")},a=Date.now();try{return await new Function("ea","utils","console",`"use strict";
return (async () => {
${n}
})();`)(t,e,o),{ok:!0,logs:i,durationMs:Date.now()-a}}catch(r){const d=r instanceof Error?`${r.message}
${r.stack??""}`:String(r);return{ok:!1,logs:i,error:d,durationMs:Date.now()-a}}}let Hn=0;function Ne(n="ea"){return Hn+=1,`${n}-${Date.now().toString(36)}-${Hn.toString(36)}`}function rt(n,t){let e=0;for(const i of n)e+=/[\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]/.test(i)?1:.56;return Math.ceil(e*t)}function Lr(n){let t=n.x,e=n.y,i=n.x+n.width,s=n.y+n.height;if(n.points&&n.points.length>0){t=e=1/0,i=s=-1/0;for(const[a,r]of n.points)t=Math.min(t,n.x+a),e=Math.min(e,n.y+r),i=Math.max(i,n.x+a),s=Math.max(s,n.y+r)}const o=n.angle??0;if(o!==0){const a=(t+i)/2,r=(e+s)/2,d=Math.cos(o),l=Math.sin(o),c=[[t,e],[i,e],[t,s],[i,s]];let p=1/0,h=1/0,f=-1/0,u=-1/0;for(const[x,b]of c){const m=x-a,y=b-r,w=a+m*d-y*l,k=r+m*l+y*d;p=Math.min(p,w),h=Math.min(h,k),f=Math.max(f,w),u=Math.max(u,k)}t=p,e=h,i=f,s=u}return{minX:t,minY:e,maxX:i,maxY:s,width:i-t,height:s-e,cx:(t+i)/2,cy:(e+s)/2}}function wt(n){if(n.length===0)return null;const t=n.map(Lr),e=Math.min(...t.map(a=>a.minX)),i=Math.min(...t.map(a=>a.minY)),s=Math.max(...t.map(a=>a.maxX)),o=Math.max(...t.map(a=>a.maxY));return{minX:e,minY:i,maxX:s,maxY:o,width:s-e,height:o-i,cx:(e+s)/2,cy:(i+o)/2}}function zn(n,t){if((n.angle??0)!==0)return{x:n.x+n.width/2,y:n.y+n.height/2};switch(t){case"top":return{x:n.x+n.width/2,y:n.y};case"bottom":return{x:n.x+n.width/2,y:n.y+n.height};case"left":return{x:n.x,y:n.y+n.height/2};case"right":return{x:n.x+n.width,y:n.y+n.height/2}}}function Xt(n,t){const e=t.x+t.width/2-(n.x+n.width/2),i=t.y+t.height/2-(n.y+n.height/2);return Math.abs(e)>=Math.abs(i)?e>=0?"right":"left":i>=0?"bottom":"top"}function Yi(n,t,e){const i=/[\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]/,s=d=>i.test(d)?1:.56,o=d=>[...d].reduce((l,c)=>l+s(c),0),a=t/e,r=[];for(const d of n.split(`
`)){const l=d.match(/[\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]|[^\s\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]+\s*|\s+/g)??[];let c="";const p=()=>{r.push(c.replace(/\s+$/,"")),c=""};for(const h of l){if(c===""&&/^\s+$/.test(h))continue;const f=h.replace(/\s+$/,"");if(c!==""&&o(c.replace(/\s+$/,""))+o(f)>a&&p(),o(f)<=a){c+=h;continue}for(const u of h)c===""&&/\s/.test(u)||(c!==""&&!/\s/.test(u)&&o(c)+s(u)>a&&p(),c+=u)}p()}return r}function Xn(n,t,e="",i={}){const s=a=>n.addElements([a])[0]??"";return{addRect:a=>s({...a,type:"rectangle"}),addDiamond:a=>s({...a,type:"diamond"}),addEllipse:a=>s({...a,type:"ellipse"}),addArrow:a=>s({...a,type:"arrow"}),addLine:a=>s({...a,type:"line"}),addText:a=>s({...a,type:"text"}),addFrame:a=>s({...a,type:"frame"}),addImage:(a,r)=>n.addImage(a,r),getElements:()=>n.getElements(),getElement:a=>n.getElements().find(r=>r.id===a),addElements:a=>n.addElements(a.map(r=>({...r,type:r.type??"rectangle"}))),deleteElements:a=>n.deleteElements(a),reorderElements:a=>n.reorderElements(a),clear:()=>n.clear(),selectElements:a=>n.selectElements(a),setStyle:(a,r)=>{const d=a==="selection"?Object.keys(n.getAppState().selectedElementIds??{}):a;d.length!==0&&n.patchElements(d,r)},setText:(a,r)=>{const d=n.getElements().find(h=>h.id===a);if(!d||d.type!=="text")return;const l=d.fontSize??20,c=d.lineHeight??1.25,p=String(r).split(`
`);n.patchElements([a],{text:r,originalText:r,width:Math.max(1,...p.map(h=>rt(h,l))),height:Math.ceil(l*c*p.length)})},zoomToFit:()=>n.scrollToContent(),scrollToElement:a=>n.scrollToElement(a),getViewMode:()=>!!n.getAppState().viewModeEnabled,setViewMode:a=>n.setViewMode(a),getBackground:()=>n.getAppState().viewBackgroundColor??"",setBackground:a=>n.updateScene({viewBackgroundColor:a}),setLink:(a,r)=>{const d=a==="selection"?Object.keys(n.getAppState().selectedElementIds??{}):a;d.length!==0&&n.patchElements(d,{link:r})},getLink:a=>{const r=n.getElements().find(d=>d.id===a);return r&&typeof r.link=="string"?r.link:null},exportSVG:(a,r)=>n.exportImage("svg",a,r),exportPNG:(a,r)=>n.exportImage("png",a,r),save:()=>t.save(),notify:a=>t.notify(a),getDocMarkdown:()=>t.getDocMarkdown(),getSelectedText:()=>t.getSelectedText(),listFiles:a=>t.listFiles(a),addImageFromFile:async(a,r)=>{const d=await t.readFileAsDataURL(a);return n.addImage(d,r)},settings:t.getSettings(),targetView:{getTitle:()=>"board"},getSelectedElements:()=>Object.keys(n.getAppState().selectedElementIds??{}),getBoundingBox:a=>{const r=a==="selection"?Object.keys(n.getAppState().selectedElementIds??{}):a;if(r.length===0)return null;const d=new Set(r),l=n.getElements().filter(c=>d.has(c.id));return wt(l)},connectObjects:(a,r,d,l,c)=>n.connectObjects(a,r,d,l,c),group:a=>{if(a.length<2)return null;const r=Ne("group");return n.patchElements(a,{groupIds:[r]}),r},unGroup:a=>{n.patchElements(a,{groupIds:[]})},toFront:a=>Un(n,a,"front"),toBack:a=>Un(n,a,"back"),setPosition:(a,r,d)=>n.patchElements([a],{x:r,y:d}),moveBy:(a,r,d)=>{const l=a==="selection"?Object.keys(n.getAppState().selectedElementIds??{}):a;for(const c of l){const p=n.getElements().find(h=>h.id===c);p&&n.patchElements([c],{x:p.x+r,y:p.y+d})}},measureText:(a,r=20)=>({width:rt(a,r),height:Math.ceil(r*1.25)}),wrapText:(a,r,d=20)=>Yi(a,r,d),addEmbeddable:(a,r)=>n.addEmbeddable(a,r),addLibraryItem:a=>n.addLibraryItem(a),getTheme:()=>n.getTheme(),setTheme:a=>n.setTheme(a),getPen:()=>n.getPen(),setPen:a=>{const r=n.getPen(),d={color:a.color??r.color,width:a.width??r.width,opacity:a.opacity??r.opacity,roughness:a.roughness??r.roughness};n.applyPen({...Qt(d),roughness:d.roughness},a.tool)},highlighter:()=>n.applyPen({...t.getHighlighter(),roughness:No},"freedraw"),siyuan:{call:(a,r)=>t.siyuanCall(a,r??{})},getModifiers:()=>({shift:!!i.shift}),getScriptSetting:(a,r)=>{const d=t.getScriptSetting(e,a);return d===void 0?r:d},setScriptSetting:(a,r)=>t.setScriptSetting(e,a,r),utils:{uuid:()=>Ne("uuid"),now:()=>Date.now(),parseHeadings:sr,parseList:ar,parseTable:or,inputPrompt:async(a,r="text",d="")=>await t.inputPrompt(a,r,d)??"",selectOption:a=>t.selectOption({...a,at:a.at??i.at})}}}function Un(n,t,e){const i=[...n.getElements()].sort((d,l)=>String(d.index??"").localeCompare(String(l.index??"")));if(i.length===0)return;const s=new Set(t),o=i.filter(d=>s.has(d.id)),a=i.filter(d=>!s.has(d.id));if(o.length===0||a.length===0)return;(e==="front"?[...a,...o]:[...o,...a]).forEach((d,l)=>{const c=String(i[l].index??"");String(d.index??"")!==c&&n.patchElements([d.id],{index:c})})}const oe={pencil:{background:"#fffdf7",ink:"#1e1e1e",fill:"#ffffff",edge:"#495057",muted:"#868e96",strokeWidth:2,roughness:1,fillStyle:"solid",strokeStyle:"solid",fontFamily:5,fontSizes:{title:28,node:16,edge:14,caption:14},nodeRoundness:{type:3}},marker:{background:"#ffffff",ink:"#1e1e1e",fill:"#ffec99",fillPalette:["#ffec99","#b2f2bb","#a5d8ff","#ffc9c9","#d0bfff","#ffd8a8","#c3fae8","#e9fac8"],edge:"#e03131",muted:"#868e96",strokeWidth:2,roughness:1,fillStyle:"solid",strokeStyle:"solid",fontFamily:5,fontSizes:{title:28,node:16,edge:14,caption:14},nodeRoundness:{type:3}},blueprint:{background:"#f8fbff",ink:"#1971c2",fill:"#e7f5ff",edge:"#1971c2",muted:"#4dabf7",strokeWidth:1,roughness:0,fillStyle:"solid",strokeStyle:"solid",fontFamily:3,fontSizes:{title:26,node:15,edge:13,caption:12},nodeRoundness:{type:3}}},Pr=Object.keys(oe),ht=new Map,ne=new Map,Or=8,Dr={hand:"pencil",handdrawn:"pencil","hand-drawn":"pencil",sketch:"pencil",ink:"pencil",color:"marker",colour:"marker",crayon:"marker",vivid:"marker",highlight:"marker",technical:"blueprint",line:"blueprint",wireframe:"blueprint",mono:"blueprint"};function St(n){return n.trim().toLowerCase().replace(/[\s_]+/g,"-").replace(/[^a-z0-9._-]/g,"").replace(/^-+|-+$/g,"")}function Br(n){if(typeof n!="string")return null;const t=St(n);if(t in oe)return t;const e=Dr[t];return e||(ht.has(t)?t:null)}function Nr(n){return St(n)in oe||ht.has(St(n))}function Fr(n,t){ht.set(n,t),ne.clear()}function jr(){ht.clear(),ne.clear()}function Hr(n){return ht.get(n)?.extendsFrom??null}function Gi(){return[...Pr,...[...ht.keys()].sort()]}function Wi(n,t){const e=ne.get(n);if(e)return e;const i=oe[n];if(i)return i;const s=ht.get(n);if(!s)throw new Error(`style:unknown-style (${n})`);if(t.includes(n)||t.length>=Or)throw new Error(`style:circular-extends (${[...t,n].join(" <- ")})`);const o=Wi(s.extendsFrom,[...t,n]),a=s.diff.fontSizes,r={...o,...s.diff,fontSizes:{title:a?.title??o.fontSizes.title,node:a?.node??o.fontSizes.node,edge:a?.edge??o.fontSizes.edge,caption:a?.caption??o.fontSizes.caption},...s.diff.space?{space:{...o.space,...s.diff.space}}:{},...s.diff.fillPalette?{fillPalette:s.diff.fillPalette.slice()}:{}};return ne.set(n,r),r}function ae(n){return Wi(n,[])}function zr(n){let t=2166136261;for(let e=0;e<n.length;e++)t^=n.charCodeAt(e),t=Math.imul(t,16777619);return t>>>0}function Xr(n,t,e){const i=n.groupColor?.roles;if(n.groupColor?.mode==="roles"&&e&&i){const a=i[e]??i[e.toLowerCase()];if(a)return a}const s=n.fillPalette;if(!s||s.length===0)return n.fill;const o=e&&e!==""?`g:${e}`:`i:${t}`;return s[zr(o)%s.length]}const ie={margin:20,bendPenalty:48,overlapPenalty:2,portPenalty:160},Ut=["top","right","bottom","left"],Yn={top:[0,-1],right:[1,0],bottom:[0,1],left:[-1,0]},Ur=[0,1,0,-1],Yr=[-1,0,1,0],O=.01;function re(n,t){return{minX:n.x-t,minY:n.y-t,maxX:n.x+n.width+t,maxY:n.y+n.height+t}}function Gn(n,t){switch(t){case"top":return{x:n.x+n.width/2,y:n.y};case"bottom":return{x:n.x+n.width/2,y:n.y+n.height};case"left":return{x:n.x,y:n.y+n.height/2};case"right":return{x:n.x+n.width,y:n.y+n.height/2}}}function Wn(n){const t=[];for(const e of[...n].sort((i,s)=>i-s))(!t.length||e-t[t.length-1]>.5)&&t.push(e);return t}function Zn(n){const t=Wn(n),e=[];for(let i=0;i+1<t.length;i++)e.push((t[i]+t[i+1])/2);return Wn([...t,...e])}function Zi(n,t=ie.margin){const e=n.map(u=>re(u,t)),i=Math.min(...e.map(u=>u.minX))-t,s=Math.max(...e.map(u=>u.maxX))+t,o=Math.min(...e.map(u=>u.minY))-t,a=Math.max(...e.map(u=>u.maxY))+t,r=Zn([i,s,...e.flatMap(u=>[u.minX,u.maxX]),...n.map(u=>u.x+u.width/2)]),d=Zn([o,a,...e.flatMap(u=>[u.minY,u.maxY]),...n.map(u=>u.y+u.height/2)]),l=r.length,c=d.length,p=new Uint8Array(l*c),h=new Uint8Array(l*c),f=new Uint8Array(l*c);for(const u of e){for(let x=0;x<c;x++){const b=d[x];if(b<u.minY-O||b>u.maxY+O)continue;const m=b>u.minY+O&&b<u.maxY-O;for(let y=0;y<l;y++){const w=r[y];if(w<u.minX-O||w>u.maxX+O)continue;const k=w>u.minX+O&&w<u.maxX-O,S=x*l+y;k&&m&&(p[S]=1),m&&y+1<l&&r[y+1]>u.minX+O&&w<u.maxX-O&&(h[S]=1),k&&x+1<c&&d[x+1]>u.minY+O&&b<u.maxY-O&&(f[S]=1)}for(let y=0;y+1<l;y++)m&&r[y]<=u.minX+O&&r[y+1]>u.minX+O&&(h[x*l+y]=1)}for(let x=0;x<l;x++){const b=r[x];if(b>u.minX+O&&b<u.maxX-O)for(let m=0;m+1<c;m++)d[m]<=u.minY+O&&d[m+1]>u.minY+O&&(f[m*l+x]=1)}}return{boxes:n,margin:t,xs:r,ys:d,blocked:p,hBlocked:h,vBlocked:f,hUse:new Uint16Array(l*c),vUse:new Uint16Array(l*c)}}class Gr{constructor(){this.keys=[],this.values=[]}get size(){return this.keys.length}push(t,e){const i=this.keys,s=this.values;i.push(t),s.push(e);let o=i.length-1;for(;o>0;){const a=o-1>>1;if(i[a]<=i[o])break;[i[a],i[o]]=[i[o],i[a]],[s[a],s[o]]=[s[o],s[a]],o=a}}pop(){const t=this.keys,e=this.values,i=e[0],s=t.pop(),o=e.pop();if(t.length){t[0]=s,e[0]=o;let a=0;for(;;){const r=a*2+1,d=r+1;let l=a;if(r<t.length&&t[r]<t[l]&&(l=r),d<t.length&&t[d]<t[l]&&(l=d),l===a)break;[t[l],t[a]]=[t[a],t[l]],[e[l],e[a]]=[e[a],e[l]],a=l}}return i}}function Yt(n,t){let e=0,i=n.length-1;for(;e<=i;){const s=e+i>>1;if(Math.abs(n[s]-t)<.5)return s;n[s]<t?e=s+1:i=s-1}return-1}function Wr(n,t,e,i,s,o,a,r){const{xs:d,ys:l,blocked:c,hBlocked:p,vBlocked:h,hUse:f,vUse:u}=n,x=d.length,b=l.length,m=new Float64Array(x*b*4).fill(1/0),y=new Int32Array(x*b*4).fill(-1),w=new Gr,k=(M,_)=>Math.abs(d[M]-d[s])+Math.abs(l[_]-l[o]),S=(e*x+t)*4+i;m[S]=0,w.push(k(t,e),S);let v=-1,E=1/0;for(;w.size;){const M=w.pop(),_=M&3,A=M>>2,R=A%x,D=(A-R)/x,P=m[M];if(P+k(R,D)>=E)break;if(R===s&&D===o){const T=P+(_===a?0:r.bendPenalty*(_===(a+2&3)?2:1));T<E&&(E=T,v=M);continue}for(let T=0;T<4;T++){if(T===(_+2&3))continue;const L=R+Ur[T],j=D+Yr[T];if(L<0||j<0||L>=x||j>=b)continue;const J=j*x+L;if(c[J])continue;const z=T===1?A:T===3?J:T===2?A:J,nt=T===1||T===3;if(nt?p[z]:h[z])continue;const it=Math.abs(nt?d[L]-d[R]:l[j]-l[D]),ce=nt?f[z]:u[z],vt=P+it+(T===_?0:r.bendPenalty)+(ce?it*r.overlapPenalty:0),ut=J*4+T;vt<m[ut]&&(m[ut]=vt,y[ut]=M,w.push(vt+k(L,j),ut))}}if(v<0)return null;const I=[];for(let M=v;M>=0;M=y[M]){const _=M>>2,A=_%x;I.push([A,(_-A)/x])}return I.reverse(),{cost:E,cells:I}}function Zr(n){const t=[];for(const e of n){const i=t[t.length-1];if(!(i&&Math.abs(i.x-e.x)<O&&Math.abs(i.y-e.y)<O))for(t.push(e);t.length>=3;){const[s,o,a]=t.slice(-3);if(!(Math.abs(s.x-o.x)<O&&Math.abs(o.x-a.x)<O||Math.abs(s.y-o.y)<O&&Math.abs(o.y-a.y)<O))break;t.splice(t.length-2,1)}}return t}function qn(n,t){const e=t.x+t.width/2-(n.x+n.width/2),i=t.y+t.height/2-(n.y+n.height/2),s=e>=0?"right":"left",o=i>=0?"bottom":"top";return Math.abs(e)>=Math.abs(i)?[s,o]:[o,s]}function qr(n,t,e,i=[],s=ie,o=new Map,a=Zi(n,s.margin)){const r=n.find(m=>m.id===t),d=n.find(m=>m.id===e);if(!r||!d||r===d)return null;const l=a.margin;let c=null,p=[];const h=m=>{let y=1/0;for(const[w,k]of m){const S=Gn(r,w),v=Gn(d,k),[E,I]=Yn[w],[M,_]=Yn[k],A=Yt(a.xs,S.x+E*l),R=Yt(a.ys,S.y+I*l),D=Yt(a.xs,v.x+M*l),P=Yt(a.ys,v.y+_*l);if(A<0||R<0||D<0||P<0)continue;const T=Ut.indexOf(w),L=Ut.indexOf(k)+2&3,j=Wr(a,A,R,T,D,P,L,s);if(!j)continue;const J=o.get(`${r.id}:${w}`),z=o.get(`${d.id}:${k}`),nt=(J?.in?1:0)+(z?.out?1:0),it=j.cost+2*l+nt*s.portPenalty;if(it<y){y=it,p=j.cells;const ce=j.cells.map(([vt,ut])=>({x:a.xs[vt],y:a.ys[ut]}));c={side1:w,side2:k,path:Zr([S,...ce,v])}}}},f=Kr(r,d,a,o);if(f)return Kn(f,[],r,d,a,o,i),f;const u=qn(r,d),x=qn(d,r);h(u.flatMap(m=>x.map(y=>[m,y]))),c||h(Ut.flatMap(m=>Ut.map(y=>[m,y])));const b=c;return b?(Kn(b,p,r,d,a,o,i),b):null}function Kn(n,t,e,i,s,o,a){const r=`${e.id}:${n.side1}`,d=`${i.id}:${n.side2}`;o.set(r,{in:o.get(r)?.in??0,out:(o.get(r)?.out??0)+1}),o.set(d,{in:(o.get(d)?.in??0)+1,out:o.get(d)?.out??0});const l=s.xs.length;for(let c=0;c+1<t.length;c++){const[p,h]=t[c],[f,u]=t[c+1];h===u?s.hUse[h*l+Math.min(p,f)]++:s.vUse[Math.min(h,u)*l+p]++}for(let c=0;c+1<n.path.length;c++){const p=n.path[c],h=n.path[c+1];a.push({x1:p.x,y1:p.y,x2:h.x,y2:h.y})}}function Kr(n,t,e,i){const s=e.margin,o=(w,k)=>{const S=k==="x"?w.x:w.y,v=k==="x"?w.width:w.height;return w.shape==="diamond"||w.shape==="ellipse"?[S+v/2,S+v/2]:[S+12,S+v-12]},a=[],[r,d]=o(n,"x"),[l,c]=o(t,"x"),p=Math.max(r,l),h=Math.min(d,c);if(h>=p){const w=(p+h)/2;n.y+n.height+2*s<=t.y?a.push({side1:"bottom",side2:"top",path:[{x:w,y:n.y+n.height},{x:w,y:t.y}]}):t.y+t.height+2*s<=n.y&&a.push({side1:"top",side2:"bottom",path:[{x:w,y:n.y},{x:w,y:t.y+t.height}]})}const[f,u]=o(n,"y"),[x,b]=o(t,"y"),m=Math.max(f,x),y=Math.min(u,b);if(y>=m){const w=(m+y)/2;n.x+n.width+2*s<=t.x?a.push({side1:"right",side2:"left",path:[{x:n.x+n.width,y:w},{x:t.x,y:w}]}):t.x+t.width+2*s<=n.x&&a.push({side1:"left",side2:"right",path:[{x:n.x,y:w},{x:t.x+t.width,y:w}]})}for(const w of a){const[k,S]=w.path;if(!e.boxes.some(E=>E!==n&&E!==t&&qi(k,S,re(E,s/2)))&&!(i.get(`${n.id}:${w.side1}`)?.in||i.get(`${t.id}:${w.side2}`)?.out))return w}return null}function Jr(n,t,e,i=8){const s=n.find(f=>f.id===t),o=n.find(f=>f.id===e);if(!s||!o||s===o)return null;const a={x:s.x+s.width/2,y:s.y+s.height/2},r={x:o.x+o.width/2,y:o.y+o.height/2},d=r.x-a.x,l=r.y-a.y;if(Math.abs(d)<O&&Math.abs(l)<O)return null;const c=(f,u)=>{const x=Math.abs(d)<O?1/0:f.width/2/Math.abs(d),b=Math.abs(l)<O?1/0:f.height/2/Math.abs(l),m=Math.min(x,b),y={x:f.x+f.width/2,y:f.y+f.height/2};return{x:y.x+u*d*m,y:y.y+u*l*m}},p=c(s,1),h=c(o,-1);for(const f of n)if(!(f===s||f===o)&&qi(p,h,re(f,i)))return null;return[p,h]}function qi(n,t,e){let i=0,s=1;const o=t.x-n.x,a=t.y-n.y,r=[[-o,n.x-e.minX],[o,e.maxX-n.x],[-a,n.y-e.minY],[a,e.maxY-n.y]];for(const[d,l]of r){if(Math.abs(d)<1e-9){if(l<0)return!1;continue}const c=l/d;if(d<0?i=Math.max(i,c):s=Math.min(s,c),i>s)return!1}return!0}function Vr(n,t,e,i,s){let o=0,a=0;for(let u=0;u+1<n.length;u++){const x=Math.abs(n[u+1].x-n[u].x)+Math.abs(n[u+1].y-n[u].y);x>o&&(o=x,a=u)}const r=n[a]??{x:0,y:0},d=n[a+1]??r,l=Math.abs(d.x-r.x)>=Math.abs(d.y-r.y),c=[...i.map(u=>re(u,4)),...s],p=(u,x)=>!c.some(b=>u<b.maxX&&u+t>b.minX&&x<b.maxY&&x+e>b.minY),h=[];for(const u of[.5,.33,.67,.2,.8]){const x=r.x+(d.x-r.x)*u,b=r.y+(d.y-r.y)*u;l?h.push({x:x-t/2,y:b-e-6},{x:x-t/2,y:b+6}):h.push({x:x+8,y:b-e/2},{x:x-t-8,y:b-e/2})}const f=h.find(u=>p(u.x,u.y))??h[0];return s.push({minX:f.x-4,minY:f.y-2,maxX:f.x+t+4,maxY:f.y+e+2}),f}const Qr={minW:160,minH:90,padX:64,padY:40,gapX:110,gapY:64,gridGapX:90,gridGapY:72,radialMinRadius:240,radialGap:120,maxGridCols:4,textWrap:200};function tl(n){return{...Qr,...n.space}}const at=24;function el(n,t,e,i){const s=t.fontSizes.node,o=Yi(n.label,i.textWrap,s),a=Math.max(1,...o.map(c=>rt(c,s))),r=Math.ceil(o.length*s*1.25);let d,l;return n.shape==="text"?(d=Math.max(a,24),l=Math.max(r,s)):(d=Math.max(i.minW,a+i.padX),l=Math.max(i.minH,r+i.padY)),n.shape==="ellipse"?(d=Math.ceil(d*1.1),l=Math.ceil(l*1.12)):n.shape==="diamond"&&(d=Math.ceil(d*1.24),l=Math.ceil(l*1.32)),{id:n.id,label:n.label,shape:n.shape,...n.group?{group:n.group}:{},...n.rank!==void 0?{rank:n.rank}:{},...n.order!==void 0?{order:n.order}:{},index:e,fill:n.shape==="text"?"transparent":Xr(t,e,n.group),lines:o,x:0,y:0,width:d,height:l}}function nl(n,t){const e=new Map(n.map(l=>[l.id,l.index])),i=new Map(n.map(l=>[l.id,0])),s=new Map(n.map(l=>[l.id,[]]));for(const l of t)s.get(l.from)?.push(l.to),i.set(l.to,(i.get(l.to)??0)+1);const o=new Map(n.map(l=>[l.id,0])),a=new Set,r=n.filter(l=>(i.get(l.id)??0)===0).map(l=>l.id);for(;a.size<n.length;){if(r.length===0){const p=n.filter(f=>!a.has(f.id)).sort((f,u)=>(e.get(f.id)??0)-(e.get(u.id)??0))[0];let h=0;for(const f of t)f.to===p.id&&a.has(f.from)&&(h=Math.max(h,(o.get(f.from)??0)+1));o.set(p.id,h),r.push(p.id)}const l=r.shift();if(!(!l||a.has(l))){a.add(l);for(const c of s.get(l)??[]){if(a.has(c))continue;o.set(c,Math.max(o.get(c)??0,(o.get(l)??0)+1));const p=(i.get(c)??1)-1;i.set(c,p),p<=0&&r.push(c)}}}const d=new Set(t.map(l=>l.to));for(const l of n){if(d.has(l.id))continue;const c=(s.get(l.id)??[]).map(p=>o.get(p)??0);c.length&&o.set(l.id,Math.max(o.get(l.id)??0,Math.min(...c)-1))}for(const l of n)l.rank!==void 0&&o.set(l.id,l.rank);return o}function Ki(n,t){const e=nl(n,t),i=new Map;for(const s of n){const o=e.get(s.id)??0,a=i.get(o)??[];a.push(s),i.set(o,a)}il(i,t);for(const[s,o]of i)i.set(s,Ge(o));return i}function Ge(n){const t=new Map;return n.forEach((i,s)=>{i.group&&!t.has(i.group)&&t.set(i.group,s)}),n.map((i,s)=>({n:i,i:s,key:i.group?t.get(i.group)??s:s})).sort((i,s)=>i.key-s.key||i.i-s.i).map(i=>i.n).map((i,s)=>({n:i,i:s,key:i.order??s,explicit:i.order!==void 0?0:1})).sort((i,s)=>i.key-s.key||i.explicit-s.explicit||i.i-s.i).map(i=>i.n)}function il(n,t){const e=[...n.keys()].sort((o,a)=>o-a);if(e.length<2)return;const i=new Map;for(const o of t)o.from!==o.to&&(i.set(o.from,[...i.get(o.from)??[],o.to]),i.set(o.to,[...i.get(o.to)??[],o.from]));const s=(o,a)=>{o.forEach((r,d)=>{const l=a(d);if(l===void 0)return;const c=new Map((n.get(l)??[]).map((f,u)=>[f.id,u])),p=n.get(r)??[],h=p.map((f,u)=>{const x=(i.get(f.id)??[]).map(m=>c.get(m)).filter(m=>m!==void 0),b=Math.max(1,(n.get(l)?.length??1)-1)/Math.max(1,p.length-1);return{n:f,k:u,key:x.length?x.reduce((m,y)=>m+y,0)/x.length/b:u}});h.sort((f,u)=>f.key-u.key||f.k-u.k),n.set(r,h.map(f=>f.n))})};for(let o=0;o<2;o++){s(e,r=>r>0?e[r-1]:void 0);const a=[...e].reverse();s(a,r=>r>0?a[r-1]:void 0)}}function sl(n,t,e){const i=Ki(n,t),s=[...i.keys()].sort((l,c)=>l-c),o=s.map(l=>Math.max(...(i.get(l)??[]).map(c=>c.width))),a=s.map(l=>{const c=i.get(l)??[];return c.reduce((p,h)=>p+h.height,0)+e.gapY*Math.max(0,c.length-1)}),r=Math.max(0,...a);let d=0;s.forEach((l,c)=>{const p=i.get(l)??[];let h=Math.max(0,(r-a[c])/2);for(const f of p)f.x=d+(o[c]-f.width)/2,f.y=h,h+=f.height+e.gapY;d+=o[c]+e.gapX})}function ol(n,t,e){const i=Ki(n,t),s=[...i.keys()].sort((l,c)=>l-c),o=s.map(l=>Math.max(...(i.get(l)??[]).map(c=>c.height))),a=s.map(l=>{const c=i.get(l)??[];return c.reduce((p,h)=>p+h.width,0)+e.gapX*Math.max(0,c.length-1)}),r=Math.max(0,...a);let d=0;s.forEach((l,c)=>{const p=i.get(l)??[];let h=Math.max(0,(r-a[c])/2);for(const f of p)f.x=h,f.y=d+(o[c]-f.height)/2,h+=f.width+e.gapX;d+=o[c]+e.gapY})}function al(n,t){const e=Ge(n),i=Math.max(1,Math.min(t.maxGridCols,Math.ceil(Math.sqrt(e.length)))),s=Math.ceil(e.length/i),o=Array.from({length:i},(p,h)=>Math.max(0,...e.filter((f,u)=>u%i===h).map(f=>f.width))),a=Array.from({length:s},(p,h)=>Math.max(0,...e.slice(h*i,h*i+i).map(f=>f.height))),r=[];let d=0;for(let p=0;p<i;p++)r.push(d),d+=o[p]+t.gridGapX;const l=[];let c=0;for(let p=0;p<s;p++)l.push(c),c+=a[p]+t.gridGapY;e.forEach((p,h)=>{const f=h%i,u=Math.floor(h/i);p.x=r[f]+(o[f]-p.width)/2,p.y=l[u]+(a[u]-p.height)/2})}function rl(n,t,e){if(n.length===1){n[0].x=0,n[0].y=0;return}const i=new Map(n.map(S=>[S.id,0]));for(const S of t)i.set(S.from,(i.get(S.from)??0)+1),i.set(S.to,(i.get(S.to)??0)+1);const s=[...n].sort((S,v)=>(i.get(v.id)??0)-(i.get(S.id)??0)||S.index-v.index)[0],o=Ge(n.filter(S=>S.id!==s.id)),a=Math.max(...o.map(S=>S.width)),r=Math.max(...o.map(S=>S.height)),d=Math.max(e.radialMinRadius,s.width/2+a/2+e.radialGap,s.height/2+r/2+e.radialGap);s.x=-s.width/2,s.y=-s.height/2;const l=Math.hypot(a,r)+e.radialGap/2,c=S=>Math.max(1,Math.floor(Math.PI/Math.asin(Math.min(1,l/(2*S))))),p=[];let h=o,f=d;for(;h.length;){const S=p.length===0&&h.length<=c(f)?h.length:Math.min(h.length,c(f));p.push({r:f,nodes:h.slice(0,S)}),h=h.slice(S),f+=Math.max(a,r)+e.radialGap}const u=o.length<=2?0:-Math.PI/2,x=[s],b=(S,v,E,I,M,_)=>{const A=M.x-_,R=M.x+M.width+_,D=M.y-_,P=M.y+M.height+_;let T=0,L=1;const j=E-S,J=I-v;for(const[z,nt]of[[-j,S-A],[j,R-S],[-J,v-D],[J,P-v]]){if(Math.abs(z)<1e-9){if(nt<0)return!1;continue}const it=nt/z;if(z<0?T=Math.max(T,it):L=Math.min(L,it),T>L)return!1}return!0},m=(S,v)=>{const I=[];for(let R=0;R<720;R++){const D=u+R/720*Math.PI*2,P=Math.cos(D)*S,T=Math.sin(D)*S,L=P-a/2,j=T-r/2;x.some(z=>z!==s&&(b(0,0,P,T,z,12)||L<z.x+z.width+12&&z.x<L+a+12&&j<z.y+z.height+12&&z.y<j+r+12))||I.push(D)}if(I.length<v)return null;const M=2*Math.asin(Math.min(1,l/(2*S))),_=(R,D)=>{const P=Math.abs(R-D)%(Math.PI*2);return Math.min(P,Math.PI*2-P)},A=[];for(let R=0;R<v;R++){const D=u+(R+.5)/v*Math.PI*2;let P=null;for(const T of I)A.some(L=>_(T,L)<M-1e-6)||(P===null||_(T,D)<_(P,D))&&(P=T);if(P===null)return null;A.push(P)}return A};let y=0;p.forEach((S,v)=>{const E=S.nodes.length,I=Math.PI*2/E;S.r+=y;let M=S.nodes.map((_,A)=>u+I*A+(v>0?I/2:0));if(v>0)for(let _=0;_<4;_++){const A=m(S.r,E);if(A){M=A;break}const R=S.r*.15;S.r+=R,y+=R}S.nodes.forEach((_,A)=>{_.x=Math.cos(M[A])*S.r-_.width/2,_.y=Math.sin(M[A])*S.r-_.height/2,x.push(_)})});const w=Math.min(...n.map(S=>S.x)),k=Math.min(...n.map(S=>S.y));n.forEach(S=>{S.x-=w,S.y-=k})}function Jn(n){const t=[];for(const e of n){const i=t[t.length-1];(!i||Math.abs(i[0]-e[0])>.01||Math.abs(i[1]-e[1])>.01)&&t.push(e)}return t.length>=2?t:[[0,0],[0,0]]}function ll(n,t,e,i=!1,s=[]){const o=new Map(n.map(h=>[h.id,h])),a=[],r=[],d=new Map,l=Zi(n,ie.margin),c=[...s],p=t.map((h,f)=>({edge:h,index:f})).sort((h,f)=>Vn(o,h.edge)-Vn(o,f.edge));for(const{edge:h,index:f}of p){const u=o.get(h.from),x=o.get(h.to);if(!u||!x)continue;const b=i?Jr(n,u.id,x.id):null,m=b?{side1:Xt(u,x),side2:Xt(x,u),path:b}:u===x?null:qr(n,u.id,x.id,r,ie,d,l);if(m){const R=m.path[0],D=m.path[m.path.length-1],P=Jn(m.path.map(L=>[L.x-R.x,L.y-R.y]));let T;if(h.label){const L=e.fontSizes.edge;T=Vr(m.path,rt(h.label,L),Math.ceil(L*1.25),n,c)}a.push({index:f,route:{from:h.from,to:h.to,...h.label?{label:h.label}:{},side1:m.side1,side2:m.side2,p1:R,p2:D,points:P,...T?{labelAt:T}:{}}});continue}const y=Xt(u,x),w=Xt(x,u),k=zn(u,y),S=zn(x,w),v=S.x-k.x,E=S.y-k.y,M=y==="left"||y==="right"?[[0,0],[v/2,0],[v/2,E],[v,E]]:[[0,0],[0,E/2],[v,E/2],[v,E]],_=Jn(M);let A;if(h.label){const R=e.fontSizes.edge,D=rt(h.label,R),P=Math.ceil(R*1.25),T=(k.x+S.x)/2,L=(k.y+S.y)/2;A=Math.abs(v)>=Math.abs(E)?{x:T-D/2,y:L-P-8}:{x:T+10,y:L-P/2}}a.push({index:f,route:{from:h.from,to:h.to,...h.label?{label:h.label}:{},side1:y,side2:w,p1:k,p2:S,points:_,...A?{labelAt:A}:{}}})}return a.sort((h,f)=>h.index-f.index).map(h=>h.route)}function Vn(n,t){const e=n.get(t.from),i=n.get(t.to);return!e||!i?1/0:Math.abs(e.x+e.width/2-(i.x+i.width/2))+Math.abs(e.y+e.height/2-(i.y+i.height/2))}function cl(n,t){const e=n.split(`
`),i=Math.max(1,...e.map(o=>rt(o,t))),s=Math.max(1,Math.ceil(e.length*t*1.25));return{minX:0,minY:0,maxX:i,maxY:s,width:i,height:s,cx:i/2,cy:s/2}}function dl(n){const t=ae(n.preset),e=n.groups??[],i=Math.ceil(t.fontSizes.edge*1.25)+8,s=tl(t),o=e.length?{...s,gapX:Math.max(s.gapX,2*at+32),gapY:Math.max(s.gapY,2*at+i+24),gridGapX:Math.max(s.gridGapX,2*at+32),gridGapY:Math.max(s.gridGapY,2*at+i+24)}:s,a=n.nodes.map((f,u)=>el(f,t,u,o));switch(n.layout){case"tb":ol(a,n.edges,o);break;case"grid":al(a,o);break;case"radial":rl(a,n.edges,o);break;case"lr":default:sl(a,n.edges,o);break}const r=[],d=fl(e,a,i,r),l=d.flatMap(f=>[{minX:f.labelAt.x-4,minY:f.labelAt.y-2,maxX:f.labelAt.x+rt(f.label,t.fontSizes.edge)+4,maxY:f.labelAt.y+i},{minX:f.x-3,minY:f.y-3,maxX:f.x+f.width+3,maxY:f.y+3},{minX:f.x-3,minY:f.y+f.height-3,maxX:f.x+f.width+3,maxY:f.y+f.height+3},{minX:f.x-3,minY:f.y-3,maxX:f.x+3,maxY:f.y+f.height+3},{minX:f.x+f.width-3,minY:f.y-3,maxX:f.x+f.width+3,maxY:f.y+f.height+3}]),c=ll(a,n.edges,t,n.layout==="radial",l),p=wt([...a,...d]);if(p&&(p.minX<0||p.minY<0)){const f=Math.max(0,-p.minX),u=Math.max(0,-p.minY);for(const x of a)x.x+=f,x.y+=u;for(const x of d)x.x+=f,x.y+=u,x.labelAt={x:x.labelAt.x+f,y:x.labelAt.y+u};for(const x of c)x.p1={x:x.p1.x+f,y:x.p1.y+u},x.p2={x:x.p2.x+f,y:x.p2.y+u},x.labelAt&&(x.labelAt={x:x.labelAt.x+f,y:x.labelAt.y+u})}const h=wt([...a,...d])??{minX:0,minY:0,maxX:0,maxY:0,width:0,height:0,cx:0,cy:0};return{nodes:a,routes:c,titleBox:n.title?cl(n.title,t.fontSizes.title):null,frames:d,contentBox:h,preset:t,warnings:r}}function fl(n,t,e,i){const s=[];for(const o of n){const a=t.filter(h=>h.group===o.id),r=wt(a);if(!r)continue;const d=r.minX-at,l=r.minY-at-e,c={id:o.id,label:o.label,x:d,y:l,width:r.width+2*at,height:r.height+2*at+e,labelAt:{x:d+12,y:l+6}},p=t.filter(h=>h.group!==o.id&&h.x<c.x+c.width&&h.x+h.width>c.x&&h.y<c.y+c.height&&h.y+h.height>c.y);p.length&&i.push(`分组「${o.label}」的框包住了非成员节点 ${p.map(h=>h.id).join(", ")}：成员跨了不相邻的层或位置，可用 rank/order 让它们挨在一起`);for(const h of s)c.x<h.x+h.width&&c.x+c.width>h.x&&c.y<h.y+h.height&&c.y+c.height>h.y&&i.push(`分组「${o.label}」与「${h.label}」的框重叠`);s.push(c)}return s}class Q extends Error{constructor(t,e){super(`plan:${t}${e?` (${e})`:""}`),this.reason=t,this.detail=e,this.name="PlanError"}}const G={maxNodes:40,maxEdges:80,maxLabel:200,maxNote:120,maxTitle:120,maxCaption:300,maxEdgeLabel:60,maxGroups:12,maxGroupLabel:60,maxRank:39},hl={lr:"lr",horizontal:"lr","left-right":"lr",tb:"tb",vertical:"tb","top-down":"tb",grid:"grid",matrix:"grid",radial:"radial",mindmap:"radial",circle:"radial"},ul={rounded:"rounded",round:"rounded",card:"rounded",rectangle:"rectangle",rect:"rectangle",square:"rectangle",box:"rectangle",ellipse:"ellipse",oval:"ellipse",circle:"ellipse",diamond:"diamond",decision:"diamond",rhombus:"diamond",text:"text",plain:"text"};function Lt(n){return typeof n=="object"&&n!==null&&!Array.isArray(n)}function H(n){return typeof n=="string"?n:typeof n=="number"&&Number.isFinite(n)?String(n):""}function ft(n,t){const e=n.trim().replace(/\r\n?/g,`
`);return e.length>t?`${e.slice(0,t-1)}…`:e}function pl(n){if(typeof n!="string")return null;const t=n.trim().toLowerCase();return hl[t]??null}function gl(n){return n===""?"rounded":ul[n.trim().toLowerCase()]??null}function Ji(n){return n.trim().replace(/[^\w.-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,48)}function ml(n,t){const e=[],i=new Set;for(let s=0;s<n.length;s++){const o=n[s];let a="",r="",d="",l="",c,p;if(typeof o=="string")r=o;else if(Lt(o)){a=H(o.id),r=H(o.label??o.text??o.title),d=H(o.shape),l=H(o.group),c=o.rank??o.layer,p=o.order;const x=H(o.note??o.description);x&&(r=r?`${r}
${x}`:x)}else{t.push(`nodes[${s}] 不是字符串或对象，已忽略`);continue}if(r=ft(r,G.maxLabel+G.maxNote+1),!r.trim()){t.push(`nodes[${s}] 没有 label，已忽略`);continue}const h=gl(d);if(!h)throw new Q("bad-shape",`nodes[${s}].shape=${d}`);if(a=Ji(a)||`n${s+1}`,i.has(a))throw new Q("duplicate-node-id",a);i.add(a);const f=yl(c,0,G.maxRank,`nodes[${s}].rank`,t),u=bl(p,`nodes[${s}].order`,t);e.push({id:a,label:r,shape:h,...l.trim()?{group:ft(l,40)}:{},...f!==void 0?{rank:f}:{},...u!==void 0?{order:u}:{}})}return e}function yl(n,t,e,i,s){if(n==null||n==="")return;const o=typeof n=="number"?n:Number(n);if(!Number.isInteger(o)||o<t||o>e){s.push(`${i}=${H(n)||typeof n} 不是 ${t}–${e} 的整数，已忽略`);return}return o}function bl(n,t,e){if(n==null||n==="")return;const i=typeof n=="number"?n:Number(n);if(!Number.isFinite(i)){e.push(`${t}=${H(n)||typeof n} 不是数字，已忽略`);return}return i}function xl(n,t,e){if(n==null)return[];const i=[];if(Array.isArray(n))n.forEach((a,r)=>{typeof a=="string"?i.push([a,a]):Lt(a)?i.push([H(a.id??a.name),H(a.label??a.title??a.id??a.name)]):e.push(`groups[${r}] 不是字符串或对象，已忽略`)});else if(Lt(n))for(const[a,r]of Object.entries(n))i.push([a,H(r)||a]);else return e.push("groups 必须是对象或数组，已忽略"),[];const s=new Set(t.map(a=>a.group).filter(Boolean)),o=[];for(const[a,r]of i){const d=ft(a,40);if(d){if(!s.has(d)){e.push(`groups 里的「${d}」没有任何节点使用（node.group），已忽略`);continue}if(!o.some(l=>l.id===d)){if(o.length>=G.maxGroups){e.push(`groups 超过 ${G.maxGroups} 个，其余不画框`);break}o.push({id:d,label:ft(r||d,G.maxGroupLabel)})}}}return o}function Qn(n,t){const e=n.trim();if(!e)return null;const i=t.find(a=>a.id===e||a.id===Ji(e));if(i)return i.id;const s=e.toLowerCase(),o=t.filter(a=>a.label.toLowerCase()===s);return o.length===1?o[0].id:null}function wl(n,t,e){const i=[],s=new Set;for(let o=0;o<n.length;o++){const a=n[o];let r="",d="",l="";if(typeof a=="string"){const f=a.split(/\s*->\s*/);if(f.length!==2){e.push(`edges[${o}] 不是 "a->b" 形式，已忽略`);continue}[r,d]=f}else if(Array.isArray(a))r=H(a[0]),d=H(a[1]),l=H(a[2]);else if(Lt(a))r=H(a.from??a.source??a.start),d=H(a.to??a.target??a.end),l=H(a.label??a.text);else{e.push(`edges[${o}] 不是字符串/数组/对象，已忽略`);continue}const c=Qn(r,t),p=Qn(d,t);if(!c||!p){e.push(`edges[${o}] 端点不存在（${r||"?"} -> ${d||"?"}），已忽略`);continue}if(c===p){e.push(`edges[${o}] 是自环（${c}），已忽略`);continue}l=ft(l,G.maxEdgeLabel);const h=`${c}\0${p}\0${l}`;if(s.has(h)){e.push(`edges[${o}] 与前面的边重复，已忽略`);continue}s.add(h),i.push({from:c,to:p,...l?{label:l}:{}})}return i}function Sl(n,t={}){if(!Lt(n))throw new Q("bad-plan","计划必须是 JSON 对象");const e=[],i=n.nodes;if(!Array.isArray(i))throw new Q("bad-plan","缺少 nodes 数组");if(i.length>G.maxNodes)throw new Q("too-many-nodes",`${i.length} > ${G.maxNodes}，请拆成多张白板`);const s=ml(i,e);if(s.length===0)throw new Q("empty-plan","没有可用节点");const o=n.edges??[];if(!Array.isArray(o))throw new Q("bad-plan","edges 必须是数组");if(o.length>G.maxEdges)throw new Q("too-many-edges",`${o.length} > ${G.maxEdges}`);const a=wl(o,s,e),r=t.preset!==void 0&&t.preset!==""?t.preset:n.preset;let d="pencil";if(r!=null&&r!==""){const x=Br(r);if(!x)throw new Q("bad-preset",`${H(r)}（可选 ${Gi().join("/")}）`);d=x}const l=t.layout!==void 0&&t.layout!==""?t.layout:n.layout;let c=a.length>0?"lr":"grid";if(l!=null&&l!==""){const x=pl(l);if(!x)throw new Q("bad-layout",`${H(l)}（可选 lr/tb/grid/radial）`);c=x}const p=t.title!==void 0&&t.title!==""?t.title:n.title,h=ft(H(p),G.maxTitle)||void 0,f=ft(H(n.caption),G.maxCaption)||void 0,u=xl(n.groups,s,e);return(c==="grid"||c==="radial")&&s.some(x=>x.rank!==void 0)&&e.push(`rank 只对 lr/tb 生效，${c} 布局下已忽略`),{...h?{title:h}:{},...f?{caption:f}:{},preset:d,layout:c,nodes:s,edges:a,groups:u,warnings:e}}function kl(n){return(n??"ai").trim().replace(/[^\w.-]+/g,"_").replace(/^_+|_+$/g,"")||"ai"}function Gt(n,t,e,i,s,o,a,r){const d=t.split(`
`);return{type:"text",id:n,x:e,y:i,width:Math.max(1,...d.map(l=>rt(l,s))),height:Math.max(1,Math.ceil(d.length*s*1.25)),text:t,fontSize:s,fontFamily:o,strokeColor:a,textAlign:r}}function El(n,t,e,i,s,o){const r={type:n.shape==="ellipse"?"ellipse":n.shape==="diamond"?"diamond":n.shape==="text"?"text":"rectangle",id:t,x:s+n.x,y:o+n.y,width:n.width,height:n.height,text:n.label,fontSize:i.fontSizes.node,fontFamily:i.fontFamily,strokeColor:i.ink,textAlign:n.shape==="text"?"left":"center"};return n.shape!=="text"&&(r.backgroundColor=n.fill,r.fillStyle=i.fillStyle,r.strokeWidth=i.strokeWidth,r.strokeStyle=i.strokeStyle,r.roughness=i.roughness,n.shape==="rectangle"?r.roundness=null:i.nodeRoundness&&(r.roundness=i.nodeRoundness)),n.group&&(r.groupIds=[`${e}-group-${n.group.replace(/[^\w.-]+/g,"_")}`]),r}function vl(n,t={}){const e=Sl(n,t),i=ae(e.preset),s=dl(e),o=kl(t.idPrefix),a={x:t.origin?.x??0,y:t.origin?.y??0},r=a.x+40,d=a.y+(e.title?96:40),l=[],c=s.nodes.map(y=>{const w=`${o}-${y.id}`;return l.push(El(y,w,o,i,r,d)),{...y,elementId:w}}),p=s.routes.map(y=>({...y,fromElementId:`${o}-${y.from}`,toElementId:`${o}-${y.to}`,p1:{x:r+y.p1.x,y:d+y.p1.y},p2:{x:r+y.p2.x,y:d+y.p2.y},...y.labelAt?{labelAt:{x:r+y.labelAt.x,y:d+y.labelAt.y}}:{}})),h=e.title?[Gt(`${o}-title`,e.title,a.x+40,a.y+24,i.fontSizes.title,i.fontFamily,i.ink,"left")]:[],f=[];for(const y of s.frames){const w=`${o}-frame-${y.id.replace(/[^\w.-]+/g,"_")}`;f.push({type:"rectangle",id:w,x:r+y.x,y:d+y.y,width:y.width,height:y.height,strokeColor:i.muted,backgroundColor:"transparent",fillStyle:"solid",strokeWidth:1,strokeStyle:"dashed",roughness:i.roughness,roundness:{type:3},groupIds:[`${o}-group-${y.id.replace(/[^\w.-]+/g,"_")}`]}),f.push(Gt(`${w}-label`,y.label,r+y.labelAt.x,d+y.labelAt.y,i.fontSizes.edge,i.fontFamily,i.muted,"left")),f[f.length-1].groupIds=[`${o}-group-${y.id.replace(/[^\w.-]+/g,"_")}`]}const u=[];p.forEach((y,w)=>{!y.label||!y.labelAt||u.push(Gt(`${o}-edge-${w+1}`,y.label,y.labelAt.x,y.labelAt.y,i.fontSizes.edge,i.fontFamily,i.muted,"center"))});const x=e.caption?[Gt(`${o}-caption`,e.caption,r,d+s.contentBox.maxY+44,i.fontSizes.caption,i.fontFamily,i.muted,"left")]:[],b=[...h,...f,...l,...u,...x];e.warnings.push(...s.warnings);const m=wt(b.map(y=>({x:y.x,y:y.y,width:y.width??0,height:y.height??0})))??{minX:0,minY:0,maxX:0,maxY:0,width:0,height:0,cx:0,cy:0};return{plan:e,preset:i,specs:b,nodes:c,routes:p,bbox:m,background:i.background,idPrefix:o}}const Fe="assets/excali-styles",_l=/^[a-z0-9][a-z0-9._-]{0,31}$/,Al=/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,Ml=["solid","hachure","cross-hatch"],$l=["solid","dashed","dotted"],Vi=["minW","minH","padX","padY","gapX","gapY","gridGapX","gridGapY","radialMinRadius","radialGap","maxGridCols","textWrap"],Il=new Set(Vi),Cl=4e3,Rl=8,Tl=96,Ll=20,Pl=[0,1,2],Ol=20,ti=32,ei=64,Dl=40;class Qi extends Error{constructor(t,e,i){super(`style:${t} (${i}) ${e}`),this.reason=t,this.source=i,this.name="StylePackError"}}function kt(n){return typeof n=="object"&&n!==null&&!Array.isArray(n)}function ts(n){return(n.replace(/\\/g,"/").split("/").pop()??"").replace(/\.json$/i,"")}function F(n,t,e){throw new Qi(n,t,e)}function We(n,t,e){return(typeof n!="string"||!Al.test(n.trim()))&&F("bad-field",`${t} 需要 #rgb/#rrggbb 形式的颜色`,e),n.trim()}function Ct(n,t,e,i,s){const o=typeof n=="number"?n:Number(n);return(!Number.isFinite(o)||!Number.isInteger(o)||o<e||o>i)&&F("bad-field",`${t} 需要 ${e}..${i} 的整数（收到 ${String(n)}）`,s),o}function je(n,t,e,i){return(typeof n!="string"||!e.includes(n))&&F("bad-field",`${t} 只能是 ${e.join("/")}（收到 ${String(n)}）`,i),n}function Bl(n,t){kt(n)||F("bad-field","fontSizes 需要对象 {title,node,edge,caption}",t);const e={};for(const s of["title","node","edge","caption"]){const o=n[s];o!==void 0&&(e[s]=Ct(o,`fontSizes.${s}`,Rl,Tl,t))}const i=Object.keys(n).filter(s=>!["title","node","edge","caption"].includes(s));return i.length&&F("bad-field",`fontSizes 有未知字段 ${i.join(",")}`,t),Object.keys(e).length===0&&F("bad-field","fontSizes 是空对象",t),e}function Nl(n,t){return(!Array.isArray(n)||n.length===0)&&F("bad-field","palette 需要非空数组",t),n.length>ti&&F("bad-field",`palette 最多 ${ti} 色`,t),n.map((e,i)=>We(e,`palette[${i}]`,t))}function Fl(n,t){kt(n)||F("bad-field","space 需要对象（gapX/gapY/padX/padY…）",t);const e={};for(const s of Vi){const o=n[s];o!==void 0&&(e[s]=Ct(o,`space.${s}`,0,Cl,t))}const i=Object.keys(n).filter(s=>!Il.has(s));return i.length&&F("bad-field",`space 有未知字段 ${i.join(",")}`,t),Object.keys(e).length===0&&F("bad-field","space 是空对象",t),e}function jl(n,t){kt(n)||F("bad-field","groupColor 需要对象 {mode,roles}",t);const e=je(n.mode,"groupColor.mode",["hash","roles"],t);if(e!=="roles")return{mode:e};const i=n.roles;kt(i)||F("bad-field","groupColor.roles 需要 {分组名:颜色}",t);const s=Object.entries(i);s.length===0&&F("bad-field","groupColor.roles 是空对象",t),s.length>ei&&F("bad-field",`groupColor.roles 最多 ${ei} 组`,t);const o={};for(const[a,r]of s){const d=a.trim().slice(0,Dl);d||F("bad-field","groupColor.roles 有空的分组名",t),o[d]=We(r,`groupColor.roles.${d}`,t)}return{mode:e,roles:o}}function Hl(n,t){return n===null?null:typeof n=="number"?{type:n}:kt(n)&&typeof n.type=="number"?{type:n.type}:F("bad-field","nodeRoundness 需要 null / {type:number}",t)}function zl(n,t="inline",e=new Set){let i;try{i=JSON.parse(n)}catch(c){return F("bad-json",`不是合法 JSON：${c instanceof Error?c.message:String(c)}`,t)}if(!kt(i))return F("bad-pack","风格包必须是 JSON 对象",t);const s=typeof i.name=="string"&&i.name.trim()?i.name:ts(t),o=St(s);_l.test(o)||F("bad-name",`${s} → ${o||"(空)"}（要求小写字母/数字/._-，首字符字母数字，≤32）`,t);const a=i.extends===void 0||i.extends===null||i.extends===""?"pencil":St(String(i.extends));!Nr(a)&&!e.has(a)&&F("bad-extends",`${a} 不存在（内置之外可用 ${[...e].join("/")||"无"}）`,t),a===o&&F("bad-extends","不能 extends 自己",t);const r={},d=["background","ink","fill","edge","muted"];for(const c of d)i[c]!==void 0&&(r[c]=We(i[c],c,t));if(i.palette!==void 0&&(r.fillPalette=Nl(i.palette,t)),i.strokeWidth!==void 0&&(r.strokeWidth=Ct(i.strokeWidth,"strokeWidth",0,Ll,t)),i.roughness!==void 0){const c=Ct(i.roughness,"roughness",0,2,t);Pl.includes(c)||F("bad-field","roughness 只能是 0/1/2",t),r.roughness=c}i.fillStyle!==void 0&&(r.fillStyle=je(i.fillStyle,"fillStyle",Ml,t)),i.strokeStyle!==void 0&&(r.strokeStyle=je(i.strokeStyle,"strokeStyle",$l,t)),i.fontFamily!==void 0&&(r.fontFamily=Ct(i.fontFamily,"fontFamily",1,Ol,t)),i.fontSizes!==void 0&&(r.fontSizes=Bl(i.fontSizes,t)),i.nodeRoundness!==void 0&&(r.nodeRoundness=Hl(i.nodeRoundness,t)),i.space!==void 0&&(r.space=Fl(i.space,t)),i.groupColor!==void 0&&(r.groupColor=jl(i.groupColor,t));const l=typeof i.label=="string"&&i.label.trim()?i.label.trim().slice(0,40):o;return{name:o,extendsFrom:a,label:l,diff:r}}function Xl(n,t="inline",e){const i=zl(n,t,e);return Fr(i.name,{extendsFrom:i.extendsFrom,diff:{...i.diff,label:i.label}}),{name:i.name,extends:i.extendsFrom,label:i.label}}async function Ul(n,t=Fe){jr();const e=[];let i=[];try{i=(await n.list()).filter(a=>/\.json$/i.test(a)).sort()}catch(a){return e.push(`${t} 目录读不了，只用内置风格：${a instanceof Error?a.message:String(a)}`),{loaded:[],warnings:e}}const s=new Set(i.map(a=>St(ts(a)))),o=[];for(const a of i){const r=`${t}/${a}`;let d;try{d=await n.read(a)}catch(l){e.push(`${r} 读不到，已跳过：${l instanceof Error?l.message:String(l)}`);continue}try{o.push(Xl(d,r,s))}catch(l){l instanceof Qi?e.push(l.message):e.push(`${r} 加载失败：${l instanceof Error?l.message:String(l)}`)}}for(const a of o)try{ae(a.name)}catch(r){e.push(`style:${a.name} 解析失败，绘图时不可用：${r instanceof Error?r.message:String(r)}`)}return{loaded:o,warnings:e}}function Yl(){const n=[];for(const t of Gi())try{n.push({name:t,extends:Hr(t)??"-",label:ae(t).label??t})}catch{}return n}const Gl=12*1024*1024,Wl="1024x1024",Zl="gpt-image-1";function ql(n,t){const e=t.toLowerCase();for(const[i,s]of Object.entries(n??{}))if(i.toLowerCase()===e)return Array.isArray(s)?String(s[0]??""):typeof s=="string"?s:String(s??"");return""}function Kl(n){const t=String(n??"").trim().replace(/\/+$/,"");if(!t)throw new Error("未配置图像 API 地址");if(!/^https?:\/\//i.test(t))throw new Error("图像 API 地址必须以 http:// 或 https:// 开头");return/\/images\/generations$/i.test(t)?t:`${t}/images/generations`}function Jl(n,t,e={}){const i=String(t??"").trim();if(!i)throw new Error("prompt 不能为空");if(i.length>4e3)throw new Error("prompt 过长（上限 4000 字符）");const s=String(n.apiKey??"").trim();if(!s)throw new Error("未配置图像 API Key");const o=String(n.model??"").trim()||Zl,a=String(e.size??n.size??"").trim()||Wl;return{url:Kl(n.baseUrl),headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"},payload:JSON.stringify({model:o,prompt:i,n:1,size:a}),size:a}}function le(n){const t=n.replace(/\s+/g,"").replace(/-/g,"+").replace(/_/g,"/"),e=t.length%4;return e===0?t:t+"=".repeat(4-e)}function Vl(n){const t=/^data:([^;,]+);base64,([\s\S]+)$/i.exec(n.trim());return t?{mime:t[1]||"image/png",base64:le(t[2])}:null}function Ql(n){if(!n||typeof n!="object")throw new Error("图像 API 返回的不是 JSON 对象");const t=n;if(t.error){const r=t.error,d=r&&typeof r=="object"&&typeof r.message=="string"?r.message:typeof r=="string"?r:"图像 API 返回错误";throw new Error(`图像 API：${d}`)}const e=Array.isArray(t.data)?t.data[0]:t.data,i=e&&typeof e=="object"?e:t,s=typeof i.revised_prompt=="string"?i.revised_prompt:typeof t.revised_prompt=="string"?t.revised_prompt:void 0,o=typeof i.b64_json=="string"?i.b64_json:typeof t.b64_json=="string"?t.b64_json:"";if(o){const r=Vl(o);return{kind:"inline",base64:r?r.base64:le(o),...s?{revisedPrompt:s}:{}}}const a=typeof i.url=="string"?i.url:typeof t.url=="string"?t.url:"";if(a)return{kind:"url",url:a,...s?{revisedPrompt:s}:{}};throw new Error("图像 API 没有返回图片（b64_json / url 都为空）")}function es(n){const t=atob(le(n)),e=new Uint8Array(t.length);for(let i=0;i<t.length;i++)e[i]=t.charCodeAt(i)&255;return e}function $e(n,t){return n[t]<<8|n[t+1]}function ni(n,t){return(n[t]<<24|n[t+1]<<16|n[t+2]<<8|n[t+3])>>>0}function Wt(n,t){return n[t]|n[t+1]<<8}function ii(n,t){return n[t]|n[t+1]<<8|n[t+2]<<16}function si(n,t){return(n[t]|n[t+1]<<8|n[t+2]<<16|n[t+3]<<24)>>>0}function oi(n){let t;try{t=es(n.slice(0,64))}catch{return"image/png"}return t.length>=8&&t[0]===137&&t[1]===80&&t[2]===78&&t[3]===71?"image/png":t.length>=3&&t[0]===255&&t[1]===216&&t[2]===255?"image/jpeg":t.length>=4&&t[0]===71&&t[1]===73&&t[2]===70?"image/gif":t.length>=12&&t[0]===82&&t[1]===73&&t[2]===70&&t[3]===70&&t[8]===87&&t[9]===69&&t[10]===66&&t[11]===80?"image/webp":t.length>=2&&t[0]===66&&t[1]===77?"image/bmp":"image/png"}function tc(n){let t;try{t=es(n)}catch{return null}if(t.length>=24&&t[0]===137&&t[1]===80&&t[2]===78&&t[3]===71)return{width:ni(t,16),height:ni(t,20)};if(t.length>=10&&t[0]===71&&t[1]===73&&t[2]===70)return{width:Wt(t,6),height:Wt(t,8)};if(t.length>=26&&t[0]===66&&t[1]===77){const e=si(t,22);return{width:si(t,18),height:e>2147483647?4294967296-e:e}}if(t.length>=30&&t[0]===82&&t[1]===73&&t[2]===70&&t[3]===70&&t[8]===87&&t[9]===69&&t[10]===66&&t[11]===80){const e=String.fromCharCode(t[12],t[13],t[14],t[15]);if(e==="VP8X"&&t.length>=30)return{width:ii(t,24)+1,height:ii(t,27)+1};if(e==="VP8 "&&t.length>=30)return{width:Wt(t,26)&16383,height:Wt(t,28)&16383};if(e==="VP8L"&&t.length>=25){const i=t[21]|t[22]<<8|t[23]<<16|t[24]<<24;return{width:(i&16383)+1,height:(i>>>14&16383)+1}}return null}if(t.length>=4&&t[0]===255&&t[1]===216){let e=2;for(;e+3<t.length;){if(t[e]!==255){e+=1;continue}const i=t[e+1];if(i===216||i===217||i===1||i>=208&&i<=215){e+=2;continue}const s=$e(t,e+2);if(s<2)break;if((i>=192&&i<=195||i>=197&&i<=199||i>=201&&i<=203||i>=205&&i<=207)&&e+8<t.length)return{width:$e(t,e+7),height:$e(t,e+5)};e+=2+s}}return null}async function ec(n,t,e,i={}){const s=Jl(n,t,i),o=await e({url:s.url,method:"POST",headers:s.headers,payload:s.payload,contentType:"application/json",timeout:18e4});if(o.code!==0)throw new Error(`思源转发失败：${o.msg||`code ${o.code}`}`);if(o.status<200||o.status>=300)throw new Error(`图像 API HTTP ${o.status}：${String(o.body??"").slice(0,300)}`);let a;try{a=JSON.parse(o.body)}catch{throw new Error("图像 API 返回的不是 JSON")}const r=Ql(a);let d,l;if(r.kind==="inline")d=r.base64,l=oi(d);else{if(!/^https?:\/\//i.test(r.url))throw new Error("图像 API 返回的图片 URL 不是 http(s)");const h=await e({url:r.url,method:"GET",headers:{},payload:"",contentType:"application/octet-stream",timeout:12e4,responseEncoding:"base64"});if(h.code!==0)throw new Error(`图片下载失败：${h.msg||`code ${h.code}`}`);if(h.status<200||h.status>=300)throw new Error(`图片下载 HTTP ${h.status}`);if(d=le(h.body||""),!d)throw new Error("图片下载返回空内容");const f=ql(h.headers,"content-type").split(";")[0].trim().toLowerCase();l=/^image\//.test(f)?f:oi(d)}const c=Math.floor(d.length*3/4);if(c>Gl)throw new Error(`生成的图片过大（约 ${(c/1024/1024).toFixed(1)} MiB，上限 12 MiB）`);const p=tc(d);return{dataURL:`data:${l};base64,${d}`,mime:l,base64:d,width:p?.width&&p.width>0?p.width:1024,height:p?.height&&p.height>0?p.height:1024,...r.revisedPrompt?{revisedPrompt:r.revisedPrompt}:{}}}function nc(){return async n=>{const t={url:n.url,method:n.method||"POST",timeout:n.timeout??12e4,contentType:n.contentType||"application/json",headers:Object.entries(n.headers??{}).map(([a,r])=>({[a]:r})),payload:n.payload??""};n.responseEncoding&&(t.responseEncoding=n.responseEncoding);const e=await fetch("/api/network/forwardProxy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),i=await e.json().catch(()=>null);if(!i||typeof i!="object")throw new Error(`forwardProxy 返回异常（HTTP ${e.status}）`);const s=i.data&&typeof i.data=="object"?i.data:{},o=s.body;return{code:typeof i.code=="number"?i.code:-1,msg:typeof i.msg=="string"?i.msg:"",status:typeof s.status=="number"?s.status:0,headers:s.headers&&typeof s.headers=="object"?s.headers:{},body:typeof o=="string"?o:o!=null?JSON.stringify(o):""}}}const ai="excali-studio",ic=8,sc=5,oc={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function Z(n){return n.replace(/[&<>"']/g,t=>oc[t])}function lt(n){return Z(n)}class ac extends $.Plugin{constructor(){super(...arguments),this.tabs=new Map,this.settings={...X},this.recent=[],this.boardActions=new Map,this.activeCustom=null,this.dockRefresh=null,this.onloadRan=new Set,this.boardFiles=[],this.dirMigrated=!1,this.legacyBoards=[],this.ready=Promise.resolve(),this.libLoading=!1,this.embedClickHandler=null,this.boardObservers=new Map,this.boardRescanTimer=null,this.lazyEngine=null,this.scriptPickerDialog=null,this.inputPromptChain=Promise.resolve(),this.selectOptionChain=Promise.resolve(),this.libCache=null}lazyMod(){return this.lazyEngine??=this.loadEngineModule(),this.lazyEngine}async loadEngineModule(){const t=new URL(`plugins/${Zt}/engine.js`,`${location.origin}/`).href,e=await fetch(t,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status} ${t}`);const i=await e.text(),s={exports:{}};return await this.runEngineScript(i,this.makeEngineRequire(),s.exports),s.exports}makeEngineRequire(){const t=window.require,e=require;return i=>{if(i==="siyuan")return e("siyuan");if(typeof t=="function")return t(i);throw new Error(`Cannot find module '${i}'`)}}runEngineScript(t,e,i){return new Promise((s,o)=>{const a=`window.__exsEngineFactory=(function(require,module,exports){
${t}
});
//# sourceURL=plugins/${Zt}/engine.js`,r=()=>{try{const p=window,h=p.__exsEngineFactory;if(delete p.__exsEngineFactory,typeof h!="function")throw new Error("引擎未导出工厂函数");h(e,{exports:i},i),s()}catch(p){o(p instanceof Error?p:new Error(String(p)))}},d=()=>{try{const p=document.createElement("script");p.type="text/javascript",p.textContent=a,document.head.appendChild(p),r()}catch(p){o(p instanceof Error?p:new Error(String(p)))}};let l=null;try{const p=new Blob([a],{type:"text/javascript"});l=URL.createObjectURL(p)}catch{d();return}const c=document.createElement("script");c.type="text/javascript",c.src=l,c.onload=()=>{l&&URL.revokeObjectURL(l),r()},c.onerror=()=>{l&&URL.revokeObjectURL(l),d()},document.head.appendChild(c)})}async onload(){ns(this.i18n),this.ready=this.bootstrapState(),this.addIcons(rs),this.registerStudioTab(),this.registerDock(),this.addTopBar({id:"excali-studio-open",icon:ct,title:g("打开白板"),callback:()=>void this.openNew(),contextMenu:t=>this.buildTopMenu(t)}),this.protyleSlash.push({id:"excaliStudio",filter:["白板","画板","excali","excalidraw","whiteboard","bb","hb"],html:Ze(g("白板")),callback:t=>{this.clearSlashHint(t),this.openNew()}}),this.protyleSlash.push({id:"excaliStudioInsertBoard",filter:["插入白板","白板卡","insert board"],html:Ze(g("插入白板…")),callback:t=>{try{this.clearSlashHint(t),this.pickBoardRef(g("插入白板…")).then(e=>{if(!e)return;const i=`![](${e})`,s=Ba(t)?.Md2BlockDOM?.(i);if(!s){$.showMessage(g("插入失败：Lute 不可用"),7e3,"error");return}t.insert(s,!0,!0);const o=t.protyle?.wysiwyg?.element;o instanceof Element&&o.isConnected&&(this.observeBoardDom(o),this.decorateProtyle(o)),$.showMessage(g("已插入白板：{name}",{name:B(e)}),3e3)}).catch(e=>$.showMessage(g("插入失败：{msg}",{msg:e instanceof Error?e.message:String(e)}),7e3,"error"))}catch(e){$.showMessage(g("插入失败：{msg}",{msg:e instanceof Error?e.message:String(e)}),7e3,"error")}}}),this.addCommand({langKey:"openExcaliStudio",langText:g("打开白板"),hotkey:"⌘⌥E",customHotkey:"",callback:()=>void this.openNew()}),ss(),Pa(this),this.registerBlockIconMenu(),this.registerEmbedClick(),this.setupSetting(),await this.ready,this.registerAgentCapabilities(),this.registerBoardDecorations(),this.refreshBoardLib(),dr().then(async t=>{t>0&&$.showMessage(g("已安装 {n} 个内置脚本到 {dir}",{n:t,dir:W}),5e3);try{const e=await hr(this.settings.builtinSnapshot),i=this.settings.builtinSnapshot;Object.keys(i).length===Object.keys(e.snapshot).length&&Object.keys(e.snapshot).every(a=>i[a]===e.snapshot[a])||(this.settings.builtinSnapshot=e.snapshot,this.persist()),e.updated.length>0&&$.showMessage(g("内置脚本已更新到最新版（{n} 个），你自建的脚本不受影响",{n:e.updated.length}),5e3)}catch(e){console.warn("[excali-studio] 内置脚本同步失败",e)}}).catch(t=>console.warn("[excali-studio] 内置脚本安装失败",t)),this.maybeShowChangelog()}onunload(){const t=[...this.tabs.values()];t.forEach(e=>e.tab.close()),this.tabs.clear(),this.embedClickHandler&&(document.removeEventListener("click",this.embedClickHandler,!0),this.embedClickHandler=null);for(const e of this.boardObservers.values())e.disconnect();this.boardObservers.clear(),this.boardRescanTimer!==null&&(clearTimeout(this.boardRescanTimer),this.boardRescanTimer=null),t.length>0&&$.showMessage(g("插件已卸载，画板未保存的改动会丢失"),3e3)}async maybeShowChangelog(){try{const t=Ka(await this.loadData(Fn),Ht);if(t==="unknown-version"||t==="up-to-date"||(await this.saveData(Fn,Ht),t!=="show"))return;const e=nr(await er(Ja(this.name)),Ht);if(!e)return;new $.Dialog({title:`${g("更新日志")} v${Ht}`,width:"min(640px, 92vw)",content:`<div class="exs-changelog b3-typography">${ir(e)}</div>`}).element.classList.add("exs-changelog-dialog")}catch(t){console.warn("[excali-studio] 更新日志读取失败",t)}}registerEmbedClick(){this.embedClickHandler=t=>{const e=t.target;if(!e||e.tagName!=="IMG")return;const i=e.getAttribute("src")||"";let s=i;try{s=new URL(i,location.origin).pathname}catch{}const o=/^\/(assets\/.+\.svg)$/i.exec(s);if(!o)return;const a=o[1];this.boardFiles.some(d=>U(d.dataPath)===a)&&(t.preventDefault(),t.stopPropagation(),this.openStudioTab(C(a)))},document.addEventListener("click",this.embedClickHandler,!0)}async bootstrapState(){try{await this.loadState()}catch(t){console.error("[excali-studio] 读取设置失败，用默认值继续",t)}try{await this.migrateLegacyBoards()}catch(t){console.error("[excali-studio] 旧白板迁移失败（下次启动重试）",t)}}async migrateLegacyBoards(){if(this.dirMigrated)return;const t=Oi(this.settings.saveDir);if(t!==Mt&&t!==yt){this.dirMigrated=!0,this.persist();return}let e=[];try{e=(await _t(Mt)).map(a=>a.path).filter(a=>Sa(B(a)))}catch(a){console.warn("[excali-studio] 迁移：读取旧保存目录失败（按近期/命名继续）",a)}const i=va({recent:this.recent,registry:this.legacyBoards,autoNamed:e}),s=new Map,o=[];for(const a of i)try{const r=await On(a,await Ee(yt,B(a)));s.set(a,C(r))}catch(r){console.warn("[excali-studio] 迁移白板失败",a,r),o.push(a)}if(t===Mt&&await this.migrateLibraryFile(),s.size>0){this.recent=_a(this.recent,s);for(const a of this.tabs.values()){const r=s.get(C(a.data.dataPath??""));r&&(a.data.dataPath=r,a.tab.updateTitle(B(r)))}}this.settings={...this.settings,saveDir:yt},this.dirMigrated=o.length===0,this.persist(),o.length>0?$.showMessage(g("白板迁移未完成：{fail} 块失败，下次启动会重试",{fail:o.length}),1e4,"error"):s.size>0&&$.showMessage(g("已把 {n} 块白板迁入 {dir}",{n:s.size,dir:yt}),6e3)}async migrateLibraryFile(){const t=C(ot(Mt,"excali-library.json")),e=C(ot(yt,"excali-library.json"));try{await st(t)&&!await st(e)&&(await xt(e,await q(t)),await bt(t))}catch(i){console.warn("[excali-studio] 迁移图库文件失败（忽略）",i)}}async remapBoardPath(t){const e=C(t),i=C(ot(this.settings.saveDir,B(e)));return i===e?null:await st(i)?i:null}studioHost(){const t=this;return{load:e=>this.loadScene(e),remapPath:e=>this.remapBoardPath(e),restoreFromBackup:e=>this.restoreFromBackup(e),get accent(){return t.settings.accentStroke?da():null},onSave:(e,i)=>this.saveSvg(e,i),saveMedia:(e,i)=>this.saveBoardMedia(e,i),openDocLink:e=>this.openBoardDocLink(e),promptFileName:(e,i)=>this.promptFileName(e,i),fetchBlockMetas:e=>Na(e),searchDocs:e=>ja(e),onRename:(e,i)=>this.renameBoard(e,i),loadLibraryItems:()=>this.loadLibraryItems(),saveLibraryItems:e=>this.saveLibraryItems(e),get showWelcome(){return t.settings.showWelcome},get gridModeEnabled(){return t.settings.gridModeEnabled},onGridChange:e=>this.rememberGrid(e),onOpenExisting:()=>this.promptOpenPath(),onNewBoard:()=>void this.openNew(),onBoardActions:(e,i)=>{i?(this.boardActions.set(e,i),this.onloadRan.has(e)||(this.onloadRan.add(e),this.runOnloadScripts(e))):(this.boardActions.delete(e),this.onloadRan.delete(e)),!i&&this.activeCustom===e&&(this.activeCustom=null),this.dockRefresh?.()},onBoardActive:e=>{this.activeCustom=e},copyBoardRef:e=>t.copyBoardRefFor(e),onRunScript:()=>void this.openScriptPicker(),listPinnedScripts:()=>this.listPinnedScripts(),onRunScriptFile:(e,i)=>void this.runScriptFile(e,i),onPinScript:(e,i)=>this.rememberScriptPin(e,i),listPinnedActions:()=>this.settings.pinnedActions,onPinAction:(e,i)=>this.rememberActionPin(e,i),getAiChannels:()=>this.settings.aiChannels,onAiChannel:(e,i)=>this.setAiChannel(e,i),getPresentationSettings:()=>this.settings.presentation,onPresentationSetting:(e,i)=>this.rememberPresentationSetting(e,i),get scriptRailCollapsed(){return t.settings.scriptRailCollapsed},get scriptRailTop(){return t.settings.scriptRailTop},onScriptRailCollapsedChange:e=>this.rememberScriptRail("scriptRailCollapsed",e),onScriptRailTopChange:e=>this.rememberScriptRail("scriptRailTop",e),get highlighter(){return t.settings.highlighter},onHighlighterChange:e=>this.rememberHighlighter(e),onHelp:()=>this.openHelp(),getLibraryImportUrl:()=>t.libraryImportUrl(),get libDirAbs(){return os(as(),t.libDirRel())},get boardDir(){return t.settings.saveDir},pickBoardPath:()=>this.pickBoardRef()}}registerStudioTab(){const t=this,e=this.studioHost();this.addTab({type:Pn,init:i=>{const s=i.element;s.classList.add("exs-panel"),s.innerHTML=`<div class="exs-loading">${g("正在打开白板…")}</div>`,this.lazyMod().then(o=>{s.innerHTML="",this.tabs.set(i,o.attachStudioTab(i,e))}).catch(o=>{console.error("[excali-studio] 画板引擎加载失败",o),s.innerHTML=`<div class="exs-loaderror"><div>${g("画板引擎加载失败：{msg}",{msg:o instanceof Error?o.message:String(o)})}</div></div>`})},destroy:function(){t.tabs.get(this)?.dispose(),t.tabs.delete(this),t.boardActions.delete(this),t.activeCustom===this&&(t.activeCustom=null),t.dockRefresh?.()}})}eaHost(){const t=this;return{getDocMarkdown:async()=>{const e=Oa()?.block?.rootID;if(!e)return"";const o=(await(await fetch("/api/block/getBlockKramdown",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e})})).json().catch(()=>null))?.data;return typeof o=="string"?o:o&&typeof o=="object"&&typeof o.kramdown=="string"?o.kramdown:""},getSelectedText:()=>{const e=window.getSelection();return e?String(e.toString()??""):""},listFiles:async e=>{try{return await ve(e||t.settings.saveDir)}catch{return[]}},readFileAsDataURL:async e=>{const i=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:C(e)})});if(!i.ok)throw new Error(`getFile HTTP ${i.status}`);const s=await i.blob();return new Promise((o,a)=>{const r=new FileReader;r.onload=()=>o(String(r.result||"")),r.onerror=()=>a(r.error||new Error("读取失败")),r.readAsDataURL(s)})},save:()=>void t.activeActions()?.flush(),notify:e=>$.showMessage(e),getSettings:()=>({saveDir:t.settings.saveDir}),getScriptSetting:(e,i)=>{const s=(At[e]??[]).find(a=>a.key===i);if(!s)return;const o=t.settings.scriptSettings?.[e]?.[i];return o===void 0||typeof o!=typeof s.default||s.type==="number"&&typeof o=="number"&&(!Number.isFinite(o)||s.min!==void 0&&o<s.min||s.max!==void 0&&o>s.max)||s.type==="select"&&typeof o=="string"&&s.options&&!s.options.some(a=>a.value===o)?s.default:o},setScriptSetting:(e,i,s)=>{if(!(At[e]??[]).find(r=>r.key===i))return;const a=t.settings.scriptSettings??{};t.settings={...t.settings,scriptSettings:{...a,[e]:{...a[e]??{},[i]:s}}},t.persist()},getHighlighter:()=>Qt(t.settings.highlighter),siyuanCall:async(e,i)=>{if(!/^(block\/(getBlockKramdown|getBlockDOM|getBlockInfo|getBlockAttrs|getBlockBreadcrumb|getChildBlocks)|export\/exportMdContent|filetree\/(getDoc|getHPathByID|getHPathByPath)|query\/sql|file\/getFile)$/.test(e))throw new Error(`只读白名单外的接口不可调用：${e}`);const o=await fetch(`/api/${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i??{})}),a=await o.json().catch(()=>null);if(!o.ok||!a||a.code!==0)throw new Error(`内核 API 失败：${e} ${a?.msg||`HTTP ${o.status}`}`);return a.data},inputPrompt:(e,i,s)=>{const o=()=>new Promise(r=>{let d=!1;const l=f=>{d||(d=!0,c.destroy(),r(f))},c=new $.Dialog({title:e,width:"340px",content:`<div class="exs-picker">
  <input class="b3-text-field fn__block exs-name-input" type="${i==="number"?"number":i==="password"?"password":"text"}" value="${lt(s)}" />
  <div class="exs-name-actions">
    <button class="b3-button exs-name-cancel" type="button">${g("取消")}</button>
    <button class="b3-button exs-name-ok" type="button">${g("确定")}</button>
  </div>
</div>`,destroyCallback:()=>l(null)});c.element.classList.add("exs-name-dialog");const p=c.element.querySelector(".exs-name-input");c.element.querySelector(".exs-name-cancel").addEventListener("click",()=>l(null));const h=()=>l(p.value);c.element.querySelector(".exs-name-ok").addEventListener("click",h),p.addEventListener("keydown",f=>{f.key==="Enter"?(f.preventDefault(),h()):f.key==="Escape"&&(f.preventDefault(),l(null)),f.stopPropagation()}),setTimeout(()=>{p.focus(),p.select()},50)}),a=this.inputPromptChain.then(o,o);return this.inputPromptChain=a.catch(()=>null),a},selectOption:e=>{const i=()=>new Promise(o=>{if(e.options.length===0){o(null);return}let a=!1;const r=new $.Menu("excali-select-option",()=>{a||o(null)});for(const l of e.options)r.addItem({label:l.hint?`${l.label}（${l.hint}）`:l.label,current:l.value===e.current,click:()=>{a=!0,o(l.value)}});const d=e.at??{x:window.innerWidth/2,y:window.innerHeight/3};r.open({x:d.x,y:d.y})}),s=this.selectOptionChain.then(i,i);return this.selectOptionChain=s.catch(()=>null),s}}}async agentRun(t){if(!this.settings.aiChannels.agent)return{error:g("通道已关闭：内置智能体")};try{return await t()}catch(e){return console.warn("[excali-studio] 智能体能力失败",e),{error:e instanceof Error?e.message:String(e)}}}agentBoardDir(){return U(C(this.settings.saveDir)).replace(/\/+$/,"")}async resolveAgentBoard(t){const e=typeof t.board=="string"?t.board.trim():"",i=typeof t.path=="string"&&t.path.trim()?t.path.trim():/\.svg$/i.test(e)?e:"",s=typeof t.title=="string"&&t.title.trim()?t.title.trim():/\.svg$/i.test(e)?"":e;await this.ready;const o=this.agentBoardDir();if(i){const p=U(C(i));return!/\.svg$/i.test(p)||o!==""&&!p.startsWith(`${o}/`)||!await st(p)?null:{path:C(p),title:B(p).replace(/\.svg$/i,"")}}if(!s)return null;const a=await _t(this.settings.saveDir),r=s.replace(/\.svg$/i,"").toLowerCase(),d=a.filter(p=>B(p.path).replace(/\.svg$/i,"").toLowerCase()===r);if(d.length===0)return null;const c=d.find(p=>B(p.path).replace(/\.svg$/i,"")===s.replace(/\.svg$/i,""))??d[0];return{path:C(c.path),title:B(c.path).replace(/\.svg$/i,"")}}async waitForAgentActions(t,e=2e4){const i=C(t),s=Date.now()+e;for(;Date.now()<s;){for(const[o,a]of this.tabs){if(a.data.dataPath!==i)continue;const r=this.boardActions.get(o);if(r?.getEaHandle())return r}await new Promise(o=>setTimeout(o,120))}return null}agentDrawOrigin(t){const e=t.getElements().filter(s=>!s.isDeleted);if(e.length===0)return{x:0,y:0};const i=wt(e);return i?{x:i.minX,y:i.maxY+80}:{x:0,y:0}}loadAgentStyles(){return Ul({list:async()=>(await ve(Fe,/\.json$/i)).map(t=>t.slice(t.lastIndexOf("/")+1)),read:t=>q(`${Fe}/${t}`)})}async agentListBoards(t){await this.ready;const e=typeof t.query=="string"?t.query.trim().toLowerCase():"",i=Number(t.limit),s=Number.isFinite(i)?Math.max(1,Math.min(100,Math.floor(i))):50,o=await _t(this.settings.saveDir),a=e?o.filter(c=>c.path.toLowerCase().includes(e)||B(c.path).toLowerCase().includes(e)):o,r=a.slice(0,s).map(c=>({title:B(c.path).replace(/\.svg$/i,""),path:c.path,updated:c.updated,updatedAt:c.updated?new Date(c.updated).toISOString():""})),d=await this.loadAgentStyles(),l=Yl();return{result:`白板库 ${this.agentBoardDir()}：${a.length} 块${e?`（匹配「${e}」）`:""}。可用风格：${l.map(c=>c.name).join("/")}。`,structuredContent:{dir:this.agentBoardDir(),total:a.length,boards:r,styles:l,styleWarnings:d.warnings}}}async agentOpenBoard(t){const e=await this.resolveAgentBoard(t);if(!e)return{error:`找不到白板：${String(t.board??t.path??"")}（只认 ${this.agentBoardDir()} 下的 .svg）`};await this.openStudioTab(e.path);const i=await this.waitForAgentActions(e.path,15e3);return{result:`已打开「${e.title}」${i?"":"（画布引擎仍在加载）"}。`,structuredContent:{ok:!0,path:U(e.path),title:e.title,ready:!!i}}}async agentDrawBoard(t){await this.ready;let e=t.plan;if(typeof e=="string")try{e=JSON.parse(e)}catch{return{error:"plan 是字符串但不是合法 JSON"}}if(!e||typeof e!="object"||Array.isArray(e))return{error:"缺少 plan 对象（nodes/edges/title/preset/layout）"};const i=t.append!==!1,s=[t.board,t.path].some(m=>typeof m=="string"&&m.trim()!==""),o=i?await this.resolveAgentBoard(t):null;if(i&&s&&!o)return{error:`找不到白板：${String(t.board??t.path)}（不自动改新建，避免画错板）`};let a,r=!1;if(o)a=o;else{const m=e.title,y=typeof t.title=="string"&&t.title.trim()||typeof m=="string"&&m.trim()||g("AI 白板"),w=await this.createBoardFile(y);a={path:w.path,title:B(w.path).replace(/\.svg$/i,"")},r=!0}await this.openStudioTab(a.path);const d=await this.waitForAgentActions(a.path),l=d?.getEaHandle();if(!d||!l)return{error:`白板「${a.title}」已打开，但画布引擎未在 20 秒内就绪。请手动打开后重试。`};const c=r?{x:0,y:0}:this.agentDrawOrigin(l),p=await this.loadAgentStyles(),h=[t.style,t.preset].find(m=>typeof m=="string"&&m.trim()!==""),f=vl(e,{origin:c,idPrefix:Ne("ai"),preset:h,layout:t.layout});l.addElements(f.specs);let u=0;for(const m of f.routes){const y=l.connectObjects(m.fromElementId,m.side1,m.toElementId,m.side2,4);y&&(u+=1,l.patchElements([y],{x:m.p1.x,y:m.p1.y,points:m.points,strokeColor:f.preset.edge,strokeWidth:f.preset.strokeWidth,strokeStyle:f.preset.strokeStyle,roughness:f.preset.roughness}))}l.selectElements(f.nodes.map(m=>m.elementId)),l.scrollToContent();let x=!1;try{x=await d.flush()}catch{x=!1}const b={ok:!0,created:r,path:U(a.path),title:a.title,nodes:f.nodes.length,edges:u,preset:f.plan.preset,layout:f.plan.layout,styleWarnings:p.warnings,saved:x,origin:c,warnings:f.plan.warnings};return{result:`${r?"已新建":"已绘制到"}「${a.title}」：${b.nodes} 个节点、${b.edges} 条连线（${b.path}）${x?"。":"；落盘失败，稍后自动保存会重试。"}`+(b.warnings.length?` 忽略 ${b.warnings.length} 条计划警告。`:""),structuredContent:b}}async agentGenerateImage(t){await this.ready;const e=typeof t.prompt=="string"?t.prompt.trim():"";if(!e)return{error:"prompt 不能为空"};const i=t.append!==!1,s=[t.board,t.path].some(y=>typeof y=="string"&&y.trim()!==""),o=i?await this.resolveAgentBoard(t):null;if(i&&s&&!o)return{error:`找不到白板：${String(t.board??t.path)}（不自动改新建，避免插错板）`};let a;try{a=await ec({baseUrl:this.settings.imageBaseUrl,model:this.settings.imageModel,apiKey:this.settings.imageApiKey,size:this.settings.imageSize},e,nc(),{size:typeof t.size=="string"&&t.size.trim()?t.size.trim():void 0})}catch(y){return{error:y instanceof Error?y.message:String(y)}}let r,d=!1;if(o)r=o;else{const y=typeof t.title=="string"&&t.title.trim()||g("AI 图片"),w=await this.createBoardFile(y);r={path:w.path,title:B(w.path).replace(/\.svg$/i,"")},d=!0}await this.openStudioTab(r.path);const l=await this.waitForAgentActions(r.path),c=l?.getEaHandle();if(!l||!c)return{error:`图片已生成，但白板「${r.title}」的画布未在 20 秒内就绪，未插入。请手动打开后重试（会重新生成一张图）。`};const p=d?{x:0,y:0}:this.agentDrawOrigin(c),h=this.agentImageDimension(t.width)??a.width,f=this.agentImageDimension(t.height)??a.height;let u="";try{u=await c.addImage(a.dataURL,{...p,width:h,height:f})}catch(y){return{error:`图片已生成，但插入画布失败：${y instanceof Error?y.message:String(y)}`}}c.selectElements([u]),c.scrollToElement(u);let x=!1;try{x=await l.flush()}catch{x=!1}const b=Math.floor(a.base64.length*3/4),m={ok:!0,created:d,path:U(r.path),title:r.title,imageId:u,width:h,height:f,mime:a.mime,bytes:b,revisedPrompt:a.revisedPrompt??"",saved:x,origin:p};return{result:`${d?"已新建并插入":"已插入"}图片到「${r.title}」：${h}×${f}（${m.path}）${x?"。":"；落盘失败，稍后自动保存会重试。"}`+(a.revisedPrompt?` 模型改写：${a.revisedPrompt}`:""),structuredContent:m}}agentImageDimension(t){if(t==null||t==="")return;const e=Number(t);if(Number.isFinite(e))return Math.max(64,Math.min(4096,Math.round(e)))}registerAgentCapabilities(){if(typeof this.addAgentCapability=="function"&&this.settings.aiChannels.agent)try{this.addAgentCapability({name:"excali_list_boards",title:g("列出 Excali 白板"),description:g("列出白板库里的白板（标题、路径、更新时间），可按 query 过滤。只读。"),inputSchema:{type:"object",properties:{query:{type:"string",description:g("按标题/路径过滤（不区分大小写）")},limit:{type:"number",minimum:1,maximum:100,description:g("最多返回条数，默认 50")}}},effects:{localRead:!0},handler:t=>this.agentRun(()=>this.agentListBoards(t))}),this.addAgentCapability({name:"excali_open_board",title:g("打开 Excali 白板"),description:g("打开指定白板并等待画布就绪；board 传标题，path 传保存目录下的路径。"),inputSchema:{type:"object",properties:{board:{type:"string",description:g("白板标题（不含 .svg）")},path:{type:"string",description:g("白板路径，如 assets/excali/foo.svg")}}},effects:{localRead:!0},handler:t=>this.agentRun(()=>this.agentOpenBoard(t))}),this.addAgentCapability({name:"excali_draw_board",title:g("用 AI 计划绘制 Excali 白板"),description:g("把结构化计划（nodes/edges）画成白板：board 为空则新建，有值则追加到已有白板；自动布局、配色并保存。"),inputSchema:{type:"object",properties:{plan:{type:"object",description:g("绘图计划：{ title, caption, preset, layout, groups, nodes: [{id,label,shape,group,rank,order}], edges: [{from,to,label}] }"),properties:{title:{type:"string"},caption:{type:"string"},preset:{type:"string",description:g("pencil/marker/blueprint 或 data/assets/excali-styles 里的风格包名")},layout:{type:"string",enum:["lr","tb","grid","radial"]},groups:{type:["object","array"],description:g("要画框的分组：{ 组名: 框标题 }，组名对应 node.group；同组节点在层内挨着放，框包住非成员时会返回 warning")},nodes:{type:"array",description:g("节点：字符串，或 {id,label,shape,group,rank,order}。rank = lr/tb 里钉在第几层（0 起）；order = 层内先后，与位次比较（0 = 最前；grid 里是格子、radial 里是环上）。都可省略"),items:{type:["string","object"]}},edges:{type:"array",items:{type:["string","object","array"]}}},required:["nodes"]},board:{type:"string",description:g("追加到已有白板的标题或路径；省略则新建")},title:{type:"string",description:g("新建白板的文件名；省略用计划标题或「AI 白板」")},append:{type:"boolean",description:g("board 指向已有白板时是否追加，默认 true")},style:{type:"string",description:g("风格包名：内置预设，或 assets/excali-styles 目录里的 json 包；与 preset 同义，优先 style")},preset:{type:"string",description:g("覆盖计划内的风格")},layout:{type:"string",enum:["lr","tb","grid","radial"],description:g("覆盖计划内的布局")}},required:["plan"]},effects:{localRead:!0,localWrite:!0},handler:t=>this.agentRun(()=>this.agentDrawBoard(t))}),this.addAgentCapability({name:"excali_generate_image",title:g("生成图片并插入 Excali 白板"),description:g("调用设置里的 OpenAI 兼容图像 API 生成一张位图，插入已有白板或新建白板；图片不可编辑。需要先在插件设置里填 API 地址和 Key。"),inputSchema:{type:"object",properties:{prompt:{type:"string",description:g("画面描述（主体、风格、构图；上限 4000 字符）")},board:{type:"string",description:g("插入到已有白板的标题或路径；省略则新建")},title:{type:"string",description:g("新白板文件名；省略用「AI 图片」")},append:{type:"boolean",description:g("board 指向已有白板时是否插入到该板，默认 true")},width:{type:"number",minimum:64,maximum:4096,description:g("图像显示宽度；省略按原图尺寸")},height:{type:"number",minimum:64,maximum:4096,description:g("图像显示高度；省略按原图尺寸")},size:{type:"string",description:g("尺寸覆盖（如 1024x1024）；省略用设置里的值")}},required:["prompt"]},effects:{localRead:!0,localWrite:!0},handler:t=>this.agentRun(()=>this.agentGenerateImage(t))})}catch(t){console.warn("[excali-studio] 注册智能体能力失败（思源版本可能不支持）",t)}}openScriptPicker(){if(!this.settings.aiChannels.script){$.showMessage(g("脚本通道已在「AI 通道」面板里关闭"));return}this.scriptPickerDialog||(async()=>{const t=await zt();if(t.length===0){$.showMessage(g("还没有脚本：首次启用会自动安装内置脚本到 {dir}",{dir:W}),7e3);return}const e=new Set(this.settings.pinnedScripts),i=b=>Zo[b]??Rn,s=b=>`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${b}"/></svg>`,o=b=>{const m=At[b.name];return!m||m.length===0?"":`<div class="exs-script-settings" data-settings hidden>${m.map(w=>{const k=this.eaHost().getScriptSetting(b.name,w.key),S=k===void 0?w.default:k,v=lt(w.key),E=w.type==="select"?`<select class="b3-select" data-key="${v}">${(w.options??[]).map(I=>`<option value="${lt(I.value)}"${String(I.value)===String(S)?" selected":""}>${Z(I.label)}</option>`).join("")}</select>`:w.type==="toggle"?`<input class="b3-switch" type="checkbox" data-key="${v}"${S?" checked":""} />`:`<input class="b3-text-field" type="number" data-key="${v}" value="${lt(String(S))}"${w.min!==void 0?` min="${w.min}"`:""}${w.max!==void 0?` max="${w.max}"`:""} />`;return`<div class="exs-script-settings__field"><label>${Z(w.label)}</label>${E}</div>`}).join("")}<div class="exs-script-settings__tip">${g("保存即生效；脚本运行时弹窗会用它预填，仍可临时改一次。")}</div></div>`},a=`<div class="exs-picker__hint"><b>${g("脚本使用说明")}</b>${g("点一条立即对当前画布执行；先框选画布元素再跑 = 对选中操作（对齐、连线、标注类）；先打开文档页签再跑 = 读文档内容（思维导图、表格类）。行尾按钮可固定到画布右缘侧边栏 / 改脚本设置（也可右键一条固定）。脚本就是 {dir} 下的 Markdown，可直接编辑，文件头加 @excalidraw-onload 则画布打开时自动运行。",{dir:W})}</div>`,r=new Set(this.settings.pinnedActions),d=(b,m)=>b?{do:g("固定到右上角"),done:g("已固定在右上角")}:{do:g("固定到侧边栏"),done:g("已固定到侧边栏")},l=b=>{const m=r.has(b.id),y=d(we(b)==="top-right");return`<div class="b3-list-item exs-script-item${m?" exs-script-item--pinned":""}" data-rail-action="${lt(b.id)}" title="${lt(b.id)}"><div class="exs-script-item__head"><span class="b3-list-item__text"><span class="exs-script-item__icon">${s(b.icon)}</span>${Z(g(b.title))}${m?` <span class="exs-script-pin" title="${y.done}"></span>`:""}</span><span class="exs-script-item__actions"><button type="button" class="b3-button b3-button--text${m?" exs-script-item__btn--on":""}" data-act="pin" title="${m?y.done:y.do}">${s(Tn)}</button></span></div><span class="exs-script-desc">${Z(g(b.desc))}</span></div>`},c=Xe.map(l).join(""),p=t.map((b,m)=>{const y=At[b.name]??[],w=e.has(b.name);return`<div class="b3-list-item exs-script-item${w?" exs-script-item--pinned":""}" data-idx="${m}" title="${Z(b.name)}"><div class="exs-script-item__head"><span class="b3-list-item__text"><span class="exs-script-item__icon">${s(i(b.name))}</span>${Z(b.title)}${b.onload?` <span class="exs-script-badge">${g("打开时自动运行")}</span>`:""}${w?` <span class="exs-script-pin" title="${g("已固定到侧边栏")}"></span>`:""}</span><span class="exs-script-item__actions">${y.length>0?`<button type="button" class="b3-button b3-button--text" data-act="gear" title="${g("脚本设置")}">${s(Rn)}</button>`:""}<button type="button" class="b3-button b3-button--text${w?" exs-script-item__btn--on":""}" data-act="pin" title="${g(w?"已固定到侧边栏":"固定到侧边栏")}">${s(Tn)}</button></span></div>${b.description?`<span class="exs-script-desc">${Z(b.description)}</span>`:`<span class="b3-list-item__meta">${Z(b.name)}</span>`}${o(b)}</div>`}).join(""),h=await Ui(),f=h.length>0?`<div class="exs-picker__outdated"><span>${g("{n} 个内置脚本有新版本",{n:h.length})}${g("旧版内置脚本行为可能和插件不一致，重置会覆盖你在这些脚本里的修改（自建脚本不受影响）。")}</span><button type="button" class="b3-button b3-button--text" data-act="reset">${g("重置为最新版")}</button></div>`:"",u=new $.Dialog({title:g("拓展功能"),width:"520px",content:`<div class="exs-picker">${f}${c}${a}<div class="exs-picker__group">${g("脚本库")}</div><div class="b3-list b3-list--background exs-board-list">${p}</div></div>`,destroyCallback:()=>{this.scriptPickerDialog===u&&(this.scriptPickerDialog=null),window.dispatchEvent(new CustomEvent(xe,{detail:{pickerOpen:!1}}))}});u.element.classList.add("exs-picker-dialog"),this.scriptPickerDialog=u,window.dispatchEvent(new CustomEvent(xe,{detail:{pickerOpen:!0}}));const x=(b,m,y=!1)=>{const w=d(y);b.classList.toggle("exs-script-item--pinned",m);const k=b.querySelector('[data-act="pin"]');k&&(k.classList.toggle("exs-script-item__btn--on",m),k.title=m?w.done:w.do);const S=b.querySelector(".exs-script-pin");if(m&&!S){const v=document.createElement("span");v.className="exs-script-pin",v.title=w.done,b.querySelector(".b3-list-item__text")?.appendChild(v)}else!m&&S&&S.remove()};u.element.addEventListener("click",b=>{if(b.target?.closest?.('[data-act="reset"]')){(async()=>{const v=await fr();$.showMessage(g("已重置 {n} 个内置脚本",{n:v}),3e3),u.destroy(),this.openScriptPicker()})();return}const m=b.target?.closest?.("[data-rail-action]");if(m){const v=m.dataset.railAction??"";if(!Pe(v))return;if(b.target?.closest?.('[data-act="pin"]')){const E=we(Ln(v))==="top-right",I=this.settings.pinnedActions.includes(v);this.rememberActionPin(v,!I),x(m,!I,E);return}u.destroy(),this.runRailAction(v);return}const y=b.target?.closest?.(".exs-script-item"),w=y?.dataset?.idx;if(!y||w===void 0)return;const k=t[Number(w)];if(!k)return;const S=b.target?.closest?.("[data-act]");if(S){if(S.dataset.act==="pin"){const v=this.settings.pinnedScripts.includes(k.name);this.rememberScriptPin(k.name,!v),x(y,!v)}else if(S.dataset.act==="gear"){const v=y.querySelector(".exs-script-settings");if(v){const E=v.hasAttribute("hidden");u.element.querySelectorAll(".exs-script-settings").forEach(I=>{I!==v&&I.setAttribute("hidden","")}),u.element.querySelectorAll('[data-act="gear"]').forEach(I=>{I!==S&&I.classList.remove("exs-script-item__btn--on")}),E?v.removeAttribute("hidden"):v.setAttribute("hidden",""),S.classList.toggle("exs-script-item__btn--on",E)}}return}b.target?.closest?.(".exs-script-settings")||(u.destroy(),this.runScriptOnActiveBoard(k,{shift:b.shiftKey,at:{x:b.clientX,y:b.clientY}}))}),u.element.addEventListener("change",b=>{const m=b.target,y=m?.closest?.(".exs-script-settings");if(!y||!m?.dataset?.key)return;const k=y.closest(".exs-script-item")?.dataset?.idx;if(k===void 0)return;const S=t[Number(k)];if(!S)return;const v=m.dataset.key,E=(At[S.name]??[]).find(M=>M.key===v);if(!E)return;const I=E.type==="number"?Math.max(E.min??0,Math.min(E.max??Number.MAX_SAFE_INTEGER,Number(m.value)||0)):E.type==="toggle"?m.checked:m.value;this.eaHost().setScriptSetting(S.name,v,I),$.showMessage(g("已保存：{name} › {label}",{name:S.title,label:E.label}),3e3)}),u.element.addEventListener("contextmenu",b=>{const m=b.target?.closest?.("[data-rail-action]");if(m){const E=m.dataset.railAction??"";if(!Pe(E))return;b.preventDefault();const I=we(Ln(E))==="top-right",M=this.settings.pinnedActions.includes(E),_=d(I),A=new $.Menu;A.addItem({label:M?_.done:_.do,click:()=>{this.rememberActionPin(E,!M),x(m,!M,I)}}),A.open({x:b.clientX,y:b.clientY});return}const y=b.target?.closest?.(".exs-script-item"),w=y?.dataset?.idx;if(!y||w===void 0)return;const k=t[Number(w)];if(!k)return;b.preventDefault();const S=this.settings.pinnedScripts.includes(k.name),v=new $.Menu;v.addItem({label:g(S?"从侧边栏取消固定":"固定到侧边栏"),click:()=>{this.rememberScriptPin(k.name,!S),x(y,!S)}}),v.open({x:b.clientX,y:b.clientY})})})()}async listPinnedScripts(){if(this.settings.pinnedScripts.length===0)return[];let t=[];try{t=await zt()}catch{return[]}return this.settings.pinnedScripts.map(e=>t.find(i=>i.name===e)).filter(e=>!!e).map(e=>({name:e.name,title:e.title}))}async runScriptFile(t,e){let i=[];try{i=await zt()}catch{i=[]}const s=i.find(o=>o.name===t);if(!s){$.showMessage(g("找不到脚本：{name}",{name:t}),7e3,"error");return}await this.runScriptOnActiveBoard(s,e)}rememberScriptPin(t,e){const i=this.settings.pinnedScripts,s=e?i.includes(t)?i:[...i,t]:i.filter(o=>o!==t);s.length===i.length&&s.every((o,a)=>o===i[a])||(this.settings={...this.settings,pinnedScripts:s},this.persist(),window.dispatchEvent(new CustomEvent(In)))}rememberActionPin(t,e){const i=this.settings.pinnedActions,s=e?i.includes(t)?i:[...i,t]:i.filter(o=>o!==t);s.length===i.length&&s.every((o,a)=>o===i[a])||(this.settings={...this.settings,pinnedActions:s},this.persist(),window.dispatchEvent(new CustomEvent(In)))}setAiChannel(t,e){this.settings.aiChannels[t]!==e&&(this.settings={...this.settings,aiChannels:{...this.settings.aiChannels,[t]:e}},this.persist(),t==="agent"&&$.showMessage(g(e?"内置智能体通道已开启：重载思源后注册生效":"内置智能体通道已关闭：重载思源后彻底摘除"),6e3))}async runRailAction(t){if(t===Ci){const s=this.activeActions();if(!s){$.showMessage(g("先打开一块白板，再改外框颜色"));return}s.openOutlinePalette();return}if(t===Ri){const s=this.activeActions();if(!s){$.showMessage(g("先打开一块白板，再转换图片"));return}s.openImageToMaterial();return}if(t===Ti){const s=this.activeActions();if(!s){$.showMessage(g("先打开一块白板，再放映"));return}s.openPresentation();return}if(t!==ze)return;const e=this.activeActions();if(!e){$.showMessage(g("先打开一块白板，再往里插卡片"));return}const i=await this.pickBoardRef();i&&e.insertBoardCard(i,B(i).replace(/\.svg$/i,""))}rememberScriptRail(t,e){this.settings[t]!==e&&(this.settings={...this.settings,[t]:e},this.persist(),window.dispatchEvent(new CustomEvent(xe,{detail:{[t]:e}})))}rememberHighlighter(t){const e=Qt(t),i=this.settings.highlighter;i.color===e.color&&i.width===e.width&&i.opacity===e.opacity||(this.settings={...this.settings,highlighter:e},this.persist(),window.dispatchEvent(new CustomEvent(Bo,{detail:e})))}rememberPresentationSetting(t,e){const i=Bi({...this.settings.presentation,[t]:e});this.settings.presentation[t]!==i[t]&&(this.settings={...this.settings,presentation:i},this.persist())}async runScriptOnActiveBoard(t,e){if(!this.settings.aiChannels.script){$.showMessage(g("脚本通道已在「AI 通道」面板里关闭"));return}const s=this.activeActions()?.getEaHandle()??null;if(!s){$.showMessage(g("没有可运行脚本的白板：请先打开一张"));return}let o;try{o=await Be(t.path)}catch(d){$.showMessage(g("读取脚本失败：{msg}",{msg:d instanceof Error?d.message:String(d)}),7e3,"error");return}const a=Xn(s,this.eaHost(),t.name,e),r=await jn(o.code,a,a.utils);r.logs.length>0&&console.log(`[excali-studio][脚本] ${t.title}
${r.logs.join(`
`)}`),r.ok?$.showMessage(g("脚本「{title}」运行成功（{ms}ms）",{title:t.title,ms:r.durationMs})):$.showMessage(g("脚本「{title}」运行失败：{msg}",{title:t.title,msg:(r.error||"").split(`
`)[0]}),1e4,"error")}async runOnloadScripts(t){let e=[];try{e=(await zt()).filter(i=>i.onload)}catch{return}for(const i of e){const o=this.boardActions.get(t)?.getEaHandle()??null;if(o)try{const a=await Be(i.path),r=Xn(o,this.eaHost(),i.name),d=await jn(a.code,r,r.utils);d.logs.length>0&&console.log(`[excali-studio][onload 脚本] ${i.title}
${d.logs.join(`
`)}`),d.ok||console.warn(`[excali-studio][onload 脚本失败] ${i.title}: ${(d.error||"").split(`
`)[0]}`)}catch(a){console.warn("[excali-studio][onload 脚本异常]",i.title,a)}}}activeActions(){return this.activeCustom?this.boardActions.get(this.activeCustom)??null:null}registerDock(){const t=this,e={openNew:()=>void this.openNew(),deleteActiveBoard:()=>t.deleteActiveBoard(),getBoardFiles:()=>{const i=new Set;for(const s of t.tabs.values())typeof s.data.dataPath=="string"&&i.add(s.data.dataPath);return{files:t.boardFiles,opened:i}},refreshBoardLib:()=>void t.refreshBoardLib(),openBoardFile:i=>void t.openStudioTab(i.dataPath),renameBoardFile:i=>void t.renameFromDock(i),deleteBoardFile:i=>void t.deleteBoardFile(i),openFileMenu:(i,s,o)=>t.openFileMenu(i,s,o),hasActiveBoard:()=>t.activeCustom!==null&&t.tabs.has(t.activeCustom),onRefresh:i=>{this.dockRefresh=i}};this.addDock({id:this.name+"-dock",type:"excali_studio_dock",config:{position:"LeftBottom",size:{width:300,height:0},icon:ct,title:g("Excali 白板")},data:{name:this.name},init:i=>{const s=qa(e),o=i.element;o.innerHTML="",o.appendChild(s.element),this.dockRefresh=s.refresh,s.refresh()},destroy:()=>{this.dockRefresh=null}})}openHelp(){const e=[["⌘⌥E",g("新建白板")],["⌘S",g("保存（已有文件静默覆盖）")],["⌘⇧E",g("导出图片…")],[g("空格 + 拖动"),g("平移画布")],[g("滚轮"),g("缩放画布")],[g("画布右键菜单"),g("只读 / 禅模式 / 网格 / 统计")]].map(([i,s])=>`<div class="exs-help__row"><span class="exs-help__key">${Z(i)}</span><span>${Z(s)}</span></div>`).join("");new $.Dialog({title:g("帮助"),width:"420px",content:`<div class="exs-help">${e}</div>`,destroyCallback:()=>{}})}async openStudioTab(t){const e=t?C(t):null;if(e){const o=[...this.tabs.values()].find(a=>a.data.dataPath===e);if(o){o.tab.parent.switchTab(o.tab.headElement);return}}if(Dn()){this.openMobileStudio(e);return}const i=new Set(this.tabs.values());await $.openTab({app:this.app,openNewTab:!0,custom:{id:this.name+Pn,icon:ct,title:e?B(e):g("未命名白板"),data:{dataPath:e}}});const s=[...this.tabs.values()].find(o=>!i.has(o));s&&s.tab.parent.switchTab(s.tab.headElement)}openMobileStudio(t){const e={dataPath:t},i={custom:null},s=sa({data:e,onDispose:()=>{const r=i.custom;r&&(this.tabs.delete(r),this.boardActions.delete(r),this.onloadRan.delete(r),this.activeCustom===r&&(this.activeCustom=null),this.dockRefresh?.())}}),o=s.custom;i.custom=o;const a={tab:o.tab,data:e,requestClose:()=>s.close(),closeForDelete:()=>s.close(),dispose:()=>{}};this.tabs.set(o,a),this.dockRefresh?.(),this.lazyMod().then(r=>{if(s.isClosed())return;s.body.replaceChildren();const d=r.attachStudioTab(o,this.studioHost());if(s.isClosed()){d.dispose();return}this.tabs.set(o,d),s.mount(d),this.dockRefresh?.()}).catch(r=>{s.isClosed()||(console.error("[excali-studio] 画板引擎加载失败",r),s.showError(g("画板引擎加载失败：{msg}",{msg:r instanceof Error?r.message:String(r)})))})}async loadScene(t){if(!t)return null;await this.ready;const e=await q(t),{decodeSvgScene:i}=await this.lazyMod(),s=await i(e,o=>this.hydrateSceneFiles(o));return this.rememberRecent(t),s}async hydrateSceneFiles(t){const e={};for(const[i,s]of Object.entries(t)){const o=s??{};if(typeof o.dataURL=="string"&&o.dataURL!==""){e[i]=s;continue}if(typeof o.path!="string"||o.path===""){e[i]=s;continue}try{const a=await ia(o.path),r=typeof o.mimeType=="string"&&o.mimeType!==""?o.mimeType:"image/png";e[i]={...o,dataURL:ca(a,r)}}catch(a){console.warn("[excali-studio] 白板图片读回失败（该图会显示为空框）",o.path,a),e[i]=s}}return e}async saveBoardMedia(t,e){const i=aa(t);if(!i)throw new Error(g("无法解析图片数据"));const s=await la(i.bytes,i.mime||e),o=`${oa}/${s}`;return await na(o,i.bytes,i.mime||e),o}openBoardDocLink(t){const e=wa(t);if(e){this.openLinkedBoard(e);return}const i=$a(t);if(i){if(i.kind==="block"){this.openSiyuanBlock(i.id);return}this.openDocOf(i.id);return}const s=ga(t);if(s){this.openSiyuanBlock(s);return}const o=pa(t);if(!o){$.showMessage(g("无法识别的文档链接：{link}。支持思源块超链接（siyuan://blocks/…）、文档超链接（siyuan://doc/…）与块引用（((id '标题'))）",{link:t}),7e3,"error");return}this.openDocOf(o)}openSiyuanBlock(t){if(Dn()){this.openDocumentById(t);return}$.openTab({app:this.app,doc:{id:t},position:"right"}).catch(e=>{$.showMessage(g("打开文档失败：{msg}",{msg:e instanceof Error?e.message:String(e)}),7e3)})}async openLinkedBoard(t){if(!await st(t)){$.showMessage(g("这块白板已经不在了：{path}",{path:U(t)}),5e3,"error");return}await this.openExisting(t)}async restoreFromBackup(t){const e=C(t);for(const i of Fi(e))try{const s=await q(i);if(!Mo(s))continue;return await It(e,s),_e(e),!0}catch{}return!1}buildTopMenu(t){t.addItem({icon:"iconAdd",label:g("新建白板"),click:()=>void this.openNew()}),t.addSeparator(),this.recent.length===0?t.addItem({type:"readonly",label:g("还没有打开或保存过白板")}):(this.recent.slice(0,sc).forEach(e=>{const i=t.addItem({label:B(e),click:()=>void this.openExisting(e)});i instanceof HTMLElement&&i.setAttribute("title",e)}),t.addItem({label:g("清空最近记录"),click:()=>this.clearRecent()})),t.addSeparator(),t.addItem({icon:"iconOpen",label:g("按路径打开…"),click:()=>this.promptOpenPath()}),t.addItem({icon:"iconFolder",label:g("打开白板…"),click:()=>void this.openBoardPicker()}),t.addItem({icon:"iconSettings",label:g("设置"),click:()=>this.openSetting()})}registerBlockIconMenu(){this.eventBus.on("click-blockicon",({detail:t})=>{const e=Nn(t.blockElements);e&&t.menu.addItem({icon:ct,label:g("用 Excali 白板打开"),click:()=>void this.openExisting(e)})})}boardAssetRefOf(t){const e=String(t??"").split("#")[0].split("?")[0],i=/\/?(assets\/[^\s]+?\.svg)$/i.exec(e);if(!i)return null;const s=this.settings.saveDir.replace(/\/+$/,"");return i[1].startsWith(s+"/")?i[1]:null}isBoardDataPath(t){return t.startsWith(C(this.settings.saveDir.replace(/\/+$/,"")))}openBoardAssetRef(t){const e=this.boardAssetRefOf(t);e&&this.openExisting(C(e))}registerBoardDecorations(){const t=e=>{const i=e?.wysiwyg?.element;i instanceof Element&&i.isConnected&&(this.observeBoardDom(i),this.decorateProtyle(i))};this.eventBus.on("switch-protyle",({detail:e})=>t(e?.protyle)),this.eventBus.on("click-editorcontent",({detail:e})=>t(e?.protyle)),this.eventBus.on("open-menu-image",({detail:e})=>{if(!(e?.element instanceof HTMLElement))return;const i=Nn([e.element]);!i||!this.isBoardDataPath(i)||e.menu.addItem({icon:ct,label:g("用 Excali 白板打开"),click:()=>void this.openExisting(i)})})}decorateProtyle(t){za(t,{isBoardAsset:e=>this.boardAssetRefOf(e)!==null,openBoard:e=>this.openBoardAssetRef(e)})}observeBoardDom(t){if(this.boardObservers.has(t))return;const e=new MutationObserver(()=>this.scheduleBoardRescan());e.observe(t,{childList:!0,subtree:!0}),this.boardObservers.set(t,e)}scheduleBoardRescan(){this.boardRescanTimer===null&&(this.boardRescanTimer=setTimeout(()=>{this.boardRescanTimer=null;for(const[t,e]of[...this.boardObservers]){if(!t.isConnected){e.disconnect(),this.boardObservers.delete(t);continue}this.decorateProtyle(t)}},150))}async refreshBoardLib(){if(!this.libLoading){this.libLoading=!0;try{await this.ready;let t=null;try{t=await _t(this.settings.saveDir)}catch(e){console.warn("[excali-studio] 白板库读保存目录失败",e)}t&&(this.boardFiles=fa(t))}finally{this.libLoading=!1}this.dockRefresh?.()}}copyText(t,e){const i=()=>$.showMessage(e,3e3);try{navigator.clipboard?.writeText?navigator.clipboard.writeText(t).then(i,()=>this.fallbackCopy(t,i)):this.fallbackCopy(t,i)}catch{this.fallbackCopy(t,i)}}fallbackCopy(t,e){try{const i=document.createElement("textarea");i.value=t,i.style.position="fixed",i.style.opacity="0",document.body.appendChild(i),i.select();const s=document.execCommand("copy");i.remove(),s?e():$.showMessage(g("复制失败：{msg}",{msg:"execCommand"}),7e3,"error")}catch(i){$.showMessage(g("复制失败：{msg}",{msg:i instanceof Error?i.message:String(i)}),7e3,"error")}}openFileMenu(t,e,i){const s=new $.Menu("excali-file-menu");s.addItem({icon:"iconEdit",label:g("在画板中打开"),click:()=>void this.openBoardFile(t)}),s.addItem({icon:"iconRight",label:g("插入到当前画布"),click:()=>this.insertBoardCardToActive(t)}),s.addItem({icon:"iconCopy",label:g("复制图片引用"),click:()=>this.copyText(`![${te(t)}](${U(t.dataPath)})`,g("已复制图片引用：粘贴到思源正文即插入白板"))}),s.addItem({icon:"iconRename",label:g("重命名"),click:()=>void this.renameFromDock(t)}),s.addSeparator(),s.addItem({icon:"iconTrash",label:g("删除…"),click:()=>void this.deleteBoardFile(t)}),s.open({x:e,y:i})}openBoardFile(t){return this.openStudioTab(t.dataPath)}insertBoardCardToActive(t){const e=this.activeActions();if(!e){$.showMessage(g("先打开一块白板，再往里插卡片"));return}e.insertBoardCard(U(t.dataPath),te(t))}openDocOf(t){this.openDocumentById(t)}openDocumentById(t){const e=window,i=e.openMobileFileById??e.siyuan?.openMobileFileById;if(e.siyuan?.mobile&&typeof i=="function")try{i(this.app,t,[],"start");return}catch(s){console.warn("[excali-studio] 移动端打开文档失败，回落页签",s)}$.openTab({app:this.app,doc:{id:t}}).catch(s=>{$.showMessage(g("打开文档失败：{msg}",{msg:s instanceof Error?s.message:String(s)}),7e3)})}async deleteBoardFile(t){const e=ua(t);$.confirm(g("删除白板"),g("将删除白板文件 {name} 及其备份（如存在）。删除不可恢复；白板开着时，画布上未保存的改动也会一并丢弃。",{name:t.name}),()=>{(async()=>{try{for(const i of[...this.tabs.values()])i.data.dataPath===t.dataPath&&i.closeForDelete();await bt(e.svgPath);for(const i of e.bakPaths)try{await bt(i)}catch{}this.boardFiles=this.boardFiles.filter(i=>i.dataPath!==t.dataPath),this.recent=this.recent.filter(i=>i!==t.dataPath),this.persist(),this.dockRefresh?.(),$.showMessage(g("已删除《{name}》",{name:t.name}),5e3)}catch(i){$.showMessage(g("删除失败：{msg}",{msg:i instanceof Error?i.message:String(i)}),1e4,"error")}})()})}deleteActiveBoard(){const t=this.activeCustom?this.tabs.get(this.activeCustom)?.data.dataPath:null;if(!t){$.showMessage(g("没有可删除的白板：当前没有打开已保存的白板"),7e3);return}const e=this.boardFiles.find(i=>i.dataPath===t);if(!e){this.refreshBoardLib().then(()=>{const i=this.boardFiles.find(s=>s.dataPath===t);i?this.deleteBoardFile(i):$.showMessage(g("删除失败：{msg}",{msg:t}),7e3,"error")});return}this.deleteBoardFile(e)}async renameFromDock(t){const e=await this.promptFileName(t.name,g("重命名白板"));if(e)try{const i=await this.renameBoard(t.dataPath,e);this.applyRenameToSession(t.dataPath,i),$.showMessage(g("已重命名为 {name}",{name:B(i)}),5e3)}catch(i){$.showMessage(g("重命名失败：{msg}",{msg:i instanceof Error?i.message:String(i)}),7e3,"error")}}applyRenameToSession(t,e){for(const i of this.tabs.values())i.data.dataPath===t&&(i.data.dataPath=e,i.tab.updateTitle(B(e)))}copyBoardRefFor(t){const e=this.tabs.get(t);if(!e)return;const i=e.data.dataPath;if(!i){$.showMessage(g("白板还没保存，保存后才能复制引用"),7e3);return}const s=B(i).replace(/\.svg$/i,"");this.copyText(`![${s}](${U(i)})`,g("已复制图片引用：粘贴到思源正文即插入白板"))}promptOpenPath(){$.openInputDialog({title:g("按路径打开…"),label:g("工作空间内的 SVG 路径"),placeholder:"assets/excali-20261015-120000.svg",value:"",confirmText:g("打开"),onConfirm:(t,e)=>{const i=t.trim();i&&(this.openExisting(C(i)),e.destroy())}})}clearSlashHint(t){const e=t?.protyle?.toolbar?.range;!e||!e.toString().startsWith("/")||(e.deleteContents(),t.protyle?.wysiwyg?.element?.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"deleteContentBackward"})))}async openNew(){const t=await this.promptFileName(g("未命名白板"),g("新建白板"));if(t)try{const{path:e}=await this.createBoardFile(t);await this.openStudioTab(e)}catch(e){$.showMessage(g("创建白板失败：{msg}",{msg:e instanceof Error?e.message:String(e)}),7e3,"error")}}openExisting(t){return this.openStudioTab(t)}async createBoardFile(t){const e=await Ee(this.settings.saveDir,ke(t,g("未命名白板"))),{sceneToSvgText:i}=await this.lazyMod();return await It(e,await i({elements:[],appState:{},files:{}})),_e(e),this.rememberRecent(e),this.rememberBoardFile(e),this.refreshBoardLib(),{path:e}}async saveSvg(t,e){if(!e)throw new Error("saveSvg 只接受已有文件（新建走 createBoardFile）");const i=C(e);let s=null;try{s=await q(i)}catch{}if(s!==null&&Io(s,t))return{path:e};const o=await It(i,t);return _e(o),this.rememberRecent(o),this.rememberBoardFile(o),this.refreshBoardLib(),{path:o}}rememberBoardFile(t){const e=C(t);this.boardFiles.some(i=>i.dataPath===e)||(this.boardFiles=[{dataPath:e,name:B(e),updated:Date.now()},...this.boardFiles])}async renameBoard(t,e){const i=C(t),s=await Ee(this.settings.saveDir,ke(e),i);if(C(s)===i)return i;const o=await On(i,s);return this.refreshBoardLib(),this.recent=[o,...this.recent.filter(a=>a!==i&&a!==o)],this.persist(),o}libDirRel(){return ot(this.settings.saveDir,"excali-libraries")}localLibRel(){return ot(this.libDirRel(),Ro)}libraryImportUrl(){const t=encodeURIComponent(this.libDirRel());return`${location.origin}/plugins/${Zt}/library-import.html?dir=${t}`}async migrateStencilLibrary(){if(!this.settings.stencilMigrated)try{const t=this.localLibRel();if(!await st(t)){let e=[];try{e=Mn(await q(C(ot(this.settings.saveDir,"excali-library.json"))))}catch{e=[]}e.length>0&&(await xt(t,$n(e)),$.showMessage(g("组件库已迁移到 {dir}",{dir:"excali-libraries"}),3500))}}catch(t){console.warn("[excali-studio] 组件库迁移失败（旧文件保留，下次不再自动尝试）",t)}finally{this.settings.stencilMigrated=!0,this.persist()}}async loadLibraryItems(){await this.migrateStencilLibrary();const t=this.localLibRel();let e=[];try{e=await ve(this.libDirRel(),/\.excalidrawlib$/i)}catch{e=[]}e.sort((s,o)=>s===t?-1:o===t?1:s.localeCompare(o));const i=[];for(const s of e)try{i.push({path:s,items:Mn(await q(s))})}catch(o){console.warn("[excali-studio] 模板库文件读取失败，已跳过",s,o)}return this.libCache=Oo(i),this.libCache.items}async saveLibraryItems(t){const e=this.libCache??{items:[],sourceOf:new Map,byPath:new Map},i=Do(e,t,this.localLibRel());for(const{path:s,items:o}of i)try{if(o.length===0){await st(s)&&await bt(s);continue}await xt(s,$n(o))}catch(a){console.error("[excali-studio] 模板库文件写入失败",s,a),$.showMessage(g("模板库保存失败：{path}",{path:B(s)}),5e3,"error")}this.libCache=null,await this.loadLibraryItems()}promptFileName(t,e){return new Promise(i=>{let s=!1;const o=l=>{s||(s=!0,a.destroy(),i(l))},a=new $.Dialog({title:e,width:"420px",content:`<div class="exs-picker">
  <input class="b3-text-field fn__block exs-name-input" value="${lt(t)}" />
  <div class="exs-name-tip">${g("位置")}：${Z(this.settings.saveDir)}</div>
  <div class="exs-name-actions">
    <button class="b3-button exs-name-cancel" type="button">${g("取消")}</button>
    <button class="b3-button exs-name-ok" type="button">${g("确定")}</button>
  </div>
</div>`,destroyCallback:()=>o(null)});a.element.classList.add("exs-name-dialog");const r=a.element.querySelector(".exs-name-input");a.element.querySelector(".exs-name-cancel").addEventListener("click",()=>o(null));const d=()=>o(ke(r.value||t));a.element.querySelector(".exs-name-ok").addEventListener("click",d),r.addEventListener("keydown",l=>{l.key==="Enter"?(l.preventDefault(),d()):l.key==="Escape"&&(l.preventDefault(),o(null)),l.stopPropagation()}),setTimeout(()=>{r.focus(),r.select()},50)})}async pickBoardRef(t){let e=[];try{e=await _t(this.settings.saveDir)}catch(s){return $.showMessage(g("读取目录失败：{msg}",{msg:s instanceof Error?s.message:String(s)}),7e3,"error"),null}if(e.length===0)return $.showMessage(g("目录里还没有白板文件")),null;const i=new Set([...this.tabs.values()].map(s=>s.data.dataPath).filter(s=>typeof s=="string"));return await Wa(e,i,t)}async openBoardPicker(){const t=await this.pickBoardRef();t&&this.openExisting(t)}rememberRecent(t){const e=C(t);this.recent=[e,...this.recent.filter(i=>i!==e)].slice(0,ic),this.persist()}clearRecent(){this.recent=[],this.persist()}setupSetting(){let t=null,e=null,i=null,s=null,o=null,a=null,r=null,d=null;this.setting=new $.Setting({confirmCallback:()=>{this.settings={...this.settings,saveDir:t?.value??this.settings.saveDir,accentStroke:e?.checked??this.settings.accentStroke,showWelcome:i?.checked??this.settings.showWelcome,gridModeEnabled:s?.checked??this.settings.gridModeEnabled,imageBaseUrl:o?.value??this.settings.imageBaseUrl,imageModel:a?.value??this.settings.imageModel,imageApiKey:r?.value??this.settings.imageApiKey,imageSize:d?.value??this.settings.imageSize},this.settings=mt(this.settings),this.persist()}}),this.setting.addItem({title:g("保存目录"),description:g("新白板保存的位置（工作空间相对路径，默认 assets/excali）。白板库只列这个目录里的 .svg；assets 根目录留给普通图片附件。"),createActionElement:()=>{const l=document.createElement("input");return l.type="text",l.className="b3-text-field fn__block",l.value=this.settings.saveDir,l.placeholder=X.saveDir,l.addEventListener("change",()=>{this.settings={...this.settings,saveDir:l.value},this.persist()}),t=l,l}}),this.setting.addItem({title:g("图像生成 API 地址"),description:g("OpenAI 兼容的 images API 地址（如 https://api.openai.com/v1）；留空 = 关闭生图。"),createActionElement:()=>{const l=document.createElement("input");return l.type="text",l.className="b3-text-field fn__block",l.value=this.settings.imageBaseUrl,l.placeholder="https://api.openai.com/v1",l.addEventListener("change",()=>{this.settings=mt({...this.settings,imageBaseUrl:l.value}),this.persist()}),o=l,l}}),this.setting.addItem({title:g("图像生成模型"),description:g("模型名（如 gpt-image-1、dall-e-3）；按服务商支持的型号填写。"),createActionElement:()=>{const l=document.createElement("input");return l.type="text",l.className="b3-text-field fn__block",l.value=this.settings.imageModel,l.placeholder=X.imageModel,l.addEventListener("change",()=>{this.settings=mt({...this.settings,imageModel:l.value}),this.persist()}),a=l,l}}),this.setting.addItem({title:g("图像生成 API Key"),description:g("只保存在插件数据里，不写日志、不写白板文件。"),createActionElement:()=>{const l=document.createElement("input");return l.type="password",l.className="b3-text-field fn__block",l.autocomplete="off",l.spellcheck=!1,l.value=this.settings.imageApiKey,l.placeholder="sk-...",l.addEventListener("change",()=>{this.settings=mt({...this.settings,imageApiKey:l.value}),this.persist()}),r=l,l}}),this.setting.addItem({title:g("图像生成尺寸"),description:g("传给 images API 的 size（如 1024x1024）；不同模型支持的尺寸不同，按服务商文档填写。"),createActionElement:()=>{const l=document.createElement("input");return l.type="text",l.className="b3-text-field fn__block",l.value=this.settings.imageSize,l.placeholder=X.imageSize,l.addEventListener("change",()=>{this.settings=mt({...this.settings,imageSize:l.value}),this.persist()}),d=l,l}}),this.setting.addItem({title:g("画笔颜色跟随思源强调色"),description:g("新画板把第一笔的默认颜色设成当前主题强调色；只影响默认值，不覆盖已有图。"),createActionElement:()=>{const l=document.createElement("input");return l.type="checkbox",l.className="b3-switch fn__flex-center",l.checked=this.settings.accentStroke,l.addEventListener("change",()=>{this.settings={...this.settings,accentStroke:l.checked},this.persist()}),e=l,l}}),this.setting.addItem({title:g("空画板显示引导画面"),description:g("空白板中央显示手绘纸飞机和上手提示；落第一笔就消失，只影响新建的白板。"),createActionElement:()=>{const l=document.createElement("input");return l.type="checkbox",l.className="b3-switch fn__flex-center",l.checked=this.settings.showWelcome,l.addEventListener("change",()=>{this.settings={...this.settings,showWelcome:l.checked},this.persist()}),i=l,l}}),this.setting.addItem({title:g("默认显示网格"),description:g("在任意白板里切换网格都会记住这个值，之后所有白板（含还没保存过的空白板）打开时都按它显示。改这里只影响之后打开的页签。"),createActionElement:()=>{const l=document.createElement("input");return l.type="checkbox",l.className="b3-switch fn__flex-center",l.checked=this.settings.gridModeEnabled,l.addEventListener("change",()=>{this.settings={...this.settings,gridModeEnabled:l.checked},this.persist()}),s=l,l}})}async loadState(){const t=await this.loadData(ai),e=t&&typeof t=="object"?t:{};this.settings=mt(e.settings),this.recent=Array.isArray(e.recent)?e.recent.filter(i=>typeof i=="string"&&i!==""):[],this.dirMigrated=e.dirMigrated===!0,this.legacyBoards=Array.isArray(e.boards)?e.boards.filter(i=>typeof i=="string"):[]}rememberGrid(t){this.settings.gridModeEnabled!==t&&(this.settings={...this.settings,gridModeEnabled:t},this.persist())}persist(){this.saveData(ai,{settings:this.settings,recent:this.recent,dirMigrated:this.dirMigrated}).catch(t=>console.error("[excali-studio] 保存设置失败",t))}}module.exports=ac;
