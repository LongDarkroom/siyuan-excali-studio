"use strict";const I=require("siyuan");let di={};function os(n){di=n&&typeof n=="object"?n:{}}function g(n,t){const e=di[n],i=typeof e=="string"?e:n;return t?i.replace(/\{(\w+)\}/g,(o,s)=>s in t?String(t[s]):o):i}const qt="siyuan-excali-studio";function as(){return new URL(`plugins/${qt}/`,`${location.origin}/`).href}function rs(){const n=as();return window.EXCALIDRAW_ASSET_PATH=n,n}function ls(...n){return n.map(e=>String(e??"").trim()).filter(e=>e!=="").join("/").replace(/\/{2,}/g,"/")}function cs(){try{const t=window.siyuan?.config?.system?.dataDir;return typeof t=="string"?t.trim():""}catch{return""}}const ft="iconExcaliStudio",ds=`<symbol id="${ft}" viewBox="0 0 1024 1024"><g fill="none" stroke="currentColor" stroke-width="56" stroke-linecap="round" stroke-linejoin="round"><rect x="128" y="168" width="768" height="588" rx="56"/><path d="M272 616c72-152 148 92 224-56 44-88 96-36 152-72"/></g></symbol>`;function Ke(n){return`<div class="b3-list-item__first"><svg class="b3-list-item__graphic"><use xlink:href="#${ft}"></use></svg><span class="b3-list-item__text">${n}</span></div>`}function Et(n){let t=n.length;for(;--t>=0;)n[t]=0}const fs=3,hs=258,fi=29,us=256,ps=us+1+fi,hi=30,gs=512,ms=new Array((ps+2)*2);Et(ms);const ys=new Array(hi*2);Et(ys);const bs=new Array(gs);Et(bs);const xs=new Array(hs-fs+1);Et(xs);const ws=new Array(fi);Et(ws);const ks=new Array(hi);Et(ks);const Ss=(n,t,e,i)=>{let o=n&65535|0,s=n>>>16&65535|0,a=0;for(;e!==0;){a=e>2e3?2e3:e,e-=a;do o=o+t[i++]|0,s=s+o|0;while(--a);o%=65521,s%=65521}return o|s<<16|0};var Te=Ss;const vs=()=>{let n,t=[];for(var e=0;e<256;e++){n=e;for(var i=0;i<8;i++)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n}return t},Es=new Uint32Array(vs()),_s=(n,t,e,i)=>{const o=Es,s=i+e;n^=-1;for(let a=i;a<s;a++)n=n>>>8^o[(n^t[a])&255];return n^-1};var Q=_s,Le={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},ui={Z_NO_FLUSH:0,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_DEFLATED:8};const As=(n,t)=>Object.prototype.hasOwnProperty.call(n,t);var $s=function(n){const t=Array.prototype.slice.call(arguments,1);for(;t.length;){const e=t.shift();if(e){if(typeof e!="object")throw new TypeError(e+"must be non-object");for(const i in e)As(e,i)&&(n[i]=e[i])}}return n},Ms=n=>{let t=0;for(let i=0,o=n.length;i<o;i++)t+=n[i].length;const e=new Uint8Array(t);for(let i=0,o=0,s=n.length;i<s;i++){let a=n[i];e.set(a,o),o+=a.length}return e},pi={assign:$s,flattenChunks:Ms};let gi=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{gi=!1}const Tt=new Uint8Array(256);for(let n=0;n<256;n++)Tt[n]=n>=252?6:n>=248?5:n>=240?4:n>=224?3:n>=192?2:1;Tt[254]=Tt[254]=1;var Is=n=>{let t,e,i,o,s,a=n.length,r=0;for(o=0;o<a;o++)e=n.charCodeAt(o),(e&64512)===55296&&o+1<a&&(i=n.charCodeAt(o+1),(i&64512)===56320&&(e=65536+(e-55296<<10)+(i-56320),o++)),r+=e<128?1:e<2048?2:e<65536?3:4;for(t=new Uint8Array(r),s=0,o=0;s<r;o++)e=n.charCodeAt(o),(e&64512)===55296&&o+1<a&&(i=n.charCodeAt(o+1),(i&64512)===56320&&(e=65536+(e-55296<<10)+(i-56320),o++)),e<128?t[s++]=e:e<2048?(t[s++]=192|e>>>6,t[s++]=128|e&63):e<65536?(t[s++]=224|e>>>12,t[s++]=128|e>>>6&63,t[s++]=128|e&63):(t[s++]=240|e>>>18,t[s++]=128|e>>>12&63,t[s++]=128|e>>>6&63,t[s++]=128|e&63);return t};const Cs=(n,t)=>{if(t<65534&&n.subarray&&gi)return String.fromCharCode.apply(null,n.length===t?n:n.subarray(0,t));let e="";for(let i=0;i<t;i++)e+=String.fromCharCode(n[i]);return e};var Rs=(n,t)=>{let e,i;const o=t||n.length,s=new Array(o*2);for(i=0,e=0;e<o;){let a=n[e++];if(a<128){s[i++]=a;continue}let r=Tt[a];if(r>4){s[i++]=65533,e+=r-1;continue}for(a&=r===2?31:r===3?15:7;r>1&&e<o;)a=a<<6|n[e++]&63,r--;if(r>1){s[i++]=65533;continue}a<65536?s[i++]=a:(a-=65536,s[i++]=55296|a>>10&1023,s[i++]=56320|a&1023)}return Cs(s,i)},Ts=(n,t)=>{t=t||n.length,t>n.length&&(t=n.length);let e=t-1;for(;e>=0&&(n[e]&192)===128;)e--;return e<0||e===0?t:e+Tt[n[e]]>t?e:t},Oe={string2buf:Is,buf2string:Rs,utf8border:Ts};function Ls(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}var Os=Ls;const Dt=30,Ps=12;var Ds=function(t,e){let i,o,s,a,r,d,l,c,u,h,f,p,x,E,b,y,S,m,w,$,v,M,A,k;const _=t.state;i=t.next_in,A=t.input,o=i+(t.avail_in-5),s=t.next_out,k=t.output,a=s-(e-t.avail_out),r=s+(t.avail_out-257),d=_.dmax,l=_.wsize,c=_.whave,u=_.wnext,h=_.window,f=_.hold,p=_.bits,x=_.lencode,E=_.distcode,b=(1<<_.lenbits)-1,y=(1<<_.distbits)-1;t:do{p<15&&(f+=A[i++]<<p,p+=8,f+=A[i++]<<p,p+=8),S=x[f&b];e:for(;;){if(m=S>>>24,f>>>=m,p-=m,m=S>>>16&255,m===0)k[s++]=S&65535;else if(m&16){w=S&65535,m&=15,m&&(p<m&&(f+=A[i++]<<p,p+=8),w+=f&(1<<m)-1,f>>>=m,p-=m),p<15&&(f+=A[i++]<<p,p+=8,f+=A[i++]<<p,p+=8),S=E[f&y];n:for(;;){if(m=S>>>24,f>>>=m,p-=m,m=S>>>16&255,m&16){if($=S&65535,m&=15,p<m&&(f+=A[i++]<<p,p+=8,p<m&&(f+=A[i++]<<p,p+=8)),$+=f&(1<<m)-1,$>d){t.msg="invalid distance too far back",_.mode=Dt;break t}if(f>>>=m,p-=m,m=s-a,$>m){if(m=$-m,m>c&&_.sane){t.msg="invalid distance too far back",_.mode=Dt;break t}if(v=0,M=h,u===0){if(v+=l-m,m<w){w-=m;do k[s++]=h[v++];while(--m);v=s-$,M=k}}else if(u<m){if(v+=l+u-m,m-=u,m<w){w-=m;do k[s++]=h[v++];while(--m);if(v=0,u<w){m=u,w-=m;do k[s++]=h[v++];while(--m);v=s-$,M=k}}}else if(v+=u-m,m<w){w-=m;do k[s++]=h[v++];while(--m);v=s-$,M=k}for(;w>2;)k[s++]=M[v++],k[s++]=M[v++],k[s++]=M[v++],w-=3;w&&(k[s++]=M[v++],w>1&&(k[s++]=M[v++]))}else{v=s-$;do k[s++]=k[v++],k[s++]=k[v++],k[s++]=k[v++],w-=3;while(w>2);w&&(k[s++]=k[v++],w>1&&(k[s++]=k[v++]))}}else if(m&64){t.msg="invalid distance code",_.mode=Dt;break t}else{S=E[(S&65535)+(f&(1<<m)-1)];continue n}break}}else if(m&64)if(m&32){_.mode=Ps;break t}else{t.msg="invalid literal/length code",_.mode=Dt;break t}else{S=x[(S&65535)+(f&(1<<m)-1)];continue e}break}}while(i<o&&s<r);w=p>>3,i-=w,p-=w<<3,f&=(1<<p)-1,t.next_in=i,t.next_out=s,t.avail_in=i<o?5+(o-i):5-(i-o),t.avail_out=s<r?257+(r-s):257-(s-r),_.hold=f,_.bits=p};const mt=15,Je=852,Ve=592,Qe=0,he=1,tn=2,Bs=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),Ns=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),Fs=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),js=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]),Hs=(n,t,e,i,o,s,a,r)=>{const d=r.bits;let l=0,c=0,u=0,h=0,f=0,p=0,x=0,E=0,b=0,y=0,S,m,w,$,v,M=null,A=0,k;const _=new Uint16Array(mt+1),C=new Uint16Array(mt+1);let L=null,O=0,T,P,j;for(l=0;l<=mt;l++)_[l]=0;for(c=0;c<i;c++)_[t[e+c]]++;for(f=d,h=mt;h>=1&&_[h]===0;h--);if(f>h&&(f=h),h===0)return o[s++]=1<<24|64<<16|0,o[s++]=1<<24|64<<16|0,r.bits=1,0;for(u=1;u<h&&_[u]===0;u++);for(f<u&&(f=u),E=1,l=1;l<=mt;l++)if(E<<=1,E-=_[l],E<0)return-1;if(E>0&&(n===Qe||h!==1))return-1;for(C[1]=0,l=1;l<mt;l++)C[l+1]=C[l]+_[l];for(c=0;c<i;c++)t[e+c]!==0&&(a[C[t[e+c]]++]=c);if(n===Qe?(M=L=a,k=19):n===he?(M=Bs,A-=257,L=Ns,O-=257,k=256):(M=Fs,L=js,k=-1),y=0,c=0,l=u,v=s,p=f,x=0,w=-1,b=1<<f,$=b-1,n===he&&b>Je||n===tn&&b>Ve)return 1;for(;;){T=l-x,a[c]<k?(P=0,j=a[c]):a[c]>k?(P=L[O+a[c]],j=M[A+a[c]]):(P=96,j=0),S=1<<l-x,m=1<<p,u=m;do m-=S,o[v+(y>>x)+m]=T<<24|P<<16|j|0;while(m!==0);for(S=1<<l-1;y&S;)S>>=1;if(S!==0?(y&=S-1,y+=S):y=0,c++,--_[l]===0){if(l===h)break;l=t[e+a[c]]}if(l>f&&(y&$)!==w){for(x===0&&(x=f),v+=u,p=l-x,E=1<<p;p+x<h&&(E-=_[p+x],!(E<=0));)p++,E<<=1;if(b+=1<<p,n===he&&b>Je||n===tn&&b>Ve)return 1;w=y&$,o[w]=f<<24|p<<16|v-s|0}}return y!==0&&(o[v+y]=l-x<<24|64<<16|0),r.bits=f,0};var It=Hs;const zs=0,mi=1,yi=2,{Z_FINISH:en,Z_BLOCK:Xs,Z_TREES:Bt,Z_OK:ht,Z_STREAM_END:Us,Z_NEED_DICT:Ys,Z_STREAM_ERROR:J,Z_DATA_ERROR:bi,Z_MEM_ERROR:xi,Z_BUF_ERROR:Gs,Z_DEFLATED:nn}=ui,wi=1,sn=2,on=3,an=4,rn=5,ln=6,cn=7,dn=8,fn=9,hn=10,Qt=11,et=12,ue=13,un=14,pe=15,pn=16,gn=17,mn=18,yn=19,Nt=20,Ft=21,bn=22,xn=23,wn=24,kn=25,Sn=26,ge=27,vn=28,En=29,N=30,ki=31,Ws=32,Zs=852,qs=592,Ks=15,Js=Ks,_n=n=>(n>>>24&255)+(n>>>8&65280)+((n&65280)<<8)+((n&255)<<24);function Vs(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const Si=n=>{if(!n||!n.state)return J;const t=n.state;return n.total_in=n.total_out=t.total=0,n.msg="",t.wrap&&(n.adler=t.wrap&1),t.mode=wi,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new Int32Array(Zs),t.distcode=t.distdyn=new Int32Array(qs),t.sane=1,t.back=-1,ht},vi=n=>{if(!n||!n.state)return J;const t=n.state;return t.wsize=0,t.whave=0,t.wnext=0,Si(n)},Ei=(n,t)=>{let e;if(!n||!n.state)return J;const i=n.state;return t<0?(e=0,t=-t):(e=(t>>4)+1,t<48&&(t&=15)),t&&(t<8||t>15)?J:(i.window!==null&&i.wbits!==t&&(i.window=null),i.wrap=e,i.wbits=t,vi(n))},_i=(n,t)=>{if(!n)return J;const e=new Vs;n.state=e,e.window=null;const i=Ei(n,t);return i!==ht&&(n.state=null),i},Qs=n=>_i(n,Js);let An=!0,me,ye;const to=n=>{if(An){me=new Int32Array(512),ye=new Int32Array(32);let t=0;for(;t<144;)n.lens[t++]=8;for(;t<256;)n.lens[t++]=9;for(;t<280;)n.lens[t++]=7;for(;t<288;)n.lens[t++]=8;for(It(mi,n.lens,0,288,me,0,n.work,{bits:9}),t=0;t<32;)n.lens[t++]=5;It(yi,n.lens,0,32,ye,0,n.work,{bits:5}),An=!1}n.lencode=me,n.lenbits=9,n.distcode=ye,n.distbits=5},Ai=(n,t,e,i)=>{let o;const s=n.state;return s.window===null&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new Uint8Array(s.wsize)),i>=s.wsize?(s.window.set(t.subarray(e-s.wsize,e),0),s.wnext=0,s.whave=s.wsize):(o=s.wsize-s.wnext,o>i&&(o=i),s.window.set(t.subarray(e-i,e-i+o),s.wnext),i-=o,i?(s.window.set(t.subarray(e-i,e),0),s.wnext=i,s.whave=s.wsize):(s.wnext+=o,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=o))),0},eo=(n,t)=>{let e,i,o,s,a,r,d,l,c,u,h,f,p,x,E=0,b,y,S,m,w,$,v,M;const A=new Uint8Array(4);let k,_;const C=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(!n||!n.state||!n.output||!n.input&&n.avail_in!==0)return J;e=n.state,e.mode===et&&(e.mode=ue),a=n.next_out,o=n.output,d=n.avail_out,s=n.next_in,i=n.input,r=n.avail_in,l=e.hold,c=e.bits,u=r,h=d,M=ht;t:for(;;)switch(e.mode){case wi:if(e.wrap===0){e.mode=ue;break}for(;c<16;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if(e.wrap&2&&l===35615){e.check=0,A[0]=l&255,A[1]=l>>>8&255,e.check=Q(e.check,A,2,0),l=0,c=0,e.mode=sn;break}if(e.flags=0,e.head&&(e.head.done=!1),!(e.wrap&1)||(((l&255)<<8)+(l>>8))%31){n.msg="incorrect header check",e.mode=N;break}if((l&15)!==nn){n.msg="unknown compression method",e.mode=N;break}if(l>>>=4,c-=4,v=(l&15)+8,e.wbits===0)e.wbits=v;else if(v>e.wbits){n.msg="invalid window size",e.mode=N;break}e.dmax=1<<e.wbits,n.adler=e.check=1,e.mode=l&512?hn:et,l=0,c=0;break;case sn:for(;c<16;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if(e.flags=l,(e.flags&255)!==nn){n.msg="unknown compression method",e.mode=N;break}if(e.flags&57344){n.msg="unknown header flags set",e.mode=N;break}e.head&&(e.head.text=l>>8&1),e.flags&512&&(A[0]=l&255,A[1]=l>>>8&255,e.check=Q(e.check,A,2,0)),l=0,c=0,e.mode=on;case on:for(;c<32;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}e.head&&(e.head.time=l),e.flags&512&&(A[0]=l&255,A[1]=l>>>8&255,A[2]=l>>>16&255,A[3]=l>>>24&255,e.check=Q(e.check,A,4,0)),l=0,c=0,e.mode=an;case an:for(;c<16;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}e.head&&(e.head.xflags=l&255,e.head.os=l>>8),e.flags&512&&(A[0]=l&255,A[1]=l>>>8&255,e.check=Q(e.check,A,2,0)),l=0,c=0,e.mode=rn;case rn:if(e.flags&1024){for(;c<16;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}e.length=l,e.head&&(e.head.extra_len=l),e.flags&512&&(A[0]=l&255,A[1]=l>>>8&255,e.check=Q(e.check,A,2,0)),l=0,c=0}else e.head&&(e.head.extra=null);e.mode=ln;case ln:if(e.flags&1024&&(f=e.length,f>r&&(f=r),f&&(e.head&&(v=e.head.extra_len-e.length,e.head.extra||(e.head.extra=new Uint8Array(e.head.extra_len)),e.head.extra.set(i.subarray(s,s+f),v)),e.flags&512&&(e.check=Q(e.check,i,f,s)),r-=f,s+=f,e.length-=f),e.length))break t;e.length=0,e.mode=cn;case cn:if(e.flags&2048){if(r===0)break t;f=0;do v=i[s+f++],e.head&&v&&e.length<65536&&(e.head.name+=String.fromCharCode(v));while(v&&f<r);if(e.flags&512&&(e.check=Q(e.check,i,f,s)),r-=f,s+=f,v)break t}else e.head&&(e.head.name=null);e.length=0,e.mode=dn;case dn:if(e.flags&4096){if(r===0)break t;f=0;do v=i[s+f++],e.head&&v&&e.length<65536&&(e.head.comment+=String.fromCharCode(v));while(v&&f<r);if(e.flags&512&&(e.check=Q(e.check,i,f,s)),r-=f,s+=f,v)break t}else e.head&&(e.head.comment=null);e.mode=fn;case fn:if(e.flags&512){for(;c<16;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if(l!==(e.check&65535)){n.msg="header crc mismatch",e.mode=N;break}l=0,c=0}e.head&&(e.head.hcrc=e.flags>>9&1,e.head.done=!0),n.adler=e.check=0,e.mode=et;break;case hn:for(;c<32;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}n.adler=e.check=_n(l),l=0,c=0,e.mode=Qt;case Qt:if(e.havedict===0)return n.next_out=a,n.avail_out=d,n.next_in=s,n.avail_in=r,e.hold=l,e.bits=c,Ys;n.adler=e.check=1,e.mode=et;case et:if(t===Xs||t===Bt)break t;case ue:if(e.last){l>>>=c&7,c-=c&7,e.mode=ge;break}for(;c<3;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}switch(e.last=l&1,l>>>=1,c-=1,l&3){case 0:e.mode=un;break;case 1:if(to(e),e.mode=Nt,t===Bt){l>>>=2,c-=2;break t}break;case 2:e.mode=gn;break;case 3:n.msg="invalid block type",e.mode=N}l>>>=2,c-=2;break;case un:for(l>>>=c&7,c-=c&7;c<32;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if((l&65535)!==(l>>>16^65535)){n.msg="invalid stored block lengths",e.mode=N;break}if(e.length=l&65535,l=0,c=0,e.mode=pe,t===Bt)break t;case pe:e.mode=pn;case pn:if(f=e.length,f){if(f>r&&(f=r),f>d&&(f=d),f===0)break t;o.set(i.subarray(s,s+f),a),r-=f,s+=f,d-=f,a+=f,e.length-=f;break}e.mode=et;break;case gn:for(;c<14;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if(e.nlen=(l&31)+257,l>>>=5,c-=5,e.ndist=(l&31)+1,l>>>=5,c-=5,e.ncode=(l&15)+4,l>>>=4,c-=4,e.nlen>286||e.ndist>30){n.msg="too many length or distance symbols",e.mode=N;break}e.have=0,e.mode=mn;case mn:for(;e.have<e.ncode;){for(;c<3;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}e.lens[C[e.have++]]=l&7,l>>>=3,c-=3}for(;e.have<19;)e.lens[C[e.have++]]=0;if(e.lencode=e.lendyn,e.lenbits=7,k={bits:e.lenbits},M=It(zs,e.lens,0,19,e.lencode,0,e.work,k),e.lenbits=k.bits,M){n.msg="invalid code lengths set",e.mode=N;break}e.have=0,e.mode=yn;case yn:for(;e.have<e.nlen+e.ndist;){for(;E=e.lencode[l&(1<<e.lenbits)-1],b=E>>>24,y=E>>>16&255,S=E&65535,!(b<=c);){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if(S<16)l>>>=b,c-=b,e.lens[e.have++]=S;else{if(S===16){for(_=b+2;c<_;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if(l>>>=b,c-=b,e.have===0){n.msg="invalid bit length repeat",e.mode=N;break}v=e.lens[e.have-1],f=3+(l&3),l>>>=2,c-=2}else if(S===17){for(_=b+3;c<_;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}l>>>=b,c-=b,v=0,f=3+(l&7),l>>>=3,c-=3}else{for(_=b+7;c<_;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}l>>>=b,c-=b,v=0,f=11+(l&127),l>>>=7,c-=7}if(e.have+f>e.nlen+e.ndist){n.msg="invalid bit length repeat",e.mode=N;break}for(;f--;)e.lens[e.have++]=v}}if(e.mode===N)break;if(e.lens[256]===0){n.msg="invalid code -- missing end-of-block",e.mode=N;break}if(e.lenbits=9,k={bits:e.lenbits},M=It(mi,e.lens,0,e.nlen,e.lencode,0,e.work,k),e.lenbits=k.bits,M){n.msg="invalid literal/lengths set",e.mode=N;break}if(e.distbits=6,e.distcode=e.distdyn,k={bits:e.distbits},M=It(yi,e.lens,e.nlen,e.ndist,e.distcode,0,e.work,k),e.distbits=k.bits,M){n.msg="invalid distances set",e.mode=N;break}if(e.mode=Nt,t===Bt)break t;case Nt:e.mode=Ft;case Ft:if(r>=6&&d>=258){n.next_out=a,n.avail_out=d,n.next_in=s,n.avail_in=r,e.hold=l,e.bits=c,Ds(n,h),a=n.next_out,o=n.output,d=n.avail_out,s=n.next_in,i=n.input,r=n.avail_in,l=e.hold,c=e.bits,e.mode===et&&(e.back=-1);break}for(e.back=0;E=e.lencode[l&(1<<e.lenbits)-1],b=E>>>24,y=E>>>16&255,S=E&65535,!(b<=c);){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if(y&&!(y&240)){for(m=b,w=y,$=S;E=e.lencode[$+((l&(1<<m+w)-1)>>m)],b=E>>>24,y=E>>>16&255,S=E&65535,!(m+b<=c);){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}l>>>=m,c-=m,e.back+=m}if(l>>>=b,c-=b,e.back+=b,e.length=S,y===0){e.mode=Sn;break}if(y&32){e.back=-1,e.mode=et;break}if(y&64){n.msg="invalid literal/length code",e.mode=N;break}e.extra=y&15,e.mode=bn;case bn:if(e.extra){for(_=e.extra;c<_;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}e.length+=l&(1<<e.extra)-1,l>>>=e.extra,c-=e.extra,e.back+=e.extra}e.was=e.length,e.mode=xn;case xn:for(;E=e.distcode[l&(1<<e.distbits)-1],b=E>>>24,y=E>>>16&255,S=E&65535,!(b<=c);){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if(!(y&240)){for(m=b,w=y,$=S;E=e.distcode[$+((l&(1<<m+w)-1)>>m)],b=E>>>24,y=E>>>16&255,S=E&65535,!(m+b<=c);){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}l>>>=m,c-=m,e.back+=m}if(l>>>=b,c-=b,e.back+=b,y&64){n.msg="invalid distance code",e.mode=N;break}e.offset=S,e.extra=y&15,e.mode=wn;case wn:if(e.extra){for(_=e.extra;c<_;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}e.offset+=l&(1<<e.extra)-1,l>>>=e.extra,c-=e.extra,e.back+=e.extra}if(e.offset>e.dmax){n.msg="invalid distance too far back",e.mode=N;break}e.mode=kn;case kn:if(d===0)break t;if(f=h-d,e.offset>f){if(f=e.offset-f,f>e.whave&&e.sane){n.msg="invalid distance too far back",e.mode=N;break}f>e.wnext?(f-=e.wnext,p=e.wsize-f):p=e.wnext-f,f>e.length&&(f=e.length),x=e.window}else x=o,p=a-e.offset,f=e.length;f>d&&(f=d),d-=f,e.length-=f;do o[a++]=x[p++];while(--f);e.length===0&&(e.mode=Ft);break;case Sn:if(d===0)break t;o[a++]=e.length,d--,e.mode=Ft;break;case ge:if(e.wrap){for(;c<32;){if(r===0)break t;r--,l|=i[s++]<<c,c+=8}if(h-=d,n.total_out+=h,e.total+=h,h&&(n.adler=e.check=e.flags?Q(e.check,o,h,a-h):Te(e.check,o,h,a-h)),h=d,(e.flags?l:_n(l))!==e.check){n.msg="incorrect data check",e.mode=N;break}l=0,c=0}e.mode=vn;case vn:if(e.wrap&&e.flags){for(;c<32;){if(r===0)break t;r--,l+=i[s++]<<c,c+=8}if(l!==(e.total&4294967295)){n.msg="incorrect length check",e.mode=N;break}l=0,c=0}e.mode=En;case En:M=Us;break t;case N:M=bi;break t;case ki:return xi;case Ws:default:return J}return n.next_out=a,n.avail_out=d,n.next_in=s,n.avail_in=r,e.hold=l,e.bits=c,(e.wsize||h!==n.avail_out&&e.mode<N&&(e.mode<ge||t!==en))&&Ai(n,n.output,n.next_out,h-n.avail_out),u-=n.avail_in,h-=n.avail_out,n.total_in+=u,n.total_out+=h,e.total+=h,e.wrap&&h&&(n.adler=e.check=e.flags?Q(e.check,o,h,n.next_out-h):Te(e.check,o,h,n.next_out-h)),n.data_type=e.bits+(e.last?64:0)+(e.mode===et?128:0)+(e.mode===Nt||e.mode===pe?256:0),(u===0&&h===0||t===en)&&M===ht&&(M=Gs),M},no=n=>{if(!n||!n.state)return J;let t=n.state;return t.window&&(t.window=null),n.state=null,ht},io=(n,t)=>{if(!n||!n.state)return J;const e=n.state;return e.wrap&2?(e.head=t,t.done=!1,ht):J},so=(n,t)=>{const e=t.length;let i,o,s;return!n||!n.state||(i=n.state,i.wrap!==0&&i.mode!==Qt)?J:i.mode===Qt&&(o=1,o=Te(o,t,e,0),o!==i.check)?bi:(s=Ai(n,t,e,e),s?(i.mode=ki,xi):(i.havedict=1,ht))};var oo=vi,ao=Ei,ro=Si,lo=Qs,co=_i,fo=eo,ho=no,uo=io,po=so,go="pako inflate (from Nodeca project)",nt={inflateReset:oo,inflateReset2:ao,inflateResetKeep:ro,inflateInit:lo,inflateInit2:co,inflate:fo,inflateEnd:ho,inflateGetHeader:uo,inflateSetDictionary:po,inflateInfo:go};function mo(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}var yo=mo;const $i=Object.prototype.toString,{Z_NO_FLUSH:bo,Z_FINISH:xo,Z_OK:Lt,Z_STREAM_END:be,Z_NEED_DICT:xe,Z_STREAM_ERROR:wo,Z_DATA_ERROR:$n,Z_MEM_ERROR:ko}=ui;function ae(n){this.options=pi.assign({chunkSize:1024*64,windowBits:15,to:""},n||{});const t=this.options;t.raw&&t.windowBits>=0&&t.windowBits<16&&(t.windowBits=-t.windowBits,t.windowBits===0&&(t.windowBits=-15)),t.windowBits>=0&&t.windowBits<16&&!(n&&n.windowBits)&&(t.windowBits+=32),t.windowBits>15&&t.windowBits<48&&(t.windowBits&15||(t.windowBits|=15)),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Os,this.strm.avail_out=0;let e=nt.inflateInit2(this.strm,t.windowBits);if(e!==Lt)throw new Error(Le[e]);if(this.header=new yo,nt.inflateGetHeader(this.strm,this.header),t.dictionary&&(typeof t.dictionary=="string"?t.dictionary=Oe.string2buf(t.dictionary):$i.call(t.dictionary)==="[object ArrayBuffer]"&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(e=nt.inflateSetDictionary(this.strm,t.dictionary),e!==Lt)))throw new Error(Le[e])}ae.prototype.push=function(n,t){const e=this.strm,i=this.options.chunkSize,o=this.options.dictionary;let s,a,r;if(this.ended)return!1;for(t===~~t?a=t:a=t===!0?xo:bo,$i.call(n)==="[object ArrayBuffer]"?e.input=new Uint8Array(n):e.input=n,e.next_in=0,e.avail_in=e.input.length;;){for(e.avail_out===0&&(e.output=new Uint8Array(i),e.next_out=0,e.avail_out=i),s=nt.inflate(e,a),s===xe&&o&&(s=nt.inflateSetDictionary(e,o),s===Lt?s=nt.inflate(e,a):s===$n&&(s=xe));e.avail_in>0&&s===be&&e.state.wrap>0&&n[e.next_in]!==0;)nt.inflateReset(e),s=nt.inflate(e,a);switch(s){case wo:case $n:case xe:case ko:return this.onEnd(s),this.ended=!0,!1}if(r=e.avail_out,e.next_out&&(e.avail_out===0||s===be))if(this.options.to==="string"){let d=Oe.utf8border(e.output,e.next_out),l=e.next_out-d,c=Oe.buf2string(e.output,d);e.next_out=l,e.avail_out=i-l,l&&e.output.set(e.output.subarray(d,d+l),0),this.onData(c)}else this.onData(e.output.length===e.next_out?e.output:e.output.subarray(0,e.next_out));if(!(s===Lt&&r===0)){if(s===be)return s=nt.inflateEnd(this.strm),this.onEnd(s),this.ended=!0,!0;if(e.avail_in===0)break}}return!0};ae.prototype.onData=function(n){this.chunks.push(n)};ae.prototype.onEnd=function(n){n===Lt&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=pi.flattenChunks(this.chunks)),this.chunks=[],this.err=n,this.msg=this.strm.msg};function So(n,t){const e=new ae(t);if(e.push(n),e.err)throw e.msg||Le[e.err];return e.result}var vo=So,Eo={inflate:vo};const{inflate:_o}=Eo;var Mi=_o;const Ao="svg-source:excalidraw",$o="application/vnd.excalidraw+json",Ii=/<!-- payload-start -->\s*([\s\S]+?)\s*<!-- payload-end -->/,Mo=/<!-- payload-version:(\d+) -->/;class G extends Error{constructor(t,e){super(`scene:${t}${e?` (${e})`:""}`),this.reason=t,this.detail=e,this.name="SceneError"}}function Ue(n){const t=new Uint8Array(n.length);for(let e=0;e<n.length;e++)t[e]=n.charCodeAt(e)&255;return t}function Ci(n){return new TextDecoder("utf-8").decode(Ue(n))}function Io(n,t){const e=atob(n);return t?Mi(Ue(e),{to:"string"}):Ci(e)}function Ri(n){return n.includes(Ao)&&Ii.test(n)}function Co(n){if(!Ri(n))return!1;try{return Ti(n).elements.length>0}catch{return!1}}function Ti(n){if(!n.includes($o))throw new G("no-payload");const t=Mo.exec(n),e=t?Number(t[1]):1,i=Ii.exec(n);if(!i)throw new G("no-payload","缺 payload-start/end 标记");let o;try{o=e===1?Io(i[1],!1):atob(i[1])}catch(d){throw new G("bad-payload",d instanceof Error?d.message:String(d))}let s;try{s=JSON.parse(o)}catch{throw new G("bad-payload","载荷不是合法 JSON")}if(!s||typeof s!="object")throw new G("bad-payload","载荷不是对象");const a=Ro(s);if(a.type!=="excalidraw")throw new G("wrong-type",String(a.type));if(!Array.isArray(a.elements))throw new G("bad-payload","scene 缺 elements 数组");return{elements:a.elements,appState:a.appState&&typeof a.appState=="object"?a.appState:{},files:a.files&&typeof a.files=="object"?a.files:{}}}function Ro(n){if(!("encoded"in n)){if(n.type==="excalidraw")return n;throw new G("wrong-type",typeof n.type=="string"?n.type:"unknown")}const t=n.encoding;if(t!=="bstring")throw new G("unsupported-encoding",String(t));const e=n.encoded;if(typeof e!="string")throw new G("bad-payload","encoded 字段不是字符串");const i=n.compressed===!0;let o;try{o=i?Mi(Ue(e),{to:"string"}):Ci(e)}catch(a){throw new G("bad-payload",a instanceof Error?a.message:String(a))}let s;try{s=JSON.parse(o)}catch{throw new G("bad-payload","scene JSON 解析失败")}if(!s||typeof s!="object")throw new G("bad-payload","scene 不是对象");return s}function Pe(n){if(Array.isArray(n))return n.map(Pe);if(n&&typeof n=="object"){const t={},e=n;for(const i of Object.keys(e).sort()){const o=e[i];o!=null&&(i==="boundElements"&&Array.isArray(o)&&o.length===0||(t[i]=Pe(o)))}return t}return n}function Mn(n){if(!Ri(n))return null;try{const t=Ti(n);return JSON.stringify(Pe({elements:t.elements,appState:t.appState,files:t.files}))}catch{return null}}function To(n,t){if(n===t)return!0;const e=Mn(n),i=Mn(t);return e!==null&&e===i}const Lo=".excalidrawlib",Oo=`local${Lo}`;function In(n){let t=[];try{const e=JSON.parse(n);if(Array.isArray(e))t=e;else if(e&&typeof e=="object"){const i=e;Array.isArray(i.libraryItems)?t=i.libraryItems:Array.isArray(i.library)&&(t=i.library)}}catch{}return Bo(t)}function Po(n){if(!n||typeof n!="object")return"";const t=n;return`${typeof t.id=="string"?t.id:""}:${typeof t.versionNonce=="number"?t.versionNonce:""}`}function we(n){const t=n.map(Po).sort().join("|");let e=2166136261,i=2166136261;for(let o=0;o<t.length;o++){const s=t.charCodeAt(o);e=Math.imul(e^s,16777619)>>>0,i=Math.imul(i^s,2246822507)>>>0}return`lib-${e.toString(16).padStart(8,"0")}${i.toString(16).padStart(8,"0")}`}function De(n){return!!n&&typeof n=="object"&&typeof n.type=="string"}function Do(n){return Object.keys(n).filter(t=>/^\d+$/.test(t)).sort((t,e)=>Number(t)-Number(e)).map(t=>n[t]).filter(De)}function Bo(n,t="published"){const e=[];for(const i of n){if(Array.isArray(i)){const o=i.filter(De);if(o.length===0)continue;e.push({id:we(o),status:t,elements:o,created:Date.now()});continue}if(i&&typeof i=="object"){const o=i;if(Array.isArray(o.elements)){const a=o.elements.filter(De);if(a.length===0)continue;e.push({...o,elements:a,id:typeof o.id=="string"&&o.id!==""?o.id:we(a),status:typeof o.status=="string"?o.status:t,created:typeof o.created=="number"?o.created:Date.now()});continue}const s=Do(o);s.length>0&&e.push({id:we(s),status:t,elements:s,created:Date.now()});continue}}return e}function Cn(n,t="siyuan-excali-studio"){return JSON.stringify({type:"excalidrawlib",version:2,source:t,libraryItems:n},null,2)}function Kt(n){if(n&&typeof n=="object"){const t=n.id;if(typeof t=="string"&&t!=="")return t}return null}function No(n){const t=[],e=new Map,i=new Map,o=n[0]?.path??"";for(const s of n){i.set(s.path,s.items);const a=s.path===o;for(const r of s.items){const d=Kt(r);if(d!==null&&e.has(d)){console.warn(`[excali-studio] 模板库条目 id 重复（${d}，来自 ${s.path}），保留先到的一份`);continue}d!==null&&e.set(d,s.path),t.push(a?r:{...r,status:"published"})}}return{items:t,sourceOf:e,byPath:i}}function Fo(n,t,e){const i=new Map,o=[];for(const r of t){const d=Kt(r);if(d===null){o.push(r);continue}n.sourceOf.has(d)||o.push(r),i.set(d,r)}const s=new Set;for(const r of n.items){const d=Kt(r),l=d!==null&&n.sourceOf.get(d)||e,c=d!==null?i.get(d):void 0;(!c||JSON.stringify(c)!==JSON.stringify(r))&&s.add(l)}o.length>0&&s.add(e);const a=[];for(const r of[...s].sort()){const d=n.byPath.get(r)??[],l=[];for(const c of d){const u=Kt(c);if(u!==null&&n.sourceOf.get(u)!==r){l.push(c);continue}const h=u!==null?i.get(u):void 0;h&&l.push(r===e?h:{...h,status:"published"})}if(r===e)for(const c of o)l.unshift(c);a.push({path:r,items:l})}return a}const Rn="exs:script-pin-changed",ke="exs:rail-view-changed",jo="exs:highlighter-changed",Ho=0,Jt={color:"#ffd43b",width:4,opacity:45},zo=/^#[0-9a-fA-F]{6}$/;function Tn(n,t,e,i){return Number.isFinite(n)?Math.min(e,Math.max(t,n)):i}function te(n){const t=n&&typeof n=="object"?n:{};return{color:typeof t.color=="string"&&zo.test(t.color.trim())?t.color.trim().toLowerCase():Jt.color,width:Tn(Number(t.width),1,12,Jt.width),opacity:Tn(Number(t.opacity),10,100,Jt.opacity)}}const Xo="M4,7L4,17A2,2 0 0 0 6,19L18,19A2,2 0 0 0 20,17L20,7A2,2 0 0 0 18,5L6,5A2,2 0 0 0 4,7ZM12,9.5L12,14.5M9.5,12L14.5,12",Uo="M3.5,6A2.5,2.5 0 0 1 6,3.5L12,3.5A2.5,2.5 0 0 1 14.5,6L14.5,12A2.5,2.5 0 0 1 12,14.5L6,14.5A2.5,2.5 0 0 1 3.5,12ZM22,18A3.5,3.5 0 1 1 15,18A3.5,3.5 0 1 1 22,18",Yo="M4,9L4,6A2,2 0 0 1 6,4L9,4M20,15L20,18A2,2 0 0 1 18,20L15,20M15.6,6.4L19.6,10.4L11,19L6.4,20L7.4,15.4ZM13.6,8.4L17.6,12.4",Ln="M8.4,12A3.6,3.6 0 1 0 15.6,12A3.6,3.6 0 1 0 8.4,12M12,3.5L12,6M12,18L12,20.5M3.5,12L6,12M18,12L20.5,12M5.9,5.9L7.7,7.7M16.3,16.3L18.1,18.1M18.1,5.9L16.3,7.7M7.7,16.3L5.9,18.1",Go="M4.5,19.5L4.5,16.3L12.8,8.0L16.2,11.4L8.0,19.5ZM10.2,10.6L13.6,14.0",Wo="M5,6L7.5,6M10.5,6L19,6M5,12L7.5,12M10.5,12L19,12M5,18L7.5,18M10.5,18L19,18",Zo="M3.5,5.5L20.5,5.5L20.5,18.5L3.5,18.5ZM7,9.5L11,9.5L11,13.5L7,13.5ZM13.5,11L17,11L17,15L13.5,15Z",qo="M3.5,5L20.5,5L20.5,19L3.5,19ZM9,9.8L12,12.8L15,9.8",Ko="M4.5,5.8L7.6,7L4.5,8.2ZM9.8,7L20,7M9.8,11.5L16.5,11.5M9.8,16L18.5,16",Jo={"text-numbering.md":Wo,"box-selection.md":Zo,"highlighter.md":Go,"frame-collapse.md":qo,"selection-fold.md":Ko},On="M9.5,3.5L14.5,3.5L16,7L8,7ZM10,7L10.8,14L13.2,14L14,7M12,14L12,20.5",Vo="M3.5,4L20.5,4L20.5,14.5L3.5,14.5ZM12,14.5L12,19M8.5,20.5L15.5,20.5M10.5,7L15,9.25L10.5,11.5Z",Ye="insert-board-card",Li="outline-color",Oi="image-to-material",Pi="presentation";function Se(n){return n.mount??"rail"}const ee=[{id:Ye,title:"插入白板卡片",titleEn:"Insert board card",desc:"从白板库挑一块，在当前画布中心插一张能点开的卡片",icon:Xo},{id:Li,title:"仅外框颜色",titleEn:"Outline color",desc:"只改选中图形的边框色，文字颜色保持不变",icon:Uo},{id:Oi,title:"图片转笔画素材",titleEn:"Image to strokes",desc:"把选中的图片描成可改色的原生笔画，可替换到画布或加入素材库",icon:Yo},{id:Pi,title:"演示模式",titleEn:"Presentation mode",desc:"把画布里的画框当幻灯片，逐页放映；点图钉固定到画布右上角",icon:Vo,mount:"top-right"}],Di=[Ye];function Be(n){return typeof n=="string"&&ee.some(t=>t.id===n)}function Pn(n){return ee.find(t=>t.id===n)??null}function Qo(n){if(!Array.isArray(n))return[...Di];const t=[];for(const e of n)Be(e)&&!t.includes(e)&&t.push(e);return t}const ta=["agent","mcp","cli","script"],Bi={agent:!0,mcp:!0,cli:!0,script:!0};function ea(n){const t=n&&typeof n=="object"?n:{},e={...Bi};for(const i of ta)t[i]===!1?e[i]=!1:t[i]===!0&&(e[i]=!0);return e}const bt="assets/excali";function Ni(n){return String(n??"").trim().replace(/\\/g,"/").replace(/^\/+/,"").replace(/^data\//i,"").replace(/\/+$/,"")}const Fi={scrim:!0,hideGrid:!0,reveal:!0,typewriter:!1,cursor:!1,speed:28,fit:.95,autoAdvance:0,fullscreen:!0,directional:!1};function ct(n,t){return typeof n=="boolean"?n:t}function ve(n,t,e,i){return typeof n!="number"||!Number.isFinite(n)?i:Math.min(e,Math.max(t,n))}function ji(n){const t=n&&typeof n=="object"?n:{},e=Fi;return{scrim:ct(t.scrim,e.scrim),hideGrid:ct(t.hideGrid,e.hideGrid),reveal:ct(t.reveal,e.reveal),typewriter:ct(t.typewriter,e.typewriter),cursor:ct(t.cursor,e.cursor),speed:Math.round(ve(t.speed,8,200,e.speed)),fit:ve(t.fit,.5,1,e.fit),autoAdvance:Math.round(ve(t.autoAdvance,0,300,e.autoAdvance)),fullscreen:ct(t.fullscreen,e.fullscreen),directional:ct(t.directional,e.directional)}}const U={saveDir:bt,accentStroke:!0,showWelcome:!0,gridModeEnabled:!1,stencilMigrated:!1,pinnedScripts:[],pinnedActions:[...Di],scriptRailCollapsed:!1,scriptRailTop:.09,scriptSettings:{},builtinSnapshot:{},highlighter:{...Jt},imageBaseUrl:"",imageModel:"gpt-image-1",imageApiKey:"",imageSize:"1024x1024",aiChannels:{...Bi},presentation:{...Fi}};function yt(n){const t=n&&typeof n=="object"?n:{},e=typeof t.saveDir=="string"?Ni(t.saveDir):"",i=e!==""?e:U.saveDir,o={};if(t.scriptSettings&&typeof t.scriptSettings=="object")for(const[a,r]of Object.entries(t.scriptSettings).slice(0,50)){if(!r||typeof r!="object")continue;const d={};for(const[l,c]of Object.entries(r).slice(0,20))(typeof c=="string"||typeof c=="number"||typeof c=="boolean")&&(d[l]=c);o[a]=d}const s={};if(t.builtinSnapshot&&typeof t.builtinSnapshot=="object")for(const[a,r]of Object.entries(t.builtinSnapshot).slice(0,100))a!==""&&typeof r=="number"&&Number.isFinite(r)&&(s[a]=r);return{saveDir:i,accentStroke:typeof t.accentStroke=="boolean"?t.accentStroke:U.accentStroke,showWelcome:typeof t.showWelcome=="boolean"?t.showWelcome:U.showWelcome,gridModeEnabled:typeof t.gridModeEnabled=="boolean"?t.gridModeEnabled:U.gridModeEnabled,stencilMigrated:typeof t.stencilMigrated=="boolean"?t.stencilMigrated:U.stencilMigrated,pinnedScripts:Array.isArray(t.pinnedScripts)?t.pinnedScripts.filter(a=>typeof a=="string"&&a!==""):U.pinnedScripts,pinnedActions:Qo(t.pinnedActions),scriptRailCollapsed:typeof t.scriptRailCollapsed=="boolean"?t.scriptRailCollapsed:U.scriptRailCollapsed,scriptRailTop:typeof t.scriptRailTop=="number"&&Number.isFinite(t.scriptRailTop)&&t.scriptRailTop>=0&&t.scriptRailTop<=.85?t.scriptRailTop:U.scriptRailTop,scriptSettings:o,builtinSnapshot:s,highlighter:te(t.highlighter),imageBaseUrl:typeof t.imageBaseUrl=="string"?t.imageBaseUrl.trim().replace(/\/+$/,"").slice(0,500):U.imageBaseUrl,imageModel:typeof t.imageModel=="string"&&t.imageModel.trim()!==""?t.imageModel.trim().slice(0,100):U.imageModel,imageApiKey:typeof t.imageApiKey=="string"?t.imageApiKey.trim().slice(0,500):U.imageApiKey,imageSize:typeof t.imageSize=="string"&&t.imageSize.trim()!==""?t.imageSize.trim().slice(0,32):U.imageSize,aiChannels:ea(t.aiChannels),presentation:ji(t.presentation)}}const Dn="board";function R(n){const t=n.replace(/^\/+/,"");return t==="data"||t.startsWith("data/")?`/${t}`:`/data/${t}`}function Y(n){return n.replace(/^\/+/,"").replace(/^data\//,"")}function na(n){return R(n)}function ia(n){return`/${Y(n)}`}function B(n){return Y(n).split("/").pop()||n}function at(n,t){const e=n.trim().replace(/\\/g,"/").replace(/^\/+/,"").replace(/\/+$/,"");return`${e===""?"assets":e}/${t}`}function Ee(n,t="excali-board.svg"){return`${(String(n??"").replace(/[\\/:*?"<>|\u0000-\u001f]/g,"").replace(/^\.+/,"").trim().replace(/\.svg$/i,"")||t.replace(/\.svg$/i,"")).slice(0,80)}.svg`}const Hi=3;function Vt(n,t=1){const e=n.replace(/\.svg$/i,"");return t<=1?`${e}.svg.bak.svg`:`${e}.svg.bak${t}.svg`}function zi(n){const t=R(n);return Array.from({length:Hi},(e,i)=>Vt(t,i+1))}function Ge(n){return/\.bak\d*\.svg$/i.test(n)}async function _e(n,t,e){const i=t.replace(/\.svg$/i,"");for(let o=0;o<50;o++){const s=R(at(n,o===0?t:`${i}_${o-1}.svg`));if(e&&s===e||!await ot(s))return s}return R(at(n,t))}async function Ct(n,t){const e=R(n),i=new FormData;i.append("path",e),i.append("isDir","false"),i.append("file",new Blob([t],{type:"image/svg+xml;charset=utf-8"}),e.split("/").pop()||"x.svg");const o=await fetch("/api/file/putFile",{method:"POST",body:i}),s=await o.json().catch(()=>null);if(!o.ok||!s||s.code!==0)throw new Error(s?.msg||`putFile HTTP ${o.status}`);return e}async function K(n){const t=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:R(n)})});if(!t.ok)throw new Error(`getFile HTTP ${t.status}`);const e=await t.text();if((t.headers.get("content-type")||"").includes("application/json")){let i=null;try{i=JSON.parse(e)}catch{return e}if(i&&typeof i=="object"&&"code"in i&&i.code!==0){const o=i.msg;throw new Error(o||`getFile code ${i.code}`)}}return e}async function ot(n){try{const t=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:R(n)})});if(!t.ok)return!1;if((t.headers.get("content-type")||"").includes("application/json")){const e=await t.json().catch(()=>null);return!e||e.code===0}return!0}catch{return!1}}async function We(n,t){const e=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),i=await e.json().catch(()=>null);if(!e.ok||!i||i.code!==0)throw new Error(i?.msg||`${n} HTTP ${e.status}`);return i.data}function sa(n){return typeof n!="number"||!Number.isFinite(n)||n<=0?0:n<1e12?n*1e3:n}async function At(n){const t=n.trim().replace(/\\/g,"/").replace(/^\/+/,"").replace(/\/+$/,""),e=t===""?"assets":t,i=await We("/api/file/readDir",{path:R(e)});return(Array.isArray(i)?i.filter(s=>s&&s.isDir!==!0&&typeof s.name=="string"&&/\.svg$/i.test(s.name)&&!Ge(s.name)):[]).map(s=>({path:`${e}/${s.name}`,updated:sa(s.updated)})).sort((s,a)=>a.updated-s.updated)}async function Ae(n,t){const e=n.trim().replace(/\\/g,"/").replace(/^\/+/,"").replace(/\/+$/,""),i=e===""?"assets":e,o=await We("/api/file/readDir",{path:R(i)});return Array.isArray(o)?o.filter(s=>s&&s.isDir!==!0&&typeof s.name=="string"&&(!t||t.test(s.name))).map(s=>`${i}/${s.name}`):[]}async function xt(n){await We("/api/file/removeFile",{path:R(n)})}async function Bn(n,t){const e=R(n),i=R(t),o=await K(e),s=await Ct(i,o);if(s!==e){await xt(e);for(let a=1;a<=Hi;a++)try{const r=await K(Vt(e,a));await Ct(Vt(s,a),r),await xt(Vt(e,a))}catch{}}return s}async function wt(n,t){const e=R(n),i=new FormData;i.append("path",e),i.append("isDir","false"),i.append("file",new Blob([t],{type:"application/json;charset=utf-8"}),e.split("/").pop()||"x.json");const o=await fetch("/api/file/putFile",{method:"POST",body:i}),s=await o.json().catch(()=>null);if(!o.ok||!s||s.code!==0)throw new Error(s?.msg||`putFile HTTP ${o.status}`);return e}async function oa(n,t,e){const i=R(n),o=new FormData;o.append("path",i),o.append("isDir","false"),o.append("file",new Blob([t],{type:e}),i.split("/").pop()||"x.bin");const s=await fetch("/api/file/putFile",{method:"POST",body:o}),a=await s.json().catch(()=>null);if(!s.ok||!a||a.code!==0)throw new Error(a?.msg||`putFile HTTP ${s.status}`);return i}async function aa(n){const t=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:R(n)})});if(!t.ok)throw new Error(`getFile HTTP ${t.status}`);if((t.headers.get("content-type")||"").includes("application/json")){const e=await t.json().catch(()=>null);throw new Error(e?.msg||`getFile code ${e?.code??"?"}`)}return new Uint8Array(await t.arrayBuffer())}function Nn(){return!!window.siyuan?.mobile}function ra(n){const t=document.createElement("div");t.className="exs-mobile-shell";const e=document.createElement("div");e.className="exs-mobile-header";const i=document.createElement("div");i.className="exs-mobile-title",i.textContent=n.data.dataPath?B(n.data.dataPath):g("未命名白板");const o=document.createElement("button");o.type="button",o.className="exs-mobile-close",o.setAttribute("aria-label",g("关闭")),o.textContent="✕",e.append(i,o);const s=document.createElement("div");s.className="exs-mobile-body exs-panel";const a=document.createElement("div");a.className="exs-loading",a.textContent=g("正在打开白板…"),s.appendChild(a),t.append(e,s),document.body.appendChild(t),document.body.classList.add("exs-mobile-open");const r=()=>{document.querySelectorAll(".exs-mobile-shell").forEach(f=>{f!==t&&(f.style.display="none")}),t.style.display="flex"};r();let d=null,l=!1;const c=()=>{if(!l){l=!0;try{d?.dispose()}finally{d=null,t.remove(),document.querySelector(".exs-mobile-shell")||document.body.classList.remove("exs-mobile-open"),n.onDispose()}}},u={headElement:e,updateTitle:f=>{i.textContent=f},close:c,parent:{switchTab:()=>r()}},h={element:s,data:n.data,tab:u};return o.addEventListener("click",f=>{d||(f.preventDefault(),f.stopPropagation(),c())}),{custom:h,body:s,mount:f=>{d=f},showError:f=>{s.replaceChildren();const p=document.createElement("div");p.className="exs-loaderror";const x=document.createElement("div");x.textContent=f,p.appendChild(x),s.appendChild(p)},close:c,isClosed:()=>l}}const la="assets/excali-media";function ca(n){const t=/^data:([^;,]+)(?:;charset=[^;,]+)?;base64,([\s\S]+)$/.exec(n.trim());if(!t)return null;const e=atob(t[2]),i=new Uint8Array(e.length);for(let o=0;o<e.length;o++)i[o]=e.charCodeAt(o)&255;return{mime:t[1]||"application/octet-stream",bytes:i}}function da(n){return{"image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/gif":"gif","image/svg+xml":"svg","image/bmp":"bmp","image/avif":"avif"}[n]||"bin"}async function fa(n,t){const e=await crypto.subtle.digest("SHA-1",n);return`${Array.from(new Uint8Array(e.slice(0,8))).map(o=>o.toString(16).padStart(2,"0")).join("")}.${da(t)}`}function ha(n,t){let e="";for(let o=0;o<n.length;o+=32768)e+=String.fromCharCode(...n.subarray(o,o+32768));return`data:${t};base64,${btoa(e)}`}function ua(){let n="";try{n=getComputedStyle(document.documentElement).getPropertyValue("--b3-theme-primary").trim()}catch{return null}return n&&/^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i.test(n)?n:null}function pa(n){return n.map(t=>({dataPath:R(t.path),name:B(t.path),updated:t.updated}))}function ne(n){return n.name.replace(/\.svg$/i,"")}function ga(n,t){return n.map(e=>`${e.dataPath}\0${e.name}\0${e.updated}\0${t.has(e.dataPath)?1:0}`).join("")}function ma(n){return{svgPath:n.dataPath,bakPaths:zi(n.dataPath)}}function ya(n){if(typeof n!="string")return null;const t=/^siyuan:(?:\/\/)?doc\/([A-Za-z0-9-]{10,})$/.exec(n.trim());return t?t[1]??null:null}function ba(n){if(typeof n!="string")return null;const t=/^siyuan:(?:\/\/)?block\/([0-9]{14}-[0-9a-zA-Z]{7})$/.exec(n.trim());return t?t[1]??null:null}const xa="application/x-siyuan-excali-board";function wa(n){return n.split("/").map(t=>{try{return decodeURIComponent(t)}catch{return t}}).join("/")}function ka(n){const t=String(n??"").trim().replace(/\\/g,"/");if(t==="")return null;const e=Y(R(t));return!/\.svg$/i.test(e)||Ge(e)||e.split("/").some(i=>i===".."||i==="")?null:e}function Sa(n){if(typeof n!="string")return null;const t=n.trim(),e=/^siyuan:(?:\/\/)?excali\/(.+)$/.exec(t);return e?ka(wa(e[1]??"")):null}function va(n){const t=Sa(n);return t?R(t):null}const Mt="assets";function Ea(n){return/^excali-\d{8}-\d{6}\.svg$/i.test(n)}function _a(n){const t=R(n).replace(/^\/data\//,""),e=t.lastIndexOf("/");return e<0?"":t.slice(0,e)}function Aa(n,t){return _a(n)===t.replace(/^\/+|\/+$/g,"")}function $a(n,t=Mt){const e=t.replace(/^\/+|\/+$/g,""),i=[],o=new Set;for(const s of[...n.recent,...n.registry,...n.autoNamed]){if(typeof s!="string"||!/\.svg$/i.test(s)||Ge(s))continue;const a=R(s);!Aa(a,e)||o.has(a)||(o.add(a),i.push(a))}return i}function Ma(n,t){const e=[],i=new Set;for(const o of n){const s=R(o),a=t.get(s)??s;i.has(a)||(i.add(a),e.push(a))}return e}const jt=/^\d{14}-[0-9a-zA-Z]{7}$/,Fn=/^\d{14}-[0-9a-zA-Z]{7}$/;function Ia(n){const t=n.trim(),e=/^\[[^\]]*\]\(([^)]*)\)$/.exec(t);return e?(e[1]??"").trim():t}function Ca(n){const t=n.trim(),e=/^\(\(\s*([0-9A-Za-z-]+)\s*(?:['"][^'"]*['"])?\s*\)\)$/.exec(t);return e?e[1]??null:null}function Ra(n){if(typeof n!="string")return null;let t=n.trim();if(t==="")return null;const e=Ca(t);if(e)return jt.test(e)?{kind:"block",id:e}:null;if(t=Ia(t),t==="")return null;const i=/^siyuan:\/\/([0-9A-Za-z-]+)\/([0-9A-Za-z-]+)$/.exec(t);if(i){const a=i[1]??"",r=i[2]??"",d=a==="doc"||a==="blocks"||a==="block";if(!d&&jt.test(r))return{kind:"block",id:r};if(!d)return null}const o=/^siyuan:\/\/(blocks|doc|block)\/([0-9A-Za-z-]+)$/.exec(t);if(o){const a=o[1]??"",r=o[2]??"";return a==="doc"?Fn.test(r)?{kind:"doc",id:r}:null:jt.test(r)?{kind:"block",id:r}:null}const s=/^siyuan:(block|doc)\/([0-9A-Za-z-]+)$/.exec(t);if(s){const a=s[1]??"",r=s[2]??"";return a==="doc"?Fn.test(r)?{kind:"doc",id:r}:null:jt.test(r)?{kind:"block",id:r}:null}return null}function Ta(n){const t=n.filter(e=>/^[0-9]{14}-[0-9a-zA-Z]{7}$/.test(e)).map(e=>`'${e.replace(/'/g,"''")}'`);return t.length===0?"":`select id, content, type, subtype from blocks where id in (${t.join(",")})`}function La(n){return String(n??"").replace(/'/g,"''")}function Oa(n){return n.replace(/[\\%_]/g,t=>`\\${t}`)}function Pa(n){return`SELECT id, content, hpath FROM blocks WHERE type='d' AND content LIKE '%${La(Oa(String(n??"").trim()))}%' ESCAPE '\\' ORDER BY id LIMIT 30`}function Da(n){const t=n;if(!t||typeof t.id!="string"||t.id==="")return null;const e=String(t.content??"").replace(/\s+/g," ").trim(),i=String(t.hpath??"").replace(/\s+/g," ").trim();return{id:t.id,title:e===""?t.id:e,path:i}}let ie=null;function Ba(n){n.eventBus.on("switch-protyle",({detail:t})=>{ie=t.protyle}),n.eventBus.on("click-editorcontent",({detail:t})=>{ie=t.protyle})}function Na(){if(ie?.wysiwyg?.element?.isConnected)return ie;const n=I.getAllEditor();for(let t=n.length-1;t>=0;t--){const e=n[t].protyle;if(e?.wysiwyg?.element?.isConnected)return e}return null}async function Fa(n,t){const e=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),i=await e.json().catch(()=>null);if(!e.ok||!i||i.code!==0)throw new Error(i?.msg||`${n} HTTP ${e.status}`);return i}async function Xi(n){const t=await Fa("/api/query/sql",{stmt:n});return Array.isArray(t.data)?t.data:[]}function ja(n){const t=n;return t?.protyle?.lute??t?.lute??window.Lute??null}async function Ha(n){const t=Ta(n);if(!t)return{};try{const e=await Xi(t),i={};for(const o of e)typeof o.id=="string"&&(i[o.id]={title:typeof o.content=="string"?o.content:"",type:typeof o.type=="string"?o.type:"",subtype:typeof o.subtype=="string"?o.subtype:""});return i}catch{return{}}}function $e(n){const t=ia(n);let e=0;return document.querySelectorAll("img").forEach(i=>{let o;try{o=new URL(i.src,location.href)}catch{return}decodeURIComponent(o.pathname)===t&&(o.searchParams.set("t",String(Date.now())),i.src=o.href,e++)}),e}function za(n){let t;try{t=new URL(n,location.href)}catch{return null}const e=decodeURIComponent(t.pathname);return e.startsWith("/assets/")?na(e.replace(/^\/+/,"")):null}function jn(n){for(const t of n){const e=t.tagName==="IMG"?t:t.querySelector("img");if(!e)continue;const i=za(e.getAttribute("src")||e.dataset.src||"");if(i&&/\.svg$/i.test(i))return i}return null}async function Xa(n){const t=String(n??"").trim();if(t==="")return[];try{const e=await Xi(Pa(t)),i=[];for(const o of e){const s=Da(o);s&&i.push(s)}return i}catch{return[]}}const Ne="data-exs-board-open",Fe="data-exs-board-badge",Ua='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5h10v10"/><path d="M19 5 8 16"/><path d="M18 14v5H5V6h5"/></svg>';function Ya(n,t){let e;try{e=n.querySelectorAll("img[data-src], img[src]")}catch{return}for(const i of e){const o=i.getAttribute("data-src")||i.getAttribute("src")||"";if(!o||!t.isBoardAsset(o))continue;const s=i.closest("[data-node-id]");if(!s||!s.isConnected)continue;const a=s.querySelector(".protyle-action");if(a&&!a.querySelector(`[${Ne}]`)){const d=document.createElement("span");d.className="protyle-icon ariaLabel",d.setAttribute("aria-label",g("用 Excali 白板打开")),d.setAttribute("data-position","4north"),d.setAttribute(Ne,""),d.innerHTML=Ua,d.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),t.openBoard(o)}),a.insertAdjacentElement("beforeend",d)}const r=s.querySelector(".protyle-attr");if(r&&!r.querySelector(`[${Fe}]`)){const d=document.createElement("span");d.className="exs-board-badge",d.setAttribute(Fe,""),d.textContent="Excali",r.prepend(d)}}Ga(n,t)}function Ga(n,t){let e;try{e=n.querySelectorAll(`[${Ne}], [${Fe}]`)}catch{return}for(const i of e){if(!i.isConnected)continue;const o=i.closest("[data-node-id]");o&&o.isConnected&&Wa(o,t)||i.remove()}}function Wa(n,t){for(const e of n.querySelectorAll("img[data-src], img[src]")){const i=e.getAttribute("data-src")||e.getAttribute("src")||"";if(i&&t.isBoardAsset(i))return!0}return!1}function Ui(n,t=new Date){if(!n)return"";const e=new Date(n),i=d=>String(d).padStart(2,"0"),o=`${i(e.getHours())}:${i(e.getMinutes())}`,s=d=>`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;if(s(e)===s(t))return`${g("今天")} ${o}`;const a=new Date(t);if(a.setDate(t.getDate()-1),s(e)===s(a))return`${g("昨天")} ${o}`;const r=`${i(e.getMonth()+1)}-${i(e.getDate())}`;return e.getFullYear()===t.getFullYear()?`${r} ${o}`:`${e.getFullYear()}-${r}`}function Za(n,t){const e=t.trim().toLowerCase();return e===""?n:n.filter(i=>B(i.path).toLowerCase().includes(e))}const qa={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function Me(n){return n.replace(/[&<>"']/g,t=>qa[t])}function Ka(n,t,e=g("打开白板…")){return new Promise(i=>{let o=!1,s=!1,a,r=n,d=-1;const l=b=>{o||(o=!0,a!==void 0&&window.clearTimeout(a),c.destroy(),i(b))},c=new I.Dialog({title:e,width:"560px",content:`<div class="exs-picker">
  <input class="b3-text-field fn__block exs-picker__search" placeholder="${g("搜索文件名…")}" />
  <div class="exs-picker__list b3-list b3-list--background"></div>
</div>`,destroyCallback:()=>l(null)});c.element.classList.add("exs-board-picker-dialog");const u=c.element.querySelector(".exs-picker__search"),h=c.element.querySelector(".exs-picker__list"),f=()=>{if(r.length===0){h.innerHTML=`<div class="exs-picker__empty">${g("没有匹配的白板")}</div>`;return}h.innerHTML=r.map((b,y)=>{const S=`b3-list-item exs-picker__item${y===d?" b3-list-item--focus":""}`,m=t.has(R(b.path))?`<span class="exs-picker__badge">${g("已打开")}</span>`:"",w=Ui(b.updated),$=m||w?`<span class="b3-list-item__meta">${m}${Me(w)}</span>`:"";return`<div class="${S}" data-idx="${y}" title="${Me(b.path)}"><span class="exs-picker__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"></rect><path d="M3.5 9h17M9 9v11.5"></path></svg></span><span class="b3-list-item__text">${Me(B(b.path))}</span>${$}</div>`}).join("")},p=b=>{const y=r[b];y&&l(y.path)},x=b=>{r.length!==0&&(d=d<0?b>0?0:r.length-1:(d+b+r.length)%r.length,f(),h.querySelector(".b3-list-item--focus")?.scrollIntoView({block:"nearest"}))},E=()=>{a!==void 0&&window.clearTimeout(a),a=window.setTimeout(()=>{a=void 0,r=Za(n,u.value),d=-1,f()},120)};u.addEventListener("compositionstart",()=>{s=!0}),u.addEventListener("compositionend",()=>{s=!1,E()}),u.addEventListener("input",()=>{s||E()}),u.addEventListener("keydown",b=>{b.isComposing||b.keyCode===229||(b.key==="ArrowDown"?(b.preventDefault(),x(1)):b.key==="ArrowUp"?(b.preventDefault(),x(-1)):b.key==="Enter"?(b.preventDefault(),p(d>=0?d:0)):b.key==="Escape"&&(b.preventDefault(),l(null)))}),h.addEventListener("click",b=>{const y=b.target?.closest(".exs-picker__item");y&&p(Number(y.dataset.idx))}),u.focus(),f()})}const Ja={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Ht=n=>n.replace(/[&<>"']/g,t=>Ja[t]);function Va(n){const t=document.createElement("div");t.className="exs-dock",t.innerHTML=`
  <div class="block__icons exs-dock__head">
    <div class="block__logo fn__flex-1"><span class="fn__ellipsis">${g("白板库")}</span><span class="exs-dock__count" data-role="libcount"></span></div>
    <span class="fn__space"></span>
    <button class="block__icon block__icon--show ariaLabel" data-act="new" aria-label="${g("新建白板")}" data-position="north" title="${g("新建白板")}" type="button"><svg aria-hidden="true" focusable="false"><use xlink:href="#iconAdd"></use></svg></button>
    <button class="block__icon block__icon--show ariaLabel" data-act="delete-active" data-role="del-active" aria-label="${g("删除当前白板")}" data-position="north" title="${g("删除当前白板")}" type="button" disabled><svg aria-hidden="true" focusable="false"><use xlink:href="#iconTrashcan"></use></svg></button>
    <button class="block__icon block__icon--show ariaLabel" data-act="lib-refresh" aria-label="${g("刷新")}" data-position="north" title="${g("刷新")}" type="button"><svg aria-hidden="true" focusable="false"><use xlink:href="#iconRefresh"></use></svg></button>
  </div>
  <ul class="b3-list b3-list--background exs-dock__liblist" data-role="liblist"></ul>`;const e=t.querySelector('[data-role="libcount"]'),i=t.querySelector('[data-role="liblist"]'),o=t.querySelector('[data-role="del-active"]');let s="",a=[];const r=()=>{const c=n.getBoardFiles(),u=ga(c.files,c.opened);if(u!==s){if(s=u,a=c.files,e.textContent=c.files.length>0?String(c.files.length):"",c.files.length===0){i.innerHTML=`<li class="exs-lib__hint">${g("还没有白板")}</li>`;return}i.innerHTML=c.files.map(h=>{const f=c.opened.has(h.dataPath),p=Ui(h.updated),x=f?`<span class="exs-lib__badge">${g("已打开")}</span>`:"";return`<li class="b3-list-item b3-list-item--narrow b3-list-item--hide-action exs-lib__item${f?" is-open":""}" data-file="${Ht(h.dataPath)}" title="${Ht(h.dataPath)}" draggable="true">
          <button class="b3-list-item__text exs-lib__text" type="button">${Ht(ne(h))}</button>${x}
          <span class="fn__space"></span>
          <span class="exs-lib__meta">${Ht(p)}</span>
          <button class="b3-list-item__action b3-tooltips b3-tooltips__w" data-act="row-rename" title="${g("重命名")}" type="button"><svg aria-hidden="true"><use xlink:href="#iconEdit"></use></svg></button>
          <button class="b3-list-item__action b3-tooltips b3-tooltips__w exs-lib__act--danger" data-act="row-delete" title="${g("删除…")}" type="button"><svg aria-hidden="true"><use xlink:href="#iconTrashcan"></use></svg></button>
        </li>`}).join("")}},d=()=>{r(),o.disabled=!n.hasActiveBoard()},l=c=>{const u=c.closest(".exs-lib__item");return u?a.find(f=>f.dataPath===u.dataset.file):void 0};return t.addEventListener("click",c=>{const u=c.target,h=u.closest("[data-act]");if(h&&!h.disabled)switch(h.dataset.act){case"new":n.openNew();return;case"delete-active":n.deleteActiveBoard();return;case"lib-refresh":n.refreshBoardLib();return;case"row-rename":{const p=l(h);p&&n.renameBoardFile(p);return}case"row-delete":{const p=l(h);p&&n.deleteBoardFile(p);return}}const f=u.closest(".exs-lib__item");if(f){const p=a.find(x=>x.dataPath===f.dataset.file);p&&n.openBoardFile(p)}}),t.addEventListener("dragstart",c=>{const u=c.target.closest(".exs-lib__item");if(!u)return;const h=a.find(x=>x.dataPath===u.dataset.file),f=c.dataTransfer;if(!h||!f)return;const p=Y(h.dataPath);f.effectAllowed="copy",f.setData("text/plain",p),f.setData(xa,JSON.stringify({ref:p,title:ne(h)}))}),t.addEventListener("contextmenu",c=>{const u=c.target.closest(".exs-lib__item");if(!u)return;const h=a.find(f=>f.dataPath===u.dataset.file);h&&(c.preventDefault(),n.openFileMenu(h,c.clientX,c.clientY))}),n.onRefresh(d),d(),{element:t,refresh:d}}const zt="0.9.0",Hn="excali-studio-version";function Qa(n,t){const e=t.trim();if(!e)return"unknown-version";const i=(typeof n=="string"?n:"").trim();return i?i===e?"up-to-date":"show":"first-install"}function tr(n){return`/data/plugins/${n}/CHANGELOG.md`}const er={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function X(n){return n.replace(/[&<>"']/g,t=>er[t])}async function nr(n){const t=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:n})});if(!t.ok)throw new Error(`getFile HTTP ${t.status}`);const e=await t.text();if((t.headers.get("content-type")||"").includes("application/json")||/"code"\s*:\s*404/.test(e))throw new Error(`getFile 读不到文件：${n}`);return e}function zn(n,t){const e=globalThis.Lute;if(e?.New)try{const i=e.New().Md2HTML?.(n);if(i)return i}catch{}return`<pre class="${t}">${X(n)}</pre>`}const ir=/^v?(\d[\w.+-]*)[ \t]*(?:[(（][ \t]*([^)）]*?)[ \t]*[)）])?[ \t]*$/;function Ie(n){return n.replace(/\n-{3,}[ \t]*$/,"").replace(/\s+$/,"")}function sr(n){const t=[],e=/^##[ \t]+(.+?)[ \t]*$/gm;let i;for(;i=e.exec(n);){const s=n.indexOf(`
`,i.index);t.push({index:i.index,bodyStart:s<0?n.length:s+1,title:i[1].trim()})}const o=[];for(let s=0;s<t.length;s++){const a=ir.exec(t[s].title);if(!a)continue;const r=s+1<t.length?t[s+1].index:n.length,l=Ie(n.slice(t[s].bodyStart,r).trim()).split(/^###[ \t]+/m),c=Ie((l.shift()||"").trim()),u=[];for(const h of l){const f=h.indexOf(`
`),p=(f<0?h:h.slice(0,f)).trim();if(!p)continue;const x=f<0?"":Ie(h.slice(f+1).trim());u.push({title:p,markdown:x})}o.push({version:a[1],date:(a[2]||"").trim(),lead:c,groups:u})}return o}function or(n,t,e){const i=sr(n);if(!i.length)return"";const o=t.trim().replace(/^v/i,""),s=i.findIndex(c=>c.version===o),a=s<0?0:s,r=i.map((c,u)=>{const h=u===a;return`<button type="button" class="cl-ver${h?" is-active":""}" data-cl-ver="${u}"${h?' aria-current="true"':""}>
        <span class="cl-ver-num">v${X(c.version)}${u===0?`<span class="cl-new">${X(e.latest)}</span>`:""}</span>
        ${c.date?`<span class="cl-ver-date">${X(c.date)}</span>`:""}
      </button>`}).join(""),d=i.map((c,u)=>{const h=u===0,f=c.version===o,p=c.lead?`<div class="cl-lead">${zn(c.lead,"exs-changelog__plain")}</div>`:"",x=c.groups.map(E=>`<section class="cl-group"><h3>${X(E.title)}</h3><div class="cl-group-body">${E.markdown?zn(E.markdown,"exs-changelog__plain"):""}</div></section>`).join("");return`<section class="cl-page" data-cl-page="${u}"${u===a?"":" hidden"}${f?' data-cl-current="true"':""}>
        <div class="cl-ver-head">
          <h2>v${X(c.version)}</h2>
          ${c.date?`<time>${X(c.date)}</time>`:""}
          ${h?`<span class="cl-new">${X(e.latest)}</span>`:""}
        </div>
        ${p}
        <div class="cl-groups">${x}</div>
      </section>`}).join(""),l=`<footer class="cl-foot">
      <span class="cl-foot-status">${X(i[a].version===o?e.current:e.archived)}</span>
      <button type="button" class="cl-ok" data-cl-ok>${X(e.ok)}</button>
    </footer>`;return`<div class="cl-dialog" data-cl-text-current="${X(e.current)}" data-cl-text-archived="${X(e.archived)}">
    <header class="cl-head">
      <div class="cl-script">What's new</div>
      <h1 class="cl-title">${X(e.title)}</h1>
      <p class="cl-sub">${X(e.subtitle)}</p>
      <button type="button" class="cl-close" data-cl-close aria-label="${X(e.close)}">×</button>
    </header>
    <div class="cl-body">
      <nav class="cl-rail" aria-label="${X(e.history)}">
        <div class="cl-rail-label">${X(e.history)}</div>
        ${r}
      </nav>
      <main class="cl-main">${d}</main>
    </div>
    ${l}
  </div>`}function ar(n,t){const e=Array.from(n.querySelectorAll("[data-cl-ver]")),i=Array.from(n.querySelectorAll("[data-cl-page]")),o=n.querySelector(".cl-main"),s=n.querySelector(".cl-foot-status"),a=n.querySelector(".cl-dialog"),r=a?.getAttribute("data-cl-text-current")||"",d=a?.getAttribute("data-cl-text-archived")||"";n.addEventListener("click",l=>{const c=l.target;if(!c)return;if(c.closest("[data-cl-close], [data-cl-ok]")){t();return}const u=c.closest("[data-cl-ver]");if(!u)return;const h=Number(u.getAttribute("data-cl-ver"));!Number.isInteger(h)||h<0||(e.forEach(f=>{const p=f===u;f.classList.toggle("is-active",p),p?f.setAttribute("aria-current","true"):f.removeAttribute("aria-current")}),i.forEach((f,p)=>{f.hidden=p!==h}),s&&(s.textContent=i[h]?.hasAttribute("data-cl-current")?r:d),o&&(o.scrollTop=0),u.scrollIntoView({block:"nearest",inline:"nearest"}))})}function rr(n){const t=[];let e=!1;for(const i of(n||"").split(/\r?\n/)){if(/^\s*```/.test(i)){e=!e;continue}if(e)continue;const o=i.match(/^(#{1,6})\s+(.+?)\s*$/);o&&t.push({level:o[1].length,text:o[2]})}return t}function lr(n){const t=(n||"").split(/\r?\n/);let e=-1;for(let o=0;o<t.length;o++)if(/^\s*\|.*\|\s*$/.test(t[o])){e=o;break}if(e<0)return null;const i=[];for(let o=e;o<t.length;o++){const s=t[o];if(!/^\s*\|.*\|\s*$/.test(s))break;const a=s.replace(/^\s*\|/,"").replace(/\|\s*$/,"").split("|").map(r=>r.trim());a.every(r=>/^:?-{2,}:?$/.test(r))||i.push(a)}return i.length===0?null:{headers:i[0],rows:i.slice(1)}}function cr(n){const t=(n||"").split(/\r?\n/),e=[],i=[];for(const o of t){const s=o.match(/^(\s*)(?:[-*+]|\d+\.)\s+(.+?)\s*$/);if(!s){if(o.trim()===""||i.length===0)continue;continue}const a=Math.floor(s[1].replace(/\t/g,"  ").length/2),r={text:s[2],depth:a,children:[]};for(;i.length>a+1;)i.pop();if(a===0||i.length===0){if(a>0&&e.length===0){e.push(r),i.length=0,i.push(r);continue}e.push(r),i.length=0,i.push(r)}else(i[a-1]??i[i.length-1]).children.push(r),i[a]=r}return e}function dr(n){const t=(n||"").match(/```[a-zA-Z0-9]*\r?\n([\s\S]*?)```/);return t?t[1]:null}function fr(n){const t=(n||"").match(/^#\s+(.+?)\s*$/m)?.[1]??"",e=/@excalidraw-onload/.test(n||""),i=(dr(n)??(n||"").replace(/^#.*$/gm,"").replace(/@excalidraw-onload/g,"")).trim(),s=((n||"").split(/```/)[0]??"").split(`
`).filter(a=>!/^#\s/.test(a)&&!a.includes("@excalidraw-onload")).join(" ").replace(/\s+/g," ").trim();return{title:t,onload:e,code:i,description:s}}const Z="assets/excali-scripts",hr=50,$t={"text-numbering.md":[{key:"format",label:g("默认编号格式"),type:"select",default:"1",options:[{value:"1",label:g("数字（1. 2. 3.）")},{value:"2",label:g("罗马大写（I. II. III.）")},{value:"3",label:g("罗马小写（i. ii. iii.）")},{value:"4",label:g("字母大写（A. B. C.）")},{value:"5",label:g("字母小写（a. b. c.）")},{value:"6",label:g("无序列表（• • •）")}]}],"box-selection.md":[{key:"padding",label:g("外框边距（像素）"),type:"number",default:20,min:0,max:200}]};async function Yi(n){const t=await fetch("/api/file/readDir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:R(n)})}),e=await t.json().catch(()=>null);return!t.ok||!e||e.code!==0?[]:Array.isArray(e.data)?e.data.filter(i=>i&&i.isDir!==!0&&typeof i.name=="string").map(i=>i.name):[]}async function je(n){const t=await K(R(n));return fr(t)}async function Xt(){let n=[];try{n=await Yi(Z)}catch{return[]}const t=[];for(const e of n.filter(i=>/\.md$/i.test(i)).sort().slice(0,hr)){const i=`${Z}/${e}`;try{const o=await je(i);t.push({path:i,name:e,title:o.title||e.replace(/\.md$/i,""),description:o.description,onload:o.onload,builtin:Pr.has(e)})}catch{}}return t}async function Gi(n){const t=new FormData;t.append("path",R(n)),t.append("isDir","true"),await fetch("/api/file/putFile",{method:"POST",body:t}).catch(()=>{})}async function ur(){let n=[];try{n=await Yi(Z)}catch{n=[]}const t=Pt.filter(i=>!n.includes(i.file));if(t.length===0)return 0;await Gi(Z);let e=0;for(const i of t)try{await wt(R(`${Z}/${i.file}`),i.content),e++}catch(o){console.warn("[excali-studio] 内置脚本写入失败",i.file,o)}return e}async function Wi(){const n=[];for(const t of Pt)try{(await K(R(`${Z}/${t.file}`))).trim()!==t.content.trim()&&n.push(t.file)}catch{}return n}async function pr(){const n=new Set(await Wi());if(n.size===0)return 0;await Gi(Z);let t=0;for(const e of Pt)if(n.has(e.file))try{await wt(R(`${Z}/${e.file}`),e.content),t++}catch(i){console.warn("[excali-studio] 内置脚本重置失败",e.file,i)}return t}function Ce(n){let t=5381;for(let e=0;e<n.length;e++)t=t*33^n.charCodeAt(e);return t>>>0}async function gr(n){const t={...n},e=[],i=[];for(const o of Pt){let s;try{s=await K(R(`${Z}/${o.file}`))}catch{continue}if(s.trim()===o.content.trim()){t[o.file]=Ce(s);continue}const a=t[o.file];if(a===void 0||a===Ce(s))try{await wt(R(`${Z}/${o.file}`),o.content),t[o.file]=Ce(o.content),e.push(o.file)}catch(r){console.warn("[excali-studio] 内置脚本自动更新失败",o.file,r),i.push(o.file)}else i.push(o.file)}return{updated:e,drifted:i,snapshot:t}}const mr=`# 笔记标题 → 思维导图

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
`,yr=`# Markdown 表格 → 渲染表格

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
`,br=`# 缩进列表 → 流程图

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
`,xr=`# 批量导入图片

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
`,wr=`# 对齐与分布

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
`,kr=`# 序号标注

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
`,Sr=`# 智能连线

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
`,vr=`# 任务清单 → 三列看板

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
`,Er=`# 导出分步图

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
`,_r=`# 重复补间（选中 2 个）

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
`,Ar=`# 选区加外框

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
`,$r=`# 统一尺寸（选中 2 个以上）

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
`,Mr=`# 反转箭头

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
`,Ir=`# 形状互转

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
`,Cr=`# 文字编号（按选择顺序）

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
`,Rr=`# 荧光笔

把笔刷切到荧光笔并进入手绘工具，之后直接在画布上拖拽就行——对标 Obsidian Excalidraw
的 Highlighter tool。

颜色 / 粗细 / 透明度读的是插件设置里那一份，和右缘竖条色板**同一个配置**（在色板改完
这里立刻跟着变）。脚本侧刻意不带参数：两处各存一套迟早打架，竖向色板是唯一的调色入口。

\`\`\`js
ea.highlighter();
const p = ea.getPen();
ea.notify("荧光笔：" + p.color + " · 约 " + Math.round(p.width * 4.25) + "px · " + p.opacity + "%");
\`\`\`
`,Tr=`# 素材配方（改色 / 重新生成）

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
`,Lr=`# 选区折叠为列表

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
`,Or=`# 画框折叠 / 展开

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
`,Pt=[{file:"mindmap-from-headings.md",content:mr},{file:"table-from-markdown.md",content:yr},{file:"flowchart-from-list.md",content:br},{file:"batch-import-images.md",content:xr},{file:"align-and-distribute.md",content:wr},{file:"number-badges.md",content:kr},{file:"smart-connect.md",content:Sr},{file:"kanban-from-list.md",content:vr},{file:"export-steps.md",content:Er},{file:"repeat-tween.md",content:_r},{file:"box-selection.md",content:Ar},{file:"uniform-size.md",content:$r},{file:"reverse-arrows.md",content:Mr},{file:"change-shape.md",content:Ir},{file:"text-numbering.md",content:Cr},{file:"highlighter.md",content:Rr},{file:"material-recipe.md",content:Tr},{file:"selection-fold.md",content:Lr},{file:"frame-collapse.md",content:Or}],Pr=new Set(Pt.map(n=>n.file));async function Xn(n,t,e){const i=[],o=r=>(...d)=>{try{i.push(`[${r}] ${d.map(l=>typeof l=="string"?l:JSON.stringify(l)).join(" ")}`)}catch{i.push(`[${r}] <无法序列化的输出>`)}},s={log:o("log"),warn:o("warn"),error:o("error"),info:o("log"),debug:o("log")},a=Date.now();try{return await new Function("ea","utils","console",`"use strict";
return (async () => {
${n}
})();`)(t,e,s),{ok:!0,logs:i,durationMs:Date.now()-a}}catch(r){const d=r instanceof Error?`${r.message}
${r.stack??""}`:String(r);return{ok:!1,logs:i,error:d,durationMs:Date.now()-a}}}let Un=0;function He(n="ea"){return Un+=1,`${n}-${Date.now().toString(36)}-${Un.toString(36)}`}function lt(n,t){let e=0;for(const i of n)e+=/[\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]/.test(i)?1:.56;return Math.ceil(e*t)}function Dr(n){let t=n.x,e=n.y,i=n.x+n.width,o=n.y+n.height;if(n.points&&n.points.length>0){t=e=1/0,i=o=-1/0;for(const[a,r]of n.points)t=Math.min(t,n.x+a),e=Math.min(e,n.y+r),i=Math.max(i,n.x+a),o=Math.max(o,n.y+r)}const s=n.angle??0;if(s!==0){const a=(t+i)/2,r=(e+o)/2,d=Math.cos(s),l=Math.sin(s),c=[[t,e],[i,e],[t,o],[i,o]];let u=1/0,h=1/0,f=-1/0,p=-1/0;for(const[x,E]of c){const b=x-a,y=E-r,S=a+b*d-y*l,m=r+b*l+y*d;u=Math.min(u,S),h=Math.min(h,m),f=Math.max(f,S),p=Math.max(p,m)}t=u,e=h,i=f,o=p}return{minX:t,minY:e,maxX:i,maxY:o,width:i-t,height:o-e,cx:(t+i)/2,cy:(e+o)/2}}function kt(n){if(n.length===0)return null;const t=n.map(Dr),e=Math.min(...t.map(a=>a.minX)),i=Math.min(...t.map(a=>a.minY)),o=Math.max(...t.map(a=>a.maxX)),s=Math.max(...t.map(a=>a.maxY));return{minX:e,minY:i,maxX:o,maxY:s,width:o-e,height:s-i,cx:(e+o)/2,cy:(i+s)/2}}function Yn(n,t){if((n.angle??0)!==0)return{x:n.x+n.width/2,y:n.y+n.height/2};switch(t){case"top":return{x:n.x+n.width/2,y:n.y};case"bottom":return{x:n.x+n.width/2,y:n.y+n.height};case"left":return{x:n.x,y:n.y+n.height/2};case"right":return{x:n.x+n.width,y:n.y+n.height/2}}}function Ut(n,t){const e=t.x+t.width/2-(n.x+n.width/2),i=t.y+t.height/2-(n.y+n.height/2);return Math.abs(e)>=Math.abs(i)?e>=0?"right":"left":i>=0?"bottom":"top"}function Zi(n,t,e){const i=/[\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]/,o=d=>i.test(d)?1:.56,s=d=>[...d].reduce((l,c)=>l+o(c),0),a=t/e,r=[];for(const d of n.split(`
`)){const l=d.match(/[\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]|[^\s\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]+\s*|\s+/g)??[];let c="";const u=()=>{r.push(c.replace(/\s+$/,"")),c=""};for(const h of l){if(c===""&&/^\s+$/.test(h))continue;const f=h.replace(/\s+$/,"");if(c!==""&&s(c.replace(/\s+$/,""))+s(f)>a&&u(),s(f)<=a){c+=h;continue}for(const p of h)c===""&&/\s/.test(p)||(c!==""&&!/\s/.test(p)&&s(c)+o(p)>a&&u(),c+=p)}u()}return r}function Gn(n,t,e="",i={}){const o=a=>n.addElements([a])[0]??"";return{addRect:a=>o({...a,type:"rectangle"}),addDiamond:a=>o({...a,type:"diamond"}),addEllipse:a=>o({...a,type:"ellipse"}),addArrow:a=>o({...a,type:"arrow"}),addLine:a=>o({...a,type:"line"}),addText:a=>o({...a,type:"text"}),addFrame:a=>o({...a,type:"frame"}),addImage:(a,r)=>n.addImage(a,r),getElements:()=>n.getElements(),getElement:a=>n.getElements().find(r=>r.id===a),addElements:a=>n.addElements(a.map(r=>({...r,type:r.type??"rectangle"}))),deleteElements:a=>n.deleteElements(a),reorderElements:a=>n.reorderElements(a),clear:()=>n.clear(),selectElements:a=>n.selectElements(a),setStyle:(a,r)=>{const d=a==="selection"?Object.keys(n.getAppState().selectedElementIds??{}):a;d.length!==0&&n.patchElements(d,r)},setText:(a,r)=>{const d=n.getElements().find(h=>h.id===a);if(!d||d.type!=="text")return;const l=d.fontSize??20,c=d.lineHeight??1.25,u=String(r).split(`
`);n.patchElements([a],{text:r,originalText:r,width:Math.max(1,...u.map(h=>lt(h,l))),height:Math.ceil(l*c*u.length)})},zoomToFit:()=>n.scrollToContent(),scrollToElement:a=>n.scrollToElement(a),getViewMode:()=>!!n.getAppState().viewModeEnabled,setViewMode:a=>n.setViewMode(a),getBackground:()=>n.getAppState().viewBackgroundColor??"",setBackground:a=>n.updateScene({viewBackgroundColor:a}),setLink:(a,r)=>{const d=a==="selection"?Object.keys(n.getAppState().selectedElementIds??{}):a;d.length!==0&&n.patchElements(d,{link:r})},getLink:a=>{const r=n.getElements().find(d=>d.id===a);return r&&typeof r.link=="string"?r.link:null},exportSVG:(a,r)=>n.exportImage("svg",a,r),exportPNG:(a,r)=>n.exportImage("png",a,r),save:()=>t.save(),notify:a=>t.notify(a),getDocMarkdown:()=>t.getDocMarkdown(),getSelectedText:()=>t.getSelectedText(),listFiles:a=>t.listFiles(a),addImageFromFile:async(a,r)=>{const d=await t.readFileAsDataURL(a);return n.addImage(d,r)},settings:t.getSettings(),targetView:{getTitle:()=>"board"},getSelectedElements:()=>Object.keys(n.getAppState().selectedElementIds??{}),getBoundingBox:a=>{const r=a==="selection"?Object.keys(n.getAppState().selectedElementIds??{}):a;if(r.length===0)return null;const d=new Set(r),l=n.getElements().filter(c=>d.has(c.id));return kt(l)},connectObjects:(a,r,d,l,c)=>n.connectObjects(a,r,d,l,c),group:a=>{if(a.length<2)return null;const r=He("group");return n.patchElements(a,{groupIds:[r]}),r},unGroup:a=>{n.patchElements(a,{groupIds:[]})},toFront:a=>Wn(n,a,"front"),toBack:a=>Wn(n,a,"back"),setPosition:(a,r,d)=>n.patchElements([a],{x:r,y:d}),moveBy:(a,r,d)=>{const l=a==="selection"?Object.keys(n.getAppState().selectedElementIds??{}):a;for(const c of l){const u=n.getElements().find(h=>h.id===c);u&&n.patchElements([c],{x:u.x+r,y:u.y+d})}},measureText:(a,r=20)=>({width:lt(a,r),height:Math.ceil(r*1.25)}),wrapText:(a,r,d=20)=>Zi(a,r,d),addEmbeddable:(a,r)=>n.addEmbeddable(a,r),addLibraryItem:a=>n.addLibraryItem(a),getTheme:()=>n.getTheme(),setTheme:a=>n.setTheme(a),getPen:()=>n.getPen(),setPen:a=>{const r=n.getPen(),d={color:a.color??r.color,width:a.width??r.width,opacity:a.opacity??r.opacity,roughness:a.roughness??r.roughness};n.applyPen({...te(d),roughness:d.roughness},a.tool)},highlighter:()=>n.applyPen({...t.getHighlighter(),roughness:Ho},"freedraw"),siyuan:{call:(a,r)=>t.siyuanCall(a,r??{})},getModifiers:()=>({shift:!!i.shift}),getScriptSetting:(a,r)=>{const d=t.getScriptSetting(e,a);return d===void 0?r:d},setScriptSetting:(a,r)=>t.setScriptSetting(e,a,r),utils:{uuid:()=>He("uuid"),now:()=>Date.now(),parseHeadings:rr,parseList:cr,parseTable:lr,inputPrompt:async(a,r="text",d="")=>await t.inputPrompt(a,r,d)??"",selectOption:a=>t.selectOption({...a,at:a.at??i.at})}}}function Wn(n,t,e){const i=[...n.getElements()].sort((d,l)=>String(d.index??"").localeCompare(String(l.index??"")));if(i.length===0)return;const o=new Set(t),s=i.filter(d=>o.has(d.id)),a=i.filter(d=>!o.has(d.id));if(s.length===0||a.length===0)return;(e==="front"?[...a,...s]:[...s,...a]).forEach((d,l)=>{const c=String(i[l].index??"");String(d.index??"")!==c&&n.patchElements([d.id],{index:c})})}const re={pencil:{background:"#fffdf7",ink:"#1e1e1e",fill:"#ffffff",edge:"#495057",muted:"#868e96",strokeWidth:2,roughness:1,fillStyle:"solid",strokeStyle:"solid",fontFamily:5,fontSizes:{title:28,node:16,edge:14,caption:14},nodeRoundness:{type:3}},marker:{background:"#ffffff",ink:"#1e1e1e",fill:"#ffec99",fillPalette:["#ffec99","#b2f2bb","#a5d8ff","#ffc9c9","#d0bfff","#ffd8a8","#c3fae8","#e9fac8"],edge:"#e03131",muted:"#868e96",strokeWidth:2,roughness:1,fillStyle:"solid",strokeStyle:"solid",fontFamily:5,fontSizes:{title:28,node:16,edge:14,caption:14},nodeRoundness:{type:3}},blueprint:{background:"#f8fbff",ink:"#1971c2",fill:"#e7f5ff",edge:"#1971c2",muted:"#4dabf7",strokeWidth:1,roughness:0,fillStyle:"solid",strokeStyle:"solid",fontFamily:3,fontSizes:{title:26,node:15,edge:13,caption:12},nodeRoundness:{type:3}}},Br=Object.keys(re),pt=new Map,se=new Map,Nr=8,Fr={hand:"pencil",handdrawn:"pencil","hand-drawn":"pencil",sketch:"pencil",ink:"pencil",color:"marker",colour:"marker",crayon:"marker",vivid:"marker",highlight:"marker",technical:"blueprint",line:"blueprint",wireframe:"blueprint",mono:"blueprint"};function St(n){return n.trim().toLowerCase().replace(/[\s_]+/g,"-").replace(/[^a-z0-9._-]/g,"").replace(/^-+|-+$/g,"")}function jr(n){if(typeof n!="string")return null;const t=St(n);if(t in re)return t;const e=Fr[t];return e||(pt.has(t)?t:null)}function Hr(n){return St(n)in re||pt.has(St(n))}function zr(n,t){pt.set(n,t),se.clear()}function Xr(){pt.clear(),se.clear()}function Ur(n){return pt.get(n)?.extendsFrom??null}function qi(){return[...Br,...[...pt.keys()].sort()]}function Ki(n,t){const e=se.get(n);if(e)return e;const i=re[n];if(i)return i;const o=pt.get(n);if(!o)throw new Error(`style:unknown-style (${n})`);if(t.includes(n)||t.length>=Nr)throw new Error(`style:circular-extends (${[...t,n].join(" <- ")})`);const s=Ki(o.extendsFrom,[...t,n]),a=o.diff.fontSizes,r={...s,...o.diff,fontSizes:{title:a?.title??s.fontSizes.title,node:a?.node??s.fontSizes.node,edge:a?.edge??s.fontSizes.edge,caption:a?.caption??s.fontSizes.caption},...o.diff.space?{space:{...s.space,...o.diff.space}}:{},...o.diff.fillPalette?{fillPalette:o.diff.fillPalette.slice()}:{}};return se.set(n,r),r}function le(n){return Ki(n,[])}function Yr(n){let t=2166136261;for(let e=0;e<n.length;e++)t^=n.charCodeAt(e),t=Math.imul(t,16777619);return t>>>0}function Gr(n,t,e){const i=n.groupColor?.roles;if(n.groupColor?.mode==="roles"&&e&&i){const a=i[e]??i[e.toLowerCase()];if(a)return a}const o=n.fillPalette;if(!o||o.length===0)return n.fill;const s=e&&e!==""?`g:${e}`:`i:${t}`;return o[Yr(s)%o.length]}const oe={margin:20,bendPenalty:48,overlapPenalty:2,portPenalty:160},Yt=["top","right","bottom","left"],Zn={top:[0,-1],right:[1,0],bottom:[0,1],left:[-1,0]},Wr=[0,1,0,-1],Zr=[-1,0,1,0],D=.01;function ce(n,t){return{minX:n.x-t,minY:n.y-t,maxX:n.x+n.width+t,maxY:n.y+n.height+t}}function qn(n,t){switch(t){case"top":return{x:n.x+n.width/2,y:n.y};case"bottom":return{x:n.x+n.width/2,y:n.y+n.height};case"left":return{x:n.x,y:n.y+n.height/2};case"right":return{x:n.x+n.width,y:n.y+n.height/2}}}function Kn(n){const t=[];for(const e of[...n].sort((i,o)=>i-o))(!t.length||e-t[t.length-1]>.5)&&t.push(e);return t}function Jn(n){const t=Kn(n),e=[];for(let i=0;i+1<t.length;i++)e.push((t[i]+t[i+1])/2);return Kn([...t,...e])}function Ji(n,t=oe.margin){const e=n.map(p=>ce(p,t)),i=Math.min(...e.map(p=>p.minX))-t,o=Math.max(...e.map(p=>p.maxX))+t,s=Math.min(...e.map(p=>p.minY))-t,a=Math.max(...e.map(p=>p.maxY))+t,r=Jn([i,o,...e.flatMap(p=>[p.minX,p.maxX]),...n.map(p=>p.x+p.width/2)]),d=Jn([s,a,...e.flatMap(p=>[p.minY,p.maxY]),...n.map(p=>p.y+p.height/2)]),l=r.length,c=d.length,u=new Uint8Array(l*c),h=new Uint8Array(l*c),f=new Uint8Array(l*c);for(const p of e){for(let x=0;x<c;x++){const E=d[x];if(E<p.minY-D||E>p.maxY+D)continue;const b=E>p.minY+D&&E<p.maxY-D;for(let y=0;y<l;y++){const S=r[y];if(S<p.minX-D||S>p.maxX+D)continue;const m=S>p.minX+D&&S<p.maxX-D,w=x*l+y;m&&b&&(u[w]=1),b&&y+1<l&&r[y+1]>p.minX+D&&S<p.maxX-D&&(h[w]=1),m&&x+1<c&&d[x+1]>p.minY+D&&E<p.maxY-D&&(f[w]=1)}for(let y=0;y+1<l;y++)b&&r[y]<=p.minX+D&&r[y+1]>p.minX+D&&(h[x*l+y]=1)}for(let x=0;x<l;x++){const E=r[x];if(E>p.minX+D&&E<p.maxX-D)for(let b=0;b+1<c;b++)d[b]<=p.minY+D&&d[b+1]>p.minY+D&&(f[b*l+x]=1)}}return{boxes:n,margin:t,xs:r,ys:d,blocked:u,hBlocked:h,vBlocked:f,hUse:new Uint16Array(l*c),vUse:new Uint16Array(l*c)}}class qr{constructor(){this.keys=[],this.values=[]}get size(){return this.keys.length}push(t,e){const i=this.keys,o=this.values;i.push(t),o.push(e);let s=i.length-1;for(;s>0;){const a=s-1>>1;if(i[a]<=i[s])break;[i[a],i[s]]=[i[s],i[a]],[o[a],o[s]]=[o[s],o[a]],s=a}}pop(){const t=this.keys,e=this.values,i=e[0],o=t.pop(),s=e.pop();if(t.length){t[0]=o,e[0]=s;let a=0;for(;;){const r=a*2+1,d=r+1;let l=a;if(r<t.length&&t[r]<t[l]&&(l=r),d<t.length&&t[d]<t[l]&&(l=d),l===a)break;[t[l],t[a]]=[t[a],t[l]],[e[l],e[a]]=[e[a],e[l]],a=l}}return i}}function Gt(n,t){let e=0,i=n.length-1;for(;e<=i;){const o=e+i>>1;if(Math.abs(n[o]-t)<.5)return o;n[o]<t?e=o+1:i=o-1}return-1}function Kr(n,t,e,i,o,s,a,r){const{xs:d,ys:l,blocked:c,hBlocked:u,vBlocked:h,hUse:f,vUse:p}=n,x=d.length,E=l.length,b=new Float64Array(x*E*4).fill(1/0),y=new Int32Array(x*E*4).fill(-1),S=new qr,m=(A,k)=>Math.abs(d[A]-d[o])+Math.abs(l[k]-l[s]),w=(e*x+t)*4+i;b[w]=0,S.push(m(t,e),w);let $=-1,v=1/0;for(;S.size;){const A=S.pop(),k=A&3,_=A>>2,C=_%x,L=(_-C)/x,O=b[A];if(O+m(C,L)>=v)break;if(C===o&&L===s){const T=O+(k===a?0:r.bendPenalty*(k===(a+2&3)?2:1));T<v&&(v=T,$=A);continue}for(let T=0;T<4;T++){if(T===(k+2&3))continue;const P=C+Wr[T],j=L+Zr[T];if(P<0||j<0||P>=x||j>=E)continue;const V=j*x+P;if(c[V])continue;const z=T===1?_:T===3?V:T===2?_:V,it=T===1||T===3;if(it?u[z]:h[z])continue;const st=Math.abs(it?d[P]-d[C]:l[j]-l[L]),fe=it?f[z]:p[z],_t=O+st+(T===k?0:r.bendPenalty)+(fe?st*r.overlapPenalty:0),gt=V*4+T;_t<b[gt]&&(b[gt]=_t,y[gt]=A,S.push(_t+m(P,j),gt))}}if($<0)return null;const M=[];for(let A=$;A>=0;A=y[A]){const k=A>>2,_=k%x;M.push([_,(k-_)/x])}return M.reverse(),{cost:v,cells:M}}function Jr(n){const t=[];for(const e of n){const i=t[t.length-1];if(!(i&&Math.abs(i.x-e.x)<D&&Math.abs(i.y-e.y)<D))for(t.push(e);t.length>=3;){const[o,s,a]=t.slice(-3);if(!(Math.abs(o.x-s.x)<D&&Math.abs(s.x-a.x)<D||Math.abs(o.y-s.y)<D&&Math.abs(s.y-a.y)<D))break;t.splice(t.length-2,1)}}return t}function Vn(n,t){const e=t.x+t.width/2-(n.x+n.width/2),i=t.y+t.height/2-(n.y+n.height/2),o=e>=0?"right":"left",s=i>=0?"bottom":"top";return Math.abs(e)>=Math.abs(i)?[o,s]:[s,o]}function Vr(n,t,e,i=[],o=oe,s=new Map,a=Ji(n,o.margin)){const r=n.find(b=>b.id===t),d=n.find(b=>b.id===e);if(!r||!d||r===d)return null;const l=a.margin;let c=null,u=[];const h=b=>{let y=1/0;for(const[S,m]of b){const w=qn(r,S),$=qn(d,m),[v,M]=Zn[S],[A,k]=Zn[m],_=Gt(a.xs,w.x+v*l),C=Gt(a.ys,w.y+M*l),L=Gt(a.xs,$.x+A*l),O=Gt(a.ys,$.y+k*l);if(_<0||C<0||L<0||O<0)continue;const T=Yt.indexOf(S),P=Yt.indexOf(m)+2&3,j=Kr(a,_,C,T,L,O,P,o);if(!j)continue;const V=s.get(`${r.id}:${S}`),z=s.get(`${d.id}:${m}`),it=(V?.in?1:0)+(z?.out?1:0),st=j.cost+2*l+it*o.portPenalty;if(st<y){y=st,u=j.cells;const fe=j.cells.map(([_t,gt])=>({x:a.xs[_t],y:a.ys[gt]}));c={side1:S,side2:m,path:Jr([w,...fe,$])}}}},f=Qr(r,d,a,s);if(f)return Qn(f,[],r,d,a,s,i),f;const p=Vn(r,d),x=Vn(d,r);h(p.flatMap(b=>x.map(y=>[b,y]))),c||h(Yt.flatMap(b=>Yt.map(y=>[b,y])));const E=c;return E?(Qn(E,u,r,d,a,s,i),E):null}function Qn(n,t,e,i,o,s,a){const r=`${e.id}:${n.side1}`,d=`${i.id}:${n.side2}`;s.set(r,{in:s.get(r)?.in??0,out:(s.get(r)?.out??0)+1}),s.set(d,{in:(s.get(d)?.in??0)+1,out:s.get(d)?.out??0});const l=o.xs.length;for(let c=0;c+1<t.length;c++){const[u,h]=t[c],[f,p]=t[c+1];h===p?o.hUse[h*l+Math.min(u,f)]++:o.vUse[Math.min(h,p)*l+u]++}for(let c=0;c+1<n.path.length;c++){const u=n.path[c],h=n.path[c+1];a.push({x1:u.x,y1:u.y,x2:h.x,y2:h.y})}}function Qr(n,t,e,i){const o=e.margin,s=(S,m)=>{const w=m==="x"?S.x:S.y,$=m==="x"?S.width:S.height;return S.shape==="diamond"||S.shape==="ellipse"?[w+$/2,w+$/2]:[w+12,w+$-12]},a=[],[r,d]=s(n,"x"),[l,c]=s(t,"x"),u=Math.max(r,l),h=Math.min(d,c);if(h>=u){const S=(u+h)/2;n.y+n.height+2*o<=t.y?a.push({side1:"bottom",side2:"top",path:[{x:S,y:n.y+n.height},{x:S,y:t.y}]}):t.y+t.height+2*o<=n.y&&a.push({side1:"top",side2:"bottom",path:[{x:S,y:n.y},{x:S,y:t.y+t.height}]})}const[f,p]=s(n,"y"),[x,E]=s(t,"y"),b=Math.max(f,x),y=Math.min(p,E);if(y>=b){const S=(b+y)/2;n.x+n.width+2*o<=t.x?a.push({side1:"right",side2:"left",path:[{x:n.x+n.width,y:S},{x:t.x,y:S}]}):t.x+t.width+2*o<=n.x&&a.push({side1:"left",side2:"right",path:[{x:n.x,y:S},{x:t.x+t.width,y:S}]})}for(const S of a){const[m,w]=S.path;if(!e.boxes.some(v=>v!==n&&v!==t&&Vi(m,w,ce(v,o/2)))&&!(i.get(`${n.id}:${S.side1}`)?.in||i.get(`${t.id}:${S.side2}`)?.out))return S}return null}function tl(n,t,e,i=8){const o=n.find(f=>f.id===t),s=n.find(f=>f.id===e);if(!o||!s||o===s)return null;const a={x:o.x+o.width/2,y:o.y+o.height/2},r={x:s.x+s.width/2,y:s.y+s.height/2},d=r.x-a.x,l=r.y-a.y;if(Math.abs(d)<D&&Math.abs(l)<D)return null;const c=(f,p)=>{const x=Math.abs(d)<D?1/0:f.width/2/Math.abs(d),E=Math.abs(l)<D?1/0:f.height/2/Math.abs(l),b=Math.min(x,E),y={x:f.x+f.width/2,y:f.y+f.height/2};return{x:y.x+p*d*b,y:y.y+p*l*b}},u=c(o,1),h=c(s,-1);for(const f of n)if(!(f===o||f===s)&&Vi(u,h,ce(f,i)))return null;return[u,h]}function Vi(n,t,e){let i=0,o=1;const s=t.x-n.x,a=t.y-n.y,r=[[-s,n.x-e.minX],[s,e.maxX-n.x],[-a,n.y-e.minY],[a,e.maxY-n.y]];for(const[d,l]of r){if(Math.abs(d)<1e-9){if(l<0)return!1;continue}const c=l/d;if(d<0?i=Math.max(i,c):o=Math.min(o,c),i>o)return!1}return!0}function el(n,t,e,i,o){let s=0,a=0;for(let p=0;p+1<n.length;p++){const x=Math.abs(n[p+1].x-n[p].x)+Math.abs(n[p+1].y-n[p].y);x>s&&(s=x,a=p)}const r=n[a]??{x:0,y:0},d=n[a+1]??r,l=Math.abs(d.x-r.x)>=Math.abs(d.y-r.y),c=[...i.map(p=>ce(p,4)),...o],u=(p,x)=>!c.some(E=>p<E.maxX&&p+t>E.minX&&x<E.maxY&&x+e>E.minY),h=[];for(const p of[.5,.33,.67,.2,.8]){const x=r.x+(d.x-r.x)*p,E=r.y+(d.y-r.y)*p;l?h.push({x:x-t/2,y:E-e-6},{x:x-t/2,y:E+6}):h.push({x:x+8,y:E-e/2},{x:x-t-8,y:E-e/2})}const f=h.find(p=>u(p.x,p.y))??h[0];return o.push({minX:f.x-4,minY:f.y-2,maxX:f.x+t+4,maxY:f.y+e+2}),f}const nl={minW:160,minH:90,padX:64,padY:40,gapX:110,gapY:64,gridGapX:90,gridGapY:72,radialMinRadius:240,radialGap:120,maxGridCols:4,textWrap:200};function il(n){return{...nl,...n.space}}const rt=24;function sl(n,t,e,i){const o=t.fontSizes.node,s=Zi(n.label,i.textWrap,o),a=Math.max(1,...s.map(c=>lt(c,o))),r=Math.ceil(s.length*o*1.25);let d,l;return n.shape==="text"?(d=Math.max(a,24),l=Math.max(r,o)):(d=Math.max(i.minW,a+i.padX),l=Math.max(i.minH,r+i.padY)),n.shape==="ellipse"?(d=Math.ceil(d*1.1),l=Math.ceil(l*1.12)):n.shape==="diamond"&&(d=Math.ceil(d*1.24),l=Math.ceil(l*1.32)),{id:n.id,label:n.label,shape:n.shape,...n.group?{group:n.group}:{},...n.rank!==void 0?{rank:n.rank}:{},...n.order!==void 0?{order:n.order}:{},index:e,fill:n.shape==="text"?"transparent":Gr(t,e,n.group),lines:s,x:0,y:0,width:d,height:l}}function ol(n,t){const e=new Map(n.map(l=>[l.id,l.index])),i=new Map(n.map(l=>[l.id,0])),o=new Map(n.map(l=>[l.id,[]]));for(const l of t)o.get(l.from)?.push(l.to),i.set(l.to,(i.get(l.to)??0)+1);const s=new Map(n.map(l=>[l.id,0])),a=new Set,r=n.filter(l=>(i.get(l.id)??0)===0).map(l=>l.id);for(;a.size<n.length;){if(r.length===0){const u=n.filter(f=>!a.has(f.id)).sort((f,p)=>(e.get(f.id)??0)-(e.get(p.id)??0))[0];let h=0;for(const f of t)f.to===u.id&&a.has(f.from)&&(h=Math.max(h,(s.get(f.from)??0)+1));s.set(u.id,h),r.push(u.id)}const l=r.shift();if(!(!l||a.has(l))){a.add(l);for(const c of o.get(l)??[]){if(a.has(c))continue;s.set(c,Math.max(s.get(c)??0,(s.get(l)??0)+1));const u=(i.get(c)??1)-1;i.set(c,u),u<=0&&r.push(c)}}}const d=new Set(t.map(l=>l.to));for(const l of n){if(d.has(l.id))continue;const c=(o.get(l.id)??[]).map(u=>s.get(u)??0);c.length&&s.set(l.id,Math.max(s.get(l.id)??0,Math.min(...c)-1))}for(const l of n)l.rank!==void 0&&s.set(l.id,l.rank);return s}function Qi(n,t){const e=ol(n,t),i=new Map;for(const o of n){const s=e.get(o.id)??0,a=i.get(s)??[];a.push(o),i.set(s,a)}al(i,t);for(const[o,s]of i)i.set(o,Ze(s));return i}function Ze(n){const t=new Map;return n.forEach((i,o)=>{i.group&&!t.has(i.group)&&t.set(i.group,o)}),n.map((i,o)=>({n:i,i:o,key:i.group?t.get(i.group)??o:o})).sort((i,o)=>i.key-o.key||i.i-o.i).map(i=>i.n).map((i,o)=>({n:i,i:o,key:i.order??o,explicit:i.order!==void 0?0:1})).sort((i,o)=>i.key-o.key||i.explicit-o.explicit||i.i-o.i).map(i=>i.n)}function al(n,t){const e=[...n.keys()].sort((s,a)=>s-a);if(e.length<2)return;const i=new Map;for(const s of t)s.from!==s.to&&(i.set(s.from,[...i.get(s.from)??[],s.to]),i.set(s.to,[...i.get(s.to)??[],s.from]));const o=(s,a)=>{s.forEach((r,d)=>{const l=a(d);if(l===void 0)return;const c=new Map((n.get(l)??[]).map((f,p)=>[f.id,p])),u=n.get(r)??[],h=u.map((f,p)=>{const x=(i.get(f.id)??[]).map(b=>c.get(b)).filter(b=>b!==void 0),E=Math.max(1,(n.get(l)?.length??1)-1)/Math.max(1,u.length-1);return{n:f,k:p,key:x.length?x.reduce((b,y)=>b+y,0)/x.length/E:p}});h.sort((f,p)=>f.key-p.key||f.k-p.k),n.set(r,h.map(f=>f.n))})};for(let s=0;s<2;s++){o(e,r=>r>0?e[r-1]:void 0);const a=[...e].reverse();o(a,r=>r>0?a[r-1]:void 0)}}function rl(n,t,e){const i=Qi(n,t),o=[...i.keys()].sort((l,c)=>l-c),s=o.map(l=>Math.max(...(i.get(l)??[]).map(c=>c.width))),a=o.map(l=>{const c=i.get(l)??[];return c.reduce((u,h)=>u+h.height,0)+e.gapY*Math.max(0,c.length-1)}),r=Math.max(0,...a);let d=0;o.forEach((l,c)=>{const u=i.get(l)??[];let h=Math.max(0,(r-a[c])/2);for(const f of u)f.x=d+(s[c]-f.width)/2,f.y=h,h+=f.height+e.gapY;d+=s[c]+e.gapX})}function ll(n,t,e){const i=Qi(n,t),o=[...i.keys()].sort((l,c)=>l-c),s=o.map(l=>Math.max(...(i.get(l)??[]).map(c=>c.height))),a=o.map(l=>{const c=i.get(l)??[];return c.reduce((u,h)=>u+h.width,0)+e.gapX*Math.max(0,c.length-1)}),r=Math.max(0,...a);let d=0;o.forEach((l,c)=>{const u=i.get(l)??[];let h=Math.max(0,(r-a[c])/2);for(const f of u)f.x=h,f.y=d+(s[c]-f.height)/2,h+=f.width+e.gapX;d+=s[c]+e.gapY})}function cl(n,t){const e=Ze(n),i=Math.max(1,Math.min(t.maxGridCols,Math.ceil(Math.sqrt(e.length)))),o=Math.ceil(e.length/i),s=Array.from({length:i},(u,h)=>Math.max(0,...e.filter((f,p)=>p%i===h).map(f=>f.width))),a=Array.from({length:o},(u,h)=>Math.max(0,...e.slice(h*i,h*i+i).map(f=>f.height))),r=[];let d=0;for(let u=0;u<i;u++)r.push(d),d+=s[u]+t.gridGapX;const l=[];let c=0;for(let u=0;u<o;u++)l.push(c),c+=a[u]+t.gridGapY;e.forEach((u,h)=>{const f=h%i,p=Math.floor(h/i);u.x=r[f]+(s[f]-u.width)/2,u.y=l[p]+(a[p]-u.height)/2})}function dl(n,t,e){if(n.length===1){n[0].x=0,n[0].y=0;return}const i=new Map(n.map(w=>[w.id,0]));for(const w of t)i.set(w.from,(i.get(w.from)??0)+1),i.set(w.to,(i.get(w.to)??0)+1);const o=[...n].sort((w,$)=>(i.get($.id)??0)-(i.get(w.id)??0)||w.index-$.index)[0],s=Ze(n.filter(w=>w.id!==o.id)),a=Math.max(...s.map(w=>w.width)),r=Math.max(...s.map(w=>w.height)),d=Math.max(e.radialMinRadius,o.width/2+a/2+e.radialGap,o.height/2+r/2+e.radialGap);o.x=-o.width/2,o.y=-o.height/2;const l=Math.hypot(a,r)+e.radialGap/2,c=w=>Math.max(1,Math.floor(Math.PI/Math.asin(Math.min(1,l/(2*w))))),u=[];let h=s,f=d;for(;h.length;){const w=u.length===0&&h.length<=c(f)?h.length:Math.min(h.length,c(f));u.push({r:f,nodes:h.slice(0,w)}),h=h.slice(w),f+=Math.max(a,r)+e.radialGap}const p=s.length<=2?0:-Math.PI/2,x=[o],E=(w,$,v,M,A,k)=>{const _=A.x-k,C=A.x+A.width+k,L=A.y-k,O=A.y+A.height+k;let T=0,P=1;const j=v-w,V=M-$;for(const[z,it]of[[-j,w-_],[j,C-w],[-V,$-L],[V,O-$]]){if(Math.abs(z)<1e-9){if(it<0)return!1;continue}const st=it/z;if(z<0?T=Math.max(T,st):P=Math.min(P,st),T>P)return!1}return!0},b=(w,$)=>{const M=[];for(let C=0;C<720;C++){const L=p+C/720*Math.PI*2,O=Math.cos(L)*w,T=Math.sin(L)*w,P=O-a/2,j=T-r/2;x.some(z=>z!==o&&(E(0,0,O,T,z,12)||P<z.x+z.width+12&&z.x<P+a+12&&j<z.y+z.height+12&&z.y<j+r+12))||M.push(L)}if(M.length<$)return null;const A=2*Math.asin(Math.min(1,l/(2*w))),k=(C,L)=>{const O=Math.abs(C-L)%(Math.PI*2);return Math.min(O,Math.PI*2-O)},_=[];for(let C=0;C<$;C++){const L=p+(C+.5)/$*Math.PI*2;let O=null;for(const T of M)_.some(P=>k(T,P)<A-1e-6)||(O===null||k(T,L)<k(O,L))&&(O=T);if(O===null)return null;_.push(O)}return _};let y=0;u.forEach((w,$)=>{const v=w.nodes.length,M=Math.PI*2/v;w.r+=y;let A=w.nodes.map((k,_)=>p+M*_+($>0?M/2:0));if($>0)for(let k=0;k<4;k++){const _=b(w.r,v);if(_){A=_;break}const C=w.r*.15;w.r+=C,y+=C}w.nodes.forEach((k,_)=>{k.x=Math.cos(A[_])*w.r-k.width/2,k.y=Math.sin(A[_])*w.r-k.height/2,x.push(k)})});const S=Math.min(...n.map(w=>w.x)),m=Math.min(...n.map(w=>w.y));n.forEach(w=>{w.x-=S,w.y-=m})}function ti(n){const t=[];for(const e of n){const i=t[t.length-1];(!i||Math.abs(i[0]-e[0])>.01||Math.abs(i[1]-e[1])>.01)&&t.push(e)}return t.length>=2?t:[[0,0],[0,0]]}function fl(n,t,e,i=!1,o=[]){const s=new Map(n.map(h=>[h.id,h])),a=[],r=[],d=new Map,l=Ji(n,oe.margin),c=[...o],u=t.map((h,f)=>({edge:h,index:f})).sort((h,f)=>ei(s,h.edge)-ei(s,f.edge));for(const{edge:h,index:f}of u){const p=s.get(h.from),x=s.get(h.to);if(!p||!x)continue;const E=i?tl(n,p.id,x.id):null,b=E?{side1:Ut(p,x),side2:Ut(x,p),path:E}:p===x?null:Vr(n,p.id,x.id,r,oe,d,l);if(b){const C=b.path[0],L=b.path[b.path.length-1],O=ti(b.path.map(P=>[P.x-C.x,P.y-C.y]));let T;if(h.label){const P=e.fontSizes.edge;T=el(b.path,lt(h.label,P),Math.ceil(P*1.25),n,c)}a.push({index:f,route:{from:h.from,to:h.to,...h.label?{label:h.label}:{},side1:b.side1,side2:b.side2,p1:C,p2:L,points:O,...T?{labelAt:T}:{}}});continue}const y=Ut(p,x),S=Ut(x,p),m=Yn(p,y),w=Yn(x,S),$=w.x-m.x,v=w.y-m.y,A=y==="left"||y==="right"?[[0,0],[$/2,0],[$/2,v],[$,v]]:[[0,0],[0,v/2],[$,v/2],[$,v]],k=ti(A);let _;if(h.label){const C=e.fontSizes.edge,L=lt(h.label,C),O=Math.ceil(C*1.25),T=(m.x+w.x)/2,P=(m.y+w.y)/2;_=Math.abs($)>=Math.abs(v)?{x:T-L/2,y:P-O-8}:{x:T+10,y:P-O/2}}a.push({index:f,route:{from:h.from,to:h.to,...h.label?{label:h.label}:{},side1:y,side2:S,p1:m,p2:w,points:k,..._?{labelAt:_}:{}}})}return a.sort((h,f)=>h.index-f.index).map(h=>h.route)}function ei(n,t){const e=n.get(t.from),i=n.get(t.to);return!e||!i?1/0:Math.abs(e.x+e.width/2-(i.x+i.width/2))+Math.abs(e.y+e.height/2-(i.y+i.height/2))}function hl(n,t){const e=n.split(`
`),i=Math.max(1,...e.map(s=>lt(s,t))),o=Math.max(1,Math.ceil(e.length*t*1.25));return{minX:0,minY:0,maxX:i,maxY:o,width:i,height:o,cx:i/2,cy:o/2}}function ul(n){const t=le(n.preset),e=n.groups??[],i=Math.ceil(t.fontSizes.edge*1.25)+8,o=il(t),s=e.length?{...o,gapX:Math.max(o.gapX,2*rt+32),gapY:Math.max(o.gapY,2*rt+i+24),gridGapX:Math.max(o.gridGapX,2*rt+32),gridGapY:Math.max(o.gridGapY,2*rt+i+24)}:o,a=n.nodes.map((f,p)=>sl(f,t,p,s));switch(n.layout){case"tb":ll(a,n.edges,s);break;case"grid":cl(a,s);break;case"radial":dl(a,n.edges,s);break;case"lr":default:rl(a,n.edges,s);break}const r=[],d=pl(e,a,i,r),l=d.flatMap(f=>[{minX:f.labelAt.x-4,minY:f.labelAt.y-2,maxX:f.labelAt.x+lt(f.label,t.fontSizes.edge)+4,maxY:f.labelAt.y+i},{minX:f.x-3,minY:f.y-3,maxX:f.x+f.width+3,maxY:f.y+3},{minX:f.x-3,minY:f.y+f.height-3,maxX:f.x+f.width+3,maxY:f.y+f.height+3},{minX:f.x-3,minY:f.y-3,maxX:f.x+3,maxY:f.y+f.height+3},{minX:f.x+f.width-3,minY:f.y-3,maxX:f.x+f.width+3,maxY:f.y+f.height+3}]),c=fl(a,n.edges,t,n.layout==="radial",l),u=kt([...a,...d]);if(u&&(u.minX<0||u.minY<0)){const f=Math.max(0,-u.minX),p=Math.max(0,-u.minY);for(const x of a)x.x+=f,x.y+=p;for(const x of d)x.x+=f,x.y+=p,x.labelAt={x:x.labelAt.x+f,y:x.labelAt.y+p};for(const x of c)x.p1={x:x.p1.x+f,y:x.p1.y+p},x.p2={x:x.p2.x+f,y:x.p2.y+p},x.labelAt&&(x.labelAt={x:x.labelAt.x+f,y:x.labelAt.y+p})}const h=kt([...a,...d])??{minX:0,minY:0,maxX:0,maxY:0,width:0,height:0,cx:0,cy:0};return{nodes:a,routes:c,titleBox:n.title?hl(n.title,t.fontSizes.title):null,frames:d,contentBox:h,preset:t,warnings:r}}function pl(n,t,e,i){const o=[];for(const s of n){const a=t.filter(h=>h.group===s.id),r=kt(a);if(!r)continue;const d=r.minX-rt,l=r.minY-rt-e,c={id:s.id,label:s.label,x:d,y:l,width:r.width+2*rt,height:r.height+2*rt+e,labelAt:{x:d+12,y:l+6}},u=t.filter(h=>h.group!==s.id&&h.x<c.x+c.width&&h.x+h.width>c.x&&h.y<c.y+c.height&&h.y+h.height>c.y);u.length&&i.push(`分组「${s.label}」的框包住了非成员节点 ${u.map(h=>h.id).join(", ")}：成员跨了不相邻的层或位置，可用 rank/order 让它们挨在一起`);for(const h of o)c.x<h.x+h.width&&c.x+c.width>h.x&&c.y<h.y+h.height&&c.y+c.height>h.y&&i.push(`分组「${s.label}」与「${h.label}」的框重叠`);o.push(c)}return o}class tt extends Error{constructor(t,e){super(`plan:${t}${e?` (${e})`:""}`),this.reason=t,this.detail=e,this.name="PlanError"}}const W={maxNodes:40,maxEdges:80,maxLabel:200,maxNote:120,maxTitle:120,maxCaption:300,maxEdgeLabel:60,maxGroups:12,maxGroupLabel:60,maxRank:39},gl={lr:"lr",horizontal:"lr","left-right":"lr",tb:"tb",vertical:"tb","top-down":"tb",grid:"grid",matrix:"grid",radial:"radial",mindmap:"radial",circle:"radial"},ml={rounded:"rounded",round:"rounded",card:"rounded",rectangle:"rectangle",rect:"rectangle",square:"rectangle",box:"rectangle",ellipse:"ellipse",oval:"ellipse",circle:"ellipse",diamond:"diamond",decision:"diamond",rhombus:"diamond",text:"text",plain:"text"};function Ot(n){return typeof n=="object"&&n!==null&&!Array.isArray(n)}function H(n){return typeof n=="string"?n:typeof n=="number"&&Number.isFinite(n)?String(n):""}function ut(n,t){const e=n.trim().replace(/\r\n?/g,`
`);return e.length>t?`${e.slice(0,t-1)}…`:e}function yl(n){if(typeof n!="string")return null;const t=n.trim().toLowerCase();return gl[t]??null}function bl(n){return n===""?"rounded":ml[n.trim().toLowerCase()]??null}function ts(n){return n.trim().replace(/[^\w.-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,48)}function xl(n,t){const e=[],i=new Set;for(let o=0;o<n.length;o++){const s=n[o];let a="",r="",d="",l="",c,u;if(typeof s=="string")r=s;else if(Ot(s)){a=H(s.id),r=H(s.label??s.text??s.title),d=H(s.shape),l=H(s.group),c=s.rank??s.layer,u=s.order;const x=H(s.note??s.description);x&&(r=r?`${r}
${x}`:x)}else{t.push(`nodes[${o}] 不是字符串或对象，已忽略`);continue}if(r=ut(r,W.maxLabel+W.maxNote+1),!r.trim()){t.push(`nodes[${o}] 没有 label，已忽略`);continue}const h=bl(d);if(!h)throw new tt("bad-shape",`nodes[${o}].shape=${d}`);if(a=ts(a)||`n${o+1}`,i.has(a))throw new tt("duplicate-node-id",a);i.add(a);const f=wl(c,0,W.maxRank,`nodes[${o}].rank`,t),p=kl(u,`nodes[${o}].order`,t);e.push({id:a,label:r,shape:h,...l.trim()?{group:ut(l,40)}:{},...f!==void 0?{rank:f}:{},...p!==void 0?{order:p}:{}})}return e}function wl(n,t,e,i,o){if(n==null||n==="")return;const s=typeof n=="number"?n:Number(n);if(!Number.isInteger(s)||s<t||s>e){o.push(`${i}=${H(n)||typeof n} 不是 ${t}–${e} 的整数，已忽略`);return}return s}function kl(n,t,e){if(n==null||n==="")return;const i=typeof n=="number"?n:Number(n);if(!Number.isFinite(i)){e.push(`${t}=${H(n)||typeof n} 不是数字，已忽略`);return}return i}function Sl(n,t,e){if(n==null)return[];const i=[];if(Array.isArray(n))n.forEach((a,r)=>{typeof a=="string"?i.push([a,a]):Ot(a)?i.push([H(a.id??a.name),H(a.label??a.title??a.id??a.name)]):e.push(`groups[${r}] 不是字符串或对象，已忽略`)});else if(Ot(n))for(const[a,r]of Object.entries(n))i.push([a,H(r)||a]);else return e.push("groups 必须是对象或数组，已忽略"),[];const o=new Set(t.map(a=>a.group).filter(Boolean)),s=[];for(const[a,r]of i){const d=ut(a,40);if(d){if(!o.has(d)){e.push(`groups 里的「${d}」没有任何节点使用（node.group），已忽略`);continue}if(!s.some(l=>l.id===d)){if(s.length>=W.maxGroups){e.push(`groups 超过 ${W.maxGroups} 个，其余不画框`);break}s.push({id:d,label:ut(r||d,W.maxGroupLabel)})}}}return s}function ni(n,t){const e=n.trim();if(!e)return null;const i=t.find(a=>a.id===e||a.id===ts(e));if(i)return i.id;const o=e.toLowerCase(),s=t.filter(a=>a.label.toLowerCase()===o);return s.length===1?s[0].id:null}function vl(n,t,e){const i=[],o=new Set;for(let s=0;s<n.length;s++){const a=n[s];let r="",d="",l="";if(typeof a=="string"){const f=a.split(/\s*->\s*/);if(f.length!==2){e.push(`edges[${s}] 不是 "a->b" 形式，已忽略`);continue}[r,d]=f}else if(Array.isArray(a))r=H(a[0]),d=H(a[1]),l=H(a[2]);else if(Ot(a))r=H(a.from??a.source??a.start),d=H(a.to??a.target??a.end),l=H(a.label??a.text);else{e.push(`edges[${s}] 不是字符串/数组/对象，已忽略`);continue}const c=ni(r,t),u=ni(d,t);if(!c||!u){e.push(`edges[${s}] 端点不存在（${r||"?"} -> ${d||"?"}），已忽略`);continue}if(c===u){e.push(`edges[${s}] 是自环（${c}），已忽略`);continue}l=ut(l,W.maxEdgeLabel);const h=`${c}\0${u}\0${l}`;if(o.has(h)){e.push(`edges[${s}] 与前面的边重复，已忽略`);continue}o.add(h),i.push({from:c,to:u,...l?{label:l}:{}})}return i}function El(n,t={}){if(!Ot(n))throw new tt("bad-plan","计划必须是 JSON 对象");const e=[],i=n.nodes;if(!Array.isArray(i))throw new tt("bad-plan","缺少 nodes 数组");if(i.length>W.maxNodes)throw new tt("too-many-nodes",`${i.length} > ${W.maxNodes}，请拆成多张白板`);const o=xl(i,e);if(o.length===0)throw new tt("empty-plan","没有可用节点");const s=n.edges??[];if(!Array.isArray(s))throw new tt("bad-plan","edges 必须是数组");if(s.length>W.maxEdges)throw new tt("too-many-edges",`${s.length} > ${W.maxEdges}`);const a=vl(s,o,e),r=t.preset!==void 0&&t.preset!==""?t.preset:n.preset;let d="pencil";if(r!=null&&r!==""){const x=jr(r);if(!x)throw new tt("bad-preset",`${H(r)}（可选 ${qi().join("/")}）`);d=x}const l=t.layout!==void 0&&t.layout!==""?t.layout:n.layout;let c=a.length>0?"lr":"grid";if(l!=null&&l!==""){const x=yl(l);if(!x)throw new tt("bad-layout",`${H(l)}（可选 lr/tb/grid/radial）`);c=x}const u=t.title!==void 0&&t.title!==""?t.title:n.title,h=ut(H(u),W.maxTitle)||void 0,f=ut(H(n.caption),W.maxCaption)||void 0,p=Sl(n.groups,o,e);return(c==="grid"||c==="radial")&&o.some(x=>x.rank!==void 0)&&e.push(`rank 只对 lr/tb 生效，${c} 布局下已忽略`),{...h?{title:h}:{},...f?{caption:f}:{},preset:d,layout:c,nodes:o,edges:a,groups:p,warnings:e}}function _l(n){return(n??"ai").trim().replace(/[^\w.-]+/g,"_").replace(/^_+|_+$/g,"")||"ai"}function Wt(n,t,e,i,o,s,a,r){const d=t.split(`
`);return{type:"text",id:n,x:e,y:i,width:Math.max(1,...d.map(l=>lt(l,o))),height:Math.max(1,Math.ceil(d.length*o*1.25)),text:t,fontSize:o,fontFamily:s,strokeColor:a,textAlign:r}}function Al(n,t,e,i,o,s){const r={type:n.shape==="ellipse"?"ellipse":n.shape==="diamond"?"diamond":n.shape==="text"?"text":"rectangle",id:t,x:o+n.x,y:s+n.y,width:n.width,height:n.height,text:n.label,fontSize:i.fontSizes.node,fontFamily:i.fontFamily,strokeColor:i.ink,textAlign:n.shape==="text"?"left":"center"};return n.shape!=="text"&&(r.backgroundColor=n.fill,r.fillStyle=i.fillStyle,r.strokeWidth=i.strokeWidth,r.strokeStyle=i.strokeStyle,r.roughness=i.roughness,n.shape==="rectangle"?r.roundness=null:i.nodeRoundness&&(r.roundness=i.nodeRoundness)),n.group&&(r.groupIds=[`${e}-group-${n.group.replace(/[^\w.-]+/g,"_")}`]),r}function $l(n,t={}){const e=El(n,t),i=le(e.preset),o=ul(e),s=_l(t.idPrefix),a={x:t.origin?.x??0,y:t.origin?.y??0},r=a.x+40,d=a.y+(e.title?96:40),l=[],c=o.nodes.map(y=>{const S=`${s}-${y.id}`;return l.push(Al(y,S,s,i,r,d)),{...y,elementId:S}}),u=o.routes.map(y=>({...y,fromElementId:`${s}-${y.from}`,toElementId:`${s}-${y.to}`,p1:{x:r+y.p1.x,y:d+y.p1.y},p2:{x:r+y.p2.x,y:d+y.p2.y},...y.labelAt?{labelAt:{x:r+y.labelAt.x,y:d+y.labelAt.y}}:{}})),h=e.title?[Wt(`${s}-title`,e.title,a.x+40,a.y+24,i.fontSizes.title,i.fontFamily,i.ink,"left")]:[],f=[];for(const y of o.frames){const S=`${s}-frame-${y.id.replace(/[^\w.-]+/g,"_")}`;f.push({type:"rectangle",id:S,x:r+y.x,y:d+y.y,width:y.width,height:y.height,strokeColor:i.muted,backgroundColor:"transparent",fillStyle:"solid",strokeWidth:1,strokeStyle:"dashed",roughness:i.roughness,roundness:{type:3},groupIds:[`${s}-group-${y.id.replace(/[^\w.-]+/g,"_")}`]}),f.push(Wt(`${S}-label`,y.label,r+y.labelAt.x,d+y.labelAt.y,i.fontSizes.edge,i.fontFamily,i.muted,"left")),f[f.length-1].groupIds=[`${s}-group-${y.id.replace(/[^\w.-]+/g,"_")}`]}const p=[];u.forEach((y,S)=>{!y.label||!y.labelAt||p.push(Wt(`${s}-edge-${S+1}`,y.label,y.labelAt.x,y.labelAt.y,i.fontSizes.edge,i.fontFamily,i.muted,"center"))});const x=e.caption?[Wt(`${s}-caption`,e.caption,r,d+o.contentBox.maxY+44,i.fontSizes.caption,i.fontFamily,i.muted,"left")]:[],E=[...h,...f,...l,...p,...x];e.warnings.push(...o.warnings);const b=kt(E.map(y=>({x:y.x,y:y.y,width:y.width??0,height:y.height??0})))??{minX:0,minY:0,maxX:0,maxY:0,width:0,height:0,cx:0,cy:0};return{plan:e,preset:i,specs:E,nodes:c,routes:u,bbox:b,background:i.background,idPrefix:s}}const ze="assets/excali-styles",Ml=/^[a-z0-9][a-z0-9._-]{0,31}$/,Il=/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,Cl=["solid","hachure","cross-hatch"],Rl=["solid","dashed","dotted"],es=["minW","minH","padX","padY","gapX","gapY","gridGapX","gridGapY","radialMinRadius","radialGap","maxGridCols","textWrap"],Tl=new Set(es),Ll=4e3,Ol=8,Pl=96,Dl=20,Bl=[0,1,2],Nl=20,ii=32,si=64,Fl=40;class ns extends Error{constructor(t,e,i){super(`style:${t} (${i}) ${e}`),this.reason=t,this.source=i,this.name="StylePackError"}}function vt(n){return typeof n=="object"&&n!==null&&!Array.isArray(n)}function is(n){return(n.replace(/\\/g,"/").split("/").pop()??"").replace(/\.json$/i,"")}function F(n,t,e){throw new ns(n,t,e)}function qe(n,t,e){return(typeof n!="string"||!Il.test(n.trim()))&&F("bad-field",`${t} 需要 #rgb/#rrggbb 形式的颜色`,e),n.trim()}function Rt(n,t,e,i,o){const s=typeof n=="number"?n:Number(n);return(!Number.isFinite(s)||!Number.isInteger(s)||s<e||s>i)&&F("bad-field",`${t} 需要 ${e}..${i} 的整数（收到 ${String(n)}）`,o),s}function Xe(n,t,e,i){return(typeof n!="string"||!e.includes(n))&&F("bad-field",`${t} 只能是 ${e.join("/")}（收到 ${String(n)}）`,i),n}function jl(n,t){vt(n)||F("bad-field","fontSizes 需要对象 {title,node,edge,caption}",t);const e={};for(const o of["title","node","edge","caption"]){const s=n[o];s!==void 0&&(e[o]=Rt(s,`fontSizes.${o}`,Ol,Pl,t))}const i=Object.keys(n).filter(o=>!["title","node","edge","caption"].includes(o));return i.length&&F("bad-field",`fontSizes 有未知字段 ${i.join(",")}`,t),Object.keys(e).length===0&&F("bad-field","fontSizes 是空对象",t),e}function Hl(n,t){return(!Array.isArray(n)||n.length===0)&&F("bad-field","palette 需要非空数组",t),n.length>ii&&F("bad-field",`palette 最多 ${ii} 色`,t),n.map((e,i)=>qe(e,`palette[${i}]`,t))}function zl(n,t){vt(n)||F("bad-field","space 需要对象（gapX/gapY/padX/padY…）",t);const e={};for(const o of es){const s=n[o];s!==void 0&&(e[o]=Rt(s,`space.${o}`,0,Ll,t))}const i=Object.keys(n).filter(o=>!Tl.has(o));return i.length&&F("bad-field",`space 有未知字段 ${i.join(",")}`,t),Object.keys(e).length===0&&F("bad-field","space 是空对象",t),e}function Xl(n,t){vt(n)||F("bad-field","groupColor 需要对象 {mode,roles}",t);const e=Xe(n.mode,"groupColor.mode",["hash","roles"],t);if(e!=="roles")return{mode:e};const i=n.roles;vt(i)||F("bad-field","groupColor.roles 需要 {分组名:颜色}",t);const o=Object.entries(i);o.length===0&&F("bad-field","groupColor.roles 是空对象",t),o.length>si&&F("bad-field",`groupColor.roles 最多 ${si} 组`,t);const s={};for(const[a,r]of o){const d=a.trim().slice(0,Fl);d||F("bad-field","groupColor.roles 有空的分组名",t),s[d]=qe(r,`groupColor.roles.${d}`,t)}return{mode:e,roles:s}}function Ul(n,t){return n===null?null:typeof n=="number"?{type:n}:vt(n)&&typeof n.type=="number"?{type:n.type}:F("bad-field","nodeRoundness 需要 null / {type:number}",t)}function Yl(n,t="inline",e=new Set){let i;try{i=JSON.parse(n)}catch(c){return F("bad-json",`不是合法 JSON：${c instanceof Error?c.message:String(c)}`,t)}if(!vt(i))return F("bad-pack","风格包必须是 JSON 对象",t);const o=typeof i.name=="string"&&i.name.trim()?i.name:is(t),s=St(o);Ml.test(s)||F("bad-name",`${o} → ${s||"(空)"}（要求小写字母/数字/._-，首字符字母数字，≤32）`,t);const a=i.extends===void 0||i.extends===null||i.extends===""?"pencil":St(String(i.extends));!Hr(a)&&!e.has(a)&&F("bad-extends",`${a} 不存在（内置之外可用 ${[...e].join("/")||"无"}）`,t),a===s&&F("bad-extends","不能 extends 自己",t);const r={},d=["background","ink","fill","edge","muted"];for(const c of d)i[c]!==void 0&&(r[c]=qe(i[c],c,t));if(i.palette!==void 0&&(r.fillPalette=Hl(i.palette,t)),i.strokeWidth!==void 0&&(r.strokeWidth=Rt(i.strokeWidth,"strokeWidth",0,Dl,t)),i.roughness!==void 0){const c=Rt(i.roughness,"roughness",0,2,t);Bl.includes(c)||F("bad-field","roughness 只能是 0/1/2",t),r.roughness=c}i.fillStyle!==void 0&&(r.fillStyle=Xe(i.fillStyle,"fillStyle",Cl,t)),i.strokeStyle!==void 0&&(r.strokeStyle=Xe(i.strokeStyle,"strokeStyle",Rl,t)),i.fontFamily!==void 0&&(r.fontFamily=Rt(i.fontFamily,"fontFamily",1,Nl,t)),i.fontSizes!==void 0&&(r.fontSizes=jl(i.fontSizes,t)),i.nodeRoundness!==void 0&&(r.nodeRoundness=Ul(i.nodeRoundness,t)),i.space!==void 0&&(r.space=zl(i.space,t)),i.groupColor!==void 0&&(r.groupColor=Xl(i.groupColor,t));const l=typeof i.label=="string"&&i.label.trim()?i.label.trim().slice(0,40):s;return{name:s,extendsFrom:a,label:l,diff:r}}function Gl(n,t="inline",e){const i=Yl(n,t,e);return zr(i.name,{extendsFrom:i.extendsFrom,diff:{...i.diff,label:i.label}}),{name:i.name,extends:i.extendsFrom,label:i.label}}async function Wl(n,t=ze){Xr();const e=[];let i=[];try{i=(await n.list()).filter(a=>/\.json$/i.test(a)).sort()}catch(a){return e.push(`${t} 目录读不了，只用内置风格：${a instanceof Error?a.message:String(a)}`),{loaded:[],warnings:e}}const o=new Set(i.map(a=>St(is(a)))),s=[];for(const a of i){const r=`${t}/${a}`;let d;try{d=await n.read(a)}catch(l){e.push(`${r} 读不到，已跳过：${l instanceof Error?l.message:String(l)}`);continue}try{s.push(Gl(d,r,o))}catch(l){l instanceof ns?e.push(l.message):e.push(`${r} 加载失败：${l instanceof Error?l.message:String(l)}`)}}for(const a of s)try{le(a.name)}catch(r){e.push(`style:${a.name} 解析失败，绘图时不可用：${r instanceof Error?r.message:String(r)}`)}return{loaded:s,warnings:e}}function Zl(){const n=[];for(const t of qi())try{n.push({name:t,extends:Ur(t)??"-",label:le(t).label??t})}catch{}return n}const ql=12*1024*1024,Kl="1024x1024",Jl="gpt-image-1";function Vl(n,t){const e=t.toLowerCase();for(const[i,o]of Object.entries(n??{}))if(i.toLowerCase()===e)return Array.isArray(o)?String(o[0]??""):typeof o=="string"?o:String(o??"");return""}function Ql(n){const t=String(n??"").trim().replace(/\/+$/,"");if(!t)throw new Error("未配置图像 API 地址");if(!/^https?:\/\//i.test(t))throw new Error("图像 API 地址必须以 http:// 或 https:// 开头");return/\/images\/generations$/i.test(t)?t:`${t}/images/generations`}function tc(n,t,e={}){const i=String(t??"").trim();if(!i)throw new Error("prompt 不能为空");if(i.length>4e3)throw new Error("prompt 过长（上限 4000 字符）");const o=String(n.apiKey??"").trim();if(!o)throw new Error("未配置图像 API Key");const s=String(n.model??"").trim()||Jl,a=String(e.size??n.size??"").trim()||Kl;return{url:Ql(n.baseUrl),headers:{Authorization:`Bearer ${o}`,"Content-Type":"application/json"},payload:JSON.stringify({model:s,prompt:i,n:1,size:a}),size:a}}function de(n){const t=n.replace(/\s+/g,"").replace(/-/g,"+").replace(/_/g,"/"),e=t.length%4;return e===0?t:t+"=".repeat(4-e)}function ec(n){const t=/^data:([^;,]+);base64,([\s\S]+)$/i.exec(n.trim());return t?{mime:t[1]||"image/png",base64:de(t[2])}:null}function nc(n){if(!n||typeof n!="object")throw new Error("图像 API 返回的不是 JSON 对象");const t=n;if(t.error){const r=t.error,d=r&&typeof r=="object"&&typeof r.message=="string"?r.message:typeof r=="string"?r:"图像 API 返回错误";throw new Error(`图像 API：${d}`)}const e=Array.isArray(t.data)?t.data[0]:t.data,i=e&&typeof e=="object"?e:t,o=typeof i.revised_prompt=="string"?i.revised_prompt:typeof t.revised_prompt=="string"?t.revised_prompt:void 0,s=typeof i.b64_json=="string"?i.b64_json:typeof t.b64_json=="string"?t.b64_json:"";if(s){const r=ec(s);return{kind:"inline",base64:r?r.base64:de(s),...o?{revisedPrompt:o}:{}}}const a=typeof i.url=="string"?i.url:typeof t.url=="string"?t.url:"";if(a)return{kind:"url",url:a,...o?{revisedPrompt:o}:{}};throw new Error("图像 API 没有返回图片（b64_json / url 都为空）")}function ss(n){const t=atob(de(n)),e=new Uint8Array(t.length);for(let i=0;i<t.length;i++)e[i]=t.charCodeAt(i)&255;return e}function Re(n,t){return n[t]<<8|n[t+1]}function oi(n,t){return(n[t]<<24|n[t+1]<<16|n[t+2]<<8|n[t+3])>>>0}function Zt(n,t){return n[t]|n[t+1]<<8}function ai(n,t){return n[t]|n[t+1]<<8|n[t+2]<<16}function ri(n,t){return(n[t]|n[t+1]<<8|n[t+2]<<16|n[t+3]<<24)>>>0}function li(n){let t;try{t=ss(n.slice(0,64))}catch{return"image/png"}return t.length>=8&&t[0]===137&&t[1]===80&&t[2]===78&&t[3]===71?"image/png":t.length>=3&&t[0]===255&&t[1]===216&&t[2]===255?"image/jpeg":t.length>=4&&t[0]===71&&t[1]===73&&t[2]===70?"image/gif":t.length>=12&&t[0]===82&&t[1]===73&&t[2]===70&&t[3]===70&&t[8]===87&&t[9]===69&&t[10]===66&&t[11]===80?"image/webp":t.length>=2&&t[0]===66&&t[1]===77?"image/bmp":"image/png"}function ic(n){let t;try{t=ss(n)}catch{return null}if(t.length>=24&&t[0]===137&&t[1]===80&&t[2]===78&&t[3]===71)return{width:oi(t,16),height:oi(t,20)};if(t.length>=10&&t[0]===71&&t[1]===73&&t[2]===70)return{width:Zt(t,6),height:Zt(t,8)};if(t.length>=26&&t[0]===66&&t[1]===77){const e=ri(t,22);return{width:ri(t,18),height:e>2147483647?4294967296-e:e}}if(t.length>=30&&t[0]===82&&t[1]===73&&t[2]===70&&t[3]===70&&t[8]===87&&t[9]===69&&t[10]===66&&t[11]===80){const e=String.fromCharCode(t[12],t[13],t[14],t[15]);if(e==="VP8X"&&t.length>=30)return{width:ai(t,24)+1,height:ai(t,27)+1};if(e==="VP8 "&&t.length>=30)return{width:Zt(t,26)&16383,height:Zt(t,28)&16383};if(e==="VP8L"&&t.length>=25){const i=t[21]|t[22]<<8|t[23]<<16|t[24]<<24;return{width:(i&16383)+1,height:(i>>>14&16383)+1}}return null}if(t.length>=4&&t[0]===255&&t[1]===216){let e=2;for(;e+3<t.length;){if(t[e]!==255){e+=1;continue}const i=t[e+1];if(i===216||i===217||i===1||i>=208&&i<=215){e+=2;continue}const o=Re(t,e+2);if(o<2)break;if((i>=192&&i<=195||i>=197&&i<=199||i>=201&&i<=203||i>=205&&i<=207)&&e+8<t.length)return{width:Re(t,e+7),height:Re(t,e+5)};e+=2+o}}return null}async function sc(n,t,e,i={}){const o=tc(n,t,i),s=await e({url:o.url,method:"POST",headers:o.headers,payload:o.payload,contentType:"application/json",timeout:18e4});if(s.code!==0)throw new Error(`思源转发失败：${s.msg||`code ${s.code}`}`);if(s.status<200||s.status>=300)throw new Error(`图像 API HTTP ${s.status}：${String(s.body??"").slice(0,300)}`);let a;try{a=JSON.parse(s.body)}catch{throw new Error("图像 API 返回的不是 JSON")}const r=nc(a);let d,l;if(r.kind==="inline")d=r.base64,l=li(d);else{if(!/^https?:\/\//i.test(r.url))throw new Error("图像 API 返回的图片 URL 不是 http(s)");const h=await e({url:r.url,method:"GET",headers:{},payload:"",contentType:"application/octet-stream",timeout:12e4,responseEncoding:"base64"});if(h.code!==0)throw new Error(`图片下载失败：${h.msg||`code ${h.code}`}`);if(h.status<200||h.status>=300)throw new Error(`图片下载 HTTP ${h.status}`);if(d=de(h.body||""),!d)throw new Error("图片下载返回空内容");const f=Vl(h.headers,"content-type").split(";")[0].trim().toLowerCase();l=/^image\//.test(f)?f:li(d)}const c=Math.floor(d.length*3/4);if(c>ql)throw new Error(`生成的图片过大（约 ${(c/1024/1024).toFixed(1)} MiB，上限 12 MiB）`);const u=ic(d);return{dataURL:`data:${l};base64,${d}`,mime:l,base64:d,width:u?.width&&u.width>0?u.width:1024,height:u?.height&&u.height>0?u.height:1024,...r.revisedPrompt?{revisedPrompt:r.revisedPrompt}:{}}}function oc(){return async n=>{const t={url:n.url,method:n.method||"POST",timeout:n.timeout??12e4,contentType:n.contentType||"application/json",headers:Object.entries(n.headers??{}).map(([a,r])=>({[a]:r})),payload:n.payload??""};n.responseEncoding&&(t.responseEncoding=n.responseEncoding);const e=await fetch("/api/network/forwardProxy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),i=await e.json().catch(()=>null);if(!i||typeof i!="object")throw new Error(`forwardProxy 返回异常（HTTP ${e.status}）`);const o=i.data&&typeof i.data=="object"?i.data:{},s=o.body;return{code:typeof i.code=="number"?i.code:-1,msg:typeof i.msg=="string"?i.msg:"",status:typeof o.status=="number"?o.status:0,headers:o.headers&&typeof o.headers=="object"?o.headers:{},body:typeof s=="string"?s:s!=null?JSON.stringify(s):""}}}const ci="excali-studio",ac=8,rc=5,lc={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function q(n){return n.replace(/[&<>"']/g,t=>lc[t])}function dt(n){return q(n)}class cc extends I.Plugin{constructor(){super(...arguments),this.tabs=new Map,this.settings={...U},this.recent=[],this.boardActions=new Map,this.activeCustom=null,this.dockRefresh=null,this.onloadRan=new Set,this.boardFiles=[],this.dirMigrated=!1,this.legacyBoards=[],this.ready=Promise.resolve(),this.libLoading=!1,this.embedClickHandler=null,this.boardObservers=new Map,this.boardRescanTimer=null,this.lazyEngine=null,this.scriptPickerDialog=null,this.inputPromptChain=Promise.resolve(),this.selectOptionChain=Promise.resolve(),this.libCache=null}lazyMod(){return this.lazyEngine??=this.loadEngineModule(),this.lazyEngine}async loadEngineModule(){const t=new URL(`plugins/${qt}/engine.js`,`${location.origin}/`).href,e=await fetch(t,{cache:"no-cache"});if(!e.ok)throw new Error(`HTTP ${e.status} ${t}`);const i=await e.text(),o={exports:{}};return await this.runEngineScript(i,this.makeEngineRequire(),o.exports),o.exports}makeEngineRequire(){const t=window.require,e=require;return i=>{if(i==="siyuan")return e("siyuan");if(typeof t=="function")return t(i);throw new Error(`Cannot find module '${i}'`)}}runEngineScript(t,e,i){return new Promise((o,s)=>{const a=`window.__exsEngineFactory=(function(require,module,exports){
${t}
});
//# sourceURL=plugins/${qt}/engine.js`,r=()=>{try{const u=window,h=u.__exsEngineFactory;if(delete u.__exsEngineFactory,typeof h!="function")throw new Error("引擎未导出工厂函数");h(e,{exports:i},i),o()}catch(u){s(u instanceof Error?u:new Error(String(u)))}},d=()=>{try{const u=document.createElement("script");u.type="text/javascript",u.textContent=a,document.head.appendChild(u),r()}catch(u){s(u instanceof Error?u:new Error(String(u)))}};let l=null;try{const u=new Blob([a],{type:"text/javascript"});l=URL.createObjectURL(u)}catch{d();return}const c=document.createElement("script");c.type="text/javascript",c.src=l,c.onload=()=>{l&&URL.revokeObjectURL(l),r()},c.onerror=()=>{l&&URL.revokeObjectURL(l),d()},document.head.appendChild(c)})}async onload(){os(this.i18n),this.ready=this.bootstrapState(),this.addIcons(ds),this.registerStudioTab(),this.registerDock(),this.addTopBar({id:"excali-studio-open",icon:ft,title:g("打开白板"),callback:()=>void this.openNew(),contextMenu:t=>this.buildTopMenu(t)}),this.protyleSlash.push({id:"excaliStudio",filter:["白板","画板","excali","excalidraw","whiteboard","bb","hb"],html:Ke(g("白板")),callback:t=>{this.clearSlashHint(t),this.openNew()}}),this.protyleSlash.push({id:"excaliStudioInsertBoard",filter:["插入白板","白板卡","insert board"],html:Ke(g("插入白板…")),callback:t=>{try{this.clearSlashHint(t),this.pickBoardRef(g("插入白板…")).then(e=>{if(!e)return;const i=`![](${e})`,o=ja(t)?.Md2BlockDOM?.(i);if(!o){I.showMessage(g("插入失败：Lute 不可用"),7e3,"error");return}t.insert(o,!0,!0);const s=t.protyle?.wysiwyg?.element;s instanceof Element&&s.isConnected&&(this.observeBoardDom(s),this.decorateProtyle(s)),I.showMessage(g("已插入白板：{name}",{name:B(e)}),3e3)}).catch(e=>I.showMessage(g("插入失败：{msg}",{msg:e instanceof Error?e.message:String(e)}),7e3,"error"))}catch(e){I.showMessage(g("插入失败：{msg}",{msg:e instanceof Error?e.message:String(e)}),7e3,"error")}}}),this.addCommand({langKey:"openExcaliStudio",langText:g("打开白板"),hotkey:"⌘⌥E",customHotkey:"",callback:()=>void this.openNew()}),rs(),Ba(this),this.registerBlockIconMenu(),this.registerEmbedClick(),this.setupSetting(),await this.ready,this.registerAgentCapabilities(),this.registerBoardDecorations(),this.refreshBoardLib(),ur().then(async t=>{t>0&&I.showMessage(g("已安装 {n} 个内置脚本到 {dir}",{n:t,dir:Z}),5e3);try{const e=await gr(this.settings.builtinSnapshot),i=this.settings.builtinSnapshot;Object.keys(i).length===Object.keys(e.snapshot).length&&Object.keys(e.snapshot).every(a=>i[a]===e.snapshot[a])||(this.settings.builtinSnapshot=e.snapshot,this.persist()),e.updated.length>0&&I.showMessage(g("内置脚本已更新到最新版（{n} 个），你自建的脚本不受影响",{n:e.updated.length}),5e3)}catch(e){console.warn("[excali-studio] 内置脚本同步失败",e)}}).catch(t=>console.warn("[excali-studio] 内置脚本安装失败",t)),this.maybeShowChangelog()}onunload(){const t=[...this.tabs.values()];t.forEach(e=>e.tab.close()),this.tabs.clear(),this.embedClickHandler&&(document.removeEventListener("click",this.embedClickHandler,!0),this.embedClickHandler=null);for(const e of this.boardObservers.values())e.disconnect();this.boardObservers.clear(),this.boardRescanTimer!==null&&(clearTimeout(this.boardRescanTimer),this.boardRescanTimer=null),t.length>0&&I.showMessage(g("插件已卸载，画板未保存的改动会丢失"),3e3)}async maybeShowChangelog(){try{const t=Qa(await this.loadData(Hn),zt);if(t==="unknown-version"||t==="up-to-date"||(await this.saveData(Hn,zt),t!=="show"))return;const e=or(await nr(tr(this.name)),zt,{title:g("版本更新"),subtitle:g("每一次更新优化了什么、解决了什么问题，都记在这里。"),history:g("历史版本"),latest:g("最新"),current:g("当前已是最新版本"),archived:g("历史版本记录"),ok:g("知道了"),close:g("关闭")});if(!e)return;const i=new I.Dialog({title:`${g("更新日志")} v${zt}`,width:"min(860px, calc(100vw - 56px))",height:"min(68vh, 620px)",hideCloseIcon:!0,content:e});i.element.classList.add("exs-changelog-dialog"),ar(i.element,()=>i.destroy())}catch(t){console.warn("[excali-studio] 更新日志读取失败",t)}}registerEmbedClick(){this.embedClickHandler=t=>{const e=t.target;if(!e||e.tagName!=="IMG")return;const i=e.getAttribute("src")||"";let o=i;try{o=new URL(i,location.origin).pathname}catch{}const s=/^\/(assets\/.+\.svg)$/i.exec(o);if(!s)return;const a=s[1];this.boardFiles.some(d=>Y(d.dataPath)===a)&&(t.preventDefault(),t.stopPropagation(),this.openStudioTab(R(a)))},document.addEventListener("click",this.embedClickHandler,!0)}async bootstrapState(){try{await this.loadState()}catch(t){console.error("[excali-studio] 读取设置失败，用默认值继续",t)}try{await this.migrateLegacyBoards()}catch(t){console.error("[excali-studio] 旧白板迁移失败（下次启动重试）",t)}}async migrateLegacyBoards(){if(this.dirMigrated)return;const t=Ni(this.settings.saveDir);if(t!==Mt&&t!==bt){this.dirMigrated=!0,this.persist();return}let e=[];try{e=(await At(Mt)).map(a=>a.path).filter(a=>Ea(B(a)))}catch(a){console.warn("[excali-studio] 迁移：读取旧保存目录失败（按近期/命名继续）",a)}const i=$a({recent:this.recent,registry:this.legacyBoards,autoNamed:e}),o=new Map,s=[];for(const a of i)try{const r=await Bn(a,await _e(bt,B(a)));o.set(a,R(r))}catch(r){console.warn("[excali-studio] 迁移白板失败",a,r),s.push(a)}if(t===Mt&&await this.migrateLibraryFile(),o.size>0){this.recent=Ma(this.recent,o);for(const a of this.tabs.values()){const r=o.get(R(a.data.dataPath??""));r&&(a.data.dataPath=r,a.tab.updateTitle(B(r)))}}this.settings={...this.settings,saveDir:bt},this.dirMigrated=s.length===0,this.persist(),s.length>0?I.showMessage(g("白板迁移未完成：{fail} 块失败，下次启动会重试",{fail:s.length}),1e4,"error"):o.size>0&&I.showMessage(g("已把 {n} 块白板迁入 {dir}",{n:o.size,dir:bt}),6e3)}async migrateLibraryFile(){const t=R(at(Mt,"excali-library.json")),e=R(at(bt,"excali-library.json"));try{await ot(t)&&!await ot(e)&&(await wt(e,await K(t)),await xt(t))}catch(i){console.warn("[excali-studio] 迁移图库文件失败（忽略）",i)}}async remapBoardPath(t){const e=R(t),i=R(at(this.settings.saveDir,B(e)));return i===e?null:await ot(i)?i:null}studioHost(){const t=this;return{load:e=>this.loadScene(e),remapPath:e=>this.remapBoardPath(e),restoreFromBackup:e=>this.restoreFromBackup(e),get accent(){return t.settings.accentStroke?ua():null},onSave:(e,i)=>this.saveSvg(e,i),saveMedia:(e,i)=>this.saveBoardMedia(e,i),openDocLink:e=>this.openBoardDocLink(e),promptFileName:(e,i)=>this.promptFileName(e,i),fetchBlockMetas:e=>Ha(e),searchDocs:e=>Xa(e),onRename:(e,i)=>this.renameBoard(e,i),loadLibraryItems:()=>this.loadLibraryItems(),saveLibraryItems:e=>this.saveLibraryItems(e),get showWelcome(){return t.settings.showWelcome},get gridModeEnabled(){return t.settings.gridModeEnabled},onGridChange:e=>this.rememberGrid(e),onOpenExisting:()=>this.promptOpenPath(),onNewBoard:()=>void this.openNew(),onBoardActions:(e,i)=>{i?(this.boardActions.set(e,i),this.onloadRan.has(e)||(this.onloadRan.add(e),this.runOnloadScripts(e))):(this.boardActions.delete(e),this.onloadRan.delete(e)),!i&&this.activeCustom===e&&(this.activeCustom=null),this.dockRefresh?.()},onBoardActive:e=>{this.activeCustom=e},copyBoardRef:e=>t.copyBoardRefFor(e),onRunScript:()=>void this.openScriptPicker(),listPinnedScripts:()=>this.listPinnedScripts(),onRunScriptFile:(e,i)=>void this.runScriptFile(e,i),onPinScript:(e,i)=>this.rememberScriptPin(e,i),listPinnedActions:()=>this.settings.pinnedActions,onPinAction:(e,i)=>this.rememberActionPin(e,i),getAiChannels:()=>this.settings.aiChannels,onAiChannel:(e,i)=>this.setAiChannel(e,i),getPresentationSettings:()=>this.settings.presentation,onPresentationSetting:(e,i)=>this.rememberPresentationSetting(e,i),get scriptRailCollapsed(){return t.settings.scriptRailCollapsed},get scriptRailTop(){return t.settings.scriptRailTop},onScriptRailCollapsedChange:e=>this.rememberScriptRail("scriptRailCollapsed",e),onScriptRailTopChange:e=>this.rememberScriptRail("scriptRailTop",e),get highlighter(){return t.settings.highlighter},onHighlighterChange:e=>this.rememberHighlighter(e),onHelp:()=>this.openHelp(),getLibraryImportUrl:()=>t.libraryImportUrl(),get libDirAbs(){return ls(cs(),t.libDirRel())},get boardDir(){return t.settings.saveDir},pickBoardPath:()=>this.pickBoardRef()}}registerStudioTab(){const t=this,e=this.studioHost();this.addTab({type:Dn,init:i=>{const o=i.element;o.classList.add("exs-panel"),o.innerHTML=`<div class="exs-loading">${g("正在打开白板…")}</div>`,this.lazyMod().then(s=>{o.innerHTML="",this.tabs.set(i,s.attachStudioTab(i,e))}).catch(s=>{console.error("[excali-studio] 画板引擎加载失败",s),o.innerHTML=`<div class="exs-loaderror"><div>${g("画板引擎加载失败：{msg}",{msg:s instanceof Error?s.message:String(s)})}</div></div>`})},destroy:function(){t.tabs.get(this)?.dispose(),t.tabs.delete(this),t.boardActions.delete(this),t.activeCustom===this&&(t.activeCustom=null),t.dockRefresh?.()}})}eaHost(){const t=this;return{getDocMarkdown:async()=>{const e=Na()?.block?.rootID;if(!e)return"";const s=(await(await fetch("/api/block/getBlockKramdown",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e})})).json().catch(()=>null))?.data;return typeof s=="string"?s:s&&typeof s=="object"&&typeof s.kramdown=="string"?s.kramdown:""},getSelectedText:()=>{const e=window.getSelection();return e?String(e.toString()??""):""},listFiles:async e=>{try{return await Ae(e||t.settings.saveDir)}catch{return[]}},readFileAsDataURL:async e=>{const i=await fetch("/api/file/getFile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:R(e)})});if(!i.ok)throw new Error(`getFile HTTP ${i.status}`);const o=await i.blob();return new Promise((s,a)=>{const r=new FileReader;r.onload=()=>s(String(r.result||"")),r.onerror=()=>a(r.error||new Error("读取失败")),r.readAsDataURL(o)})},save:()=>void t.activeActions()?.flush(),notify:e=>I.showMessage(e),getSettings:()=>({saveDir:t.settings.saveDir}),getScriptSetting:(e,i)=>{const o=($t[e]??[]).find(a=>a.key===i);if(!o)return;const s=t.settings.scriptSettings?.[e]?.[i];return s===void 0||typeof s!=typeof o.default||o.type==="number"&&typeof s=="number"&&(!Number.isFinite(s)||o.min!==void 0&&s<o.min||o.max!==void 0&&s>o.max)||o.type==="select"&&typeof s=="string"&&o.options&&!o.options.some(a=>a.value===s)?o.default:s},setScriptSetting:(e,i,o)=>{if(!($t[e]??[]).find(r=>r.key===i))return;const a=t.settings.scriptSettings??{};t.settings={...t.settings,scriptSettings:{...a,[e]:{...a[e]??{},[i]:o}}},t.persist()},getHighlighter:()=>te(t.settings.highlighter),siyuanCall:async(e,i)=>{if(!/^(block\/(getBlockKramdown|getBlockDOM|getBlockInfo|getBlockAttrs|getBlockBreadcrumb|getChildBlocks)|export\/exportMdContent|filetree\/(getDoc|getHPathByID|getHPathByPath)|query\/sql|file\/getFile)$/.test(e))throw new Error(`只读白名单外的接口不可调用：${e}`);const s=await fetch(`/api/${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i??{})}),a=await s.json().catch(()=>null);if(!s.ok||!a||a.code!==0)throw new Error(`内核 API 失败：${e} ${a?.msg||`HTTP ${s.status}`}`);return a.data},inputPrompt:(e,i,o)=>{const s=()=>new Promise(r=>{let d=!1;const l=f=>{d||(d=!0,c.destroy(),r(f))},c=new I.Dialog({title:e,width:"340px",content:`<div class="exs-picker">
  <input class="b3-text-field fn__block exs-name-input" type="${i==="number"?"number":i==="password"?"password":"text"}" value="${dt(o)}" />
  <div class="exs-name-actions">
    <button class="b3-button exs-name-cancel" type="button">${g("取消")}</button>
    <button class="b3-button exs-name-ok" type="button">${g("确定")}</button>
  </div>
</div>`,destroyCallback:()=>l(null)});c.element.classList.add("exs-name-dialog");const u=c.element.querySelector(".exs-name-input");c.element.querySelector(".exs-name-cancel").addEventListener("click",()=>l(null));const h=()=>l(u.value);c.element.querySelector(".exs-name-ok").addEventListener("click",h),u.addEventListener("keydown",f=>{f.key==="Enter"?(f.preventDefault(),h()):f.key==="Escape"&&(f.preventDefault(),l(null)),f.stopPropagation()}),setTimeout(()=>{u.focus(),u.select()},50)}),a=this.inputPromptChain.then(s,s);return this.inputPromptChain=a.catch(()=>null),a},selectOption:e=>{const i=()=>new Promise(s=>{if(e.options.length===0){s(null);return}let a=!1;const r=new I.Menu("excali-select-option",()=>{a||s(null)});for(const l of e.options)r.addItem({label:l.hint?`${l.label}（${l.hint}）`:l.label,current:l.value===e.current,click:()=>{a=!0,s(l.value)}});const d=e.at??{x:window.innerWidth/2,y:window.innerHeight/3};r.open({x:d.x,y:d.y})}),o=this.selectOptionChain.then(i,i);return this.selectOptionChain=o.catch(()=>null),o}}}async agentRun(t){if(!this.settings.aiChannels.agent)return{error:g("通道已关闭：内置智能体")};try{return await t()}catch(e){return console.warn("[excali-studio] 智能体能力失败",e),{error:e instanceof Error?e.message:String(e)}}}agentBoardDir(){return Y(R(this.settings.saveDir)).replace(/\/+$/,"")}async resolveAgentBoard(t){const e=typeof t.board=="string"?t.board.trim():"",i=typeof t.path=="string"&&t.path.trim()?t.path.trim():/\.svg$/i.test(e)?e:"",o=typeof t.title=="string"&&t.title.trim()?t.title.trim():/\.svg$/i.test(e)?"":e;await this.ready;const s=this.agentBoardDir();if(i){const u=Y(R(i));return!/\.svg$/i.test(u)||s!==""&&!u.startsWith(`${s}/`)||!await ot(u)?null:{path:R(u),title:B(u).replace(/\.svg$/i,"")}}if(!o)return null;const a=await At(this.settings.saveDir),r=o.replace(/\.svg$/i,"").toLowerCase(),d=a.filter(u=>B(u.path).replace(/\.svg$/i,"").toLowerCase()===r);if(d.length===0)return null;const c=d.find(u=>B(u.path).replace(/\.svg$/i,"")===o.replace(/\.svg$/i,""))??d[0];return{path:R(c.path),title:B(c.path).replace(/\.svg$/i,"")}}async waitForAgentActions(t,e=2e4){const i=R(t),o=Date.now()+e;for(;Date.now()<o;){for(const[s,a]of this.tabs){if(a.data.dataPath!==i)continue;const r=this.boardActions.get(s);if(r?.getEaHandle())return r}await new Promise(s=>setTimeout(s,120))}return null}agentDrawOrigin(t){const e=t.getElements().filter(o=>!o.isDeleted);if(e.length===0)return{x:0,y:0};const i=kt(e);return i?{x:i.minX,y:i.maxY+80}:{x:0,y:0}}loadAgentStyles(){return Wl({list:async()=>(await Ae(ze,/\.json$/i)).map(t=>t.slice(t.lastIndexOf("/")+1)),read:t=>K(`${ze}/${t}`)})}async agentListBoards(t){await this.ready;const e=typeof t.query=="string"?t.query.trim().toLowerCase():"",i=Number(t.limit),o=Number.isFinite(i)?Math.max(1,Math.min(100,Math.floor(i))):50,s=await At(this.settings.saveDir),a=e?s.filter(c=>c.path.toLowerCase().includes(e)||B(c.path).toLowerCase().includes(e)):s,r=a.slice(0,o).map(c=>({title:B(c.path).replace(/\.svg$/i,""),path:c.path,updated:c.updated,updatedAt:c.updated?new Date(c.updated).toISOString():""})),d=await this.loadAgentStyles(),l=Zl();return{result:`白板库 ${this.agentBoardDir()}：${a.length} 块${e?`（匹配「${e}」）`:""}。可用风格：${l.map(c=>c.name).join("/")}。`,structuredContent:{dir:this.agentBoardDir(),total:a.length,boards:r,styles:l,styleWarnings:d.warnings}}}async agentOpenBoard(t){const e=await this.resolveAgentBoard(t);if(!e)return{error:`找不到白板：${String(t.board??t.path??"")}（只认 ${this.agentBoardDir()} 下的 .svg）`};await this.openStudioTab(e.path);const i=await this.waitForAgentActions(e.path,15e3);return{result:`已打开「${e.title}」${i?"":"（画布引擎仍在加载）"}。`,structuredContent:{ok:!0,path:Y(e.path),title:e.title,ready:!!i}}}async agentDrawBoard(t){await this.ready;let e=t.plan;if(typeof e=="string")try{e=JSON.parse(e)}catch{return{error:"plan 是字符串但不是合法 JSON"}}if(!e||typeof e!="object"||Array.isArray(e))return{error:"缺少 plan 对象（nodes/edges/title/preset/layout）"};const i=t.append!==!1,o=[t.board,t.path].some(b=>typeof b=="string"&&b.trim()!==""),s=i?await this.resolveAgentBoard(t):null;if(i&&o&&!s)return{error:`找不到白板：${String(t.board??t.path)}（不自动改新建，避免画错板）`};let a,r=!1;if(s)a=s;else{const b=e.title,y=typeof t.title=="string"&&t.title.trim()||typeof b=="string"&&b.trim()||g("AI 白板"),S=await this.createBoardFile(y);a={path:S.path,title:B(S.path).replace(/\.svg$/i,"")},r=!0}await this.openStudioTab(a.path);const d=await this.waitForAgentActions(a.path),l=d?.getEaHandle();if(!d||!l)return{error:`白板「${a.title}」已打开，但画布引擎未在 20 秒内就绪。请手动打开后重试。`};const c=r?{x:0,y:0}:this.agentDrawOrigin(l),u=await this.loadAgentStyles(),h=[t.style,t.preset].find(b=>typeof b=="string"&&b.trim()!==""),f=$l(e,{origin:c,idPrefix:He("ai"),preset:h,layout:t.layout});l.addElements(f.specs);let p=0;for(const b of f.routes){const y=l.connectObjects(b.fromElementId,b.side1,b.toElementId,b.side2,4);y&&(p+=1,l.patchElements([y],{x:b.p1.x,y:b.p1.y,points:b.points,strokeColor:f.preset.edge,strokeWidth:f.preset.strokeWidth,strokeStyle:f.preset.strokeStyle,roughness:f.preset.roughness}))}l.selectElements(f.nodes.map(b=>b.elementId)),l.scrollToContent();let x=!1;try{x=await d.flush()}catch{x=!1}const E={ok:!0,created:r,path:Y(a.path),title:a.title,nodes:f.nodes.length,edges:p,preset:f.plan.preset,layout:f.plan.layout,styleWarnings:u.warnings,saved:x,origin:c,warnings:f.plan.warnings};return{result:`${r?"已新建":"已绘制到"}「${a.title}」：${E.nodes} 个节点、${E.edges} 条连线（${E.path}）${x?"。":"；落盘失败，稍后自动保存会重试。"}`+(E.warnings.length?` 忽略 ${E.warnings.length} 条计划警告。`:""),structuredContent:E}}async agentGenerateImage(t){await this.ready;const e=typeof t.prompt=="string"?t.prompt.trim():"";if(!e)return{error:"prompt 不能为空"};const i=t.append!==!1,o=[t.board,t.path].some(y=>typeof y=="string"&&y.trim()!==""),s=i?await this.resolveAgentBoard(t):null;if(i&&o&&!s)return{error:`找不到白板：${String(t.board??t.path)}（不自动改新建，避免插错板）`};let a;try{a=await sc({baseUrl:this.settings.imageBaseUrl,model:this.settings.imageModel,apiKey:this.settings.imageApiKey,size:this.settings.imageSize},e,oc(),{size:typeof t.size=="string"&&t.size.trim()?t.size.trim():void 0})}catch(y){return{error:y instanceof Error?y.message:String(y)}}let r,d=!1;if(s)r=s;else{const y=typeof t.title=="string"&&t.title.trim()||g("AI 图片"),S=await this.createBoardFile(y);r={path:S.path,title:B(S.path).replace(/\.svg$/i,"")},d=!0}await this.openStudioTab(r.path);const l=await this.waitForAgentActions(r.path),c=l?.getEaHandle();if(!l||!c)return{error:`图片已生成，但白板「${r.title}」的画布未在 20 秒内就绪，未插入。请手动打开后重试（会重新生成一张图）。`};const u=d?{x:0,y:0}:this.agentDrawOrigin(c),h=this.agentImageDimension(t.width)??a.width,f=this.agentImageDimension(t.height)??a.height;let p="";try{p=await c.addImage(a.dataURL,{...u,width:h,height:f})}catch(y){return{error:`图片已生成，但插入画布失败：${y instanceof Error?y.message:String(y)}`}}c.selectElements([p]),c.scrollToElement(p);let x=!1;try{x=await l.flush()}catch{x=!1}const E=Math.floor(a.base64.length*3/4),b={ok:!0,created:d,path:Y(r.path),title:r.title,imageId:p,width:h,height:f,mime:a.mime,bytes:E,revisedPrompt:a.revisedPrompt??"",saved:x,origin:u};return{result:`${d?"已新建并插入":"已插入"}图片到「${r.title}」：${h}×${f}（${b.path}）${x?"。":"；落盘失败，稍后自动保存会重试。"}`+(a.revisedPrompt?` 模型改写：${a.revisedPrompt}`:""),structuredContent:b}}agentImageDimension(t){if(t==null||t==="")return;const e=Number(t);if(Number.isFinite(e))return Math.max(64,Math.min(4096,Math.round(e)))}registerAgentCapabilities(){if(typeof this.addAgentCapability=="function"&&this.settings.aiChannels.agent)try{this.addAgentCapability({name:"excali_list_boards",title:g("列出 Excali 白板"),description:g("列出白板库里的白板（标题、路径、更新时间），可按 query 过滤。只读。"),inputSchema:{type:"object",properties:{query:{type:"string",description:g("按标题/路径过滤（不区分大小写）")},limit:{type:"number",minimum:1,maximum:100,description:g("最多返回条数，默认 50")}}},effects:{localRead:!0},handler:t=>this.agentRun(()=>this.agentListBoards(t))}),this.addAgentCapability({name:"excali_open_board",title:g("打开 Excali 白板"),description:g("打开指定白板并等待画布就绪；board 传标题，path 传保存目录下的路径。"),inputSchema:{type:"object",properties:{board:{type:"string",description:g("白板标题（不含 .svg）")},path:{type:"string",description:g("白板路径，如 assets/excali/foo.svg")}}},effects:{localRead:!0},handler:t=>this.agentRun(()=>this.agentOpenBoard(t))}),this.addAgentCapability({name:"excali_draw_board",title:g("用 AI 计划绘制 Excali 白板"),description:g("把结构化计划（nodes/edges）画成白板：board 为空则新建，有值则追加到已有白板；自动布局、配色并保存。"),inputSchema:{type:"object",properties:{plan:{type:"object",description:g("绘图计划：{ title, caption, preset, layout, groups, nodes: [{id,label,shape,group,rank,order}], edges: [{from,to,label}] }"),properties:{title:{type:"string"},caption:{type:"string"},preset:{type:"string",description:g("pencil/marker/blueprint 或 data/assets/excali-styles 里的风格包名")},layout:{type:"string",enum:["lr","tb","grid","radial"]},groups:{type:["object","array"],description:g("要画框的分组：{ 组名: 框标题 }，组名对应 node.group；同组节点在层内挨着放，框包住非成员时会返回 warning")},nodes:{type:"array",description:g("节点：字符串，或 {id,label,shape,group,rank,order}。rank = lr/tb 里钉在第几层（0 起）；order = 层内先后，与位次比较（0 = 最前；grid 里是格子、radial 里是环上）。都可省略"),items:{type:["string","object"]}},edges:{type:"array",items:{type:["string","object","array"]}}},required:["nodes"]},board:{type:"string",description:g("追加到已有白板的标题或路径；省略则新建")},title:{type:"string",description:g("新建白板的文件名；省略用计划标题或「AI 白板」")},append:{type:"boolean",description:g("board 指向已有白板时是否追加，默认 true")},style:{type:"string",description:g("风格包名：内置预设，或 assets/excali-styles 目录里的 json 包；与 preset 同义，优先 style")},preset:{type:"string",description:g("覆盖计划内的风格")},layout:{type:"string",enum:["lr","tb","grid","radial"],description:g("覆盖计划内的布局")}},required:["plan"]},effects:{localRead:!0,localWrite:!0},handler:t=>this.agentRun(()=>this.agentDrawBoard(t))}),this.addAgentCapability({name:"excali_generate_image",title:g("生成图片并插入 Excali 白板"),description:g("调用设置里的 OpenAI 兼容图像 API 生成一张位图，插入已有白板或新建白板；图片不可编辑。需要先在插件设置里填 API 地址和 Key。"),inputSchema:{type:"object",properties:{prompt:{type:"string",description:g("画面描述（主体、风格、构图；上限 4000 字符）")},board:{type:"string",description:g("插入到已有白板的标题或路径；省略则新建")},title:{type:"string",description:g("新白板文件名；省略用「AI 图片」")},append:{type:"boolean",description:g("board 指向已有白板时是否插入到该板，默认 true")},width:{type:"number",minimum:64,maximum:4096,description:g("图像显示宽度；省略按原图尺寸")},height:{type:"number",minimum:64,maximum:4096,description:g("图像显示高度；省略按原图尺寸")},size:{type:"string",description:g("尺寸覆盖（如 1024x1024）；省略用设置里的值")}},required:["prompt"]},effects:{localRead:!0,localWrite:!0},handler:t=>this.agentRun(()=>this.agentGenerateImage(t))})}catch(t){console.warn("[excali-studio] 注册智能体能力失败（思源版本可能不支持）",t)}}openScriptPicker(){if(!this.settings.aiChannels.script){I.showMessage(g("脚本通道已在「AI 通道」面板里关闭"));return}this.scriptPickerDialog||(async()=>{const t=await Xt();if(t.length===0){I.showMessage(g("还没有脚本：首次启用会自动安装内置脚本到 {dir}",{dir:Z}),7e3);return}const e=new Set(this.settings.pinnedScripts),i=m=>Jo[m]??Ln,o=m=>`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${m}"/></svg>`,s="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8h.01M11 12h1v4h1",a="m6 9 6 6 6-6",r=m=>{const w=$t[m.name];return!w||w.length===0?"":`<div class="exs-script-settings" data-settings hidden>${w.map(v=>{const M=this.eaHost().getScriptSetting(m.name,v.key),A=M===void 0?v.default:M,k=dt(v.key),_=v.type==="select"?`<select class="b3-select" data-key="${k}">${(v.options??[]).map(C=>`<option value="${dt(C.value)}"${String(C.value)===String(A)?" selected":""}>${q(C.label)}</option>`).join("")}</select>`:v.type==="toggle"?`<input class="b3-switch" type="checkbox" data-key="${k}"${A?" checked":""} />`:`<input class="b3-text-field" type="number" data-key="${k}" value="${dt(String(A))}"${v.min!==void 0?` min="${v.min}"`:""}${v.max!==void 0?` max="${v.max}"`:""} />`;return`<div class="exs-script-settings__field"><label>${q(v.label)}</label>${_}</div>`}).join("")}<div class="exs-script-settings__tip">${g("保存即生效；脚本运行时弹窗会用它预填，仍可临时改一次。")}</div></div>`},d=`<div class="exs-picker__hint"><b>${g("脚本使用说明")}</b>${g("点一条立即对当前画布执行；先框选画布元素再跑 = 对选中操作（对齐、连线、标注类）；先打开文档页签再跑 = 读文档内容（思维导图、表格类）。行尾按钮可固定到画布右缘侧边栏 / 改脚本设置（也可右键一条固定）。脚本就是 {dir} 下的 Markdown，可直接编辑，文件头加 @excalidraw-onload 则画布打开时自动运行。",{dir:Z})}</div>`,l=new Set(this.settings.pinnedActions),c=(m,w)=>m?{do:g("固定到右上角"),done:g("已固定在右上角")}:{do:g("固定到侧边栏"),done:g("已固定到侧边栏")},u=m=>{const w=l.has(m.id),$=c(Se(m)==="top-right");return`<div class="exs-script-item${w?" exs-script-item--pinned":""}" data-rail-action="${dt(m.id)}" title="${dt(m.id)}"><span class="exs-script-item__icon">${o(m.icon)}</span><div class="exs-script-item__main"><div class="exs-script-item__head"><span class="exs-script-item__title">${q(g(m.title))}</span>${w?`<span class="exs-script-pin" title="${$.done}">${g("已固定")}</span>`:""}</div><span class="exs-script-desc">${q(g(m.desc))}</span></div><span class="exs-script-item__actions"><button type="button" class="b3-button b3-button--text${w?" exs-script-item__btn--on":""}" data-act="pin" title="${w?$.done:$.do}">${o(On)}</button></span></div>`},h=ee.map(u).join(""),f=t.map((m,w)=>{const $=$t[m.name]??[],v=e.has(m.name),M=c(!1);return`<div class="exs-script-item${v?" exs-script-item--pinned":""}" data-idx="${w}" title="${q(m.name)}"><span class="exs-script-item__icon">${o(i(m.name))}</span><div class="exs-script-item__main"><div class="exs-script-item__head"><span class="exs-script-item__title">${q(m.title)}</span>${m.onload?`<span class="exs-script-badge">${g("打开时自动运行")}</span>`:""}${v?`<span class="exs-script-pin" title="${M.done}">${g("已固定")}</span>`:""}</div>${m.description?`<span class="exs-script-desc">${q(m.description)}</span>`:`<span class="exs-script-item__meta">${q(m.name)}</span>`}</div><span class="exs-script-item__actions">${$.length>0?`<button type="button" class="b3-button b3-button--text" data-act="gear" title="${g("脚本设置")}">${o(Ln)}</button>`:""}<button type="button" class="b3-button b3-button--text${v?" exs-script-item__btn--on":""}" data-act="pin" title="${v?M.done:M.do}">${o(On)}</button></span>${r(m)}</div>`}).join(""),p=await Wi(),x=p.length>0?`<div class="exs-picker__outdated"><span>${g("{n} 个内置脚本有新版本",{n:p.length})}${g("旧版内置脚本行为可能和插件不一致，重置会覆盖你在这些脚本里的修改（自建脚本不受影响）。")}</span><button type="button" class="b3-button b3-button--text" data-act="reset">${g("重置为最新版")}</button></div>`:"",E=(m,w,$)=>`<div class="exs-picker__group"><span class="exs-picker__group-title">${m}</span><span class="exs-picker__group-count">${w}</span><span class="exs-picker__group-note">${$}</span></div>`,b=`<details class="exs-picker__guide"><summary><span class="exs-picker__guide-ic">${o(s)}</span><span class="exs-picker__guide-text">${g("使用说明 · 先框选再跑，或先打开文档页签")}</span><span class="exs-picker__guide-chev">${o(a)}</span></summary>${d}</details>`,y=new I.Dialog({title:g("拓展功能"),width:"560px",content:`<div class="exs-picker">${x}${E(g("画布动作"),ee.length,g("固定后出现在画布右缘"))}<div class="exs-picker__rows">${h}</div>${E(g("脚本库"),t.length,g("点一条立即执行"))}<div class="exs-picker__rows">${f}</div>${b}</div>`,destroyCallback:()=>{this.scriptPickerDialog===y&&(this.scriptPickerDialog=null),window.dispatchEvent(new CustomEvent(ke,{detail:{pickerOpen:!1}}))}});y.element.classList.add("exs-picker-dialog"),this.scriptPickerDialog=y,window.dispatchEvent(new CustomEvent(ke,{detail:{pickerOpen:!0}}));const S=(m,w,$=!1)=>{const v=c($);m.classList.toggle("exs-script-item--pinned",w);const M=m.querySelector('[data-act="pin"]');M&&(M.classList.toggle("exs-script-item__btn--on",w),M.title=w?v.done:v.do);const A=m.querySelector(".exs-script-pin");if(w&&!A){const k=document.createElement("span");k.className="exs-script-pin",k.textContent=g("已固定"),k.title=v.done,m.querySelector(".exs-script-item__head")?.appendChild(k)}else!w&&A&&A.remove()};y.element.addEventListener("click",m=>{if(m.target?.closest?.('[data-act="reset"]')){(async()=>{const k=await pr();I.showMessage(g("已重置 {n} 个内置脚本",{n:k}),3e3),y.destroy(),this.openScriptPicker()})();return}const w=m.target?.closest?.("[data-rail-action]");if(w){const k=w.dataset.railAction??"";if(!Be(k))return;if(m.target?.closest?.('[data-act="pin"]')){const _=Se(Pn(k))==="top-right",C=this.settings.pinnedActions.includes(k);this.rememberActionPin(k,!C),S(w,!C,_);return}y.destroy(),this.runRailAction(k);return}const $=m.target?.closest?.(".exs-script-item"),v=$?.dataset?.idx;if(!$||v===void 0)return;const M=t[Number(v)];if(!M)return;const A=m.target?.closest?.("[data-act]");if(A){if(A.dataset.act==="pin"){const k=this.settings.pinnedScripts.includes(M.name);this.rememberScriptPin(M.name,!k),S($,!k)}else if(A.dataset.act==="gear"){const k=$.querySelector(".exs-script-settings");if(k){const _=k.hasAttribute("hidden");y.element.querySelectorAll(".exs-script-settings").forEach(C=>{C!==k&&C.setAttribute("hidden","")}),y.element.querySelectorAll('[data-act="gear"]').forEach(C=>{C!==A&&C.classList.remove("exs-script-item__btn--on")}),_?k.removeAttribute("hidden"):k.setAttribute("hidden",""),A.classList.toggle("exs-script-item__btn--on",_)}}return}m.target?.closest?.(".exs-script-settings")||(y.destroy(),this.runScriptOnActiveBoard(M,{shift:m.shiftKey,at:{x:m.clientX,y:m.clientY}}))}),y.element.addEventListener("change",m=>{const w=m.target,$=w?.closest?.(".exs-script-settings");if(!$||!w?.dataset?.key)return;const M=$.closest(".exs-script-item")?.dataset?.idx;if(M===void 0)return;const A=t[Number(M)];if(!A)return;const k=w.dataset.key,_=($t[A.name]??[]).find(L=>L.key===k);if(!_)return;const C=_.type==="number"?Math.max(_.min??0,Math.min(_.max??Number.MAX_SAFE_INTEGER,Number(w.value)||0)):_.type==="toggle"?w.checked:w.value;this.eaHost().setScriptSetting(A.name,k,C),I.showMessage(g("已保存：{name} › {label}",{name:A.title,label:_.label}),3e3)}),y.element.addEventListener("contextmenu",m=>{const w=m.target?.closest?.("[data-rail-action]");if(w){const _=w.dataset.railAction??"";if(!Be(_))return;m.preventDefault();const C=Se(Pn(_))==="top-right",L=this.settings.pinnedActions.includes(_),O=c(C),T=new I.Menu;T.addItem({label:L?O.done:O.do,click:()=>{this.rememberActionPin(_,!L),S(w,!L,C)}}),T.open({x:m.clientX,y:m.clientY});return}const $=m.target?.closest?.(".exs-script-item"),v=$?.dataset?.idx;if(!$||v===void 0)return;const M=t[Number(v)];if(!M)return;m.preventDefault();const A=this.settings.pinnedScripts.includes(M.name),k=new I.Menu;k.addItem({label:g(A?"从侧边栏取消固定":"固定到侧边栏"),click:()=>{this.rememberScriptPin(M.name,!A),S($,!A)}}),k.open({x:m.clientX,y:m.clientY})})})()}async listPinnedScripts(){if(this.settings.pinnedScripts.length===0)return[];let t=[];try{t=await Xt()}catch{return[]}return this.settings.pinnedScripts.map(e=>t.find(i=>i.name===e)).filter(e=>!!e).map(e=>({name:e.name,title:e.title}))}async runScriptFile(t,e){let i=[];try{i=await Xt()}catch{i=[]}const o=i.find(s=>s.name===t);if(!o){I.showMessage(g("找不到脚本：{name}",{name:t}),7e3,"error");return}await this.runScriptOnActiveBoard(o,e)}rememberScriptPin(t,e){const i=this.settings.pinnedScripts,o=e?i.includes(t)?i:[...i,t]:i.filter(s=>s!==t);o.length===i.length&&o.every((s,a)=>s===i[a])||(this.settings={...this.settings,pinnedScripts:o},this.persist(),window.dispatchEvent(new CustomEvent(Rn)))}rememberActionPin(t,e){const i=this.settings.pinnedActions,o=e?i.includes(t)?i:[...i,t]:i.filter(s=>s!==t);o.length===i.length&&o.every((s,a)=>s===i[a])||(this.settings={...this.settings,pinnedActions:o},this.persist(),window.dispatchEvent(new CustomEvent(Rn)))}setAiChannel(t,e){this.settings.aiChannels[t]!==e&&(this.settings={...this.settings,aiChannels:{...this.settings.aiChannels,[t]:e}},this.persist(),t==="agent"&&I.showMessage(g(e?"内置智能体通道已开启：重载思源后注册生效":"内置智能体通道已关闭：重载思源后彻底摘除"),6e3))}async runRailAction(t){if(t===Li){const o=this.activeActions();if(!o){I.showMessage(g("先打开一块白板，再改外框颜色"));return}o.openOutlinePalette();return}if(t===Oi){const o=this.activeActions();if(!o){I.showMessage(g("先打开一块白板，再转换图片"));return}o.openImageToMaterial();return}if(t===Pi){const o=this.activeActions();if(!o){I.showMessage(g("先打开一块白板，再放映"));return}o.openPresentation();return}if(t!==Ye)return;const e=this.activeActions();if(!e){I.showMessage(g("先打开一块白板，再往里插卡片"));return}const i=await this.pickBoardRef();i&&e.insertBoardCard(i,B(i).replace(/\.svg$/i,""))}rememberScriptRail(t,e){this.settings[t]!==e&&(this.settings={...this.settings,[t]:e},this.persist(),window.dispatchEvent(new CustomEvent(ke,{detail:{[t]:e}})))}rememberHighlighter(t){const e=te(t),i=this.settings.highlighter;i.color===e.color&&i.width===e.width&&i.opacity===e.opacity||(this.settings={...this.settings,highlighter:e},this.persist(),window.dispatchEvent(new CustomEvent(jo,{detail:e})))}rememberPresentationSetting(t,e){const i=ji({...this.settings.presentation,[t]:e});this.settings.presentation[t]!==i[t]&&(this.settings={...this.settings,presentation:i},this.persist())}async runScriptOnActiveBoard(t,e){if(!this.settings.aiChannels.script){I.showMessage(g("脚本通道已在「AI 通道」面板里关闭"));return}const o=this.activeActions()?.getEaHandle()??null;if(!o){I.showMessage(g("没有可运行脚本的白板：请先打开一张"));return}let s;try{s=await je(t.path)}catch(d){I.showMessage(g("读取脚本失败：{msg}",{msg:d instanceof Error?d.message:String(d)}),7e3,"error");return}const a=Gn(o,this.eaHost(),t.name,e),r=await Xn(s.code,a,a.utils);r.logs.length>0&&console.log(`[excali-studio][脚本] ${t.title}
${r.logs.join(`
`)}`),r.ok?I.showMessage(g("脚本「{title}」运行成功（{ms}ms）",{title:t.title,ms:r.durationMs})):I.showMessage(g("脚本「{title}」运行失败：{msg}",{title:t.title,msg:(r.error||"").split(`
`)[0]}),1e4,"error")}async runOnloadScripts(t){let e=[];try{e=(await Xt()).filter(i=>i.onload)}catch{return}for(const i of e){const s=this.boardActions.get(t)?.getEaHandle()??null;if(s)try{const a=await je(i.path),r=Gn(s,this.eaHost(),i.name),d=await Xn(a.code,r,r.utils);d.logs.length>0&&console.log(`[excali-studio][onload 脚本] ${i.title}
${d.logs.join(`
`)}`),d.ok||console.warn(`[excali-studio][onload 脚本失败] ${i.title}: ${(d.error||"").split(`
`)[0]}`)}catch(a){console.warn("[excali-studio][onload 脚本异常]",i.title,a)}}}activeActions(){return this.activeCustom?this.boardActions.get(this.activeCustom)??null:null}registerDock(){const t=this,e={openNew:()=>void this.openNew(),deleteActiveBoard:()=>t.deleteActiveBoard(),getBoardFiles:()=>{const i=new Set;for(const o of t.tabs.values())typeof o.data.dataPath=="string"&&i.add(o.data.dataPath);return{files:t.boardFiles,opened:i}},refreshBoardLib:()=>void t.refreshBoardLib(),openBoardFile:i=>void t.openStudioTab(i.dataPath),renameBoardFile:i=>void t.renameFromDock(i),deleteBoardFile:i=>void t.deleteBoardFile(i),openFileMenu:(i,o,s)=>t.openFileMenu(i,o,s),hasActiveBoard:()=>t.activeCustom!==null&&t.tabs.has(t.activeCustom),onRefresh:i=>{this.dockRefresh=i}};this.addDock({id:this.name+"-dock",type:"excali_studio_dock",config:{position:"LeftBottom",size:{width:300,height:0},icon:ft,title:g("Excali 白板")},data:{name:this.name},init:i=>{const o=Va(e),s=i.element;s.innerHTML="",s.appendChild(o.element),this.dockRefresh=o.refresh,o.refresh()},destroy:()=>{this.dockRefresh=null}})}openHelp(){const e=[["⌘⌥E",g("新建白板")],["⌘S",g("保存（已有文件静默覆盖）")],["⌘⇧E",g("导出图片…")],[g("空格 + 拖动"),g("平移画布")],[g("滚轮"),g("缩放画布")],[g("画布右键菜单"),g("只读 / 禅模式 / 网格 / 统计")]].map(([i,o])=>`<div class="exs-help__row"><span class="exs-help__key">${q(i)}</span><span>${q(o)}</span></div>`).join("");new I.Dialog({title:g("帮助"),width:"420px",content:`<div class="exs-help">${e}</div>`,destroyCallback:()=>{}})}async openStudioTab(t){const e=t?R(t):null;if(e){const s=[...this.tabs.values()].find(a=>a.data.dataPath===e);if(s){s.tab.parent.switchTab(s.tab.headElement);return}}if(Nn()){this.openMobileStudio(e);return}const i=new Set(this.tabs.values());await I.openTab({app:this.app,openNewTab:!0,custom:{id:this.name+Dn,icon:ft,title:e?B(e):g("未命名白板"),data:{dataPath:e}}});const o=[...this.tabs.values()].find(s=>!i.has(s));o&&o.tab.parent.switchTab(o.tab.headElement)}openMobileStudio(t){const e={dataPath:t},i={custom:null},o=ra({data:e,onDispose:()=>{const r=i.custom;r&&(this.tabs.delete(r),this.boardActions.delete(r),this.onloadRan.delete(r),this.activeCustom===r&&(this.activeCustom=null),this.dockRefresh?.())}}),s=o.custom;i.custom=s;const a={tab:s.tab,data:e,requestClose:()=>o.close(),closeForDelete:()=>o.close(),dispose:()=>{}};this.tabs.set(s,a),this.dockRefresh?.(),this.lazyMod().then(r=>{if(o.isClosed())return;o.body.replaceChildren();const d=r.attachStudioTab(s,this.studioHost());if(o.isClosed()){d.dispose();return}this.tabs.set(s,d),o.mount(d),this.dockRefresh?.()}).catch(r=>{o.isClosed()||(console.error("[excali-studio] 画板引擎加载失败",r),o.showError(g("画板引擎加载失败：{msg}",{msg:r instanceof Error?r.message:String(r)})))})}async loadScene(t){if(!t)return null;await this.ready;const e=await K(t),{decodeSvgScene:i}=await this.lazyMod(),o=await i(e,s=>this.hydrateSceneFiles(s));return this.rememberRecent(t),o}async hydrateSceneFiles(t){const e={};for(const[i,o]of Object.entries(t)){const s=o??{};if(typeof s.dataURL=="string"&&s.dataURL!==""){e[i]=o;continue}if(typeof s.path!="string"||s.path===""){e[i]=o;continue}try{const a=await aa(s.path),r=typeof s.mimeType=="string"&&s.mimeType!==""?s.mimeType:"image/png";e[i]={...s,dataURL:ha(a,r)}}catch(a){console.warn("[excali-studio] 白板图片读回失败（该图会显示为空框）",s.path,a),e[i]=o}}return e}async saveBoardMedia(t,e){const i=ca(t);if(!i)throw new Error(g("无法解析图片数据"));const o=await fa(i.bytes,i.mime||e),s=`${la}/${o}`;return await oa(s,i.bytes,i.mime||e),s}openBoardDocLink(t){const e=va(t);if(e){this.openLinkedBoard(e);return}const i=Ra(t);if(i){if(i.kind==="block"){this.openSiyuanBlock(i.id);return}this.openDocOf(i.id);return}const o=ba(t);if(o){this.openSiyuanBlock(o);return}const s=ya(t);if(!s){I.showMessage(g("无法识别的文档链接：{link}。支持思源块超链接（siyuan://blocks/…）、文档超链接（siyuan://doc/…）与块引用（((id '标题'))）",{link:t}),7e3,"error");return}this.openDocOf(s)}openSiyuanBlock(t){if(Nn()){this.openDocumentById(t);return}I.openTab({app:this.app,doc:{id:t},position:"right"}).catch(e=>{I.showMessage(g("打开文档失败：{msg}",{msg:e instanceof Error?e.message:String(e)}),7e3)})}async openLinkedBoard(t){if(!await ot(t)){I.showMessage(g("这块白板已经不在了：{path}",{path:Y(t)}),5e3,"error");return}await this.openExisting(t)}async restoreFromBackup(t){const e=R(t);for(const i of zi(e))try{const o=await K(i);if(!Co(o))continue;return await Ct(e,o),$e(e),!0}catch{}return!1}buildTopMenu(t){t.addItem({icon:"iconAdd",label:g("新建白板"),click:()=>void this.openNew()}),t.addSeparator(),this.recent.length===0?t.addItem({type:"readonly",label:g("还没有打开或保存过白板")}):(this.recent.slice(0,rc).forEach(e=>{const i=t.addItem({label:B(e),click:()=>void this.openExisting(e)});i instanceof HTMLElement&&i.setAttribute("title",e)}),t.addItem({label:g("清空最近记录"),click:()=>this.clearRecent()})),t.addSeparator(),t.addItem({icon:"iconOpen",label:g("按路径打开…"),click:()=>this.promptOpenPath()}),t.addItem({icon:"iconFolder",label:g("打开白板…"),click:()=>void this.openBoardPicker()}),t.addItem({icon:"iconSettings",label:g("设置"),click:()=>this.openSetting()})}registerBlockIconMenu(){this.eventBus.on("click-blockicon",({detail:t})=>{const e=jn(t.blockElements);e&&t.menu.addItem({icon:ft,label:g("用 Excali 白板打开"),click:()=>void this.openExisting(e)})})}boardAssetRefOf(t){const e=String(t??"").split("#")[0].split("?")[0],i=/\/?(assets\/[^\s]+?\.svg)$/i.exec(e);if(!i)return null;const o=this.settings.saveDir.replace(/\/+$/,"");return i[1].startsWith(o+"/")?i[1]:null}isBoardDataPath(t){return t.startsWith(R(this.settings.saveDir.replace(/\/+$/,"")))}openBoardAssetRef(t){const e=this.boardAssetRefOf(t);e&&this.openExisting(R(e))}registerBoardDecorations(){const t=e=>{const i=e?.wysiwyg?.element;i instanceof Element&&i.isConnected&&(this.observeBoardDom(i),this.decorateProtyle(i))};this.eventBus.on("switch-protyle",({detail:e})=>t(e?.protyle)),this.eventBus.on("click-editorcontent",({detail:e})=>t(e?.protyle)),this.eventBus.on("open-menu-image",({detail:e})=>{if(!(e?.element instanceof HTMLElement))return;const i=jn([e.element]);!i||!this.isBoardDataPath(i)||e.menu.addItem({icon:ft,label:g("用 Excali 白板打开"),click:()=>void this.openExisting(i)})})}decorateProtyle(t){Ya(t,{isBoardAsset:e=>this.boardAssetRefOf(e)!==null,openBoard:e=>this.openBoardAssetRef(e)})}observeBoardDom(t){if(this.boardObservers.has(t))return;const e=new MutationObserver(()=>this.scheduleBoardRescan());e.observe(t,{childList:!0,subtree:!0}),this.boardObservers.set(t,e)}scheduleBoardRescan(){this.boardRescanTimer===null&&(this.boardRescanTimer=setTimeout(()=>{this.boardRescanTimer=null;for(const[t,e]of[...this.boardObservers]){if(!t.isConnected){e.disconnect(),this.boardObservers.delete(t);continue}this.decorateProtyle(t)}},150))}async refreshBoardLib(){if(!this.libLoading){this.libLoading=!0;try{await this.ready;let t=null;try{t=await At(this.settings.saveDir)}catch(e){console.warn("[excali-studio] 白板库读保存目录失败",e)}t&&(this.boardFiles=pa(t))}finally{this.libLoading=!1}this.dockRefresh?.()}}copyText(t,e){const i=()=>I.showMessage(e,3e3);try{navigator.clipboard?.writeText?navigator.clipboard.writeText(t).then(i,()=>this.fallbackCopy(t,i)):this.fallbackCopy(t,i)}catch{this.fallbackCopy(t,i)}}fallbackCopy(t,e){try{const i=document.createElement("textarea");i.value=t,i.style.position="fixed",i.style.opacity="0",document.body.appendChild(i),i.select();const o=document.execCommand("copy");i.remove(),o?e():I.showMessage(g("复制失败：{msg}",{msg:"execCommand"}),7e3,"error")}catch(i){I.showMessage(g("复制失败：{msg}",{msg:i instanceof Error?i.message:String(i)}),7e3,"error")}}openFileMenu(t,e,i){const o=new I.Menu("excali-file-menu");o.addItem({icon:"iconEdit",label:g("在画板中打开"),click:()=>void this.openBoardFile(t)}),o.addItem({icon:"iconRight",label:g("插入到当前画布"),click:()=>this.insertBoardCardToActive(t)}),o.addItem({icon:"iconCopy",label:g("复制图片引用"),click:()=>this.copyText(`![${ne(t)}](${Y(t.dataPath)})`,g("已复制图片引用：粘贴到思源正文即插入白板"))}),o.addItem({icon:"iconRename",label:g("重命名"),click:()=>void this.renameFromDock(t)}),o.addSeparator(),o.addItem({icon:"iconTrash",label:g("删除…"),click:()=>void this.deleteBoardFile(t)}),o.open({x:e,y:i})}openBoardFile(t){return this.openStudioTab(t.dataPath)}insertBoardCardToActive(t){const e=this.activeActions();if(!e){I.showMessage(g("先打开一块白板，再往里插卡片"));return}e.insertBoardCard(Y(t.dataPath),ne(t))}openDocOf(t){this.openDocumentById(t)}openDocumentById(t){const e=window,i=e.openMobileFileById??e.siyuan?.openMobileFileById;if(e.siyuan?.mobile&&typeof i=="function")try{i(this.app,t,[],"start");return}catch(o){console.warn("[excali-studio] 移动端打开文档失败，回落页签",o)}I.openTab({app:this.app,doc:{id:t}}).catch(o=>{I.showMessage(g("打开文档失败：{msg}",{msg:o instanceof Error?o.message:String(o)}),7e3)})}async deleteBoardFile(t){const e=ma(t);I.confirm(g("删除白板"),g("将删除白板文件 {name} 及其备份（如存在）。删除不可恢复；白板开着时，画布上未保存的改动也会一并丢弃。",{name:t.name}),()=>{(async()=>{try{for(const i of[...this.tabs.values()])i.data.dataPath===t.dataPath&&i.closeForDelete();await xt(e.svgPath);for(const i of e.bakPaths)try{await xt(i)}catch{}this.boardFiles=this.boardFiles.filter(i=>i.dataPath!==t.dataPath),this.recent=this.recent.filter(i=>i!==t.dataPath),this.persist(),this.dockRefresh?.(),I.showMessage(g("已删除《{name}》",{name:t.name}),5e3)}catch(i){I.showMessage(g("删除失败：{msg}",{msg:i instanceof Error?i.message:String(i)}),1e4,"error")}})()})}deleteActiveBoard(){const t=this.activeCustom?this.tabs.get(this.activeCustom)?.data.dataPath:null;if(!t){I.showMessage(g("没有可删除的白板：当前没有打开已保存的白板"),7e3);return}const e=this.boardFiles.find(i=>i.dataPath===t);if(!e){this.refreshBoardLib().then(()=>{const i=this.boardFiles.find(o=>o.dataPath===t);i?this.deleteBoardFile(i):I.showMessage(g("删除失败：{msg}",{msg:t}),7e3,"error")});return}this.deleteBoardFile(e)}async renameFromDock(t){const e=await this.promptFileName(t.name,g("重命名白板"));if(e)try{const i=await this.renameBoard(t.dataPath,e);this.applyRenameToSession(t.dataPath,i),I.showMessage(g("已重命名为 {name}",{name:B(i)}),5e3)}catch(i){I.showMessage(g("重命名失败：{msg}",{msg:i instanceof Error?i.message:String(i)}),7e3,"error")}}applyRenameToSession(t,e){for(const i of this.tabs.values())i.data.dataPath===t&&(i.data.dataPath=e,i.tab.updateTitle(B(e)))}copyBoardRefFor(t){const e=this.tabs.get(t);if(!e)return;const i=e.data.dataPath;if(!i){I.showMessage(g("白板还没保存，保存后才能复制引用"),7e3);return}const o=B(i).replace(/\.svg$/i,"");this.copyText(`![${o}](${Y(i)})`,g("已复制图片引用：粘贴到思源正文即插入白板"))}promptOpenPath(){I.openInputDialog({title:g("按路径打开…"),label:g("工作空间内的 SVG 路径"),placeholder:"assets/excali-20261015-120000.svg",value:"",confirmText:g("打开"),onConfirm:(t,e)=>{const i=t.trim();i&&(this.openExisting(R(i)),e.destroy())}})}clearSlashHint(t){const e=t?.protyle?.toolbar?.range;!e||!e.toString().startsWith("/")||(e.deleteContents(),t.protyle?.wysiwyg?.element?.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"deleteContentBackward"})))}async openNew(){const t=await this.promptFileName(g("未命名白板"),g("新建白板"));if(t)try{const{path:e}=await this.createBoardFile(t);await this.openStudioTab(e)}catch(e){I.showMessage(g("创建白板失败：{msg}",{msg:e instanceof Error?e.message:String(e)}),7e3,"error")}}openExisting(t){return this.openStudioTab(t)}async createBoardFile(t){const e=await _e(this.settings.saveDir,Ee(t,g("未命名白板"))),{sceneToSvgText:i}=await this.lazyMod();return await Ct(e,await i({elements:[],appState:{},files:{}})),$e(e),this.rememberRecent(e),this.rememberBoardFile(e),this.refreshBoardLib(),{path:e}}async saveSvg(t,e){if(!e)throw new Error("saveSvg 只接受已有文件（新建走 createBoardFile）");const i=R(e);let o=null;try{o=await K(i)}catch{}if(o!==null&&To(o,t))return{path:e};const s=await Ct(i,t);return $e(s),this.rememberRecent(s),this.rememberBoardFile(s),this.refreshBoardLib(),{path:s}}rememberBoardFile(t){const e=R(t);this.boardFiles.some(i=>i.dataPath===e)||(this.boardFiles=[{dataPath:e,name:B(e),updated:Date.now()},...this.boardFiles])}async renameBoard(t,e){const i=R(t),o=await _e(this.settings.saveDir,Ee(e),i);if(R(o)===i)return i;const s=await Bn(i,o);return this.refreshBoardLib(),this.recent=[s,...this.recent.filter(a=>a!==i&&a!==s)],this.persist(),s}libDirRel(){return at(this.settings.saveDir,"excali-libraries")}localLibRel(){return at(this.libDirRel(),Oo)}libraryImportUrl(){const t=encodeURIComponent(this.libDirRel());return`${location.origin}/plugins/${qt}/library-import.html?dir=${t}`}async migrateStencilLibrary(){if(!this.settings.stencilMigrated)try{const t=this.localLibRel();if(!await ot(t)){let e=[];try{e=In(await K(R(at(this.settings.saveDir,"excali-library.json"))))}catch{e=[]}e.length>0&&(await wt(t,Cn(e)),I.showMessage(g("组件库已迁移到 {dir}",{dir:"excali-libraries"}),3500))}}catch(t){console.warn("[excali-studio] 组件库迁移失败（旧文件保留，下次不再自动尝试）",t)}finally{this.settings.stencilMigrated=!0,this.persist()}}async loadLibraryItems(){await this.migrateStencilLibrary();const t=this.localLibRel();let e=[];try{e=await Ae(this.libDirRel(),/\.excalidrawlib$/i)}catch{e=[]}e.sort((o,s)=>o===t?-1:s===t?1:o.localeCompare(s));const i=[];for(const o of e)try{i.push({path:o,items:In(await K(o))})}catch(s){console.warn("[excali-studio] 模板库文件读取失败，已跳过",o,s)}return this.libCache=No(i),this.libCache.items}async saveLibraryItems(t){const e=this.libCache??{items:[],sourceOf:new Map,byPath:new Map},i=Fo(e,t,this.localLibRel());for(const{path:o,items:s}of i)try{if(s.length===0){await ot(o)&&await xt(o);continue}await wt(o,Cn(s))}catch(a){console.error("[excali-studio] 模板库文件写入失败",o,a),I.showMessage(g("模板库保存失败：{path}",{path:B(o)}),5e3,"error")}this.libCache=null,await this.loadLibraryItems()}promptFileName(t,e){return new Promise(i=>{let o=!1;const s=l=>{o||(o=!0,a.destroy(),i(l))},a=new I.Dialog({title:e,width:"420px",content:`<div class="exs-picker">
  <input class="b3-text-field fn__block exs-name-input" value="${dt(t)}" />
  <div class="exs-name-tip">${g("位置")}：${q(this.settings.saveDir)}</div>
  <div class="exs-name-actions">
    <button class="b3-button exs-name-cancel" type="button">${g("取消")}</button>
    <button class="b3-button exs-name-ok" type="button">${g("确定")}</button>
  </div>
</div>`,destroyCallback:()=>s(null)});a.element.classList.add("exs-name-dialog");const r=a.element.querySelector(".exs-name-input");a.element.querySelector(".exs-name-cancel").addEventListener("click",()=>s(null));const d=()=>s(Ee(r.value||t));a.element.querySelector(".exs-name-ok").addEventListener("click",d),r.addEventListener("keydown",l=>{l.key==="Enter"?(l.preventDefault(),d()):l.key==="Escape"&&(l.preventDefault(),s(null)),l.stopPropagation()}),setTimeout(()=>{r.focus(),r.select()},50)})}async pickBoardRef(t){let e=[];try{e=await At(this.settings.saveDir)}catch(o){return I.showMessage(g("读取目录失败：{msg}",{msg:o instanceof Error?o.message:String(o)}),7e3,"error"),null}if(e.length===0)return I.showMessage(g("目录里还没有白板文件")),null;const i=new Set([...this.tabs.values()].map(o=>o.data.dataPath).filter(o=>typeof o=="string"));return await Ka(e,i,t)}async openBoardPicker(){const t=await this.pickBoardRef();t&&this.openExisting(t)}rememberRecent(t){const e=R(t);this.recent=[e,...this.recent.filter(i=>i!==e)].slice(0,ac),this.persist()}clearRecent(){this.recent=[],this.persist()}setupSetting(){let t=null,e=null,i=null,o=null,s=null,a=null,r=null,d=null;this.setting=new I.Setting({confirmCallback:()=>{this.settings={...this.settings,saveDir:t?.value??this.settings.saveDir,accentStroke:e?.checked??this.settings.accentStroke,showWelcome:i?.checked??this.settings.showWelcome,gridModeEnabled:o?.checked??this.settings.gridModeEnabled,imageBaseUrl:s?.value??this.settings.imageBaseUrl,imageModel:a?.value??this.settings.imageModel,imageApiKey:r?.value??this.settings.imageApiKey,imageSize:d?.value??this.settings.imageSize},this.settings=yt(this.settings),this.persist()}}),this.setting.addItem({title:g("保存目录"),description:g("新白板保存的位置（工作空间相对路径，默认 assets/excali）。白板库只列这个目录里的 .svg；assets 根目录留给普通图片附件。"),createActionElement:()=>{const l=document.createElement("input");return l.type="text",l.className="b3-text-field fn__block",l.value=this.settings.saveDir,l.placeholder=U.saveDir,l.addEventListener("change",()=>{this.settings={...this.settings,saveDir:l.value},this.persist()}),t=l,l}}),this.setting.addItem({title:g("图像生成 API 地址"),description:g("OpenAI 兼容的 images API 地址（如 https://api.openai.com/v1）；留空 = 关闭生图。"),createActionElement:()=>{const l=document.createElement("input");return l.type="text",l.className="b3-text-field fn__block",l.value=this.settings.imageBaseUrl,l.placeholder="https://api.openai.com/v1",l.addEventListener("change",()=>{this.settings=yt({...this.settings,imageBaseUrl:l.value}),this.persist()}),s=l,l}}),this.setting.addItem({title:g("图像生成模型"),description:g("模型名（如 gpt-image-1、dall-e-3）；按服务商支持的型号填写。"),createActionElement:()=>{const l=document.createElement("input");return l.type="text",l.className="b3-text-field fn__block",l.value=this.settings.imageModel,l.placeholder=U.imageModel,l.addEventListener("change",()=>{this.settings=yt({...this.settings,imageModel:l.value}),this.persist()}),a=l,l}}),this.setting.addItem({title:g("图像生成 API Key"),description:g("只保存在插件数据里，不写日志、不写白板文件。"),createActionElement:()=>{const l=document.createElement("input");return l.type="password",l.className="b3-text-field fn__block",l.autocomplete="off",l.spellcheck=!1,l.value=this.settings.imageApiKey,l.placeholder="sk-...",l.addEventListener("change",()=>{this.settings=yt({...this.settings,imageApiKey:l.value}),this.persist()}),r=l,l}}),this.setting.addItem({title:g("图像生成尺寸"),description:g("传给 images API 的 size（如 1024x1024）；不同模型支持的尺寸不同，按服务商文档填写。"),createActionElement:()=>{const l=document.createElement("input");return l.type="text",l.className="b3-text-field fn__block",l.value=this.settings.imageSize,l.placeholder=U.imageSize,l.addEventListener("change",()=>{this.settings=yt({...this.settings,imageSize:l.value}),this.persist()}),d=l,l}}),this.setting.addItem({title:g("画笔颜色跟随思源强调色"),description:g("新画板把第一笔的默认颜色设成当前主题强调色；只影响默认值，不覆盖已有图。"),createActionElement:()=>{const l=document.createElement("input");return l.type="checkbox",l.className="b3-switch fn__flex-center",l.checked=this.settings.accentStroke,l.addEventListener("change",()=>{this.settings={...this.settings,accentStroke:l.checked},this.persist()}),e=l,l}}),this.setting.addItem({title:g("空画板显示引导画面"),description:g("空白板中央显示手绘纸飞机和上手提示；落第一笔就消失，只影响新建的白板。"),createActionElement:()=>{const l=document.createElement("input");return l.type="checkbox",l.className="b3-switch fn__flex-center",l.checked=this.settings.showWelcome,l.addEventListener("change",()=>{this.settings={...this.settings,showWelcome:l.checked},this.persist()}),i=l,l}}),this.setting.addItem({title:g("默认显示网格"),description:g("在任意白板里切换网格都会记住这个值，之后所有白板（含还没保存过的空白板）打开时都按它显示。改这里只影响之后打开的页签。"),createActionElement:()=>{const l=document.createElement("input");return l.type="checkbox",l.className="b3-switch fn__flex-center",l.checked=this.settings.gridModeEnabled,l.addEventListener("change",()=>{this.settings={...this.settings,gridModeEnabled:l.checked},this.persist()}),o=l,l}})}async loadState(){const t=await this.loadData(ci),e=t&&typeof t=="object"?t:{};this.settings=yt(e.settings),this.recent=Array.isArray(e.recent)?e.recent.filter(i=>typeof i=="string"&&i!==""):[],this.dirMigrated=e.dirMigrated===!0,this.legacyBoards=Array.isArray(e.boards)?e.boards.filter(i=>typeof i=="string"):[]}rememberGrid(t){this.settings.gridModeEnabled!==t&&(this.settings={...this.settings,gridModeEnabled:t},this.persist())}persist(){this.saveData(ci,{settings:this.settings,recent:this.recent,dirMigrated:this.dirMigrated}).catch(t=>console.error("[excali-studio] 保存设置失败",t))}}module.exports=cc;
