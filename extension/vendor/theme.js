(()=>{var Wo;(function(e){e.GET_DATA="ui-bg-get-data",e.GET_DEVTOOLS_DATA="ui-bg-get-devtools-data",e.SUBSCRIBE_TO_CHANGES="ui-bg-subscribe-to-changes",e.UNSUBSCRIBE_FROM_CHANGES="ui-bg-unsubscribe-from-changes",e.CHANGE_SETTINGS="ui-bg-change-settings",e.SET_THEME="ui-bg-set-theme",e.TOGGLE_ACTIVE_TAB="ui-bg-toggle-active-tab",e.MARK_NEWS_AS_READ="ui-bg-mark-news-as-read",e.MARK_NEWS_AS_DISPLAYED="ui-bg-mark-news-as-displayed",e.LOAD_CONFIG="ui-bg-load-config",e.APPLY_DEV_FIXES="ui-bg-apply-dev-fixes",e.RESET_DEV_FIXES="ui-bg-reset-dev-fixes",e.START_ACTIVATION="ui-bg-start-activation",e.RESET_ACTIVATION="ui-bg-reset-activation",e.COLOR_SCHEME_CHANGE="ui-bg-color-scheme-change",e.HIDE_HIGHLIGHTS="ui-bg-hide-highlights"})(Wo||(Wo={}));var Xo;(function(e){e.CHANGES="bg-ui-changes"})(Xo||(Xo={}));var Do;(function(e){e.CSS_UPDATE="debug-bg-ui-css-update",e.UPDATE="debug-bg-ui-update"})(Do||(Do={}));var yt;(function(e){e.ADD_CSS_FILTER="bg-cs-add-css-filter",e.ADD_DYNAMIC_THEME="bg-cs-add-dynamic-theme",e.ADD_STATIC_THEME="bg-cs-add-static-theme",e.ADD_SVG_FILTER="bg-cs-add-svg-filter",e.CLEAN_UP="bg-cs-clean-up",e.FETCH_RESPONSE="bg-cs-fetch-response",e.UNSUPPORTED_SENDER="bg-cs-unsupported-sender"})(yt||(yt={}));var Go;(function(e){e.RELOAD="debug-bg-cs-reload"})(Go||(Go={}));var Ht;(function(e){e.COLOR_SCHEME_CHANGE="cs-bg-color-scheme-change",e.DARK_THEME_DETECTED="cs-bg-dark-theme-detected",e.DARK_THEME_NOT_DETECTED="cs-bg-dark-theme-not-detected",e.FETCH="cs-bg-fetch",e.DOCUMENT_CONNECT="cs-bg-document-connect",e.DOCUMENT_FORGET="cs-bg-document-forget",e.DOCUMENT_FREEZE="cs-bg-document-freeze",e.DOCUMENT_RESUME="cs-bg-document-resume"})(Ht||(Ht={}));var Bo;(function(e){e.LOG="debug-cs-bg-log"})(Bo||(Bo={}));var Fo;(function(e){e.EXPORT_CSS_RESPONSE="cs-ui-export-css-response"})(Fo||(Fo={}));var Ho;(function(e){e.EXPORT_CSS="ui-cs-export-css"})(Ho||(Ho={}));var ho=typeof navigator<"u",me=ho?navigator.userAgentData&&Array.isArray(navigator.userAgentData.brands)?navigator.userAgentData.brands.map(e=>`${e.brand.toLowerCase()} ${e.version}`).join(" "):navigator.userAgent.toLowerCase():"some useragent",zr=ho?navigator.userAgentData&&typeof navigator.userAgentData.platform=="string"?navigator.userAgentData.platform.toLowerCase():navigator.platform.toLowerCase():"some platform",Jt=me.includes("chrome")||me.includes("chromium"),ie=me.includes("firefox")||me.includes("thunderbird")||me.includes("librewolf"),qt=me.includes("safari")&&!Jt,da=zr.startsWith("win"),ua=zr.startsWith("mac"),fa=ho&&navigator.userAgentData?navigator.userAgentData.mobile:me.includes("mobile")||!1,Nr=typeof ShadowRoot=="function",qc=typeof MediaQueryList=="function"&&typeof MediaQueryList.prototype.addEventListener=="function",Zr=typeof CSSLayerBlockRule=="function",pa=typeof CSSContainerRule=="function";(()=>{let e=me.match(/chrom(?:e|ium)(?:\/| )([^ ]+)/);return e&&e[1]?e[1]:""})();(()=>{let e=me.match(/(?:firefox|librewolf)(?:\/| )([^ ]+)/);return e&&e[1]?e[1]:""})();var ha=(()=>{try{return document.querySelector(":defined"),!0}catch{return!1}})(),jr=(()=>{try{if(typeof document>"u")return!1;let e=document.createElement("div");return!e||typeof e.style!="object"?!1:typeof e.style.colorScheme=="string"?!0:(e.setAttribute("style","color-scheme: dark"),e.style.colorScheme==="dark")}catch{return!1}})();async function go(e,t,n){let r=n&&e.startsWith(`${n}/`)?void 0:"omit",a=await fetch(e,{cache:"force-cache",credentials:r,referrer:n,redirect:t==="text/css"?void 0:"error"});if(ie&&t==="text/css"&&e.startsWith("moz-extension://")&&e.endsWith(".css"))return a;let s=a.headers.get("Content-Type");if(t&&!(s===t||s?.startsWith(`${t};`)))throw new Error(`Mime type mismatch when loading ${e}`);if(a.redirected&&a.url&&Ur(new URL(a.url)))throw new Error("Cross-origin limit reached");if(!a.ok)throw new Error(`Unable to load ${e} ${a.status} ${a.statusText}`);return a}async function ga(e,t,n){let o=await go(e,t,n);return await Vr(o)}async function ma(e,t,n){return await(await go(e,t,n)).blob()}async function Vr(e){let t=await e.blob();return await new Promise((o,r)=>{let i=new FileReader;i.onloadend=()=>o(i.result),i.onerror=()=>r(i.error),i.readAsDataURL(t)})}async function ba(e,t,n){return await(await go(e,t,n)).text()}var xa=16,mn=new Set,Jo=new Set,Kr=["127-0-0-1.org.uk","42foo.com","domaincontrol.com","fbi.com","fuf.me","lacolhost.com","local.sisteminha.com","localfabriek.nl","localhost","localhst.co.uk","localmachine.info","localmachine.name","localtest.me","lvh.me","mouse-potato.com","nip.io","sslip.io","vcap.me","xip.io","yoogle.com"],ya=[".corp",".direct",".home",".internal",".intranet",".lan",".local",".localdomain",".test",".zz",...Kr.map(e=>`.${e}`)];function ka(e){if(e.startsWith("["))return!0;let t=e.split("."),n=t[t.length-1];return/^(0x[0-9a-f]+|\d+)$/i.test(n)}function Ur(e){let{host:t,port:n,protocol:o}=e,r=e.hostname.endsWith(".")?e.hostname.slice(0,-1):e.hostname;return mn.has(t)||mn.add(t),Jo.has(e.origin)?!1:mn.size>=xa||o!=="https:"||n!==""||Kr.includes(r)||ya.some(i=>r.endsWith(i))||ka(r)?!0:(Jo.add(e.origin),!1)}var Wr=async e=>Promise.reject(new Error(["Embedded Dark Reader cannot access a cross-origin resource",e,"Overview your URLs and CORS policies or use","`DarkReader.setFetchMethod(fetch: (url) => Promise<Response>))`.","See if using `DarkReader.setFetchMethod(window.fetch)`","before `DarkReader.enable()` works."].join(" "))),Zn=Wr;function Sa(e){e?Zn=e:Zn=Wr}async function Aa(e){return await Zn(e)}var G={runtime:{}},jn=new Set;async function qo(...e){if(e[0]&&e[0].type===Ht.FETCH){let{id:t}=e[0];try{let{url:n,responseType:o}=e[0].data,r=await Aa(n),i;o==="data-url"?i=await Vr(r):i=await r.text(),jn.forEach(a=>a({type:yt.FETCH_RESPONSE,data:i,error:null,id:t}))}catch(n){console.error(n),jn.forEach(o=>o({type:yt.FETCH_RESPONSE,data:null,error:n,id:t}))}}}function Yo(e){jn.add(e)}if(typeof G.runtime.sendMessage=="function"){let e=G.runtime.sendMessage;G.runtime.sendMessage=(...t)=>{qo(...t),e.apply(G.runtime,t)}}else G.runtime.sendMessage=qo;G.runtime.onMessage||(G.runtime.onMessage={});if(typeof G.runtime.onMessage.addListener=="function"){let e=G.runtime.onMessage.addListener;G.runtime.onMessage.addListener=(...t)=>{Yo(t[0]),e.apply(G.runtime.onMessage,t)}}else G.runtime.onMessage.addListener=(...e)=>Yo(e[0]);var kt;(function(e){e.cssFilter="cssFilter",e.svgFilter="svgFilter",e.staticTheme="staticTheme",e.dynamicTheme="dynamicTheme"})(kt||(kt={}));var Vn;(function(e){e.NONE="",e.TIME="time",e.SYSTEM="system",e.LOCATION="location"})(Vn||(Vn={}));var Tt={darkScheme:{background:"#181a1b",text:"#e8e6e3"},lightScheme:{background:"#dcdad7",text:"#181a1b"}},Xr={mode:1,brightness:100,contrast:100,grayscale:0,sepia:0,useFont:!1,fontFamily:ua?"Helvetica Neue":da?"Segoe UI":"Open Sans",textStroke:0,engine:kt.dynamicTheme,stylesheet:"",darkSchemeBackgroundColor:Tt.darkScheme.background,darkSchemeTextColor:Tt.darkScheme.text,lightSchemeBackgroundColor:Tt.lightScheme.background,lightSchemeTextColor:Tt.lightScheme.text,scrollbarColor:"",selectionColor:"auto",styleSystemControls:!jr,lightColorScheme:"Default",darkColorScheme:"Default",immediateModify:!1},wa=["*.officeapps.live.com","*.sharepoint.com","docs.google.com","onedrive.live.com"];wa.map(e=>{let t=kt.cssFilter;return{url:[e],theme:{...Xr,engine:t},builtIn:!0}}),Vn.NONE;function Kn(e,t,n=0){let o=[],r;for(;r=e.exec(t);)o.push(r[n]);return o}function va(e,t,n=0){let o=[],r;for(;r=e.exec(t);)o.push({text:r[n],offset:r.index});return o}function Ra(e){let t=e.length,n=0;for(let o=0;o<t;o++){let r=e.charCodeAt(o);n=(n<<5)-n+r&4294967295}return n}function Ea(e){return e.replaceAll(/[\^$.*+?\(\)\[\]{}|\-\\]/g,"\\$&")}function mo(e,t=0){return Ia(e,t,"(",")",[])}function Ia(e,t,n,o,r){let i;r.length===0?i=(l,u)=>e.indexOf(l,u):i=(l,u)=>Dr(e,l,u,r);let{length:a}=e,s=0,c=-1;for(let l=t;l<a;l++)if(s===0){let u=i(n,l);if(u<0)break;c=u,s++,l=u}else{let u=i(o,l);if(u<0)break;let f=i(n,l);if(f<0||u<=f){if(s--,s===0)return{start:c,end:u+1};l=u}else s++,l=f}return null}function Dr(e,t,n,o){let r=e.indexOf(t,n),i=o.find(a=>r>=a.start&&r<a.end);return i?Dr(e,t,i.end,o):r}var Mt,dt=new Map;function Qo(e){return Mt||(Mt=document.createElement("a")),Mt.href=e,Mt.href}function Yt(e,t=null){let n=`${e}${t?`;${t}`:""}`;if(dt.has(n))return dt.get(n);if(t){let r=new URL(e,Qo(t));return dt.set(n,r),r}let o=new URL(Qo(e));return dt.set(e,o),o}function un(e,t){if(t.match(/^data\\?\:/))return t;if(/^\/\//.test(t))return`${location.protocol}${t}`;let n=Yt(e);return Yt(t,n.href).href}function Ca(e){if(e.startsWith("data:"))return!0;let t=Yt(e);return t.protocol!==location.protocol||t.hostname!==location.hostname||t.port!==location.port?!1:t.pathname===location.pathname}var Ta=["pre","pre *","code",'[aria-hidden="true"]','[class*="fa-"]',".fa",".fab",".fad",".fal",".far",".fas",".fass",".fasr",".fat",".icofont",'[style*="font-"]','[class*="icon"]','[class*="Icon"]','[class*="symbol"]','[class*="Symbol"]',".glyphicon",'[class*="material-symbol"]','[class*="material-icon"]',"mu",'[class*="mu-"]',".typcn",'[class*="vjs-"]'];function Ma(e){let t=[];return t.push(`*:not(${Ta.join(", ")}) {`),e.useFont&&e.fontFamily&&t.push(`  font-family: ${e.fontFamily} !important;`),e.textStroke>0&&(t.push(`  -webkit-text-stroke: ${e.textStroke}px !important;`),t.push(`  text-stroke: ${e.textStroke}px !important;`)),t.push("}"),t.join(`
`)}function Pa(e){return e.length!=null}function H(e,t){if(Pa(e))for(let n=0,o=e.length;n<o;n++)t(e[n]);else for(let n of e)t(n)}function bo(e,t){H(t,n=>e.push(n))}function La(e){let t=[];for(let n=0,o=e.length;n<o;n++)t.push(e[n]);return t}function ee(e,t,n,o,r){return(e-t)*(r-o)/(n-t)+o}function we(e,t,n){return Math.min(n,Math.max(t,e))}function We(e,t){let n=[];for(let o=0,r=e.length;o<r;o++){n[o]=[];for(let i=0,a=t[0].length;i<a;i++){let s=0;for(let c=0,l=e[0].length;c<l;c++)s+=e[o][c]*t[c][i];n[o][i]=s}}return n}function Gr(e){let t=Ze.identity();return e.sepia!==0&&(t=We(t,Ze.sepia(e.sepia/100))),e.grayscale!==0&&(t=We(t,Ze.grayscale(e.grayscale/100))),e.contrast!==100&&(t=We(t,Ze.contrast(e.contrast/100))),e.brightness!==100&&(t=We(t,Ze.brightness(e.brightness/100))),e.mode===1&&(t=We(t,Ze.invertNHue())),t}function Oa([e,t,n],o){let r=[[e/255],[t/255],[n/255],[1],[1]],i=We(o,r);return[0,1,2].map(a=>we(Math.round(i[a][0]*255),0,255))}var Ze={identity(){return[[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]]},invertNHue(){return[[.333,-.667,-.667,0,1],[-.667,.333,-.667,0,1],[-.667,-.667,.333,0,1],[0,0,0,1,0],[0,0,0,0,1]]},brightness(e){return[[e,0,0,0,0],[0,e,0,0,0],[0,0,e,0,0],[0,0,0,1,0],[0,0,0,0,1]]},contrast(e){let t=(1-e)/2;return[[e,0,0,0,t],[0,e,0,0,t],[0,0,e,0,t],[0,0,0,1,0],[0,0,0,0,1]]},sepia(e){return[[.393+.607*(1-e),.769-.769*(1-e),.189-.189*(1-e),0,0],[.349-.349*(1-e),.686+.314*(1-e),.168-.168*(1-e),0,0],[.272-.272*(1-e),.534-.534*(1-e),.131+.869*(1-e),0,0],[0,0,0,1,0],[0,0,0,0,1]]},grayscale(e){return[[.2126+.7874*(1-e),.7152-.7152*(1-e),.0722-.0722*(1-e),0,0],[.2126-.2126*(1-e),.7152+.2848*(1-e),.0722-.0722*(1-e),0,0],[.2126-.2126*(1-e),.7152-.7152*(1-e),.0722+.9278*(1-e),0,0],[0,0,0,1,0],[0,0,0,0,1]]}},Un;(function(e){e[e.light=0]="light",e[e.dark=1]="dark"})(Un||(Un={}));function _o(e){let t=[];return e.mode===Un.dark&&t.push("invert(100%) hue-rotate(180deg)"),e.brightness!==100&&t.push(`brightness(${e.brightness}%)`),e.contrast!==100&&t.push(`contrast(${e.contrast}%)`),e.grayscale!==0&&t.push(`grayscale(${e.grayscale}%)`),e.sepia!==0&&t.push(`sepia(${e.sepia}%)`),t.length===0?null:t.join(" ")}function za(e){let t=[],n=[],o;for(let i=0,a=e.length;i<a;i++){let s=e[i];if(!(!s||s===" ")){if(rt.has(s)){let c=rt.get(s);for(;n.length;){let l=rt.get(n[0]);if(!l)break;if(c.lessOrEqualThan(l))t.push(n.shift());else break}n.unshift(s)}else!o||rt.has(o)?t.push(s):t[t.length-1]+=s;o=s}}t.push(...n);let r=[];for(let i=0,a=t.length;i<a;i++){let s=rt.get(t[i]);if(s){let c=r.splice(0,2);r.push(s.exec(c[1],c[0]))}else r.unshift(parseFloat(t[i]))}return r[0]}var Ge=class{constructor(t,n){this.precendce=t,this.execMethod=n}exec(t,n){return this.execMethod(t,n)}lessOrEqualThan(t){return this.precendce<=t.precendce}},rt=new Map([["+",new Ge(1,(e,t)=>e+t)],["-",new Ge(1,(e,t)=>e-t)],["*",new Ge(2,(e,t)=>e*t)],["/",new Ge(2,(e,t)=>e/t)]]),Na=()=>matchMedia("(prefers-color-scheme: dark)").matches,Ut=new Map,Wt=new Map;function W(e){e=e.trim();let t=e;if(Wt.has(t))return Wt.get(t);e.includes("calc(")&&(e=ns(e));let n=Fr(e);return Wt.set(t,n),n}function $o(e){if(Ut.has(e))return Ut.get(e);let t=W(e);if(!t)return null;let n=fn(t);return Ut.set(e,n),n}function Za(){Ut.clear(),Wt.clear()}function Br({h:e,s:t,l:n,a:o=1}){if(t===0){let[u,f,g]=[n,n,n].map(x=>Math.round(x*255));return{r:u,g,b:f,a:o}}let r=(1-Math.abs(2*n-1))*t,i=r*(1-Math.abs(e/60%2-1)),a=n-r/2,[s,c,l]=(e<60?[r,i,0]:e<120?[i,r,0]:e<180?[0,r,i]:e<240?[0,i,r]:e<300?[i,0,r]:[r,0,i]).map(u=>Math.round((u+a)*255));return{r:s,g:c,b:l,a:o}}function fn({r:e,g:t,b:n,a:o=1}){let r=e/255,i=t/255,a=n/255,s=Math.max(r,i,a),c=Math.min(r,i,a),l=s-c,u=(s+c)/2;if(l===0)return{h:0,s:0,l:u,a:o};let f=(s===r?(i-a)/l%6:s===i?(a-r)/l+2:(r-i)/l+4)*60;f<0&&(f+=360);let g=l/(1-Math.abs(2*u-1));return{h:f,s:g,l:u,a:o}}function J(e,t=0){let n=e.toFixed(t);if(t===0)return n;let o=n.indexOf(".");if(o>=0){let r=n.match(/0+$/);if(r)return r.index===o+1?n.substring(0,o):n.substring(0,r.index)}return n}function ja(e){let{r:t,g:n,b:o,a:r}=e;return r!=null&&r<1?`rgba(${J(t)}, ${J(n)}, ${J(o)}, ${J(r,2)})`:`rgb(${J(t)}, ${J(n)}, ${J(o)})`}function xo({r:e,g:t,b:n,a:o}){return`#${(o!=null&&o<1?[e,t,n,Math.round(o*255)]:[e,t,n]).map(r=>`${r<16?"0":""}${r.toString(16)}`).join("")}`}function er(e){let{h:t,s:n,l:o,a:r}=e;return r!=null&&r<1?`hsla(${J(t)}, ${J(n*100)}%, ${J(o*100)}%, ${J(r,2)})`:`hsl(${J(t)}, ${J(n*100)}%, ${J(o*100)}%)`}var Va=/^rgba?\([^\(\)]+\)$/,Ka=/^hsla?\([^\(\)]+\)$/,Ua=/^#[0-9a-f]+$/i,Wa=["color","color-mix","hwb","lab","lch","oklab","oklch"];function Fr(e){let t=e.trim().toLowerCase();if(t.includes("(from "))return t.indexOf("(from")!==t.lastIndexOf("(from")?null:bn(t);if(t.match(Va))return t.startsWith("rgb(#")||t.startsWith("rgba(#")?t.lastIndexOf("rgb")>0?null:bn(t):Qr(t);if(t.match(Ka))return Ya(t);if(t.match(Ua))return $a(t);if(_r.has(t))return es(t);if($r.has(t))return ts(t);if(t==="transparent")return{r:0,g:0,b:0,a:0};if(t.endsWith(")")&&Wa.some(n=>t.startsWith(n)&&t[n.length]==="("&&t.lastIndexOf(n)===0))return bn(t);if(t.startsWith("light-dark(")&&t.endsWith(")")){let n=t.match(/^light-dark\(\s*([a-z]+(\(.*\))?),\s*([a-z]+(\(.*\))?)\s*\)$/);if(n){let o=Na()?n[3]:n[1];return Fr(o)}}return null}var yo=48,Hr=57,Xa=101,Wn=46,Da=43,Ga=45,ut=32,Xn=44,Jr=47,Ba=37;function qr(e,t,n){let o=[],r=e.indexOf("(")+1,i=e.length-1,a=-1,s=-1,c=l=>{let u=s>-1?s:l,f=e.slice(a,u),g=parseFloat(f),x=t[o.length];if(s>-1){let S=e.slice(s,l),y=n[S];y!=null&&(g*=x/y)}x>1&&(g=Math.round(g)),o.push(g),a=-1,s=-1};for(let l=r;l<i;l++){let u=e.charCodeAt(l),f=u>=yo&&u<=Hr||u===Wn||u===Da||u===Ga||u===Xa,g=u===ut||u===Xn||u===Jr;f?a===-1&&(a=l):a>-1&&(g?c(l):s===-1&&(s=l))}return a>-1&&c(i),o}var Fa=[255,255,255,1],Ha={"%":100};function Yr(e){let n=e.length,o=0,r=0,i=!1,a=-1,s=ut,c=-1,l=null;for(;o<n;){let u=e.charCodeAt(o);if(u>=yo&&u<=Hr||u===Wn){if(!i&&(i=!0,r=0,a=-1,c++,c===3&&l&&(l[3]=0),c>3))return null;if(u===Wn){if(a>0)return null;a=0}else{let f=u-48;if(l||(l=[0,0,0,1]),a>-1)a++,l[c]+=f/10**a;else{if(r++,r>3)return null;l[c]=l[c]*10+f}}}else if(u===Ba){if(c<0||c>3||s!==ut||!l)return null;l[c]=c<3?Math.round(l[c]*255/100):l[c]/100,i=!1}else if(i=!1,u===ut)c===0&&(s=u);else if(u===Xn){if(c===-1)return null;s=Xn}else if(u===Jr){if(c!==2||s!==ut)return null}else return null;o++}return c<2||c>3?null:l}function Qr(e){let[t,n,o,r=1]=qr(e,Fa,Ha);return t==null||n==null||o==null||r==null?null:{r:t,g:n,b:o,a:r}}var Ja=[360,1,1,1],qa={"%":100,deg:360,rad:2*Math.PI,turn:1};function Ya(e){let[t,n,o,r=1]=qr(e,Ja,qa);return t==null||n==null||o==null||r==null?null:Br({h:t,s:n,l:o,a:r})}var tr=65,Qa=70,nr=97,_a=102;function $a(e){let n=e.length-1,o=n===3||n===4;if(!o&&!(n===6||n===8))return null;let i=u=>{let f=e.charCodeAt(u);return f>=tr&&f<=Qa?f+10-tr:f>=nr&&f<=_a?f+10-nr:f-yo},a,s,c,l=1;return o?(a=i(1)*17,s=i(2)*17,c=i(3)*17,n===4&&(l=i(4)*17/255)):(a=i(1)*16+i(2),s=i(3)*16+i(4),c=i(5)*16+i(6),n===8&&(l=(i(7)*16+i(8))/255)),{r:a,g:s,b:c,a:l}}function es(e){let t=_r.get(e);return{r:t>>16&255,g:t>>8&255,b:t>>0&255,a:1}}function ts(e){let t=$r.get(e);return{r:t>>16&255,g:t>>8&255,b:t>>0&255,a:1}}function ns(e){let t=0,n=(o,r,i)=>{e=e.substring(0,o)+i+e.substring(r)};for(;(t=e.indexOf("calc("))!==-1;){let o=mo(e,t);if(!o)break;let r=e.slice(o.start+1,o.end-1),i=r.includes("%");r=r.split("%").join("");let a=Math.round(za(r));n(o.start-4,o.end,a+(i?"%":""))}return e}var _r=new Map(Object.entries({aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgrey:11119017,darkgreen:25600,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,grey:8421504,green:32768,greenyellow:11403055,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgrey:13882323,lightgreen:9498256,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074})),$r=new Map(Object.entries({ActiveBorder:3906044,ActiveCaption:0,AppWorkspace:11184810,Background:6513614,ButtonFace:16777215,ButtonHighlight:15329769,ButtonShadow:10461343,ButtonText:0,CaptionText:0,GrayText:8355711,Highlight:11720703,HighlightText:0,InactiveBorder:16777215,InactiveCaption:16777215,InactiveCaptionText:0,InfoBackground:16514245,InfoText:0,Menu:16185078,MenuText:16777215,Scrollbar:11184810,ThreeDDarkShadow:0,ThreeDFace:12632256,ThreeDHighlight:16777215,ThreeDLightShadow:16777215,ThreeDShadow:0,Window:15527148,WindowFrame:11184810,WindowText:0,"-webkit-focus-ring-color":15046400}).map(([e,t])=>[e.toLowerCase(),t]));function ei(e,t,n){return(.2126*e+.7152*t+.0722*n)/255}var Pt,it;function bn(e){it||(Pt=document.createElement("canvas"),Pt.width=1,Pt.height=1,it=Pt.getContext("2d",{willReadFrequently:!0})),it.fillStyle=e,it.fillRect(0,0,1,1);let t=it.getImageData(0,0,1,1).data,n=`rgba(${t[0]}, ${t[1]}, ${t[2]}, ${(t[3]/255).toFixed(2)})`;return Qr(n)}function ko(e){let t=!1,n=null,o;return Object.assign((...a)=>{o=a,n?t=!0:(e(...o),n=requestAnimationFrame(()=>{n=null,t&&(e(...o),t=!1)}))},{cancel:()=>{cancelAnimationFrame(n),t=!1,n=null}})}function os(){let e=[],t=null;function n(){let i;for(;i=e.shift();)i();t=null}function o(i){e.push(i),t||(t=requestAnimationFrame(n))}function r(){e.splice(0),cancelAnimationFrame(t),t=null}return{add:o,cancel:r}}function rs(e){return(e<16?"0":"")+e.toString(16)}function ti(){if("randomUUID"in crypto){let e=crypto.randomUUID();return e.substring(0,8)+e.substring(9,13)+e.substring(14,18)+e.substring(19,23)+e.substring(24)}return"getRandomValues"in crypto?Array.from(crypto.getRandomValues(new Uint8Array(16))).map(e=>rs(e)).join(""):Math.floor(Math.random()*2**55).toString(36)}var be=null,ni=!document.hidden,He={capture:!0,passive:!0};function is(){document.addEventListener("visibilitychange",be,He),window.addEventListener("pageshow",be,He),window.addEventListener("focus",be,He)}function as(){document.removeEventListener("visibilitychange",be,He),window.removeEventListener("pageshow",be,He),window.removeEventListener("focus",be,He)}function ss(e){let t=!!be;be=()=>{document.hidden||(oi(),e(),ni=!0)},t||is()}function oi(){as(),be=null}function ri(){return ni}function Qt(e){let t=0;return e.seconds&&(t+=e.seconds*1e3),e.minutes&&(t+=e.minutes*60*1e3),e.hours&&(t+=e.hours*60*60*1e3),e.days&&(t+=e.days*24*60*60*1e3),t}function ue(...e){}function z(...e){}function Se(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function ii(e,t,n=Function.prototype){let r=Qt({seconds:2}),i=Qt({seconds:10}),a=e.previousSibling,s=e.parentNode;if(!s)throw new Error("Unable to watch for node position: parent element not found");if(t==="prev-sibling"&&!a)throw new Error("Unable to watch for node position: there is no previous sibling");let c=0,l=null,u=null,f=ko(()=>{if(u)return;c++;let d=Date.now();if(l==null)l=d;else if(c>=10){if(d-l<i){z(`Node position watcher paused: retry in ${r}ms`,e,a),u=setTimeout(()=>{l=null,c=0,u=null,f()},r);return}l=d,c=1}if(t==="head"&&a&&a.parentNode!==s&&(z("Sibling moved, moving node to the head end",e,a,s),a=document.head.lastChild),t==="prev-sibling"){if(a.parentNode==null){z("Unable to restore node position: sibling was removed",e,a,s),S();return}a.parentNode!==s&&(z("Style was moved to another parent",e,a,s),h(a.parentNode))}t==="head"&&!s.isConnected&&(s=document.head),z("Restoring node position",e,a,s),s.insertBefore(e,a&&a.isConnected?a.nextSibling:s.firstChild),g.takeRecords(),n&&n()}),g=new MutationObserver(()=>{(t==="head"&&(e.parentNode!==s||!e.parentNode.isConnected)||t==="prev-sibling"&&e.previousSibling!==a)&&f()}),x=()=>{g.observe(s,{childList:!0})},S=()=>{clearTimeout(u),g.disconnect(),f.cancel()},y=()=>{g.takeRecords()},h=d=>{s=d,S(),x()};return x(),{run:x,stop:S,skip:y}}function $e(e,t){if(e==null)return;let n=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode(o){return o.shadowRoot==null?NodeFilter.FILTER_SKIP:NodeFilter.FILTER_ACCEPT}});for(let o=e.shadowRoot?n.currentNode:n.nextNode();o!=null;o=n.nextNode())o.classList.contains("surfingkeys_hints_host")||(t(o),$e(o.shadowRoot,t))}var ve=()=>document.readyState==="complete"||document.readyState==="interactive";function ls(e){ve=e}var _t=new Set;function pn(e){ve()?e():_t.add(e)}function ai(e){_t.delete(e)}function hn(){return document.readyState==="complete"}var $t=new Set;function So(e){hn()?e():$t.add(e)}function cs(){$t.clear()}if(!ve()){let e=()=>{ve()&&(_t.forEach(t=>t()),_t.clear(),hn()&&(document.removeEventListener("readystatechange",e),$t.forEach(t=>t()),$t.clear()))};document.addEventListener("readystatechange",e)}var or=1e3;function ds(e){if(e.length>or)return!0;let t=0;for(let n=0;n<e.length;n++)if(t+=e[n].addedNodes.length,t>or)return!0;return!1}function us(e){let t=new Set,n=new Set,o=new Set;e.forEach(a=>{H(a.addedNodes,s=>{s instanceof Element&&s.isConnected&&t.add(s)}),H(a.removedNodes,s=>{s instanceof Element&&(s.isConnected?(o.add(s),t.delete(s)):n.add(s))})});let r=[],i=[];return t.forEach(a=>{t.has(a.parentElement)&&r.push(a)}),n.forEach(a=>{n.has(a.parentElement)&&i.push(a)}),r.forEach(a=>t.delete(a)),i.forEach(a=>n.delete(a)),{additions:t,moves:o,deletions:n}}var Lt=new Map,xn=new WeakMap;function si(e,t){let n,o,r;if(Lt.has(e))n=Lt.get(e),o=xn.get(n);else{let i=!1,a=!1;n=new MutationObserver(s=>{if(ds(s))!i||ve()?o.forEach(({onHugeMutations:c})=>c(e)):a||(r=()=>o.forEach(({onHugeMutations:c})=>c(e)),pn(r),a=!0),i=!0;else{let c=us(s);o.forEach(({onMinorMutations:l})=>l(e,c))}}),n.observe(e,{childList:!0,subtree:!0}),Lt.set(e,n),o=new Set,xn.set(n,o)}return o.add(t),{disconnect(){o.delete(t),r&&ai(r),o.size===0&&(n.disconnect(),xn.delete(n),Lt.delete(e))}}}function fe(e,t,n,o=new Set){H(e,r=>{if(wo(r))t(r),r.cssRules?.length>0&&fe(r.cssRules,t,n,o);else if(ms(r))try{let i=r.styleSheet;o.has(i)||(o.add(i),fe(i.cssRules,t,n,o))}catch{n?.()}else if(Dn(r)){let i=Array.from(r.media),a=i.some(c=>c.startsWith("screen")||c.startsWith("all")||c.startsWith("(")),s=!a&&i.some(c=>li.some(l=>c.startsWith(l)));(a||!s)&&fe(r.cssRules,t,n,o)}else bs(r)?CSS.supports(r.conditionText)&&fe(r.cssRules,t,n,o):Gn(r)||Bn(r)?fe(r.cssRules,t,n,o):z("CSSRule type not supported",r)})}var li=["aural","braille","embossed","handheld","print","projection","speech","tty","tv"],ci=["background","border","border-color","border-bottom","border-left","border-right","border-top","outline","outline-color"],fs=qt?ci.map(e=>{let t=new RegExp(`${e}:\\s*(.*?)\\s*;`);return[e,t]}):null;function Be(e,t){let n=e.cssText;n.includes("var(")&&(qt?fs.forEach(([o,r])=>{let i=n.match(r);if(i&&i[1]){let a=i[1].trim();t(o,a)}}):ci.forEach(o=>{let r=e.getPropertyValue(o);r&&r.includes("var(")&&t(o,r)})),(n.includes("background-color: ;")||n.includes("background-image: ;"))&&!e.getPropertyValue("background")&&rr("background",e,t),n.includes("border-")&&n.includes("-color: ;")&&!e.getPropertyValue("border")&&rr("border",e,t),H(e,o=>{let r=e.getPropertyValue(o).trim();r&&t(o,r)})}function rr(e,t,n){let o=t.parentRule;if(wo(o)){let r=o.parentStyleSheet?.ownerNode?.textContent;if(r){let i=Ea(o.selectorText);i=i.replaceAll(/\s+/g,"\\s*"),i=i.replaceAll(/::/g,"::?");let a=new RegExp(`${i}\\s*{[^}]*${e}:\\s*([^;}]+)`),s=r.match(a);s&&n(e,s[1])}else e==="background"&&(n("background-color","#ffffff"),n("background-image","none"))}}var di=/url\((('.*?')|(".*?")|([^\)]*?))\)/g,ui=/@import\s*(url\()?(('.+?')|(".+?")|([^\)]*?))\)? ?(screen)?;?/gi;function Ao(e){return e.trim().replace(/[\n\r\\]+/g,"").replace(/^url\((.*)\)$/,"$1").trim().replace(/^"(.*)"$/,"$1").replace(/^'(.*)'$/,"$1").replace(/(?:\\(.))/g,"$1")}function en(e){let t=Yt(e);return`${t.origin}${t.pathname.replace(/\?.*$/,"").replace(/(\/)([^\/]+)$/i,"$1")}`}function ps(e,t){return e.replace(di,n=>{try{let o=Ao(n);return`url('${un(t,o).replaceAll("'","\\'")}')`}catch{return z("Not able to replace relative URL with Absolute URL, skipping"),n}})}var hs=/@font-face\s*{[^}]*}/g;function gs(e){return e.replace(hs,"")}var Le=new WeakSet,ir=new WeakSet,ar=new WeakSet,sr=new WeakSet,lr=new WeakSet,cr=new WeakSet;function wo(e){return e?Le.has(e)?!0:e.selectorText?(Le.add(e),!0):!1:!1}function ms(e){return!e||Le.has(e)?!1:ir.has(e)?!0:e.href?(ir.add(e),!0):!1}function Dn(e){return!e||Le.has(e)?!1:ar.has(e)?!0:e.media?(ar.add(e),!0):!1}function bs(e){return!e||Le.has(e)?!1:sr.has(e)?!0:e instanceof CSSSupportsRule?(sr.add(e),!0):!1}function Gn(e){return!e||Le.has(e)?!1:lr.has(e)?!0:Zr&&e instanceof CSSLayerBlockRule?(lr.add(e),!0):!1}function Bn(e){return!e||Le.has(e)?!1:cr.has(e)?!0:pa&&e instanceof CSSContainerRule?(cr.add(e),!0):!1}var Fn=new WeakMap;function fi(e,t){Fn.set(e,t)}function xs(e){if(!e.ownerNode)return null;if(Fn.has(e))return Fn.get(e);let t=e.ownerNode;for(;t;){if(t instanceof ShadowRoot||t instanceof Document)return fi(e,t),t;t=t.parentNode}return null}var St,Me=new Map;function dr(e){St=e;let t=["background","text","border"];Me.forEach(n=>{t.forEach(o=>{if(n[o]){let{variable:r,value:i}=n[o];St?.cssRules[0]?.style.setProperty(r,i)}})})}function ys(){St=null,Hn()}function pi(e,t){return`var(${t[e].variable}, ${t[e].value})`}function ks(e,t){let n=xo(t),o=Me.get(n);return o?.[e]?pi(e,o):null}function Ss(e,t,n){let o=xo(t),r;Me.has(o)?r=Me.get(o):(r={parsed:W(o)},Me.set(o,r));let i=`--darkreader-${e}-${o.replace("#","")}`;return r[e]={variable:i,value:n},St?.cssRules[0]?.style&&(St?.cssRules[0]).style.setProperty(i,n),pi(e,r)}function As(){let e=[],t=[],n=[];return Me.forEach(o=>{o.background&&e.push(o.parsed),o.border&&t.push(o.parsed),o.text&&n.push(o.parsed)}),{background:e,border:t,text:n}}function Hn(){Me.clear()}function vo(e){let n=e.mode===1?"darkSchemeBackgroundColor":"lightSchemeBackgroundColor";return e[n]}function Ro(e){let n=e.mode===1?"darkSchemeTextColor":"lightSchemeTextColor";return e[n]}var Xt=new Map;function ws(){Xt.clear()}var vs=["r","g","b","a"],hi=["mode","brightness","contrast","grayscale","sepia","darkSchemeBackgroundColor","darkSchemeTextColor","lightSchemeBackgroundColor","lightSchemeTextColor"];function Rs(e,t,n,o){let r="";return vs.forEach(i=>{r+=`${e[i]};`}),hi.forEach(i=>{r+=`${t[i]};`}),r+=`${n};${o}`,r}function gn(e,t,n,o,r){let i;Xt.has(n)?i=Xt.get(n):(i=new Map,Xt.set(n,i));let a=Rs(e,t,o,r);if(i.has(a))return i.get(a);let s=fn(e),c=o==null?null:$o(o),l=r==null?null:$o(r),u=n(s,c,l),{r:f,g,b:x,a:S}=Br(u),y=Gr({...t,mode:0}),[h,d,m]=Oa([f,g,x],y),p=S===1?xo({r:h,g:d,b:m}):ja({r:h,g:d,b:m,a:S});return i.set(a,p),p}function Eo(e,t,n,o){let r=ks(e,t);if(r)return r;let i=o(t,n);return Ss(e,t,i)}function Io(e,t){let n=vo(t),o=Ro(t);return gn(e,t,Es,o,n)}function Es({h:e,s:t,l:n,a:o},r,i){let a=n<.5,s;if(a)s=n<.2||t<.12;else{let f=e>200&&e<280;s=t<.24||n>.8&&f}let c=e,l=t;s&&(a?(c=r.h,l=r.s):(c=i.h,l=i.s));let u=ee(n,0,1,r.l,i.l);return{h:c,s:l,l:u,a:o}}var ur=.4;function Is({h:e,s:t,l:n,a:o},r){let i=n<.5,a=e>200&&e<280,s=t<.12||n>.8&&a;if(i){let f=ee(n,0,.5,0,ur);if(s){let g=r.h,x=r.s;return{h:g,s:x,l:f,a:o}}return{h:e,s:t,l:f,a:o}}let c=ee(n,.5,1,ur,r.l);if(s){let f=r.h,g=r.s;return{h:f,s:g,l:c,a:o}}let l=e;return e>60&&e<180&&(e>120?l=ee(e,120,180,135,180):l=ee(e,60,120,60,105)),l>40&&l<80&&(c*=.75),{h:l,s:t,l:c,a:o}}function fr(e,t){if(t.mode===0)return Io(e,t);let n=vo(t);return gn(e,t,Is,n)}function X(e,t,n=!0){return n?Eo("background",e,t,fr):fr(e,t)}var Ot=.55;function pr(e){return ee(e,205,245,205,220)}function Cs({h:e,s:t,l:n,a:o},r){let i=n>.5,a=n<.2||t<.24,s=!a&&e>205&&e<245;if(i){let u=ee(n,.5,1,Ot,r.l);if(a){let g=r.h,x=r.s;return{h:g,s:x,l:u,a:o}}let f=e;return s&&(f=pr(e)),{h:f,s:t,l:u,a:o}}if(a){let u=r.h,f=r.s,g=ee(n,0,.5,r.l,Ot);return{h:u,s:f,l:g,a:o}}let c=e,l;return s?(c=pr(e),l=ee(n,0,.5,r.l,Math.min(1,Ot+.05))):l=ee(n,0,.5,r.l,Ot),{h:c,s:t,l,a:o}}function hr(e,t){if(t.mode===0)return Io(e,t);let n=Ro(t);return gn(e,t,Cs,n)}function q(e,t,n=!0){return n?Eo("text",e,t,hr):hr(e,t)}function Ts({h:e,s:t,l:n,a:o},r,i){let a=n<.5,s=n<.2||t<.24,c=e,l=t;s&&(a?(c=r.h,l=r.s):(c=i.h,l=i.s));let u=ee(n,0,1,.5,.2);return{h:c,s:l,l:u,a:o}}function gr(e,t){if(t.mode===0)return Io(e,t);let n=Ro(t),o=vo(t);return gn(e,t,Ts,n,o)}function _e(e,t,n=!0){return n?Eo("border",e,t,gr):gr(e,t)}function Ms(e,t){return X(e,t)}function yn(e,t){return X(e,t)}var mr=8,Jn="conic-",Ps=Jn.length,Ls="radial-",Os="linear-";function zs(e){let t=[],n=0,o=Jn.length;for(;(n=e.indexOf("gradient",o))!==-1;){let r;if([Os,Ls,Jn].find(c=>{if(n-c.length>=0&&e.substring(n-c.length,n)===c)return e.slice(n-c.length-10,n-c.length-1)==="repeating"?(r=`repeating-${c}gradient`,!0):e.slice(n-c.length-8,n-c.length-1)==="-webkit"?(r=`-webkit-${c}gradient`,!0):(r=`${c}gradient`,!0)}),!r)break;let{start:i,end:a}=mo(e,n+mr),s=e.substring(i+1,a-1);o=a+1+Ps,t.push({typeGradient:r,match:s,offset:r.length+2,index:n-r.length+mr,hasComma:!0})}return t.length&&(t[t.length-1].hasComma=!1),t}var gi="__darkreader__imageDetails_v2_list",mi="__darkreader__imageDetails_v2_",bi="__darkreader__cssFetch_",br=0,qn=new Map,xr=[];function Ns(){qn.forEach((e,t)=>{if(t&&t.startsWith("https://"))try{let n=JSON.stringify(e);sessionStorage.setItem(`${mi}${t}`,n),xr.push(t)}catch{}}),qn.clear(),sessionStorage.setItem(gi,JSON.stringify(xr))}function Zs(e,t){!e||!e.startsWith("https://")||(qn.set(e,t),clearTimeout(br),br=setTimeout(Ns,1e3))}function js(e){try{let t=sessionStorage.getItem(gi);if(!t)return;JSON.parse(t).forEach(o=>{let r=sessionStorage.getItem(`${mi}${o}`);if(r){let i=JSON.parse(r);e.set(o,i)}})}catch{}}function Vs(e,t){let n=`${bi}${e}`;try{sessionStorage.setItem(n,t)}catch{}}function Ks(e){let t=`${bi}${e}`;try{return sessionStorage.getItem(t)??null}catch{}return null}function Us(e){return e.slice(0,4).map(t=>t.map(n=>n.toFixed(3)).join(" ")).join(" ")}function Ws(e){return Us(Gr(e))}var Xs=1e3/60,Yn=class{constructor(){this.queue=[],this.timerId=null}addTask(t){this.queue.push(t),this.scheduleFrame()}stop(){this.timerId!==null&&(cancelAnimationFrame(this.timerId),this.timerId=null),this.queue=[]}scheduleFrame(){this.timerId||(this.timerId=requestAnimationFrame(()=>{this.timerId=null;let t=Date.now(),n;for(;n=this.queue.shift();)if(n(),Date.now()-t>=Xs){this.scheduleFrame();break}}))}},Qn=new Map,_n=new Map;async function xi(e){if(window.DarkReader?.Plugins?.fetch)return window.DarkReader.Plugins.fetch(e);let t=new URL(e.url);if(t.origin!==e.origin&&Ur(t))throw new Error("Cross-origin limit reached");return new Promise((n,o)=>{let r=ti();Qn.set(r,n),_n.set(r,o),G.runtime.sendMessage({type:Ht.FETCH,data:e,id:r})})}G.runtime.onMessage.addListener(({type:e,data:t,error:n,id:o})=>{if(e===yt.FETCH_RESPONSE){let r=Qn.get(o),i=_n.get(o);Qn.delete(o),_n.delete(o),n?i&&i(typeof n=="string"?new Error(n):n):r&&r(t)}});var $n=new Yn;async function yi(e){return new Promise(async(t,n)=>{try{let o=e.startsWith("data:")?e:await Ds(e),r=Ai(o)??await ma(e),i,a=!1;if(o.startsWith("data:image/svg+xml")){let s=o.indexOf(",");if(s>=0){let c=o.slice(s+1);if(o.slice(0,s).split(";")[1]==="base64"?(c.includes("%")&&(c=decodeURIComponent(c)),c=atob(c)):c.startsWith("%3c")&&(c=decodeURIComponent(c)),c.startsWith("<svg ")){let u=c.indexOf(">"),f=c.slice(0,u+1).toLocaleLowerCase();if(f.includes("viewbox=")&&!f.includes("width=")&&!f.includes("height=")){a=!0;let g=f.indexOf("viewbox="),x=f[g+8],S=f.indexOf(x,g+9),y=f.slice(g+9,S).split(" ").map(h=>parseFloat(h));if(y.length===4&&!y.some(h=>isNaN(h))){let h=y[2]-y[0],d=y[3]-y[1];o=`data:image/svg+xml;base64,${btoa(`<svg width="${h}" height="${d}" ${c.slice(5)}`)}`}}}}i=await yr(o)}else i=await Gs(r)??await yr(o);$n.addTask(()=>{let s=Ys(i);t({src:e,dataURL:s.isLarge?"":o,width:i.width,height:i.height,useViewBox:a,...s})})}catch(o){n(o)}})}async function Ds(e){return new URL(e).origin===location.origin?await ga(e):await xi({url:e,responseType:"data-url",origin:location.origin})}async function Gs(e){try{return await createImageBitmap(e)}catch(t){return z(`Unable to create image bitmap for type ${e.type}: ${String(t)}`),null}}var Bs=256,Fs=0;async function yr(e){return new Promise((t,n)=>{let o=new Image;o.onload=()=>t(o),o.onerror=()=>n(`Unable to load image ${e}`),++Fs<=Bs||hn()?o.src=e:So(()=>o.src=e)})}var eo=1024,Fe,Je;function Hs(){let e=eo,t=eo;Fe=document.createElement("canvas"),Fe.width=e,Fe.height=t,Je=Fe.getContext("2d",{willReadFrequently:!0}),Je.imageSmoothingEnabled=!1}function Js(){Fe=null,Je=null}var qs=512*512;function Ys(e){Fe||Hs();let t,n;if(e instanceof HTMLImageElement?(t=e.naturalWidth,n=e.naturalHeight):(t=e.width,n=e.height),t===0||n===0)return z("Image is empty"),{isDark:!1,isLight:!1,isTransparent:!1,isLarge:!1,averageColor:null};let o=t*n>qs,r=t*n,i=Math.min(1,Math.sqrt(eo/r)),a=Math.ceil(t*i),s=Math.ceil(n*i);Je.clearRect(0,0,a,s),Je.drawImage(e,0,0,t,n,0,0,a,s);let l=Je.getImageData(0,0,a,s).data,u=.05,f=.4,g=.7,x=0,S=0,y=0,h=1,d=0,m=0,p=0,b=0,E=0,O,k,R,w,v,K,se,U;for(R=0;R<s;R++)for(k=0;k<a;k++)O=4*(R*a+k),w=l[O+0],v=l[O+1],K=l[O+2],se=l[O+3],m+=w,p+=v,b+=K,E+=se,se/255<u?x++:(U=ei(w,v,K),U<f&&S++,U>g&&y++,U<h&&(h=U),U>d&&(d=U));let ne=a*s,$=ne-x,ze=.7,et=.7,Ne=.1,A=E===ne*255&&d-h<.1?{r:Math.round(m/$),g:Math.round(p/$),b:Math.round(b/$),a:x/ne}:null;return{isDark:S/$>=ze,isLight:y/$>=et,isTransparent:x/ne>=Ne,isLarge:o,solidColor:A}}var Et=null,Co=!1,kr=!1,kn=[];document.addEventListener("__darkreader__inlineScriptsAllowed",()=>Co=!0,{once:!0});async function Qs(){if(Co){if(kr)return await new Promise(e=>kn.push(e));kr=!0,await new Promise(e=>{document.addEventListener("__darkreader__blobURLCheckResponse",t=>{Et=t.detail.blobURLAllowed,e(),kn.forEach(n=>n()),kn.splice(0)},{once:!0}),document.dispatchEvent(new CustomEvent("__darkreader__blobURLCheckRequest"))})}}function _s(){return Et!=null||!Co}function ki(e){e.blockedURI==="blob"&&(Et=!1,document.removeEventListener("securitypolicyviolation",ki))}document.addEventListener("securitypolicyviolation",ki);var tn=new Map;function Sn({dataURL:e,width:t,height:n,useViewBox:o,src:r},i){e.startsWith("data:image/svg+xml")&&(e=Si(e));let a=Ws(i),c=[`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${o?`viewBox="0 0 ${t} ${n}"`:`width="${t}" height="${n}"`}>`,"<defs>",'<filter id="darkreader-image-filter">',`<feColorMatrix type="matrix" values="${a}" />`,"</filter>","</defs>",`<image width="${t}" height="${n}" filter="url(#darkreader-image-filter)" xlink:href="${e}" />`,"</svg>"].join("");if(!Et)return`data:image/svg+xml;base64,${btoa(c)}`;let l=tn.get(r);if(l&&l.matrix===a)return l.url;let u=new Uint8Array(c.length);for(let x=0;x<c.length;x++)u[x]=c.charCodeAt(x);let f=new Blob([u],{type:"image/svg+xml"}),g=URL.createObjectURL(f);return l&&URL.revokeObjectURL(l.url),tn.set(r,{matrix:a,url:g}),g}function $s({width:e,height:t,useViewBox:n},o){let i=[`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${n?`viewBox="0 0 ${e} ${t}"`:`width="${e}" height="${t}"`}>`,`<rect width="100%" height="100%" fill="${Si(o)}" />`,"</svg>"].join("");return`data:image/svg+xml;base64,${btoa(i)}`}var el={"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"};function Si(e){return e.replace(/[<>&'"]/g,t=>el[t]??t)}var nn=new Map;function Ai(e){let t=e.indexOf(":"),n=e.indexOf(";",t+1),o=e.indexOf(",",n+1),r=e.substring(n+1,o).toLocaleLowerCase(),i=e.substring(t+1,n);if(r!=="base64"||!i)return null;let a=e.substring(o+1);a.includes("%")&&(a=decodeURIComponent(a));let s=atob(a),c=new Uint8Array(s.length);for(let l=0;l<s.length;l++)c[l]=s.charCodeAt(l);return new Blob([c],{type:i})}async function tl(e){if(!Et)return null;let t=Ra(e),n=nn.get(t);if(n)return n;let o=Ai(e);return o||(o=await(await fetch(e)).blob()),n=URL.createObjectURL(o),nn.set(t,n),n}function nl(){$n&&$n.stop(),Js(),tn.forEach(({url:e})=>URL.revokeObjectURL(e)),tn.clear(),nn.forEach(e=>URL.revokeObjectURL(e)),nn.clear()}function ol(e,t){return!!(e&&e.getPropertyPriority(t))}function zt(e){if(e.startsWith("data:"))return!0;try{return new URL(e).origin===location.origin}catch{return!1}}var rl=["background-clip","background-position","background-repeat","background-size"];function wi(e,t,n,o,r,i){let a=null;if(e.startsWith("--"))a=yl(o,e,t,n,r,i);else if(t.includes("var("))a=kl(o,e,t,n);else if(e==="color-scheme")a=xl();else if(e==="scrollbar-color")a=bl(t);else if(e.includes("color")&&e!=="-webkit-print-color-adjust"||e==="fill"||e==="stroke"||e==="stop-color")if(e.startsWith("border")&&e!=="border-color"&&(t==="initial"||t==="currentcolor")){let s=e.substring(0,e.length-6),c=n.style.getPropertyValue(s),l=n.style.getPropertyValue("border-style");c.startsWith("0px")||c==="none"||l==="none"?(e=s,a=c):a=t}else a=hl(e,t,n);else if(e==="background-image"||e==="list-style-image"){let s=n.selectorText;a=Ei(t,n,r,i,s?l=>Ri(s,l):null)}else e.includes("shadow")?a=ml(t):rl.includes(e)&&t!=="initial"&&(a=t);return a?{property:e,value:a,important:ol(n.style,e),sourceValue:t}:null}function Sr(...e){return e.filter(Boolean).join(", ")}var il=["calendar.google.com"];function al(e,t,n){let o=[];t||(o.push("html {"),o.push(`    background-color: ${X({r:255,g:255,b:255},e)} !important;`),o.push("}")),jr&&e.mode===1&&(o.push("html {"),o.push("    color-scheme: dark !important;"),o.push("}"),o.push("iframe {"),o.push("    color-scheme: dark !important;"),o.push("}"));let r=Sr(t?"":"html, body",n?"input, textarea, select, button, dialog":"");return r&&(o.push(`${r} {`),o.push(`    background-color: ${X({r:255,g:255,b:255},e)};`),o.push("}")),o.push(`${Sr("html, body",n?"input, textarea, select, button":"")} {`),o.push(`    border-color: ${_e({r:76,g:76,b:76},e)};`),o.push(`    color: ${q({r:0,g:0,b:0},e)};`),o.push("}"),o.push("a {"),o.push(`    color: ${q({r:0,g:64,b:255},e)};`),o.push("}"),o.push("table {"),o.push(`    border-color: ${_e({r:128,g:128,b:128},e)};`),o.push("}"),o.push("mark {"),o.push(`    color: ${q({r:0,g:0,b:0},e)};`),o.push("}"),o.push("::placeholder {"),o.push(`    color: ${q({r:169,g:169,b:169},e)};`),o.push("}"),o.push("input:-webkit-autofill,"),o.push("textarea:-webkit-autofill,"),o.push("select:-webkit-autofill {"),o.push(`    background-color: ${X({r:250,g:255,b:189},e)} !important;`),o.push(`    color: ${q({r:0,g:0,b:0},e)} !important;`),o.push("}"),e.scrollbarColor&&!il.includes(location.hostname)&&o.push(ll(e)),e.selectionColor&&o.push(sl(e)),Zr&&(o.unshift("@layer {"),o.push("}")),o.join(`
`)}function vi(e){let t,n;if(e.selectionColor==="auto")t=X({r:0,g:96,b:212},{...e,grayscale:0}),n=q({r:255,g:255,b:255},{...e,grayscale:0});else{let o=W(e.selectionColor),r=fn(o);t=e.selectionColor,r.l<.5?n="#FFF":n="#000"}return{backgroundColorSelection:t,foregroundColorSelection:n}}function sl(e){let t=[],n=vi(e),o=n.backgroundColorSelection,r=n.foregroundColorSelection;return["::selection","::-moz-selection"].forEach(i=>{t.push(`${i} {`),t.push(`    background-color: ${o} !important;`),t.push(`    color: ${r} !important;`),t.push("}")}),t.join(`
`)}function ll(e){let t,n;if(e.scrollbarColor==="auto")t=X({r:241,g:241,b:241},e),n=X({r:176,g:176,b:176},e);else{let o=W(e.scrollbarColor),r=fn(o);t=er((a=>({...r,l:we(r.l-a,0,1)}))(.4)),n=er(r)}return["* {",`    scrollbar-color: ${n} ${t};`,"}"].join(`
`)}function To(e,{strict:t}){return cl(e,{strict:t})}function cl(e,{strict:t}){let n=[];return n.push(`html, body, ${t?"body :not(iframe)":"body > :not(iframe)"} {`),n.push(`    background-color: ${X({r:255,g:255,b:255},e)} !important;`),n.push(`    border-color: ${_e({r:64,g:64,b:64},e)} !important;`),n.push(`    color: ${q({r:0,g:0,b:0},e)} !important;`),n.push("}"),n.push('div[style*="background-color: rgb(135, 135, 135)"] {'),n.push("    background-color: #878787 !important;"),n.push("}"),n.join(`
`)}var to=null;function dl(e){to=e}function Ri(e,t){e&&to&&to(e,t)}var ul=new Set(["background","background-image","list-style-image"]);function fl(e){return ul.has(e)}var pl=new Set(["inherit","transparent","initial","currentcolor","none","unset","auto"]);function hl(e,t,n){if(pl.has(t.toLowerCase())&&!(e==="color"&&t==="initial"))return t;let o=null;if(e==="color"&&t==="initial"?o={r:0,g:0,b:0,a:1}:o=W(t),!o)return z("Couldn't parse color",t),null;if(e.includes("background")){let r=n.style.maskImage??n.style.mask;return r&&!r.startsWith("none")&&!r.startsWith("linear-gradient")?i=>q(o,i):i=>X(o,i)}return e.includes("border")||e.includes("outline")?r=>_e(o,r):r=>q(o,r)}var ft=new Map,de=new Map,Ar=!1;function gl(e,t){if(!e||t.length===0)return!1;if(t.some(o=>o==="*"))return!0;let n=e.split(/,\s*/g);for(let o=0;o<t.length;o++){let r=t[o];if(r.startsWith("^")){let i=r.slice(1);if(n.some(a=>a.startsWith(i)))return!0}else if(r.endsWith("$")){let i=r.slice(0,r.length-1);if(n.some(a=>a.endsWith(i)))return!0}else if(n.some(i=>i===r))return!0}return!1}var Pe=new Map,An=new Set,wn=null,Ie=null;function no(e){for(let[t,n]of Pe)(e.querySelector(t)||e instanceof Element&&e.matches(t))&&(Pe.delete(t),n.forEach(o=>o()));if(Pe.size===0){Ie?.disconnect(),Ie=null;return}Ie||(Ie=new MutationObserver(t=>{t.forEach(n=>{An.add(n.target),wn||(wn=requestAnimationFrame(()=>{An.forEach(o=>{no(o)}),An.clear(),wn=null}))})}),Ie.observe(document.documentElement,{attributes:!0,attributeFilter:["class"],subtree:!0}))}function Ei(e,t,n,o,r=null){try{if(gl(t.selectorText,n))return e;let i=zs(e),a=Kn(di,e);if(a.length===0&&i.length===0)return e;let s=h=>{let d=0;return h.map(m=>{let p=e.indexOf(m,d);return d=p+m.length,{match:m,index:p}})},c=i.map(h=>({type:"gradient",...h})).concat(s(a).map(h=>({type:"url",offset:0,...h}))).sort((h,d)=>h.index>d.index?1:-1),l=h=>{let{typeGradient:d,match:m,hasComma:p}=h,b=/([^\(\),]+(\([^\(\)]*(\([^\(\)]*\)*[^\(\)]*)?\))?([^\(\), ]|( (?!calc)))*),?/g,E=/^(from|color-stop|to)\(([^\(\)]*?,\s*)?(.*?)\)$/,O=Kn(b,m,1).map(k=>{k=k.trim();let R=W(k);if(R)return K=>yn(R,K);let w=k.lastIndexOf(" ");if(R=W(k.substring(0,w)),R)return K=>`${yn(R,K)} ${k.substring(w+1)}`;let v=k.match(E);return v&&(R=W(v[3]),R)?K=>`${v[1]}(${v[2]?`${v[2]}, `:""}${yn(R,K)})`:()=>k});return k=>`${d}(${O.map(R=>R(k)).join(", ")})${p?", ":""}`},u=h=>{Ar||(Ar=!0,js(ft));let d=Ao(h),m=d.length===0,{parentStyleSheet:p}=t,b=p?.ownerNode,E=(p&&xs(p))??document,O=p&&p.href?en(p.href):b?.baseURI||location.origin;return d=un(O,d),async k=>{if(m)return"url('')";let R=t.selectorText;R&&(R.includes("::before")&&(R=R.replaceAll("::before","")),R.includes("::after")&&(R=R.replaceAll("::after","")),E.querySelector(R)||await new Promise(v=>{Pe.has(R)?Pe.get(R).push(v):Pe.set(R,[v])}));let w=null;if(ft.has(d))w=ft.get(d);else try{if(_s()||await Qs(),de.has(d)){let v=de.get(d);if(w=await new Promise(K=>v.push(K)),!w)return null}else de.set(d,[]),w=await yi(d),ft.set(d,w),d.startsWith("data:")||new URL(d).origin===location.origin&&Zs(d,w),de.get(d).forEach(v=>v(w)),de.delete(d);if(o())return null}catch(v){z(v),de.has(d)&&(de.get(d).forEach(K=>K(null)),de.delete(d))}if(w){let v=g(w,k);if(v)return v}if(d.startsWith("data:")){let v=await tl(d);if(v)return`url("${v}")`}return`url("${d}")`}},f=()=>{let h=(t.style.backgroundRepeat||"").toLowerCase(),d=(t.style.backgroundSize||"").toLowerCase(),m=h.length>0&&h!=="no-repeat"&&!h.includes("no-repeat"),p=d.includes("cover")||d.includes("contain")||d.includes("100%");return!m&&!p},g=(h,d)=>{let{isDark:m,isLight:p,isTransparent:b,isLarge:E,solidColor:O,width:k}=h,R=null,w=h.src.startsWith("data:")?"data:":h.src;if(E&&p&&!b&&d.mode===1)ue(`Hiding large light image ${w}`),R="none";else if(m&&b&&d.mode===1&&k>2)ue(`Inverting dark image ${w}`),zt(h.src)?R=`url("${Sn(h,{...d,sepia:we(d.sepia+10,0,100)})}")`:f()&&r?.("invert");else if(p&&!b&&d.mode===1)if(O){ue(`Replacing image with a solid color ${w}`);let v=X(O,d,!1);R=`url("${$s(h,v)}")`}else zt(h.src)?(ue(`Inverting light image ${w}`),R=`url("${Sn(h,d)}")`):f()&&r?.("invert");else d.mode===0&&p&&h.dataURL?(ue(`Applying filter to image ${w}`),zt(h.src)?R=`url("${Sn(h,{...d,brightness:we(d.brightness-10,5,200),sepia:we(d.sepia+10,0,100)})}")`:r?.("dim")):(d.mode===1&&!zt(h.src)&&r?.("none"),ue(`Not modifying the image ${w}`));return R},x=[],S=0,y=!1;return c.forEach(({type:h,match:d,index:m,typeGradient:p,hasComma:b,offset:E},O)=>{let k=m,R=S,w=k+d.length+E;S=w,R!==k&&(y?x.push(()=>{let v=e.substring(R,k);return v[0]===","&&(v=v.substring(1)),v}):x.push(()=>e.substring(R,k))),y=b||!1,h==="url"?x.push(u(d)):h==="gradient"&&x.push(l({match:d,index:m,typeGradient:p,hasComma:b||!1,offset:E})),O===c.length-1&&x.push(()=>e.substring(w))}),h=>{let d=x.filter(Boolean).map(p=>p(h));if(d.some(p=>p instanceof Promise))return Promise.all(d).then(p=>p.filter(Boolean).join(""));let m=d.join("");return m.endsWith(", initial")?m.slice(0,-9):m}}catch(i){return z(`Unable to parse gradient ${e}`,i),null}}function Ii(e){try{let t=0,n=Kn(/(^|\s)(?!calc)([a-z]+\(.+?\)|#[0-9a-f]+|[a-z]+)(.*?(inset|outset)?($|,))/gi,e,2),o=0,r=n.map((i,a)=>{let s=t,c=e.indexOf(i,t),l=c+i.length;t=l;let u=W(i);return u?f=>`${e.substring(s,c)}${Ms(u,f)}${a===n.length-1?e.substring(l):""}`:(o++,()=>e.substring(s,l))});return i=>{let a=r.map(s=>s(i)).join("");return{matchesLength:n.length,unparsableMatchesLength:o,result:a}}}catch(t){return z(`Unable to parse shadow ${e}`,t),null}}function ml(e){let t=Ii(e);return t?n=>t(n).result:null}function bl(e){let t=e.match(/^\s*([a-z]+(\(.*\))?)\s+([a-z]+(\(.*\))?)\s*$/);if(!t)return e;let n=W(t[1]),o=W(t[3]);return!n||!o?(z("Couldn't parse color",...[n,o].filter(r=>!r)),null):r=>`${q(n,r)} ${X(o,r)}`}function xl(){return e=>e.mode===0?"dark light":"dark"}function yl(e,t,n,o,r,i){return e.getModifierForVariable({varName:t,sourceValue:n,rule:o,ignoredImgSelectors:r,isCancelled:i})}function kl(e,t,n,o){return e.getModifierForVarDependant(t,n,o)}function Sl(){ws(),ft.clear(),nl(),de.clear(),Pe.clear(),Ie?.disconnect(),Ie=null}var Q=1,je=2,Ve=4,at=8,Al=!location.hostname.startsWith("www.ebay.")&&!location.hostname.includes(".ebay."),oo=class{constructor(){this.varTypes=new Map,this.rulesQueue=new Set,this.inlineStyleQueue=[],this.definedVars=new Set,this.varRefs=new Map,this.unknownColorVars=new Set,this.unknownBgVars=new Set,this.undefinedVars=new Set,this.initialVarTypes=new Map,this.changedTypeVars=new Set,this.typeChangeSubscriptions=new Map,this.unstableVarValues=new Map,this.varFilterTypes=new Map,this.notifyingVarFilterTypes=new Set,this.varsChanged=!1}clear(){this.varTypes.clear(),this.rulesQueue.clear(),this.inlineStyleQueue.splice(0),this.definedVars.clear(),this.varRefs.clear(),this.unknownColorVars.clear(),this.unknownBgVars.clear(),this.undefinedVars.clear(),this.initialVarTypes.clear(),this.changedTypeVars.clear(),this.typeChangeSubscriptions.clear(),this.unstableVarValues.clear(),this.varFilterTypes.clear(),this.notifyingVarFilterTypes.clear()}isVarType(t,n){return this.varTypes.has(t)&&(this.varTypes.get(t)&n)>0}addRulesForMatching(t){this.rulesQueue.add(t)}addInlineStyleForMatching(t){this.inlineStyleQueue.push(t)}matchVariablesAndDependents(){this.rulesQueue.size===0&&this.inlineStyleQueue.length===0||(this.changedTypeVars.clear(),this.initialVarTypes=new Map(this.varTypes),this.varsChanged=!1,this.collectRootVariables(),this.collectVariablesAndVarDep(),this.collectRootVarDependents(),this.varsChanged&&(this.varRefs.forEach((t,n)=>{t.forEach(o=>{this.varTypes.has(n)&&this.resolveVariableType(o,this.varTypes.get(n))})}),this.unknownColorVars.forEach(t=>{this.unknownBgVars.has(t)?(this.unknownColorVars.delete(t),this.unknownBgVars.delete(t),this.resolveVariableType(t,Q)):this.isVarType(t,Q|je|Ve)?this.unknownColorVars.delete(t):this.undefinedVars.add(t)}),this.unknownBgVars.forEach(t=>{this.findVarRef(t,o=>this.unknownColorVars.has(o)||this.isVarType(o,Q|je|Ve))!=null?this.iterateVarRefs(t,o=>{this.resolveVariableType(o,Q)}):this.isVarType(t,Q|at)?this.unknownBgVars.delete(t):this.undefinedVars.add(t)}),this.changedTypeVars.forEach(t=>{this.typeChangeSubscriptions.has(t)&&this.typeChangeSubscriptions.get(t).forEach(n=>{n()})}),this.changedTypeVars.clear()))}getModifierForVariable(t){return n=>{let{varName:o,sourceValue:r,rule:i,ignoredImgSelectors:a,isCancelled:s}=t,c=()=>{let g=[],x=(S,y,h)=>{if(!this.isVarType(o,S))return;let d=y(o),m;if(he(r))if(vr(r)){let p=on(r,this.unstableVarValues);p||(p=S===Q?"#ffffff":"#000000"),m=h(p,n)}else m=ke(r,p=>y(p),p=>h(p,n));else m=h(r,n);g.push({property:d,value:m})};if(x(Q,st,Ee),x(je,Rn,lt),x(Ve,En,Zt),this.isVarType(o,at)){let S=wr(o),y=r;he(r)&&(y=ke(r,m=>st(m),m=>Ee(m,n)));let h=i.selectorText?m=>this.setVarFilterType(o,m):null,d=Ei(y,i,a,s,h);y=typeof d=="function"?d(n):d,g.push({property:S,value:y})}return g},l=new Set,u=g=>{if(!i.selectorText)return;let x=()=>{let S=c();g(S)};l.add(x),this.subscribeForVarTypeChange(o,x)},f=()=>{l.forEach(g=>{this.unsubscribeFromVariableTypeChanges(o,g)})};return{declarations:c(),onTypeChange:{addListener:u,removeListeners:f}}}}getModifierForVarDependant(t,n,o){o&&o.selectorText&&fl(t)&&this.watchFilterVars(n,o.selectorText);let r=n.match(/^\s*(rgb|hsl)a?\(/),i=n.match(/^rgba?\(var\(--[\-_A-Za-z0-9]+\)(\s*,?\/?\s*0?\.\d+)?\)$/);if(r&&!i){let a=t.startsWith("background"),s=In(t);return c=>{let l=on(n,this.unstableVarValues);return l||(l=a?"#ffffff":"#000000"),(a?Ee:s?lt:Zt)(l,c)}}return t==="background-color"||i&&t==="background"?a=>{let s=Al?Ee(r?"255, 255, 255":"#ffffff",a):"transparent";return ke(n,c=>st(c),c=>Ee(c,a),s)}:In(t)?a=>{let s=lt(r?"0, 0, 0":"#000000",a);return ke(n,c=>Rn(c),c=>lt(c,a),s)}:t==="background"||t==="background-image"||t==="box-shadow"?a=>{let s=new Set,c=()=>{let u=ke(n,f=>this.isVarType(f,Q)?st(f):this.isVarType(f,at)?wr(f):(s.add(f),f),f=>Ee(f,a));if(t==="box-shadow"){let g=Ii(u)(a);if(g.unparsableMatchesLength!==g.matchesLength)return g.result}return u},l=c();return s.size>0?Rl(l)?l:new Promise(u=>{for(let f of s.values()){let g=()=>{this.unsubscribeFromVariableTypeChanges(f,g);let x=c();u(x)};this.subscribeForVarTypeChange(f,g)}}):l}:t.startsWith("border")||t.startsWith("outline")?a=>ke(n,s=>En(s),s=>Zt(s,a)):null}subscribeForVarTypeChange(t,n){this.typeChangeSubscriptions.has(t)||this.typeChangeSubscriptions.set(t,new Set);let o=this.typeChangeSubscriptions.get(t);o.has(n)||o.add(n)}unsubscribeFromVariableTypeChanges(t,n){this.typeChangeSubscriptions.has(t)&&this.typeChangeSubscriptions.get(t).delete(n)}setVarFilterType(t,n){if(this.varFilterTypes.get(t)===n||(this.varFilterTypes.set(t,n),this.notifyingVarFilterTypes.has(t)))return;let o=this.typeChangeSubscriptions.get(t);o&&o.size>0&&(this.notifyingVarFilterTypes.add(t),o.forEach(r=>r()),this.notifyingVarFilterTypes.delete(t))}pushFilterSelectorsForValue(t,n){let o=new Set;vn(t,i=>o.add(i));let r=new Set;o.forEach(i=>{r.add(i),this.iterateVarRefs(i,a=>r.add(a))}),r.forEach(i=>{let a=this.varFilterTypes.get(i);a&&Ri(n,a)})}watchFilterVars(t,n){let o=new Set;vn(t,a=>o.add(a));let r=new Set;o.forEach(a=>{r.add(a),this.iterateVarRefs(a,s=>r.add(s))}),this.pushFilterSelectorsForValue(t,n);let i=()=>this.pushFilterSelectorsForValue(t,n);r.forEach(a=>this.subscribeForVarTypeChange(a,i))}collectVariablesAndVarDep(){this.rulesQueue.forEach(t=>{fe(t,n=>{n.style&&this.collectVarsFromCSSDeclarations(n.style)})}),this.inlineStyleQueue.forEach(t=>{this.collectVarsFromCSSDeclarations(t)}),this.rulesQueue.clear(),this.inlineStyleQueue.splice(0)}collectVarsFromCSSDeclarations(t){Be(t,(n,o)=>{Nt(n)&&this.inspectVariable(n,o),he(o)&&this.inspectVarDependant(n,o)})}shouldProcessRootVariables(){return this.rulesQueue.size>0&&document.documentElement.getAttribute("style")?.includes("--")}collectRootVariables(){this.shouldProcessRootVariables()&&Be(document.documentElement.style,(t,n)=>{Nt(t)&&this.inspectVariable(t,n)})}inspectVariable(t,n){this.unstableVarValues.set(t,n);let o=he(n);if(o&&vr(n)&&(this.unknownColorVars.has(t)||(this.unknownColorVars.add(t),this.varsChanged=!0),this.definedVars.add(t)),this.definedVars.has(t))return;this.definedVars.add(t),this.varsChanged=!0;let r=o?Ci(n):n;!!(Yr(r)||W(r))?this.unknownColorVars.add(t):(r.includes("url(")||r.includes("linear-gradient(")||r.includes("radial-gradient("))&&this.resolveVariableType(t,at)}resolveVariableType(t,n){let o=this.initialVarTypes.get(t)||0,r=this.varTypes.get(t)||0,i=r|n;this.varTypes.set(t,i),(i!==o||this.undefinedVars.has(t))&&(this.changedTypeVars.add(t),this.undefinedVars.delete(t)),(i!==r||this.unknownColorVars.has(t)||this.unknownBgVars.has(t))&&(this.varsChanged=!0),this.unknownColorVars.delete(t),this.unknownBgVars.delete(t)}collectRootVarDependents(){this.shouldProcessRootVariables()&&Be(document.documentElement.style,(t,n)=>{he(n)&&this.inspectVarDependant(t,n)})}inspectVarDependant(t,n){Nt(t)?this.iterateVarDeps(n,o=>{this.varRefs.has(t)||this.varRefs.set(t,new Set);let r=this.varRefs.get(t);r.has(o)||(r.add(o),this.varsChanged=!0)}):t==="background-color"||t==="box-shadow"?this.iterateVarDeps(n,o=>this.resolveVariableType(o,Q)):In(t)?this.iterateVarDeps(n,o=>this.resolveVariableType(o,je)):t.startsWith("border")||t.startsWith("outline")?this.iterateVarDeps(n,o=>this.resolveVariableType(o,Ve)):(t==="background"||t==="background-image")&&this.iterateVarDeps(n,o=>{if(this.isVarType(o,Q|at))return;let r=this.findVarRef(o,i=>this.unknownColorVars.has(i)||this.isVarType(i,Q|je|Ve))!=null;this.iterateVarRefs(o,i=>{r?this.resolveVariableType(i,Q):this.unknownBgVars.has(i)||(this.unknownBgVars.add(i),this.varsChanged=!0)})})}iterateVarDeps(t,n){let o=new Set;vn(t,r=>o.add(r)),o.forEach(r=>n(r))}findVarRef(t,n,o=new Set){let r=[t];for(;r.length>0;){let i=r.pop();if(o.has(i))continue;if(o.add(i),n(i))return i;let a=this.varRefs.get(i);a&&a.forEach(s=>r.push(s))}return null}iterateVarRefs(t,n){this.findVarRef(t,o=>(n(o),!1))}setOnRootVariableChange(t){this.onRootVariableDefined=t}putRootVars(t,n){let o=new Map;Be(document.documentElement.style,(s,c)=>{Nt(s)&&(this.isVarType(s,Q)&&o.set(st(s),Ee(c,n)),this.isVarType(s,je)&&o.set(Rn(s),lt(c,n)),this.isVarType(s,Ve)&&o.set(En(s),Zt(c,n)),this.subscribeForVarTypeChange(s,this.onRootVariableDefined))});let r=[];r.push(":root {");for(let[s,c]of o)r.push(`    ${s}: ${c};`);r.push("}");let i=r.join(`
`),a=t.sheet;a?(a.cssRules.length>0&&a.deleteRule(0),a.insertRule(i)):t.textContent=i}},V=new oo;function wl(e,t=0){let n=e.indexOf("var(",t);if(n>=0){let o=mo(e,n+3);if(o)return{start:n,end:o.end}}return null}function vl(e){let t=[],n=0,o;for(;o=wl(e,n);){let{start:r,end:i}=o;t.push({start:r,end:i,value:e.substring(r,i)}),n=o.end+1}return t}function Mo(e,t){let n=vl(e),o=n.length;if(o===0)return e;let r=e.length,i=n.map(s=>t(s.value,n.length)),a=[];a.push(e.substring(0,n[0].start));for(let s=0;s<o;s++){a.push(i[s]);let c=n[s].end,l=s<o-1?n[s+1].start:r;a.push(e.substring(c,l))}return a.join("")}function Po(e){let t=e.indexOf(","),n,o;return t>=0?(n=e.substring(4,t).trim(),o=e.substring(t+1,e.length-1).trim()):(n=e.substring(4,e.length-1).trim(),o=""),{name:n,fallback:o}}function ke(e,t,n,o){return Mo(e,i=>{let{name:a,fallback:s}=Po(i),c=t(a);if(!s)return o?`var(${c}, ${o})`:`var(${c})`;let l;return he(s)?l=ke(s,t,n):n?l=n(s):l=s,`var(${c}, ${l})`})}function Ci(e){return Mo(e,t=>{let{fallback:n}=Po(t);return n?he(n)?Ci(n):n:""})}function vn(e,t){ke(e,n=>(t(n),n))}function st(e){return`--darkreader-bg${e}`}function Rn(e){return`--darkreader-text${e}`}function En(e){return`--darkreader-border${e}`}function wr(e){return`--darkreader-bgimg${e}`}function Nt(e){return e.startsWith("--")}function he(e){return e.includes("var(")}function vr(e){return e.match(/^\s*(rgb|hsl)a?\(/)||e.match(/^(((\d{1,3})|(var\([\-_A-Za-z0-9]+\))),?\s*?){3}$/)}function Rl(e){if(e.startsWith("var(")&&e.endsWith(")")){let t=e.endsWith("))"),n=e.endsWith(")))"),o=t?e.lastIndexOf("("):-1,r=n?e.lastIndexOf("(",o-1):o,i=e.lastIndexOf(",",t?r:e.length);if(i<0||e[i+1]!==" ")return!1;let a=e.slice(i+2,e.length-1);return t?a.startsWith("rgb(")||a.startsWith("rgba(")||a.startsWith("hsl(")||a.startsWith("hsla(")||a.startsWith("var(--darkreader-bg--")||a.startsWith("var(--darkreader-background-")||n&&a.includes("var(--darkreader-background-"):a.match(/^(#[0-9a-f]+)|([a-z]+)$/i)}return!1}var El=["color","caret-color","-webkit-text-fill-color","fill","stroke"];function In(e){return El.includes(e)}function Il(e){let t=Yr(e);return t?{isRaw:!0,color:t[3]<1?`rgb(${t[0]} ${t[1]} ${t[2]} / ${t[3]})`:`rgb(${t[0]} ${t[1]} ${t[2]})`}:{isRaw:!1,color:e}}function Lo(e,t,n){let{isRaw:o,color:r}=Il(e),i=W(r);if(i){let a=n(i,t,!o);if(o){let s=W(a);return s?Number.isNaN(s.a)||s.a===1?`${s.r}, ${s.g}, ${s.b}`:`${s.r}, ${s.g}, ${s.b}, ${s.a}`:a}return a}return r}function Ee(e,t){return Lo(e,t,X)}function lt(e,t){return Lo(e,t,q)}function Zt(e,t){return Lo(e,t,_e)}var Cl=1e5,Tl=1e3;function on(e,t,n=new Set,o=new Map,r=0){if(r>Tl)return null;let i=!1,s=Mo(e,c=>{let{name:l,fallback:u}=Po(c),f=t.get(l),g=null;return f?o.has(l)?g=o.get(l):n.has(l)||(n.add(l),he(f)?g=on(f,t,n,o,r+1):g=f,n.delete(l),o.set(l,g)):u&&(he(u)?g=on(u,t,n,o,r+1):g=u),g||(i=!0,null)});return i||s.length>Cl?null:s}function Ml(e){let t="";return hi.forEach(n=>{t+=`${n}:${e[n]};`}),t}var Pl=os();function Ti(){let e=0,t=0,n=new Map;function o(x){let S=n.get(x);if(S!==void 0)return S;let y=++t,h="";do h=String.fromCharCode(y&65535)+h,y>>>=16;while(y>0);return n.set(x,h),h}function r(x){let S=o(x.cssText);if(Dn(x.parentRule)&&(S=`${o(x.parentRule.media.mediaText)}{${S}}`),Gn(x.parentRule)&&(S=`${o(x.parentRule.name)}{${S}}`),Bn(x.parentRule)){let{containerName:y,containerQuery:h}=x.parentRule;S=`${o(`${y} ${h}`)}{${S}}`}return S}let i=new Set,a=new Map,s=new Set,c=null,l=!1,u=!1;function f(){return l&&!u}function g(x){let S=x.sourceCSSRules,{theme:y,ignoreImageAnalysis:h,force:d,prepareSheet:m,isAsyncCancelled:p}=x,b=a.size===0,E=new Set(a.keys()),O=Ml(y),k=O!==c;l&&(u=!0);let R=[];if(fe(S,A=>{let C=r(A),P=!1;if(E.delete(C),i.has(C)||(i.add(C),P=!0),P)b=!0;else{R.push(a.get(C));return}if(A.style.all==="revert")return;let I=[];A.style&&Be(A.style,(M,Z)=>{let le=wi(M,Z,A,V,h,p);le&&I.push(le)});let N=null;if(I.length>0){let M=A.parentRule;N={selector:A.selectorText,declarations:I,parentRule:M},R.push(N)}a.set(C,N)},()=>{l=!0}),E.forEach(A=>{i.delete(A),a.delete(A)}),c=O,!d&&!b&&!k)return;e++;function w(A,C,P){let{selector:I,declarations:N}=P,M=I,Z=Jt&&I.startsWith(":is(")&&(I.includes(":is()")||I.includes(":where()")||I.includes(":where(")&&I.includes(":-moz")),le=I.includes("::view-transition-");(Z||le)&&(M=".darkreader-unsupported-selector"),Jt&&M.endsWith("::picker")&&(M=M.replaceAll("::picker","::picker(select)"));let B=`${M} {`;for(let ce of N){let{property:Y,value:F,important:_}=ce;F&&(B+=` ${Y}: ${F}${_?" !important":""};`)}B+=" }",A.insertRule(B,C)}let v=new Map,K=new Map,se=0,U=0,ne={rule:null,rules:[],isGroup:!0},$=new WeakMap;function ze(A){if(A==null)return ne;if($.has(A))return $.get(A);let C={rule:A,rules:[],isGroup:!0};return $.set(A,C),ze(A.parentRule).rules.push(C),C}s.forEach(A=>A()),s.clear(),R.filter(A=>A).forEach(({selector:A,declarations:C,parentRule:P})=>{let I=ze(P),N={selector:A,declarations:[],isGroup:!1},M=N.declarations;I.rules.push(N);function Z(B,ce,Y,F){let _=++se,tt={property:B,value:null,important:Y,asyncKey:_,sourceValue:F};M.push(tt);let Re=e;ce.then(Ct=>{!Ct||p()||Re!==e||(tt.value=Ct,Pl.add(()=>{p()||Re!==e||It(_)}))})}function le(B,ce,Y,F){let{declarations:_,onTypeChange:tt}=ce,Re=++U,Ct=e,la=M.length,nt=[];if(_.length===0){let oe={property:B,value:F,important:Y,sourceValue:F,varKey:Re};M.push(oe),nt=[oe]}_.forEach(oe=>{if(oe.value instanceof Promise)Z(oe.property,oe.value,Y,F);else{let ot={property:oe.property,value:oe.value,important:Y,sourceValue:F,varKey:Re};M.push(ot),nt.push(ot)}}),tt.addListener(oe=>{if(p()||Ct!==e)return;let ot=oe.map(Uo=>({property:Uo.property,value:Uo.value,important:Y,sourceValue:F,varKey:Re})),ca=M.indexOf(nt[0],la);M.splice(ca,nt.length,...ot),nt=ot,L(Re)}),s.add(()=>tt.removeListeners())}C.forEach(({property:B,value:ce,important:Y,sourceValue:F})=>{if(typeof ce=="function"){let _=ce(y);_ instanceof Promise?Z(B,_,Y,F):B.startsWith("--")?le(B,_,Y,F):M.push({property:B,value:_,important:Y,sourceValue:F})}else M.push({property:B,value:ce,important:Y,sourceValue:F})})});let et=m();function Ne(){function A(P,I){let{rule:N}=P;if(wo(N)){let{selectorText:M}=N,Z=I.cssRules.length;return I.insertRule(`${M} {}`,Z),I.cssRules[Z]}if(Dn(N)){let{media:M}=N,Z=I.cssRules.length;return I.insertRule(`@media ${M.mediaText} {}`,Z),I.cssRules[Z]}if(Gn(N)){let{name:M}=N,Z=I.cssRules.length;return I.insertRule(`@layer ${M} {}`,Z),I.cssRules[Z]}if(Bn(N)){let{containerName:M,containerQuery:Z}=N,le=I.cssRules.length,B=M?`${M} ${Z}`:Z;return I.insertRule(`@container ${B} {}`,le),I.cssRules[le]}return I}function C(P,I,N){P.rules.forEach(M=>{if(M.isGroup){let Z=A(M,I);C(M,Z,N)}else N(M,I)})}C(ne,et,(P,I)=>{let N=I.cssRules.length;P.declarations.forEach(({asyncKey:M,varKey:Z})=>{M!=null&&v.set(M,{rule:P,target:I,index:N}),Z!=null&&K.set(Z,{rule:P,target:I,index:N})}),w(I,N,P)})}function It(A){let{rule:C,target:P,index:I}=v.get(A);P.deleteRule(I),w(P,I,C),v.delete(A)}function L(A){let{rule:C,target:P,index:I}=K.get(A);P.deleteRule(I),w(P,I,C)}Ne()}return{modifySheet:g,shouldRebuildStyle:f}}var Dt=!1;document.addEventListener("__darkreader__inlineScriptsAllowed",()=>Dt=!0,{once:!0});var ct=new WeakSet,Cn=new WeakMap;function Ll(e){return Array.isArray(e.adoptedStyleSheets)}var Ke=ie?e=>e.adoptedStyleSheets.wrappedJSObject??e.adoptedStyleSheets:e=>e.adoptedStyleSheets,Ol=ie?()=>{let e=window.wrappedJSObject??window;return new e.CSSStyleSheet}:()=>new CSSStyleSheet;function zl(e){let t=!1;function n(p){H(Ke(e),b=>{ct.has(b)||p(b),fi(b,e)})}function o(p,b){let E=ie?Ke(e):[...e.adoptedStyleSheets],O=E.indexOf(p),k=E.indexOf(b);k>=0&&E.splice(k,1),E.splice(O+1,0,b),ie||(e.adoptedStyleSheets=E)}function r(){let p=ie?Ke(e):[...e.adoptedStyleSheets];for(let b=p.length-1;b>=0;b--){let E=p[b];ct.has(E)&&p.splice(b,1)}!ie&&e.adoptedStyleSheets.length!==p.length&&(e.adoptedStyleSheets=p),l=new WeakSet,u=new WeakSet}let i=[];function a(){i.forEach(p=>p()),i.splice(0),t=!0,r(),y&&(cancelAnimationFrame(y),y=null)}let s=0;function c(){let p=0;if(n(b=>{p+=b.cssRules.length}),p===1){let b=Ke(e)[0].cssRules[0];return b instanceof CSSStyleRule?b.style.length:p}return p}let l=new WeakSet,u=new WeakSet;function f(p,b){r();let E=Ke(e);for(let O=E.length-1;O>=0;O--){let k=E[O];if(ct.has(k))continue;l.add(k);let R=Cn.get(k);if(R){s=c(),o(k,R);continue}let w=k.cssRules,v=Ol();Cn.set(k,v),fe(w,U=>u.add(U.style));let K=()=>{for(let U=v.cssRules.length-1;U>=0;U--)v.deleteRule(U);return v.insertRule("#__darkreader__adoptedOverride {}"),o(k,v),ct.add(v),v};Ti().modifySheet({prepareSheet:K,sourceCSSRules:w,theme:p,ignoreImageAnalysis:b,force:!1,isAsyncCancelled:()=>t})}s=c()}let g=!1;function x(p){g||(g=!0,queueMicrotask(()=>{g=!1;let b=Ke(e).filter(E=>!ct.has(E));b.forEach(E=>Cn.delete(E)),p(b)}))}function S(){return c()!==s}let y=null;function h(p){y=requestAnimationFrame(()=>{Dt||(S()&&x(p),h(p))})}function d(p,b){e.addEventListener(p,b),i.push(()=>e.removeEventListener(p,b))}function m(p){let b=()=>{Dt=!0,x(p)};d("__darkreader__adoptedStyleSheetsChange",b),d("__darkreader__adoptedStyleSheetChange",b),d("__darkreader__adoptedStyleDeclarationChange",b),!Dt&&h(p)}return{render:f,destroy:a,watch:m}}var Nl=["chat.google.com","gogoprivate.com","gprivate.com","www.berlingske.dk","www.bloomberg.com","www.diffusioneshop.com","www.weekendavisen.dk","zhale.me"],Zl=Nl.includes(location.hostname)?"away":"next";function Mi(){return Zl}var Gt=new Set,Ce=null;function Oo(e){if(!document.body){Gt.add(e),Ce||(Ce=new MutationObserver(()=>{document.body&&(Ce.disconnect(),Ce=null,Gt.forEach(n=>Oo(n)),Gt.clear())}),Ce.observe(document,{childList:!0,subtree:!0}));return}let t=document.body.querySelector(".darkreader-style-container");t||(t=document.createElement("div"),t.classList.add("darkreader"),t.classList.add("darkreader-style-container"),t.style.display="none",document.body.append(t),ro=new MutationObserver(()=>{t?.nextElementSibling!=null&&(t.querySelectorAll(".darkreader--sync").forEach(n=>{if(n.sheet.cssRules.length>0){let o="";for(let r of n.sheet.cssRules)o+=r.cssText;n.textContent=o}}),document.body.append(t))}),ro.observe(document.body,{childList:!0})),t.append(e)}var ro;function jl(){Ce?.disconnect(),Ce=null,Gt.clear(),ro?.disconnect(),document.querySelector(".darkreader-style-container")?.remove()}var Xe={"background-color":{customProp:"--darkreader-inline-bgcolor",cssProp:"background-color",dataAttr:"data-darkreader-inline-bgcolor"},"background-image":{customProp:"--darkreader-inline-bgimage",cssProp:"background-image",dataAttr:"data-darkreader-inline-bgimage"},"border-color":{customProp:"--darkreader-inline-border",cssProp:"border-color",dataAttr:"data-darkreader-inline-border"},"border-bottom-color":{customProp:"--darkreader-inline-border-bottom",cssProp:"border-bottom-color",dataAttr:"data-darkreader-inline-border-bottom"},"border-left-color":{customProp:"--darkreader-inline-border-left",cssProp:"border-left-color",dataAttr:"data-darkreader-inline-border-left"},"border-right-color":{customProp:"--darkreader-inline-border-right",cssProp:"border-right-color",dataAttr:"data-darkreader-inline-border-right"},"border-top-color":{customProp:"--darkreader-inline-border-top",cssProp:"border-top-color",dataAttr:"data-darkreader-inline-border-top"},"box-shadow":{customProp:"--darkreader-inline-boxshadow",cssProp:"box-shadow",dataAttr:"data-darkreader-inline-boxshadow"},color:{customProp:"--darkreader-inline-color",cssProp:"color",dataAttr:"data-darkreader-inline-color"},fill:{customProp:"--darkreader-inline-fill",cssProp:"fill",dataAttr:"data-darkreader-inline-fill"},stroke:{customProp:"--darkreader-inline-stroke",cssProp:"stroke",dataAttr:"data-darkreader-inline-stroke"},"outline-color":{customProp:"--darkreader-inline-outline",cssProp:"outline-color",dataAttr:"data-darkreader-inline-outline"},"stop-color":{customProp:"--darkreader-inline-stopcolor",cssProp:"stop-color",dataAttr:"data-darkreader-inline-stopcolor"}},io={background:{customProp:"--darkreader-inline-bg",cssProp:"background",dataAttr:"data-darkreader-inline-bg"},border:{customProp:"--darkreader-inline-border-short",cssProp:"border",dataAttr:"data-darkreader-inline-border-short"},"border-bottom":{customProp:"--darkreader-inline-border-bottom-short",cssProp:"border-bottom",dataAttr:"data-darkreader-inline-border-bottom-short"},"border-left":{customProp:"--darkreader-inline-border-left-short",cssProp:"border-left",dataAttr:"data-darkreader-inline-border-left-short"},"border-right":{customProp:"--darkreader-inline-border-right-short",cssProp:"border-right",dataAttr:"data-darkreader-inline-border-right-short"},"border-top":{customProp:"--darkreader-inline-border-top-short",cssProp:"border-top",dataAttr:"data-darkreader-inline-border-top-short"}},zo=Object.values(Xe),ao={};zo.forEach(({cssProp:e,customProp:t})=>ao[t]=e);var rn=["style","fill","stop-color","stroke","bgcolor","color","background"],At=rn.map(e=>`[${e}]`).join(", ");function Pi(){return zo.concat(Object.values(io)).map(({dataAttr:t,customProp:n,cssProp:o})=>[`[${t}] {`,`  ${o}: var(${n}) !important;`,"}"].join(`
`)).concat(["[data-darkreader-inline-invert] {","    filter: invert(100%) hue-rotate(180deg);","}"]).join(`
`)}function Vl(e){let t=[];return e instanceof Element&&e.matches(At)&&t.push(e),(e instanceof Element||Nr&&e instanceof ShadowRoot||e instanceof Document)&&bo(t,e.querySelectorAll(At)),t}var gt=new Map,an=new Map,No=!0;function Kl(){return No}function Ul(e,t){so(document,e,t),$e(document.documentElement,n=>{so(n.shadowRoot,e,t)})}function so(e,t,n){gt.has(e)&&(gt.get(e).disconnect(),an.get(e).disconnect());let o=new WeakSet;function r(y){Vl(y).forEach(h=>{o.has(h)||(o.add(h),t(h))}),$e(y,h=>{o.has(h)||(o.add(h),n(h.shadowRoot),so(h.shadowRoot,t,n))})}let i=si(e,{onMinorMutations:(y,{additions:h})=>{h.forEach(d=>r(d)),V.matchVariablesAndDependents()},onHugeMutations:()=>{r(e),V.matchVariablesAndDependents()}});gt.set(e,i);let a=0,s=null,c=Qt({seconds:10}),l=Qt({seconds:2}),u=50,f=[],g=null,x=ko(y=>{let h=new Set;y.forEach(d=>{let m=d.target;h.has(m)||rn.includes(d.attributeName)&&(h.add(m),t(m))}),V.matchVariablesAndDependents()}),S=new MutationObserver(y=>{if(g){f.push(...y);return}a++;let h=Date.now();if(s==null)s=h;else if(a>=u){if(h-s<c){g=setTimeout(()=>{s=null,a=0,g=null;let d=f;f=[],x(d)},l),f.push(...y);return}s=h,a=1}x(y)});S.observe(e,{attributes:!0,attributeFilter:rn.concat(zo.map(({dataAttr:y})=>y)),subtree:!0}),an.set(e,S)}function Wl(){No=!0,gt.forEach(e=>e.disconnect()),an.forEach(e=>e.disconnect()),gt.clear(),an.clear(),pt.clear(),Jl()}var Tn=new WeakMap,Rr=new WeakSet,Mn=new WeakMap,Er=["brightness","contrast","grayscale","sepia","mode"];function Xl(e){if(Mn.has(e))return Mn.get(e);let t=!!(e&&(e.getAttribute("class")?.includes("logo")||e.parentElement?.getAttribute("class")?.includes("logo")));return Mn.set(e,t),t}var Ir=null,jt="";function Dl(e){if(e===Ir)return jt;jt="";for(let t=0;t<Er.length;t++){let n=Er[t];jt+=`${n}="${e[n]}" `}return Ir=e,jt}function Pn(e,t){return`${rn.filter(o=>e.hasAttribute(o)).map(o=>`${o}="${e.getAttribute(o)}"`)} ${Dl(t)}`}function Gl(e,t){for(let n=0,o=t.length;n<o;n++){let r=t[n];if(e.matches(r))return!0}return!1}var Ln=32,On=new WeakMap,zn=new WeakMap;function Li(e){if(!e)return null;if(On.has(e))return On.get(e);if(e instanceof SVGSVGElement)return e;let t=e.parentNode,n=Li(t);return On.set(e,n),n}var pt=new Map,Oi=10,wt=new Map,sn=new WeakMap;function Bl(e){e.parentElement&&(wt.size===0&&queueMicrotask(Fl),wt.set(e,e.parentElement))}function Fl(){wt.forEach((e,t)=>{if(t.isConnected||!e.isConnected)return;let n=(sn.get(e)??0)+1;sn.set(e,n),n===Oi&&z("Inline style change causes DOM teardown. Suspending changes for the container",e)}),wt.clear()}function Hl(e){let t=e.parentElement;return t?(sn.get(t)??0)>=Oi:!0}function Jl(){wt.clear(),sn=new WeakMap}function lo(e,t,n,o){if(Hl(e)||e.parentElement?.dataset.nodeViewContent||Pn(e,t)===Tn.get(e))return;let i=new Set(Object.keys(Xe));function a(l,u,f){let g=pt.get(u)?.get(f);if(g){S(g);return}No=!1;let x=wi(u,f,{style:e.style},V,o,Kl);if(!x)return;function S(m){let{customProp:p,dataAttr:b}=Xe[l]??io[l];e.style.setProperty(p,m),e.hasAttribute(b)||e.setAttribute(b,""),Bl(e),i.delete(l)}function y(m){let p=[];function b(E){p.forEach(({property:O})=>{e.style.removeProperty(O)}),E.forEach(({property:O,value:k})=>{k instanceof Promise||e.style.setProperty(O,k)}),p=E}b(m.declarations),m.onTypeChange.addListener(b)}function h(m,p){m.then(b=>{b&&l==="background"&&b.startsWith("var(--darkreader-bg--")&&S(b),b&&l==="background-image"&&((e===document.documentElement||e===document.body)&&b===p&&(b="none"),S(b)),Tn.set(e,Pn(e,t))})}let d=typeof x.value=="function"?x.value(t):x.value;typeof d=="string"?(S(d),pt.has(u)||pt.set(u,new Map),pt.get(u).set(f,d)):d instanceof Promise?h(d,f):typeof d=="object"&&y(d)}if(n.length>0&&Gl(e,n)){i.forEach(l=>{e.removeAttribute(Xe[l].dataAttr)});return}let s=e instanceof SVGElement,c=s?e.ownerSVGElement??(e instanceof SVGSVGElement?e:null):null;if(s&&t.mode===1&&c){if(Rr.has(c))return;if(Xl(c)){Rr.add(c);let l=()=>{let u=c.outerHTML;u=u.replaceAll('<style class="darkreader darkreader--sync" media="screen"></style>',"");let f=`data:image/svg+xml;base64,${btoa(u)}`;yi(f).then(g=>{g.isDark&&g.isTransparent||g.isLarge&&g.isLight&&!g.isTransparent?c.setAttribute("data-darkreader-inline-invert",""):c.removeAttribute("data-darkreader-inline-invert")})};l(),ve()||pn(l);return}}if(e.hasAttribute("bgcolor")){let l=e.getAttribute("bgcolor");(l.match(/^[0-9a-f]{3}$/i)||l.match(/^[0-9a-f]{6}$/i))&&(l=`#${l}`),a("background-color","background-color",l)}if((e===document.documentElement||e===document.body)&&e.hasAttribute("background")&&e.getAttribute("background")!==""){let u=`url("${un(location.href,e.getAttribute("background")??"")}")`;a("background-image","background-image",u)}if(e.hasAttribute("color")&&e.rel!=="mask-icon"){let l=e.getAttribute("color");l.match(/^[0-9a-f]{3}$/i)||l.match(/^[0-9a-f]{6}$/i)?l=`#${l}`:l.match(/^#?[0-9a-f]{4}$/i)&&(l=`#${l.startsWith("#")?l.substring(1):l}00`),a("color","color",l)}if(s){if(e.hasAttribute("fill")){let l=e.getAttribute("fill");if(l!=="none"&&l!=="currentColor")if(e instanceof SVGTextElement)a("fill","color",l);else{let u=()=>{let f=!1,g=Li(e);if(!g)return;if(zn.has(g))f=zn.get(g);else{let S=g.getBoundingClientRect();f=S.width*S.height<=Ln**2,zn.set(g,f)}let x;if(f)x=!1;else{let{width:S,height:y}=e.getBoundingClientRect();x=S>Ln||y>Ln}a("fill",x?"background-color":"color",l)};hn()?u():So(u)}}e.hasAttribute("stop-color")&&a("stop-color","background-color",e.getAttribute("stop-color"))}if(e.hasAttribute("stroke")){let l=e.getAttribute("stroke");a("stroke",e instanceof SVGLineElement||e instanceof SVGTextElement?"border-color":"color",l)}e.style&&Be(e.style,(l,u)=>{if(l==="background-image"&&u.includes("url")){(e===document.documentElement||e===document.body)&&a(l,l,u);return}if(Xe.hasOwnProperty(l)||l.startsWith("--")&&!ao[l])a(l,l,u);else if(io[l]&&u.includes("var("))a(l,l,u);else{let f=ao[l];if(f&&!e.style.getPropertyValue(f)&&!e.hasAttribute(f)){if(f==="background-color"&&e.hasAttribute("bgcolor"))return;e.style.setProperty(l,"")}}}),e.style&&e instanceof SVGTextElement&&e.style.fill&&a("fill","color",e.style.getPropertyValue("fill")),e.getAttribute("style")?.includes("--")&&V.addInlineStyleForMatching(e.style),H(i,l=>{e.removeAttribute(Xe[l].dataAttr)}),Tn.set(e,Pn(e,t))}var zi="theme-color",Ni=`meta[name="${zi}"]`,mt=null,pe=null;function Cr(e,t){mt=mt||e.content;let n=W(mt);if(!n){z("Invalid meta color",n);return}e.content=X(n,t,!1)}function ql(e){let t=document.querySelector(Ni);t?Cr(t,e):(pe&&pe.disconnect(),pe=new MutationObserver(n=>{e:for(let o=0;o<n.length;o++){let{addedNodes:r}=n[o];for(let i=0;i<r.length;i++){let a=r[i];if(a instanceof HTMLMetaElement&&a.name===zi){pe.disconnect(),pe=null,Cr(a,e);break e}}}}),pe.observe(document.head,{childList:!0}))}function Yl(){pe&&(pe.disconnect(),pe=null);let e=document.querySelector(Ni);e&&mt&&(e.content=mt)}var re={invert:new Set,dim:new Set,none:new Set};function Ql(e,t){if(!e)return;let n=re[t],o=!1;return e.split(",").forEach(r=>{let i=r.trim();if(!(!i||n.has(i))){for(let a of n)if(Tr(i,a))return;for(let a of[...n])Tr(a,i)&&n.delete(a);n.add(i),o=!0}}),o}function Tr(e,t){let n=t.length,o=e.length;if(o<n||!e.startsWith(t))return!1;if(o===n)return!0;let r=n,i=e[r];if(i==="."||i===":"||i==="#"||i==="["||i===">")return!0;if(i==="+"||i==="~"||i!==" ")return!1;for(;e[r]===" ";)r++;return e[r]!=="+"&&e[r]!=="~"}function _l(){re.invert.clear(),re.dim.clear(),re.none.clear()}var $l=/\/\*[\s\S]*?\*\//g;function Zi(e){return e.replace($l,"")}var ln=!1;document.addEventListener("__darkreader__inlineScriptsAllowed",()=>ln=!0,{once:!0});function ec(e,t,n,o){let r=null;function i(){c(),ln&&e.sheet||(r=tc(e,t,n,o),r.start())}let a=!1;function s(){if(ln=!0,r?.stop(),a)return;function f(){a=!1,!o()&&n()}a=!0,queueMicrotask(f)}function c(){e.addEventListener("__darkreader__updateSheet",s)}function l(){e.removeEventListener("__darkreader__updateSheet",s)}function u(){l(),r?.stop()}return{start:i,stop:u}}function tc(e,t,n,o){let r=null,i=null;function a(){let u=t();return u?u.length:null}function s(){return a()!==r}function c(){r=a(),l();let u=()=>{let f=o();if(!f&&s()&&(r=a(),n()),f||ln&&e.sheet){l();return}i=requestAnimationFrame(u)};u()}function l(){i&&cancelAnimationFrame(i)}return{start:c,stop:l}}var nc='style, link[rel*="stylesheet" i]:not([disabled])',co=[];function Mr(e){co=e||[]}function oc(e){if(!e||co.length===0)return!1;for(let t of co)if(t.startsWith("^")){if(e.startsWith(t.slice(1)))return!0}else if(t.endsWith("$")){if(e.endsWith(t.slice(0,-1)))return!0}else if(e.includes(t))return!0;return!1}var rc=["account.containerstore.com","containerstore.com","www.onet.pl"];function ji(e){return(e instanceof HTMLStyleElement||e instanceof SVGStyleElement&&!rc.includes(location.hostname)||e instanceof HTMLLinkElement&&!!e.rel&&e.rel.toLowerCase().includes("stylesheet")&&!!e.href&&!e.disabled&&(ie?!e.href.startsWith("moz-extension://"):!0)&&!oc(e.href))&&!e.classList.contains("darkreader")&&!li.includes(e.media.toLowerCase())&&!e.classList.contains("stylus")}function Ae(e,t=[],n=!0){return ji(e)?t.push(e):(e instanceof Element||Nr&&e instanceof ShadowRoot||e===document)&&(H(e.querySelectorAll(nc),o=>Ae(o,t,!1)),n&&(e.children?.length>0||e.shadowRoot)&&$e(e,o=>Ae(o.shadowRoot,t,!1))),t}var Pr=new WeakSet,xe=new WeakMap,Lr=new WeakMap,ic=0,qe=new Map;function ac(){qe.clear()}function sc(e,{update:t,loadingStart:n,loadingEnd:o}){let r=Mi(),i=null;if(r==="next"){let L=[],A=e;for(;(A=A.nextElementSibling)&&A.matches(".darkreader");)L.push(A);i=L.find(C=>C.matches(".darkreader--sync")&&!Pr.has(C))||null}let a=null,s=!1,c=!0,l=()=>s,u=Ti(),f=new MutationObserver(L=>{if(L.some(A=>A.type==="characterData")&&x()){let A=(e.textContent??"").trim();O(A,location.href).then(t)}else t()}),g={attributes:!0,childList:!0,subtree:!0,characterData:!0};function x(){return e instanceof HTMLStyleElement?Zi(e.textContent??"").trim().match(ui):!1}function S(L,A){let C=!1;if(L){let P;e:for(let I=0,N=L.length;I<N;I++)if(P=L[I],P.href)if(A){if(!P.href.startsWith("https://fonts.googleapis.com/")&&P.href.startsWith("http")&&!P.href.startsWith(location.origin)){C=!0;break e}}else{C=!0;break e}}return C}function y(){if(xe.has(e))return xe.get(e).cssRules;if(x())return null;let L=se();return e instanceof HTMLLinkElement&&!Ca(e.href)&&S(L,!1)||S(L,!0)?null:(!L&&z("[getRulesSync] cssRules is null, trying again."),L)}function h(){r==="next"?e.nextSibling!==i&&e.parentNode.insertBefore(i,e.nextSibling):r==="away"&&Oo(i)}function d(){i=e instanceof SVGStyleElement?document.createElementNS("http://www.w3.org/2000/svg","style"):document.createElement("style"),i.classList.add("darkreader"),i.classList.add("darkreader--sync"),i.media="screen",e.title&&(i.title=e.title),Pr.add(i)}let m=!1,p=!1,b=++ic;async function E(){let L,A;if(e instanceof HTMLLinkElement){let[C,P]=v();if(P&&z(P),qt&&!e.sheet||!qt&&!C&&!P||K(P)){try{ue(`Linkelement ${b} is not loaded yet and thus will be await for`,e),await lc(e,b)}catch(I){z(I),p=!0}if(s)return null;[C,P]=v(),P&&z(P)}if(C&&!S(C,!1))return C;try{L=await Vi(e.href)}catch(I){z(I),L=""}if(A=en(e.href),s)return null}else if(x())L=e.textContent.trim(),A=en(location.href);else return null;return await O(L,A),xe.has(e)?xe.get(e).cssRules:null}async function O(L,A){if(L)try{let C=await Ki(L,A);if(xe.has(e))(Lr.get(e)??0)<C.length&&(xe.get(e).replaceSync(C),Lr.set(e,C.length));else{let P=new CSSStyleSheet;P.replaceSync(C),xe.set(e,P)}}catch(C){z(C)}}function k(L){let A=y();return A?{rules:A}:L.secondRound?(z("Detected dead-lock at details(), returning early to prevent it."),null):(m||p||(m=!0,n(),E().then(C=>{m=!1,o(),C&&t()}).catch(C=>{z(C),m=!1,o()})),null)}let R=!1;function w(L,A){let C=y();if(!C)return;s=!1;function P(M){if(M)for(let Z=M.cssRules.length-1;Z>=0;Z--)M.deleteRule(Z)}function I(){i||d(),a&&a.stop(),h(),i.sheet==null&&(i.textContent="");let M=i.sheet;return P(M),a?a.run():r==="next"&&(a=ii(i,"prev-sibling",()=>{R=!0,N()})),i.sheet}function N(){let M=R;R=!1,u.modifySheet({prepareSheet:I,sourceCSSRules:C,theme:L,ignoreImageAnalysis:A,force:M,isAsyncCancelled:l}),c=!i.sheet||i.sheet.cssRules.length===0,u.shouldRebuildStyle()&&So(()=>t())}N()}function v(){try{return e.sheet==null?[null,null]:[e.sheet.cssRules,null]}catch(L){return[null,L]}}function K(L){return L&&L.message&&L.message.includes("loading")}function se(){let[L,A]=v();return A?(z(A),null):L}let U=ec(e,se,t,l);function ne(){f.disconnect(),s=!0,a&&a.stop(),U.stop()}function $(){if(ne(),xe.delete(e),Se(i),o(),qe.has(b)){let L=qe.get(b);qe.delete(b),L&&L()}}function ze(){f.observe(e,g),e instanceof HTMLStyleElement&&U.start()}let et=10,Ne=0;function It(){if(i){if(Ne++,Ne>et){z("Style sheet was moved multiple times",e);return}z("Restore style",i,e),h(),a&&a.skip(),c||(R=!0,t())}}return{details:k,render:w,pause:ne,destroy:$,watch:ze,restore:It}}async function lc(e,t){return new Promise((n,o)=>{let r=()=>{e.removeEventListener("load",i),e.removeEventListener("error",a),qe.delete(t)},i=()=>{r(),n()},a=()=>{r(),o(`Linkelement ${t} couldn't be loaded. ${e.href}`)};qe.set(t,()=>{r(),o()}),e.addEventListener("load",i,{passive:!0}),e.addEventListener("error",a,{passive:!0}),e.href||a()})}function cc(e){return Ao(e.substring(7).trim().replace(/;$/,"").replace(/screen$/,""))}async function Vi(e){if(e.startsWith("data:"))return await(await fetch(e)).text();let t=Ks(e);if(t)return t;let n=new URL(e),o;return n.origin===location.origin?o=await ba(e,"text/css",location.origin):o=await xi({url:e,responseType:"text",mimeType:"text/css",origin:location.origin}),n.origin===location.origin&&Vs(e,o),o}var dc=32;async function Ki(e,t,n=new Map,o=0){if(o>dc)return"";e=Zi(e),e=gs(e),e=ps(e,t);let r=va(ui,e),i=null,a=!1,s=0;for(let c of r){let l,u=i?i.offset+i.text.length:0,f=c.offset,g=e.indexOf("{",u),x=e.indexOf("}",u);if(a||g>=0&&g<f&&x>=0&&x<f)a=!0,l="";else{let S=cc(c.text),y=un(t,S);if(n.has(y))l=n.get(y);else try{l=await Vi(y),n.set(y,l),l=await Ki(l,en(y),n,o+1)}catch(h){z(h),l=""}}e=e.substring(0,c.offset+s)+l+e.substring(c.offset+c.text.length+s),s+=l.length-c.text.length,i=c}return e=e.trim(),e}var Ui=new Set,Te=new Map,vt;function uc(e){return!!(e.tagName.includes("-")||e.getAttribute("is"))}function Wi(e){let t=e.tagName.toLowerCase();if(!t.includes("-")){let n=e.getAttribute("is");if(n)t=n;else return}Te.has(t)||(Te.set(t,new Set),fc(t).then(()=>{if(vt){let n=Te.get(t);Te.delete(t),vt(Array.from(n))}})),Te.get(t).add(e)}function Vt(e){ha&&H(e.querySelectorAll(":not(:defined)"),Wi)}var Zo=!1;document.addEventListener("__darkreader__inlineScriptsAllowed",()=>{Zo=!0},{once:!0,passive:!0});var Kt=new Set;document.addEventListener("__darkreader__shadowDomAttaching",e=>{let t=e.target;Kt.size===0&&queueMicrotask(()=>{let n=[...Kt].filter(o=>o.shadowRoot);vt?.(n),Kt.clear()}),Kt.add(t)});var Ye=new Map;function Xi(e){Zo=!0;let t=e.detail.tag;if(Ui.add(t),Ye.has(t)){let n=Ye.get(t);Ye.delete(t),n.forEach(o=>o())}}async function fc(e){if(!Ui.has(e))return new Promise(t=>{if(window.customElements&&typeof customElements.whenDefined=="function")customElements.whenDefined(e).then(()=>t());else if(Zo)Ye.has(e)?Ye.get(e).push(t):Ye.set(e,[t]),document.dispatchEvent(new CustomEvent("__darkreader__addUndefinedResolver",{detail:{tag:e}}));else{let n=()=>{let o=Te.get(e);o&&o.size>0&&(o.values().next().value.matches(":defined")?t():requestAnimationFrame(n))};requestAnimationFrame(n)}})}function pc(e){vt=e}function hc(){vt=null,Te.clear(),document.removeEventListener("__darkreader__isDefined",Xi)}var Bt=[],De,uo;function gc(e,t,n){Di();let o=new WeakMap,r=d=>(o.has(d)||o.set(d,new Set),o.get(d));e.forEach(d=>{let m=d;for(;m=m.parentNode;)if(m===document||m.nodeType===Node.DOCUMENT_FRAGMENT_NODE){r(m).add(d);break}});let i=new WeakMap,a=new WeakMap;function s(d){i.set(d,d.previousElementSibling),a.set(d,d.nextElementSibling)}function c(d){i.delete(d),a.delete(d)}function l(d){return d.previousElementSibling!==i.get(d)||d.nextElementSibling!==a.get(d)}e.forEach(s);function u(d,m){let{createdStyles:p,removedStyles:b,movedStyles:E}=m;p.forEach(k=>s(k)),E.forEach(k=>s(k)),b.forEach(k=>c(k));let O=r(d);p.forEach(k=>O.add(k)),b.forEach(k=>O.delete(k)),p.size+b.size+E.size>0&&t({created:Array.from(p),removed:Array.from(b),moved:Array.from(E),updated:[]})}function f(d,{additions:m,moves:p,deletions:b}){let E=new Set,O=new Set,k=new Set;m.forEach(w=>Ae(w).forEach(v=>E.add(v))),b.forEach(w=>Ae(w).forEach(v=>O.add(v))),p.forEach(w=>Ae(w).forEach(v=>k.add(v))),u(d,{createdStyles:E,removedStyles:O,movedStyles:k});let R=new Set;m.forEach(w=>{w.parentElement&&R.add(w.parentElement),w.previousElementSibling&&R.add(w.previousElementSibling),h(w),Vt(w)}),R.forEach(w=>{w.shadowRoot&&!De.has(w)&&(y(w),h(w.shadowRoot))}),m.forEach(w=>uc(w)&&Wi(w)),m.forEach(w=>no(w))}function g(d){let m=new Set(Ae(d)),p=new Set,b=new Set,E=new Set,O=r(d);m.forEach(k=>{O.has(k)||p.add(k)}),O.forEach(k=>{m.has(k)||b.add(k)}),m.forEach(k=>{!p.has(k)&&!b.has(k)&&l(k)&&E.add(k)}),u(d,{createdStyles:p,removedStyles:b,movedStyles:E}),h(d),Vt(d),no(d)}function x(d){let m=new Set,p=new Set;d.forEach(b=>{let{target:E}=b;E.isConnected&&(ji(E)?m.add(E):E instanceof HTMLLinkElement&&E.disabled&&p.add(E))}),m.size+p.size>0&&t({updated:Array.from(m),created:[],removed:Array.from(p),moved:[]})}function S(d){if(De.has(d))return;let m=si(d,{onMinorMutations:f,onHugeMutations:g}),p=new MutationObserver(x);p.observe(d,{attributeFilter:["rel","disabled","media","href"],subtree:!0}),Bt.push(m,p),De.add(d)}function y(d){let{shadowRoot:m}=d;m==null||De.has(m)||(S(m),n(m))}function h(d){$e(d,y)}S(document),h(document.documentElement),pc(d=>{d=d.filter(p=>!uo.has(p));let m=[];d.forEach(p=>bo(m,Ae(p.shadowRoot))),t({created:m,updated:[],removed:[],moved:[]}),d.forEach(p=>{let{shadowRoot:b}=p;b!=null&&(y(p),h(b),Vt(b))}),d.forEach(p=>uo.add(p))}),document.addEventListener("__darkreader__isDefined",Xi),Vt(document),pn(()=>{H(document.body.children,d=>{d.shadowRoot&&!De.has(d)&&(y(d),h(d.shadowRoot))})})}function mc(){Bt.forEach(e=>e.disconnect()),Bt.splice(0,Bt.length),De=new WeakSet,uo=new WeakSet}function Di(){mc(),hc()}function bc(e,t,n){gc(e,t,n)}function xc(){Di()}var jo=ti(),te=new Map,fo=[],T=null,j=null,Gi=null,ae=[],Rt=[],Qe=new WeakMap;function D(e,t=document.head||document){let n=t.querySelector(`.${e}`);Qe.has(t)||Qe.set(t,new Map);let o=Qe.get(t);return n?o.set(e,n):o.has(e)?n=o.get(e):(n=document.createElement("style"),n.classList.add("darkreader"),n.classList.add(e),n.media="screen",n.textContent="",o.set(e,n)),n}var bt=new Map;function yc(e,t,n){bt.has(t)&&bt.get(t).stop(),bt.set(t,ii(e,"head",n))}function kc(){H(bt.values(),e=>e.stop()),bt.clear()}function ye(e,t,n,o){let r=Mi();r==="next"?(document.head.insertBefore(e,t?t.nextSibling:document.head.firstChild),yc(e,n,o)):r==="away"&&Oo(e)}var Bi=ko(()=>{let e=document.head?.querySelector(".darkreader--invert");e&&cn(e),dn.forEach(t=>{let n=t.querySelector(".darkreader--invert");n&&cn(n)})});dl((e,t)=>{Ql(e,t)&&Bi()});function cn(e){if(!T)return;let t=[],n=(i,a)=>{!a||i.length===0||t.push([`${i.join(", ")} {`,`    filter: ${a} !important;`,"}"].join(`
`))},o=i=>{T.mode===0||i.length===0||t.push([`${i.join(", ")} {`,"    color: black !important;","}",`${i.map(a=>`${a} > *`).join(", ")} {`,"    filter: invert(100%) hue-rotate(180deg) !important;","}"].join(`
`))},r=i=>{T.mode===0||i.length===0||t.push([`${i.join(", ")} {`,"    filter: none !important;","    color: var(--darkreader-neutral-text) !important;","}",`${i.map(a=>`${a} > *`).join(", ")} {`,"    filter: none !important;","}"].join(`
`))};if(j&&Array.isArray(j.invert)&&j.invert.length>0||re.invert.size>0){let i=[...re.invert],a=[...j?.invert??[],...i],s=_o({...T,contrast:T.mode===0?T.contrast:we(T.contrast-10,0,100)});if(n(a,s),o(i),re.none.size>0){let c=[...re.none];if(r(c),T.mode===1){let l=[];c.forEach(u=>{i.forEach(f=>l.push(`${u} > ${f}`))}),n(l,s)}}}re.dim.size>0&&n([...re.dim],_o({...T,brightness:we(T.brightness-10,5,200),sepia:we(T.sepia+10,0,100)})),e.textContent=t.join(`
`)}function Sc(){let e=D("darkreader--fallback",document);e.textContent=To(T,{strict:!0}),ye(e,null,"fallback");let t=D("darkreader--user-agent");t.textContent=al(T,Gi,T.styleSystemControls),ye(t,e,"user-agent");let n=D("darkreader--text");T.useFont||T.textStroke>0?n.textContent=Ma(T):n.textContent="",ye(n,t,"text");let o=D("darkreader--invert");cn(o),ye(o,n,"invert");let r=D("darkreader--inline");r.textContent=Pi(),ye(r,o,"inline");let i=D("darkreader--variables"),a=T?.selectionColor?vi(T):null,s=X(W("#ffffff"),T),c=q(W("#000000"),T);i.textContent=[":root {",`   --darkreader-neutral-background: ${s};`,`   --darkreader-neutral-text: ${c};`,`   --darkreader-selection-background: ${a?.backgroundColorSelection??"initial"};`,`   --darkreader-selection-text: ${a?.foregroundColorSelection??"initial"};`,"}"].join(`
`),ye(i,r,"variables",()=>dr(i.sheet)),dr(i.sheet);let l=D("darkreader--root-vars");ye(l,i,"root-vars");let u=!(j&&j.disableStyleSheetsProxy),f=!(j&&j.disableCustomElementRegistryProxy);document.dispatchEvent(new CustomEvent("__darkreader__cleanUp")),document.dispatchEvent(new CustomEvent("__tka_theme_proxy_start"));let g=D("darkreader--override");g.textContent=j&&j.css?Hi(j.css):"",ye(g,document.head.lastChild,"override")}var dn=new Set;function Fi(e){let t=D("darkreader--inline",e);t.textContent=Pi(),e.insertBefore(t,e.firstChild);let n=D("darkreader--override",e);n.textContent=j&&j.css?Hi(j.css):"",e.insertBefore(n,t.nextSibling);let o=D("darkreader--invert",e);cn(o),e.insertBefore(o,n.nextSibling),dn.add(e)}function Ac(e){new MutationObserver((n,o)=>{o.disconnect();for(let{type:r,removedNodes:i}of n)if(r==="childList"){for(let{nodeName:a,className:s}of i)if(a==="STYLE"&&["darkreader darkreader--inline","darkreader darkreader--override","darkreader darkreader--invert"].includes(s)){Fi(e);return}}}).observe(e,{childList:!0})}function po(e){let t=e.firstChild===null;Fi(e),t&&Ac(e)}function Hi(e){return e.replace(/\${(.+?)}/g,(t,n)=>{let o=W(n);return o?ei(o.r,o.g,o.b)>.5?X(o,T):q(o,T):(z("Couldn't parse CSSTemplate's color."),n)})}function Vo(){let e=Qe.get(document.head)?.get("darkreader--fallback")||Qe.get(document)?.get("darkreader--fallback")||document.querySelector(".darkreader--fallback");e&&(e.textContent="")}function wc(){let t=Ae(document).filter(r=>!te.has(r)).map(r=>Ji(r));t.map(r=>r.details({secondRound:!1})).filter(r=>r&&r.rules.length>0).forEach(r=>{V.addRulesForMatching(r.rules)}),V.matchVariablesAndDependents(),V.setOnRootVariableChange(()=>{let r=D("darkreader--root-vars");V.putRootVars(r,T)});let n=D("darkreader--root-vars");V.putRootVars(n,T),te.forEach(r=>r.render(T,ae)),ge.size===0&&Vo(),t.forEach(r=>r.watch());let o=La(document.querySelectorAll(At));$e(document.documentElement,r=>{po(r.shadowRoot);let i=r.shadowRoot.querySelectorAll(At);i.length>0&&bo(o,i)}),o.forEach(r=>lo(r,T,Rt,ae)),Qi(document),V.matchVariablesAndDependents(),jc()}var vc=0,ge=new Set;function Ji(e){let t=++vc;function n(){if(!ve()||!ri()){ge.add(t),ue(`Current amount of styles loading: ${ge.size}`);let a=D("darkreader--fallback");a.textContent||(a.textContent=To(T,{strict:!1}))}}function o(){ge.delete(t),ue(`Removed loadingStyle ${t}, now awaiting: ${ge.size}`),ge.size===0&&ve()&&Vo()}function r(){let a=i.details({secondRound:!0});a&&(V.addRulesForMatching(a.rules),V.matchVariablesAndDependents(),i.render(T,ae))}let i=sc(e,{update:r,loadingStart:n,loadingEnd:o});return te.set(e,i),i}function qi(e){let t=te.get(e);t&&(t.destroy(),te.delete(e))}function Yi(){if(ge.size===0){Vo();return}z("DOM is ready, but still have styles being loaded.",ge)}function Or(){wc(),Ic()}function Rc(){Sc(),!ri()&&!T.immediateModify?ss(Or):Or(),ql(T)}function Ec(e){return e?.wrappedJSObject??e}function Qi(e){if(Ll(e)){H(ie?Ec(e.adoptedStyleSheets):e.adoptedStyleSheets,n=>{V.addRulesForMatching(n.cssRules)});let t=zl(e);fo.push(t),t.render(T,ae),t.watch(n=>{n.forEach(o=>{V.addRulesForMatching(o.cssRules)}),V.matchVariablesAndDependents(),t.render(T,ae)})}}function Ic(){let e=Array.from(te.keys());bc(e,({created:t,updated:n,removed:o,moved:r})=>{let i=o,a=t.concat(n).concat(r).filter(l=>!te.has(l)),s=r.filter(l=>te.has(l));i.forEach(l=>qi(l));let c=a.map(l=>Ji(l));c.map(l=>l.details({secondRound:!1})).filter(l=>l&&l.rules.length>0).forEach(l=>{V.addRulesForMatching(l.rules)}),V.matchVariablesAndDependents(),c.forEach(l=>l.render(T,ae)),c.forEach(l=>l.watch()),s.forEach(l=>te.get(l).restore())},t=>{po(t),Qi(t)}),Ul(t=>{if(lo(t,T,Rt,ae),t===document.documentElement&&(t.getAttribute("style")||"").includes("--")){V.matchVariablesAndDependents();let o=D("darkreader--root-vars");V.putRootVars(o,T)}},t=>{po(t);let n=t.querySelectorAll(At);n.length>0&&H(n,o=>lo(o,T,Rt,ae))}),pn(Yi),Uc()}function Cc(){te.forEach(e=>e.pause()),kc(),xc(),Wl(),ai(Yi),cs()}var xt,Ue=null;function Tc(){xt=new MutationObserver(()=>{document.querySelector('meta[name="darkreader-lock"]')&&(xt.disconnect(),Ko())}),xt.observe(document.head,{childList:!0,subtree:!0})}function Mc(){let e=document.createElement("meta");e.name="darkreader",e.content=jo,document.head.appendChild(e)}function Pc(){return document.querySelector('meta[name="darkreader-lock"]')!=null}function Lc(){let e=document.querySelector('meta[name="darkreader"]');return e?e.content!==jo:(Mc(),Tc(),!1)}var Oc=2;function zc({success:e,failure:t}){if(--Oc<=0){t();return}let n=document.head.querySelector('meta[name="darkreader"]');if(!n||n.content===jo)return;let o=document.createElement("meta");o.name="darkreader-lock",document.head.append(o),queueMicrotask(()=>{o.remove(),e()})}function Nc(){if(document.documentElement.hasAttribute("data-wp-dark-mode-preset")){let e=()=>{document.dispatchEvent(new CustomEvent("__darkreader__disableConflictingPlugins")),document.documentElement.classList.remove("wp-dark-mode-active"),document.documentElement.removeAttribute("data-wp-dark-mode-active")};e(),new MutationObserver(()=>{(document.documentElement.classList.contains("wp-dark-mode-active")||document.documentElement.hasAttribute("data-wp-dark-mode-active"))&&e()}).observe(document.documentElement,{attributes:!0,attributeFilter:["class","data-wp-dark-mode-active"]})}}function Zc(e){let t=document.createElement("div");t.classList.add("darkreader"),t.classList.add("darkreader--pdf-overlay"),t.style.backdropFilter="invert(100%) contrast(90%)",t.style.pointerEvents="none",t.style.position="fixed",t.style.left="0px",t.style.right="0px",t.style.bottom="0px",t.style.top="56px",e.append(t),Oe.push(()=>{t.remove()})}function jc(){if(!document.body||!G.dom)return;let e=G.dom.openOrClosedShadowRoot(document.body);if(!(!e||!e.querySelector('link[href$="/pdf_embedder.css"]')))if(Jt&&!fa)Zc(e);else{let t=new CSSStyleSheet;t.replaceSync('[type="application/pdf"] { filter: invert(1) contrast(0.9); }'),e.adoptedStyleSheets.push(t),Oe.push(()=>{let n=e.adoptedStyleSheets.indexOf(t);n>=0&&e.adoptedStyleSheets.splice(n,1)})}}var ht=null,Ft=null;function Vc(e,t,n){T=e,j=t;let o=["brightness","contrast","darkSchemeBackgroundColor","darkSchemeTextColor","grayscale","lightSchemeBackgroundColor","lightSchemeTextColor","sepia"];if(ht&&Ft){let i=new Set([...Object.keys(T),...Object.keys(ht)]),a=!0;for(let s of i)if(T[s]!==ht[s]&&!o.includes(s)){a=!1;break}if(a&&JSON.stringify(j)!==JSON.stringify(Ft)&&(a=!1),a){let s=As();Hn(),s.background.forEach(c=>X(c,T)),s.text.forEach(c=>q(c,T)),s.border.forEach(c=>_e(c,T));return}Hn()}j?(ae=Array.isArray(j.ignoreImageAnalysis)?j.ignoreImageAnalysis:[],Rt=Array.isArray(j.ignoreInlineStyle)?j.ignoreInlineStyle:[],Mr(Array.isArray(j.ignoreCSSUrl)?j.ignoreCSSUrl:[])):(ae=[],Rt=[],Mr([])),T.immediateModify&&ls(()=>!0),Gi=n;let r=()=>{let i=()=>{Nc(),document.documentElement.setAttribute("data-darkreader-mode","dynamic"),document.documentElement.setAttribute("data-darkreader-scheme",T.mode?"dark":"dimmed"),Rc()},a=()=>{Ko()};Pc()?Se(document.querySelector(".darkreader--fallback")):Lc()?zc({success:i,failure:a}):i()};if(document.head)r();else{if(!ie){let i=D("darkreader--fallback");document.documentElement.appendChild(i),i.textContent=To(T,{strict:!0})}Ue?.disconnect(),Ue=new MutationObserver(()=>{document.head&&(Ue?.disconnect(),r())}),Oe.push(()=>{Ue?.disconnect(),Ue=null}),Ue.observe(document,{childList:!0,subtree:!0})}ht=T,Ft=j}function Kc(){document.dispatchEvent(new CustomEvent("__darkreader__cleanUp")),Se(document.head.querySelector(".darkreader--proxy"))}var Oe=[],Nn=!1;function Uc(){if(Nn)return;let e=window.documentPictureInPicture;if(!e)return;Nn=!0;function t(){let a=[];for(let s of document.styleSheets)try{let c=Array.from(s.cssRules);c.some(l=>l instanceof CSSFontFaceRule)&&c.forEach(l=>a.push(l.cssText))}catch{}return a.join(`
`)}function n(){return e.window?.document??null}function o(a){let s=n();if(!s||s.querySelector(".darkreader--font-fix"))return;let c=s.createElement("style");c.classList.add("darkreader"),c.classList.add("darkreader--font-fix"),c.textContent=a,(s.head||s.documentElement).appendChild(c)}function r(){n()?.querySelector(".darkreader--font-fix")?.remove()}function i(){let a=n();if(!a||a.querySelector('meta[name="darkreader-lock"]'))return;let s=t();if(!s)return;o(s);let c=new MutationObserver(()=>{if(a.querySelector('meta[name="darkreader-lock"]')){c.disconnect(),e.removeEventListener("enter",i),r();return}o(s)});c.observe(a,{childList:!0,subtree:!0}),Oe.push(()=>c.disconnect()),e.window.addEventListener("unload",()=>c.disconnect())}e.addEventListener("enter",i),Oe.push(()=>{e.removeEventListener("enter",i),r(),Nn=!1})}function Ko(){if(document.documentElement.removeAttribute("data-darkreader-mode"),document.documentElement.removeAttribute("data-darkreader-scheme"),Wc(),Se(document.querySelector(".darkreader--fallback")),document.head){let e=[".darkreader--user-agent",".darkreader--text",".darkreader--invert",".darkreader--inline",".darkreader--override",".darkreader--variables",".darkreader--root-vars",'meta[name="darkreader"]'];Yl(),e.forEach(t=>Se(document.head.querySelector(t))),Qe=new WeakMap,Kc()}dn.forEach(e=>{Se(e.querySelector(".darkreader--inline")),Se(e.querySelector(".darkreader--override"))}),dn.clear(),H(te.keys(),e=>qi(e)),ge.clear(),ac(),H(document.querySelectorAll(".darkreader"),Se),jl(),fo.forEach(e=>e.destroy()),fo.splice(0),xt&&xt.disconnect(),Bi.cancel(),Oe.forEach(e=>e()),Oe.splice(0)}function Wc(){V.clear(),dt.clear(),_l(),oi(),Cc(),Sl(),Za(),ys(),ht=null,Ft=null}var _i=!1,Xc=(()=>{try{return window.self!==window.top}catch(e){return console.warn(e),!0}})();function $i(e={},t=null){let n={...Xr,...e};if(n.engine!==kt.dynamicTheme)throw new Error("Theme engine is not supported.");Vc(n,t,Xc),_i=!0}function ea(){Ko(),_i=!1}var Yc=typeof matchMedia=="function"?matchMedia("(prefers-color-scheme: dark)"):void 0;var ta=Sa;var na=`.tka-cell { box-sizing:border-box!important; width:144px!important; min-width:144px!important; max-width:144px!important; padding:0 12px!important; vertical-align:middle!important; text-align:left!important; }
.tka-cell:not(.tka-head) { font:inherit; color:inherit; }
.tka-indicator > span:last-child {font:inherit!important;color:inherit!important;letter-spacing:inherit}
.tka-rollup {cursor:default!important}
.tka-rollup:hover {color:inherit!important}
div.tka-cell { display:flex!important; align-items:center!important; flex:0 0 144px!important; }
.tka-head { white-space:nowrap!important; }
.tka-head-inner,.tka-head-label { font:inherit!important; color:inherit!important; letter-spacing:inherit; text-transform:inherit; }
.tka-head-inner { display:flex; align-items:center; gap:5px; }
.tka-indicator, .tka-refresh, .tka-error { border:0!important; background:transparent!important; color:inherit!important; font:inherit!important; cursor:pointer!important; padding:6px 0!important; box-shadow:none!important; text-transform:none!important; min-width:0!important; }
.tka-indicator { display:inline-flex!important; align-items:center!important; gap:8px!important; white-space:nowrap!important; font-variant-numeric:tabular-nums!important; }
.tka-indicator.tka-completed-indicator {display:flex!important;width:100%!important;justify-content:center!important}
.tka-indicator:hover, .tka-refresh:hover, .tka-error:hover { color:#116aa8!important; }
.tka-indicator:focus-visible, .tka-refresh:focus-visible, .tka-error:focus-visible { outline:2px solid #247bb8!important; outline-offset:3px!important; border-radius:3px; }
.tka-refresh { font-size:17px!important; padding:3px 5px!important; }
.tka-circle { display:inline-block; width:22px; height:22px; border-radius:50%; background:conic-gradient(#247bb8 var(--tka-progress),#e2e7ec 0); position:relative; flex:none; }
.tka-circle::after { content:''; position:absolute; inset:4px; background:#fff; border-radius:50%; }
.tka-bar { display:inline-block; width:62px; height:7px; border-radius:5px; overflow:hidden; background:#e2e7ec; flex:none; }
.tka-bar-fill { display:block; height:100%; width:var(--tka-progress); background:#247bb8; }
.tka-complete-tick {display:inline-block;width:20px;height:20px;flex:none;position:relative;border-radius:50%;background:#247bb8}
.tka-complete-tick::after {content:'';position:absolute;left:7px;top:4px;width:5px;height:9px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg);box-sizing:border-box}
.tka-error { color:#a33832!important; font-size:11px!important; }
.tka-loading { color:#6b7580; font-size:11px; }
.tka-dialog { box-sizing:border-box; width:min(440px,calc(100vw - 32px)); max-height:80vh; margin:auto; border:1px solid #d9e1e7; border-radius:12px; padding:0; background:#fff; color:#263441; font:14px/1.5 system-ui,sans-serif; box-shadow:0 16px 60px #0003; }
.tka-dialog::backdrop { background:#14233455; }
.tka-dialog header { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 20px; border-bottom:1px solid #e5e9ed; }
.tka-dialog h2 { margin:0; font-size:16px; font-weight:600; }
.tka-dialog button { font:inherit; cursor:pointer; border:1px solid #cad4dd; background:#fff; border-radius:6px; padding:6px 10px; color:#263441; }
.tka-dialog button:focus-visible { outline:2px solid #247bb8; outline-offset:2px; }
.tka-dialog .tka-dialog-body { padding:18px 20px; }
.tka-dialog .tka-dialog-meta { color:#62717c; margin:0 0 12px; font-size:12px; }
.tka-dialog h3 { font-size:13px; margin:16px 0 6px; }
.tka-dialog ul { list-style:none; margin:0; padding:0; }
.tka-dialog li { display:flex; gap:10px; align-items:flex-start; margin:10px 0; overflow-wrap:anywhere; }
.tka-dialog .tka-item-mark { flex:none; color:#247bb8; }
.tka-dialog .tka-completed { text-decoration:line-through; color:#65737d; }
.tka-dialog .tka-completed-by { margin-left:auto; font-size:12px; color:#65737d; flex:0 0 auto; max-width:35%; }
.tka-dialog input.tka-item-mark { appearance:auto; width:16px; height:16px; margin:3px 0; accent-color:#247bb8; cursor:pointer; }
.tka-dialog footer { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid #e5e9ed; font-size:12px; color:#62717c; }
@media(pointer:coarse) { .tka-indicator,.tka-refresh { min-height:44px!important; } }
`;var oa=`/*!
 * @toast-ui/editor
 * @version 3.2.2 | Fri Feb 17 2023
 * @author NHN Cloud FE Development Lab <dl_javascript@nhn.com>
 * @license MIT
 */
.ProseMirror {
  position: relative;
}

.ProseMirror {
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
}

.ProseMirror pre {
  white-space: pre-wrap;
}

.ProseMirror li {
  position: relative;
}

.ProseMirror-hideselection *::selection { background: transparent; }
.ProseMirror-hideselection *::-moz-selection { background: transparent; }
.ProseMirror-hideselection { caret-color: transparent; }

.ProseMirror-selectednode {
  outline: 2px solid #8cf;
}

/* Make sure li selections wrap around markers */

li.ProseMirror-selectednode {
  outline: none;
}

li.ProseMirror-selectednode:after {
  content: "";
  position: absolute;
  left: -32px;
  right: -2px; top: -2px; bottom: -2px;
  border: 2px solid #8cf;
  pointer-events: none;
}

/* Protect against generic img rules */

img.ProseMirror-separator {
  display: inline !important;
  border: none !important;
  margin: 0 !important;
}

/* height */
.auto-height,
.auto-height .toastui-editor-defaultUI {
  height: auto;
}

.auto-height .toastui-editor-md-container {
  position: relative;
}

:not(.auto-height) > .toastui-editor-defaultUI,
:not(.auto-height) > .toastui-editor-defaultUI > .toastui-editor-main {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
}

:not(.auto-height) > .toastui-editor-defaultUI > .toastui-editor-main {
  -ms-flex: 1;
  flex: 1;
}

/* toastui editor */
.toastui-editor-md-container::after,
.toastui-editor-defaultUI-toolbar::after {
  content: '';
  display: block;
  height: 0;
  clear: both;
}


.toastui-editor-main {
  min-height: 0px;
  position: relative;
  height: inherit;
  box-sizing: border-box;
}

.toastui-editor-md-container {
  display: none;
  overflow: hidden;
  height: 100%;
}

.toastui-editor-md-container .toastui-editor {
  line-height: 1.5;
  position: relative;
}

.toastui-editor-md-container .toastui-editor,
.toastui-editor-md-container .toastui-editor-md-preview {
  box-sizing: border-box;
  padding: 0;
  height: inherit;
}

.toastui-editor-md-container .toastui-editor-md-preview {
  overflow: auto;
  padding: 0 25px;
  height: 100%;
}

.toastui-editor-md-container .toastui-editor-md-preview > p:first-child {
  margin-top: 0 !important;
}

.toastui-editor-md-container .toastui-editor-md-preview .toastui-editor-contents {
  padding-top: 8px;
}

.toastui-editor-main .toastui-editor-md-tab-style > .toastui-editor,
.toastui-editor-main .toastui-editor-md-tab-style > .toastui-editor-md-preview {
  width: 100%;
  display: none;
}

.toastui-editor-main .toastui-editor-md-tab-style > .active {
  display: block;
}

.toastui-editor-main .toastui-editor-md-vertical-style > .toastui-editor-tabs {
  display: none;
}

.toastui-editor-main .toastui-editor-md-tab-style > .toastui-editor-tabs {
  display: block;
}

.toastui-editor-main .toastui-editor-md-vertical-style .toastui-editor {
  width: 50%;
}

.toastui-editor-main .toastui-editor-md-vertical-style .toastui-editor-md-preview {
  width: 50%;
}

.toastui-editor-main .toastui-editor-md-splitter {
  display: none;
  height: 100%;
  width: 1px;
  background-color: #ebedf2;
  position: absolute;
  left: 50%;
}

.toastui-editor-main .toastui-editor-md-vertical-style .toastui-editor-md-splitter {
  display: block;
}

.toastui-editor-ww-container {
  display: none;
  overflow: hidden;
  height: inherit;
  background-color: #fff;
}

.auto-height .toastui-editor-main-container {
  position: relative;
}

.toastui-editor-main-container {
  position: absolute;
  line-height: 1;
  color: #222;
  width: 100%;
  height: inherit;
}

.toastui-editor-ww-container > .toastui-editor {
  height: inherit;
  position: relative;
  width: 100%;
}

.toastui-editor-ww-container .toastui-editor-contents {
  overflow: auto;
  box-sizing: border-box;
  margin: 0px;
  padding: 16px 25px 0px 25px;
  height: inherit;
}

.toastui-editor-ww-container .toastui-editor-contents p {
  margin: 0;
}

.toastui-editor-md-mode .toastui-editor-md-container,
.toastui-editor-ww-mode .toastui-editor-ww-container {
  display: block;
  z-index: 20;
}

.toastui-editor-md-mode .toastui-editor-md-vertical-style {
  display: -ms-flexbox;
  display: flex;
}

.toastui-editor-main.hidden,
.toastui-editor-defaultUI.hidden {
  display: none;
}

/* default UI Styles */
.toastui-editor-defaultUI .ProseMirror {
  padding: 18px 25px;
}

.toastui-editor-defaultUI {
  position: relative;
  border: 1px solid #dadde6;
  height: 100%;
  font-family: 'Open Sans', 'Helvetica Neue', 'Helvetica', 'Arial', '\uB098\uB214\uBC14\uB978\uACE0\uB515',
    'Nanum Barun Gothic', '\uB9D1\uC740\uACE0\uB515', 'Malgun Gothic', sans-serif;
  border-radius: 4px;
}

.toastui-editor-defaultUI button {
  color: #333;
  height: 28px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  border-radius: 2px;
}

.toastui-editor-defaultUI .toastui-editor-ok-button {
  min-width: 63px;
  height: 32px;
  background-color: #00a9ff;
  color: #fff;
  outline-color: #009bf2;
}

.toastui-editor-defaultUI .toastui-editor-ok-button:hover {
  background-color: #009bf2;
}

.toastui-editor-defaultUI .toastui-editor-close-button {
  min-width: 63px;
  height: 32px;
  background-color: #f7f9fc;
  border: 1px solid #dadde6;
  margin-right: 5px;
  outline-color: #cbcfdb;
}

.toastui-editor-defaultUI .toastui-editor-close-button:hover {
  border-color: #cbcfdb;
}

/* mode switch tab */
.toastui-editor-mode-switch {
  background-color: #fff;
  border-top: 1px solid #dadde6;
  font-size: 12px;
  text-align: right;
  height: 28px;
  padding-right: 10px;
  border-radius: 0 0 3px 3px;
}

.toastui-editor-mode-switch .tab-item {
  display: inline-block;
  width: 96px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #f7f9fc;
  color: #969aa5;
  margin-top: -1px;
  margin-right: -1px;
  cursor: pointer;
  border: 1px solid #dadde6;
  border-radius: 0 0 4px 4px;
  font-weight: 500;
  box-sizing: border-box;
}

.toastui-editor-mode-switch .tab-item.active {
  border-top: 1px solid #fff;
  background-color: #fff;
  color: #555;
}

/* markdown tab */
.toastui-editor-defaultUI .toastui-editor-md-tab-container {
  float: left;
  height: 45px;
  font-size: 13px;
  background: #f7f9fc;
  border-bottom: 1px solid #ebedf2;
  border-top-left-radius: 3px;
}

.toastui-editor-md-tab-container .toastui-editor-tabs {
  margin-left: 15px;
  height: 100%;
}

.toastui-editor-md-tab-container .tab-item {
  display: inline-block;
  width: 70px;
  height: 33px;
  line-height: 33px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  background: #eaedf1;
  color: #969aa5;
  cursor: pointer;
  border: 1px solid #dadde6;
  border-radius: 4px 4px 0 0;
  box-sizing: border-box;
  margin-top: 13px;
}

.toastui-editor-md-tab-container .tab-item.active {
  border-bottom: 1px solid #fff;
  background-color: #fff;
  color: #555;
}

.toastui-editor-md-tab-container .tab-item:last-child {
  margin-left: -1px;
}

/* toolbar */
.toastui-editor-defaultUI-toolbar {
  display: -ms-flexbox;
  display: flex;
  padding: 0 25px;
  height: 45px;
  background-color: #f7f9fc;
  border-bottom: 1px solid #ebedf2;
  border-radius: 3px 3px 0 0;
}

.toastui-editor-toolbar {
  height: 46px;
  box-sizing: border-box;
}

.toastui-editor-toolbar-divider {
  display: inline-block;
  width: 1px;
  height: 18px;
  background-color: #e1e3e9;
  margin: 14px 12px;
}

.toastui-editor-toolbar-group {
  display: -ms-flexbox;
  display: flex;
}

.toastui-editor-defaultUI-toolbar button {
  box-sizing: border-box;
  cursor: pointer;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 3px;
  margin: 7px 5px;
  border: 1px solid #f7f9fc;
}

.toastui-editor-defaultUI-toolbar button:not(:disabled):hover {
  border: 1px solid #e4e7ee;
  background-color: #fff;
}

.toastui-editor-defaultUI-toolbar .scroll-sync {
  display: inline-block;
  position: relative;
  width: 70px;
  height: 10px;
  text-align: center;
  line-height: 10px;
  color: #81858f;
  cursor: pointer;
}

.toastui-editor-defaultUI-toolbar .scroll-sync::before {
  content: 'Scroll';
  position: absolute;
  left: 0;
  font-size: 14px;
}

.toastui-editor-defaultUI-toolbar .scroll-sync.active::before {
  color: #00a9ff;
}

.toastui-editor-defaultUI-toolbar .scroll-sync input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toastui-editor-defaultUI-toolbar .switch {
  position: absolute;
  top: 0;
  left: 45px;
  right: 0;
  bottom: 0;
  background-color: #d6d8de;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50px;
}

.toastui-editor-defaultUI-toolbar input:checked + .switch {
  background-color: #acddfa;
}

.toastui-editor-defaultUI-toolbar .switch::before {
  position: absolute;
  content: '';
  height: 14px;
  width: 14px;
  left: 0px;
  bottom: -2px;
  background-color: #94979f;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

.toastui-editor-defaultUI-toolbar input:checked + .switch::before {
  background-color: #00a9ff;
  -webkit-transform: translateX(12px);
  -moz-transform: translateX(12px);
  -ms-transform: translateX(12px);
  transform: translateX(12px);
}

.toastui-editor-dropdown-toolbar .scroll-sync {
  margin: 0 5px;
}

.toastui-editor-dropdown-toolbar {
  position: absolute;
  height: 46px;
  z-index: 30;
  border-radius: 2px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #dadde6;
  background-color: #f7f9fc;
  display: -ms-flexbox;
  display: flex;
}

.toastui-editor-toolbar-item-wrapper {
  margin: 7px 5px;
  height: 32px;
  line-height: 32px;
}

/* toolbar popup */
.toastui-editor-popup {
  width: 400px;
  margin-right: auto;
  background: #fff;
  z-index: 30;
  position: absolute;
  border-radius: 2px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #dadde6;
}

.toastui-editor-popup-body {
  padding: 15px;
  font-size: 12px;
}

.toastui-editor-popup-body label {
  font-weight: 600;
  color: #555;
  display: block;
  margin: 20px 0 5px;
}

.toastui-editor-popup-body .toastui-editor-button-container {
  text-align: right;
  margin-top: 20px;
}

.toastui-editor-popup-body input[type='text'] {
  width: calc(100% - 26px);
  height: 30px;
  padding: 0 12px;
  border-radius: 2px;
  border: 1px solid #e1e3e9;
  color: #333;
}

.toastui-editor-popup-body input[type='text']:focus {
  outline: 1px solid #00a9ff;
  border-color: transparent;
}

.toastui-editor-popup-body input[type='text'].disabled {
  background-color: #f7f9fc;
  border-color: #e1e3e9;
  color: #969aa5;
}

.toastui-editor-popup-body input[type='file'] {
  opacity: 0;
  border: none;
  width: 1px;
  height: 1px;
  position: absolute;
  top: 0;
  left: 0;
}

.toastui-editor-popup-body input.wrong,
.toastui-editor-popup-body span.wrong {
  border-color: #fa2828;
}

.toastui-editor-popup-add-link .toastui-editor-popup-body,
.toastui-editor-popup-add-image .toastui-editor-popup-body {
  padding: 0 20px 20px;
}

.toastui-editor-popup-add-image .toastui-editor-tabs {
  margin: 5px 0 10px;
}

.toastui-editor-popup-add-image .toastui-editor-tabs .tab-item {
  display: inline-block;
  width: 60px;
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid #dadde6;
  color: #333;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  box-sizing: border-box;
}

.toastui-editor-popup-add-image .toastui-editor-tabs .tab-item:hover {
  border-bottom: 1px solid #cbcfdb;
}

.toastui-editor-popup-add-image .toastui-editor-tabs .tab-item.active {
  color: #00a9ff;
  border-bottom: 2px solid #00a9ff;
}

.toastui-editor-popup-add-image .toastui-editor-file-name {
  width: 58%;
  display: inline-block;
  border-radius: 2px;
  border: 1px solid #e1e3e9;
  color: #dadde6;
  height: 30px;
  line-height: 30px;
  padding: 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.toastui-editor-popup-add-image .toastui-editor-file-name.has-file {
  color: #333;
}

.toastui-editor-popup-add-image .toastui-editor-file-select-button {
  width: 33%;
  margin-left: 5px;
  height: 32px;
  border-radius: 2px;
  border: 1px solid #dadde6;
  background-color: #f7f9fc;
  vertical-align: top;
}

.toastui-editor-popup-add-image .toastui-editor-file-select-button:hover {
  border-color: #cbcfdb;
}

.toastui-editor-popup-add-table {
  width: auto;
}

.toastui-editor-popup-add-table .toastui-editor-table-selection {
  position: relative;
}

.toastui-editor-popup-add-table .toastui-editor-table-cell {
  display: table-cell;
  width: 20px;
  height: 20px;
  border: 1px solid #e1e3e9;
  background: #fff;
  box-sizing: border-box;
}

.toastui-editor-popup-add-table .toastui-editor-table-cell.header {
  background: #f7f9fc;
}

.toastui-editor-popup-add-table .toastui-editor-table-row {
  display: table-row;
}

.toastui-editor-popup-add-table .toastui-editor-table {
  display: table;
  border-collapse: collapse;
}

.toastui-editor-popup-add-table .toastui-editor-table-selection-layer {
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid #00a9ff;
  background: rgba(0, 169, 255, 0.1);
  z-index: 30;
}

.toastui-editor-popup-add-table .toastui-editor-table-description {
  margin: 5px 0 0;
  text-align: center;
  color: #333
}

.toastui-editor-popup-add-heading {
  width: auto;
}

.toastui-editor-popup-add-heading .toastui-editor-popup-body {
  padding: 0;
}

.toastui-editor-popup-add-heading h1,
.toastui-editor-popup-add-heading h2,
.toastui-editor-popup-add-heading h3,
.toastui-editor-popup-add-heading h4,
.toastui-editor-popup-add-heading h5,
.toastui-editor-popup-add-heading h6,
.toastui-editor-popup-add-heading ul,
.toastui-editor-popup-add-heading p {
  padding: 0;
  margin: 0;
}

.toastui-editor-popup-add-heading ul {
  padding: 5px 0;
  list-style: none;
}

.toastui-editor-popup-add-heading ul li {
  padding: 4px 12px;
  cursor: pointer;
}

.toastui-editor-popup-add-heading ul li:hover {
  background-color: #dff4ff;
}

.toastui-editor-popup-add-heading h1 {
  font-size: 24px;
}

.toastui-editor-popup-add-heading h2 {
  font-size: 22px;
}

.toastui-editor-popup-add-heading h3 {
  font-size: 20px;
}

.toastui-editor-popup-add-heading h4 {
  font-size: 18px;
}

.toastui-editor-popup-add-heading h5 {
  font-size: 16px;
}

.toastui-editor-popup-add-heading h6 {
  font-size: 14px;
}

/* table context menu */
.toastui-editor-context-menu {
  position: absolute;
  width: auto;
  min-width: 197px;
  color: #333;
  border-radius: 2px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #dadde6;
  z-index: 30;
  padding: 5px 0;
  background-color: #fff;
}

.toastui-editor-context-menu .menu-group {
  list-style: none;
  border-bottom: 1px solid #ebedf2;
  padding: 0;
  margin: 0;
  font-size: 13px;
}

.toastui-editor-context-menu .menu-group:last-child {
  border-bottom: none !important;
}

.toastui-editor-context-menu .menu-item {
  height: 32px;
  line-height: 32px;
  padding: 0 14px;
  cursor: pointer;
}

.toastui-editor-context-menu span {
  display: inline-block;
}

.toastui-editor-context-menu span::before {
  background: url(data:image/png;base64,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) no-repeat;
  background-size: 466px 146px;
  content: '';
  width: 20px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.toastui-editor-context-menu .add-row-up::before {
  background-position: 3px -104px;
}

.toastui-editor-context-menu .add-row-down::before {
  background-position: -19px -104px;
}

.toastui-editor-context-menu .remove-row::before {
  background-position: -41px -104px;
}

.toastui-editor-context-menu .add-column-left::before {
  background-position: -63px -104px;
}

.toastui-editor-context-menu .add-column-right::before {
  background-position: -85px -104px;
}

.toastui-editor-context-menu .remove-column::before {
  background-position: -111px -104px;
}

.toastui-editor-context-menu .align-column-left::before {
  background-position: -129px -104px;
}

.toastui-editor-context-menu .align-column-center::before {
  background-position: -151px -104px;
}

.toastui-editor-context-menu .align-column-right::before {
  background-position: -173px -104px;
}

.toastui-editor-context-menu .remove-table::before {
  background-position: -197px -104px;
}

.toastui-editor-context-menu .disabled span::before {
  opacity: 0.3;
}

.toastui-editor-context-menu li:not(.disabled):hover {
  background-color: #dff4ff;
}

.toastui-editor-context-menu li.disabled {
  color: #c9ccd5;
}

.toastui-editor-tooltip {
  position: absolute;
  background-color: #444;
  z-index: 40;
  padding: 4px 7px;
  font-size: 12px;
  border-radius: 3px;
  color: #fff;
  font-family: 'Open Sans', 'Helvetica Neue', 'Helvetica', 'Arial', '\uB098\uB214\uBC14\uB978\uACE0\uB515',
    'Nanum Barun Gothic', '\uB9D1\uC740\uACE0\uB515', 'Malgun Gothic', sans-serif;
}

.toastui-editor-tooltip .arrow {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: #444;
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  transform: rotate(45deg);
  position: absolute;
  top: -3px;
  left: 6px;
  z-index: -1;
}

.toastui-editor-toolbar-icons {
  background: url(data:image/png;base64,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) no-repeat;
  background-size: 466px 146px;
}

@media only screen and (-webkit-min-device-pixel-ratio: 2),
  only screen and (min--moz-device-pixel-ratio: 2),
  only screen and (-o-min-device-pixel-ratio: 2/1),
  only screen and (min-device-pixel-ratio: 2),
  only screen and (min-resolution: 192dpi),
  only screen and (min-resolution: 2dppx) {
  .toastui-editor-toolbar-icons,
  .toastui-editor-context-menu span::before {
    background: url(data:image/png;base64,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P0A9dgflJJi2Szl5led4F57jlvpECs/6vuTjuhR3dAo961VP9UoRby5eaGBuxz2Zy/3pyiWBlJEiA/s5FHaEnU170tGmBChvV5O1/Zske9dQ3upqiLdbfuL3hTpvY+q8m3ELRkrj1xLs36Md8A17jhOutYwTnYufJw89tLmvbxmhJagIVEmgaoW0yvjlXQREQASakkA77LJL42wfGmdpGiktpZBagaFRfQqNsDNGSykNldFTUQ6+3ZQFWEJlRsA6pVmzZjML1sks0hoiosy9vMoqq2wVjg7VEMNQkHbLTzEI7tOqdCoeTd1nn7dK2tjwf2F5Gsro3cVhdS4CItCcBKSQNud9kVQiIAIikIqAjZLSQNu8lGeujZiyW8pvs7mHI6W2tb/tlF28jigvcRfSmLUpw+doZDQvxM0Xb40zpbLKiE03nWtLiOpVRp1A7ZYfl6+4yTPqo5hO4nndFPt4fi+OHTv2Qb5x/Y+4P9lFQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAREQAQ6mYDfyZlX3kVABESgnQgc/WRhlf5F3j6Dvjdw6UT/mnbKm/IiAiIgAiIgAiLQngSkkLbnfVWuREAEOohA7+OFsc8v8w4peN43yfZGlnW/y9t/9kT/2g7CoKyKgAiIgAiIgAi0IIGeFpRZIouACIhA3QSOm1fY4A3f28MiWqXg/fyCyf7CuiMdhQiOmFc4YOEy7zsk/fZhyRe89ww7b8GTI+YXthv0vBO9gjcZ8TdoUBYWer43r8vzzpk1yb+vQWkqmVEmcPQjhY36+rzv0amzI6I0qqy5XC9kdGDumDHeSRdv5T/n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vaXiGC338PM8x9WSftjWO6CWsArTOAKhollR2UwjEc9wdYeNvhHCevQvqneamUs5jzhd3GlMemI2KtUTUyq89dBYDwAArSK8cWt+zbJmtNII6bA8tdAI6TC5wxP7rtbACm97tkR/K+ssVude9DBm+gqV+JM9a3q/rfW7Vklpya19CNCr94HCAFOk3LRd33u1u8vbhSlgLfWJFJ71famHrqt0Z6ivplBf17v2qFIymV1n07LtaITNJW+jus8B3NjU09sxzQZqmWVeETWcACNtV1PespspVUcOKG/XMLpUV0O83fITx3nEo4WNB1d4N+O2Rdw9yc7z+z1GRr/RrCOjSTInuTHq+3naNz3U4dcnXZebCLQDAeo+HSIgAiLQeQTaYZfdI+YV9qGhUrGR0moKqZVGlG2bxnzGaCmloTJ6Ksrotzvv6eisHFunNGvWHiHX64xyzl8eO8bbKhwdqlmUdstPMYjgqwH/9I6mQ/F4OhKYzTvi+F82kzjtksn+3SOuyEEERKApCUghbcrbIqFEQAREIB0BGyXF5+ZlfCdN2S3jvXku2UgpCveJNDxtp+xh64hylNKm/s1jaPYcjYzmSLnJoq5lplSGWVhIY2yuLSGqVxl1MrVbfly+4qZtXnT0Q96kPs/btKvgjUc5fbHH9x6cMdG39Ws6REAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAEREAERAACviiIgAiIgAgMJ7DPPvvshMuNoeueN9xww5zhPnQmAiIgAiIgAiIgAiKQBYGeLCJRHCIgAiLQTgR839++UCiMtzyZHUMKaTvd4AzzctBBB627bNmydxDl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UvksxkDZi5yw9xKm1xzi5RjlMLe10HTi3YPCeTZ1ZPD5F2TYieT/wnPzFPb+vr6+zTDdxmA2a0Yjo3aDdIiACIiACIhADgS6ysRpa5gadTQyrUblqSHp0GgyZTTYwCghwWBNqflJuNZop2rucTV+S+Wjmjiq8VsqvbzdU8tIebDNVtxuusEGRjTArcPi2piQ+9Eg3yN2LqsI1EMgdflMmwhK4ADldgr+o3JLXRaN+DMD5GyU1prXQjMKfarF4eQhbp/fppy/FzOujM4kHU3TdaBkioAIiIAIiEDGBEoqpLaGibQyb2QkyD8qa8Ro7Ng60cX2C+0JojW/E0qF7aAbrRslL2faLyb57qGfmFPjrVWUp0zKQ6PTy5toFfmx0ZzbkMfKdqCMWqMdt+LG/XN8f/E3dch9axjWpgW33QGvtqgfKtyYzO5hNeWzgkzDLlu55XcEv1eHXchgLTRxFsJnYwfsd/GL775rQ7j2fHwGpfgorg1bX1oki05FQAREQAREQAREoHMJMBp2s02Rsx/2MxwJs8fctcuuA9MhJpuxbMrvU8XZtZEfysZetkau+JrORaDZCFBex1OP/drVZUXmNfGRzHpl57lYm867iTw32y5atGi9euNTeBEQAREQAREQgXQEgo+Dp/MqX81IgAbUm2iUXYBs8+nJvyguIw2sYzifRO/+cYwEBN8AiV+XXQREQASalYApo9Rh5dZCm+jX2rTe+Ohms+ZHcomACIiACIiACIiACIiACIiACLQIAUZDvx4fEaXz7SwbEcXtmrg7SuueLZIliSkCIiACIiACIpBAoOQa0gS/chIBERABERCBhhBg1LMRa6EbkhclIgIiIAIiIAIiIAIiIAIiIAIi0GIEtBa6xW6YxBUBERABERABERABERABERABERABERABERABERCBViHw/wHIAHUN1iL6RwAAAABJRU5ErkJggg==) no-repeat;
    background-size: 466px 146px;
  }
}

.toastui-editor-toolbar-icons {
  background-position-y: 3px;
}

.toastui-editor-toolbar-icons:disabled {
  opacity: 0.3;
}

.toastui-editor-toolbar-icons.heading {
  background-position-x: 3px;
}

.toastui-editor-toolbar-icons.bold {
  background-position-x: -23px;
}

.toastui-editor-toolbar-icons.italic {
  background-position-x: -49px;
}

.toastui-editor-toolbar-icons.strike {
  background-position-x: -75px;
}

.toastui-editor-toolbar-icons.hrline {
  background-position-x: -101px;
}

.toastui-editor-toolbar-icons.quote {
  background-position-x: -127px;
}

.toastui-editor-toolbar-icons.bullet-list {
  background-position-x: -153px;
}

.toastui-editor-toolbar-icons.ordered-list {
  background-position-x: -179px;
}

.toastui-editor-toolbar-icons.task-list {
  background-position-x: -205px;
}

.toastui-editor-toolbar-icons.indent {
  background-position-x: -231px;
}

.toastui-editor-toolbar-icons.outdent {
  background-position-x: -257px;
}

.toastui-editor-toolbar-icons.table {
  background-position-x: -283px;
}

.toastui-editor-toolbar-icons.image {
  background-position-x: -309px;
}

.toastui-editor-toolbar-icons.link {
  background-position-x: -334px;
}

.toastui-editor-toolbar-icons.code {
  background-position-x: -361px;
}

.toastui-editor-toolbar-icons.codeblock {
  background-position-x: -388px;
}

.toastui-editor-toolbar-icons.more {
  background-position-x: -412px;
}

.toastui-editor-toolbar-icons:not(:disabled).active {
  background-position-y: -23px;
}

@media only screen and (max-width: 480px) {
  .toastui-editor-popup {
    max-width: 300px;
    margin-left: -150px;
  }

  .toastui-editor-dropdown-toolbar {
    max-width: none;
  }
}

/* 
  z-index basis
  -1: pseudo element
  20 - preview, wysiwyg
  30 - wysiwyg code block language editor, popup, context menu
  40 - tooltip
*/
.ProseMirror {
  font-family: 'Open Sans', 'Helvetica Neue', 'Helvetica', 'Arial', '\uB098\uB214\uBC14\uB978\uACE0\uB515',
    'Nanum Barun Gothic', '\uB9D1\uC740\uACE0\uB515', 'Malgun Gothic', sans-serif;
  color: #222;
  font-size: 13px;
  overflow-y: auto;
  overflow-X: hidden;
  height: calc(100% - 36px);
}

.ProseMirror .placeholder {
  color: #999;
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror-selectednode {
  outline: none;
}

table.ProseMirror-selectednode {
  border-radius: 2px;
  outline: 2px solid #00a9ff;
}

.html-block.ProseMirror-selectednode {
  border-radius: 2px;
  outline: 2px solid #00a9ff;
}

.toastui-editor-contents {
  margin: 0;
  padding: 0;
  font-size: 13px;
  font-family: 'Open Sans', 'Helvetica Neue', 'Helvetica', 'Arial', '\uB098\uB214\uBC14\uB978\uACE0\uB515',
    'Nanum Barun Gothic', '\uB9D1\uC740\uACE0\uB515', 'Malgun Gothic', sans-serif;
  z-index: 20;
}

.toastui-editor-contents *:not(table) {
  line-height: 160%;
  box-sizing: content-box;
}

.toastui-editor-contents i,
.toastui-editor-contents cite,
.toastui-editor-contents em,
.toastui-editor-contents var,
.toastui-editor-contents address,
.toastui-editor-contents dfn {
  font-style: italic;
}

.toastui-editor-contents strong {
  font-weight: bold;
}

.toastui-editor-contents p {
  margin: 10px 0;
  color: #222;
}

.toastui-editor-contents > h1:first-of-type,
.toastui-editor-contents > div > div:first-of-type h1 {
  margin-top: 14px;
}

.toastui-editor-contents h1,
.toastui-editor-contents h2,
.toastui-editor-contents h3,
.toastui-editor-contents h4,
.toastui-editor-contents h5,
.toastui-editor-contents h6 {
  font-weight: bold;
  color: #222;
}

.toastui-editor-contents h1 {
  font-size: 24px;
  line-height: 28px;
  border-bottom: 3px double #999;
  margin: 52px 0 15px 0;
  padding-bottom: 7px;
}

.toastui-editor-contents h2 {
  font-size: 22px;
  line-height: 23px;
  border-bottom: 1px solid #dbdbdb;
  margin: 20px 0 13px 0;
  padding-bottom: 7px;
}

.toastui-editor-contents h3 {
  font-size: 20px;
  margin: 18px 0 2px;
}

.toastui-editor-contents h4 {
  font-size: 18px;
  margin: 10px 0 2px;
}

.toastui-editor-contents h3,
.toastui-editor-contents h4 {
  line-height: 18px;
}

.toastui-editor-contents h5 {
  font-size: 16px;
}

.toastui-editor-contents h6 {
  font-size: 14px;
}

.toastui-editor-contents h5,
.toastui-editor-contents h6 {
  line-height: 17px;
  margin: 9px 0 -4px;
}

.toastui-editor-contents del {
  color: #999;
}

.toastui-editor-contents blockquote {
  margin: 14px 0;
  border-left: 4px solid #e5e5e5;
  padding: 0 16px;
  color: #999;
}

.toastui-editor-contents blockquote p,
.toastui-editor-contents blockquote ul,
.toastui-editor-contents blockquote ol {
  color: #999;
}

.toastui-editor-contents blockquote > :first-child {
  margin-top: 0;
}

.toastui-editor-contents blockquote > :last-child {
  margin-bottom: 0;
}

.toastui-editor-contents pre,
.toastui-editor-contents code {
  font-family: Consolas, Courier, 'Apple SD \uC0B0\uB3CC\uACE0\uB515 Neo', -apple-system, 'Lucida Grande',
    'Apple SD Gothic Neo', '\uB9D1\uC740 \uACE0\uB515', 'Malgun Gothic', 'Segoe UI', '\uB3CB\uC6C0', dotum, sans-serif;
  border: 0;
  border-radius: 0;
}

.toastui-editor-contents pre {
  margin: 2px 0 8px;
  padding: 18px;
  background-color: #f4f7f8;
}

.toastui-editor-contents code {
  color: #c1798b;
  background-color: #f9f2f4;
  padding: 2px 3px;
  letter-spacing: -0.3px;
  border-radius: 2px;
}

.toastui-editor-contents pre code {
  padding: 0;
  color: inherit;
  white-space: pre-wrap;
  background-color: transparent;
}

.toastui-editor-contents img {
  margin: 4px 0 10px;
  box-sizing: border-box;
  vertical-align: top;
  max-width: 100%;
}

.toastui-editor-contents table {
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin: 12px 0 14px;
  color: #222;
  width: auto;
  border-collapse: collapse;
  box-sizing: border-box;
}

.toastui-editor-contents table th,
.toastui-editor-contents table td {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 5px 14px 5px 12px;
  height: 32px;
}

.toastui-editor-contents table th {
  background-color: #555;
  font-weight: 300;
  color: #fff;
  padding-top: 6px;
}

.toastui-editor-contents th p {
  margin: 0;
  color: #fff;
}

.toastui-editor-contents td p {
  margin: 0;
  padding: 0 2px;
}

.toastui-editor-contents td.toastui-editor-cell-selected {
  background-color: #d8dfec;
}

.toastui-editor-contents th.toastui-editor-cell-selected {
  background-color: #908f8f;
}

.toastui-editor-contents ul,
.toastui-editor-contents menu,
.toastui-editor-contents ol,
.toastui-editor-contents dir {
  display: block;
  list-style-type: none;
  padding-left: 24px;
  margin: 6px 0 10px;
  color: #222;
}

.toastui-editor-contents ol {
  list-style-type: none;
  counter-reset: li;
}

.toastui-editor-contents ol > li {
  counter-increment: li;
}

.toastui-editor-contents ul > li::before,
.toastui-editor-contents ol > li::before {
  display: inline-block;
  position: absolute;
}

.toastui-editor-contents ul > li::before {
  content: '';
  margin-top: 6px;
  margin-left: -17px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #ccc;
}

.toastui-editor-contents ol > li::before {
  content: '.' counter(li);
  margin-left: -28px;
  width: 24px;
  text-align: right;
  direction: rtl;
  color: #aaa;
}

.toastui-editor-contents ul ul,
.toastui-editor-contents ul ol,
.toastui-editor-contents ol ol,
.toastui-editor-contents ol ul {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.toastui-editor-contents ul li,
.toastui-editor-contents ol li {
  position: relative;
}

.toastui-editor-contents ul p,
.toastui-editor-contents ol p {
  margin: 0;
}

.toastui-editor-contents hr {
  border-top: 1px solid #eee;
  margin: 16px 0;
}

.toastui-editor-contents a {
  text-decoration: underline;
  color: #4b96e6;
}

.toastui-editor-contents a:hover {
  color: #1f70de;
}

.toastui-editor-contents .image-link {
  position: relative;
}

.toastui-editor-contents .image-link:hover::before {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  right: 0px;
  border-radius: 50%;
  border: 1px solid #c9ccd5;
  background: #fff url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj4KICAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj4KICAgICAgICA8ZyBzdHJva2U9IiM1NTUiIHN0cm9rZS13aWR0aD0iMS41Ij4KICAgICAgICAgICAgPGc+CiAgICAgICAgICAgICAgICA8Zz4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNy42NjUgMTUuMDdsLTEuODE5LS4wMDJjLTEuNDg2IDAtMi42OTItMS4yMjgtMi42OTItMi43NDR2LS4xOTJjMC0xLjUxNSAxLjIwNi0yLjc0NCAyLjY5Mi0yLjc0NGgzLjg0NmMxLjQ4NyAwIDIuNjkyIDEuMjI5IDIuNjkyIDIuNzQ0di4xOTIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMDAwIC00NTgxKSB0cmFuc2xhdGUoOTk1IDQ1NzYpIHRyYW5zbGF0ZSg1IDUpIHNjYWxlKDEgLTEpIHJvdGF0ZSg0NSAzNy4yOTMgMCkiLz4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTIuMzI2IDQuOTM0bDEuODIyLjAwMmMxLjQ4NyAwIDIuNjkzIDEuMjI4IDIuNjkzIDIuNzQ0di4xOTJjMCAxLjUxNS0xLjIwNiAyLjc0NC0yLjY5MyAyLjc0NGgtMy44NDVjLTEuNDg3IDAtMi42OTItMS4yMjktMi42OTItMi43NDRWNy42OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEwMDAgLTQ1ODEpIHRyYW5zbGF0ZSg5OTUgNDU3NikgdHJhbnNsYXRlKDUgNSkgc2NhbGUoMSAtMSkgcm90YXRlKDQ1IDMwLjk5NiAwKSIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K) no-repeat;
  background-position: center;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.toastui-editor-contents .task-list-item {
  border: 0;
  list-style: none;
  padding-left: 24px;
  margin-left: -24px;
}

.toastui-editor-contents .task-list-item::before {
  background-repeat: no-repeat;
  background-size: 18px 18px;
  background-position: center;
  content: '';
  margin-left: 0;
  margin-top: 0;
  border-radius: 2px;
  height: 18px;
  width: 18px;
  position: absolute;
  left: 0;
  top: 1px;
  cursor: pointer;
  background: transparent url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDE4IDE4Ij4KICAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgZmlsbD0iI0ZGRiIgc3Ryb2tlPSIjQ0NDIj4KICAgICAgICAgICAgPGc+CiAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTAzMCAtMjk2KSB0cmFuc2xhdGUoNzg4IDE5MikgdHJhbnNsYXRlKDI0MiAxMDQpIj4KICAgICAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD0iMTciIGhlaWdodD0iMTciIHg9Ii41IiB5PSIuNSIgcng9IjIiLz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg==);
}

.toastui-editor-contents .task-list-item.checked::before {
  background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDE4IDE4Ij4KICAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgZmlsbD0iIzRCOTZFNiI+CiAgICAgICAgICAgIDxnPgogICAgICAgICAgICAgICAgPGc+CiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE2IDBjMS4xMDUgMCAyIC44OTUgMiAydjE0YzAgMS4xMDUtLjg5NSAyLTIgMkgyYy0xLjEwNSAwLTItLjg5NS0yLTJWMkMwIC44OTUuODk1IDAgMiAwaDE0em0tMS43OTMgNS4yOTNjLS4zOS0uMzktMS4wMjQtLjM5LTEuNDE0IDBMNy41IDEwLjU4NSA1LjIwNyA4LjI5M2wtLjA5NC0uMDgzYy0uMzkyLS4zMDUtLjk2LS4yNzgtMS4zMi4wODMtLjM5LjM5LS4zOSAxLjAyNCAwIDEuNDE0bDMgMyAuMDk0LjA4M2MuMzkyLjMwNS45Ni4yNzggMS4zMi0uMDgzbDYtNiAuMDgzLS4wOTRjLjMwNS0uMzkyLjI3OC0uOTYtLjA4My0xLjMyeiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEwNTAgLTI5NikgdHJhbnNsYXRlKDc4OCAxOTIpIHRyYW5zbGF0ZSgyNjIgMTA0KSIvPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K);
}

.toastui-editor-custom-block .toastui-editor-custom-block-editor {
  background: #f9f7fd;
  color: #452d6b;
  border: solid 1px #dbd4ea;
}

.toastui-editor-custom-block .toastui-editor-custom-block-view {
  position: relative;
  padding: 9px 13px 8px 12px;
}

.toastui-editor-custom-block.ProseMirror-selectednode .toastui-editor-custom-block-view {
  border: solid 1px #dbd4ea;
  border-radius: 2px;
}

.toastui-editor-custom-block .toastui-editor-custom-block-view .tool {
  position: absolute;
  right: 10px;
  top: 7px;
  display: none;
}

.toastui-editor-custom-block.ProseMirror-selectednode .toastui-editor-custom-block-view .tool {
  display: block;
}

.toastui-editor-custom-block-view button {
  vertical-align: middle;
  width: 15px;
  height: 15px;
  margin-left: 8px;
  padding: 3px;
  border: solid 1px #cccccc;
  background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI1LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuugiOydtOyWtF8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiCgkgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMzAgMzAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMwIDMwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6IzU1NTU1NTt9Cjwvc3R5bGU+CjxnPgoJPGc+CgkJPGc+CgkJCTxnPgoJCQkJPGc+CgkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTE1LjUsMTIuNWwyLDJMMTIsMjBoLTJ2LTJMMTUuNSwxMi41eiBNMTgsMTBsMiwybC0xLjUsMS41bC0yLTJMMTgsMTB6Ii8+CgkJCQk8L2c+CgkJCTwvZz4KCQk8L2c+Cgk8L2c+CjwvZz4KPC9zdmc+Cg==)
    no-repeat;
  background-position: center;
  background-size: 30px 30px;
}

.toastui-editor-custom-block-view .info {
  font-size: 13px;
  font-weight: bold;
  color: #5200d0;
  vertical-align: middle;
}

.toastui-editor-contents .toastui-editor-ww-code-block {
  position: relative;
}

.toastui-editor-contents .toastui-editor-ww-code-block:after {
  content: attr(data-language);
  position: absolute;
  display: inline-block;
  top: 10px;
  right: 10px;
  height: 24px;
  padding: 3px 35px 0 10px;
  font-weight: bold;
  font-size: 13px;
  color: #333;
  background: #e5e9ea url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI1LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuugiOydtOyWtF8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiCgkgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMzAgMzAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMwIDMwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6IzU1NTU1NTt9Cjwvc3R5bGU+CjxnPgoJPGc+CgkJPGc+CgkJCTxnPgoJCQkJPGc+CgkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTE1LjUsMTIuNWwyLDJMMTIsMjBoLTJ2LTJMMTUuNSwxMi41eiBNMTgsMTBsMiwybC0xLjUsMS41bC0yLTJMMTgsMTB6Ii8+CgkJCQk8L2c+CgkJCTwvZz4KCQk8L2c+Cgk8L2c+CjwvZz4KPC9zdmc+Cg==) no-repeat;
  background-position: right;
  border-radius: 2px;
  background-size: 30px 30px;
  cursor: pointer;
}

.toastui-editor-ww-code-block-language {
  position: fixed;
  display: inline-block;
  width: 100px;
  height: 27px;
  right: 35px;
  border: 1px solid #ccc;
  border-radius: 2px;
  background-color: #fff;
  z-index: 30;
}

.toastui-editor-ww-code-block-language input {
  box-sizing: border-box;
  margin: 0;
  padding: 0 10px;
  height: 100%;
  width: 100%;
  background-color: transparent;
  border: none;
  outline: none;
}

.toastui-editor-contents-placeholder::before {
  content: attr(data-placeholder);
  color: grey;
  line-height: 160%;
  position: absolute;
}

.toastui-editor-md-preview .toastui-editor-contents h1 {
  min-height: 28px;
}

.toastui-editor-md-preview .toastui-editor-contents h2 {
  min-height: 23px;
}

.toastui-editor-md-preview .toastui-editor-contents blockquote {
  min-height: 20px;
}

.toastui-editor-md-preview .toastui-editor-contents li {
  min-height: 22px;
}

.toastui-editor-pseudo-clipboard {
  position: fixed;
  opacity: 0;
  width: 0;
  height: 0;
  left: -1000px;
  top: -1000px;
  z-index: -1;
}

.toastui-editor-contents .toastui-editor-md-preview-highlight {
  position: relative;
  z-index: 0;
}

.toastui-editor-contents .toastui-editor-md-preview-highlight::after {
  content: '';
  background-color: rgba(255, 245, 131, 0.5);
  border-radius: 4px;
  z-index: -1;
  position: absolute;
  top: -4px;
  right: -4px;
  left: -4px;
  bottom: -4px;
}

.toastui-editor-contents h1.toastui-editor-md-preview-highlight::after,
.toastui-editor-contents h2.toastui-editor-md-preview-highlight::after {
  bottom: 0;
}

.toastui-editor-contents td.toastui-editor-md-preview-highlight::after,
.toastui-editor-contents th.toastui-editor-md-preview-highlight::after {
  display: none;
}

.toastui-editor-contents th.toastui-editor-md-preview-highlight,
.toastui-editor-contents td.toastui-editor-md-preview-highlight {
  background-color: rgba(255, 245, 131, 0.5);
}

.toastui-editor-contents th.toastui-editor-md-preview-highlight {
  color: #222;
}

.toastui-editor-md-heading1 {
  font-size: 24px;
}

.toastui-editor-md-heading2 {
  font-size: 22px;
}

.toastui-editor-md-heading3 {
  font-size: 20px;
}

.toastui-editor-md-heading4 {
  font-size: 18px;
}

.toastui-editor-md-heading5 {
  font-size: 16px;
}

.toastui-editor-md-heading6 {
  font-size: 14px;
}

.toastui-editor-md-heading.toastui-editor-md-delimiter.setext {
  line-height: 15px;
}

.toastui-editor-md-strong,
.toastui-editor-md-heading,
.toastui-editor-md-list-item-style,
.toastui-editor-md-list-item .toastui-editor-md-meta {
  font-weight: bold;
}

.toastui-editor-md-emph {
  font-style: italic;
}

.toastui-editor-md-strike {
  text-decoration: line-through;
}

.toastui-editor-md-strike.toastui-editor-md-delimiter {
  text-decoration: none;
}

.toastui-editor-md-delimiter,
.toastui-editor-md-thematic-break,
.toastui-editor-md-link,
.toastui-editor-md-table,
.toastui-editor-md-block-quote {
  color: #ccc;
}

.toastui-editor-md-code.toastui-editor-md-delimiter {
  color: #aaa;
}

.toastui-editor-md-meta,
.toastui-editor-md-html,
.toastui-editor-md-link.toastui-editor-md-link-url.toastui-editor-md-marked-text {
  color: #999;
}

.toastui-editor-md-block-quote .toastui-editor-md-marked-text,
.toastui-editor-md-list-item .toastui-editor-md-meta {
  color: #555;
}

.toastui-editor-md-table .toastui-editor-md-table-cell {
  color: #222;
}

.toastui-editor-md-link.toastui-editor-md-link-desc.toastui-editor-md-marked-text,
.toastui-editor-md-list-item-style.toastui-editor-md-list-item-odd {
  color: #4b96e6;
}

.toastui-editor-md-list-item-style.toastui-editor-md-list-item-even {
  color: #cb4848;
}

.toastui-editor-md-code.toastui-editor-md-marked-text {
  color: #c1798b;
}

.toastui-editor-md-code {
  background-color: rgba(243, 229, 233, 0.5);
  padding: 2px 0;
  letter-spacing: -0.3px;
}

.toastui-editor-md-code.toastui-editor-md-start {
  padding-left: 2px;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}

.toastui-editor-md-code.toastui-editor-md-end {
  padding-right: 2px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}

.toastui-editor-md-code-block-line-background {
  background-color: #f5f7f8;
}

.toastui-editor-md-code-block-line-background.start,
.toastui-editor-md-custom-block-line-background.start {
  margin-top: 2px;
}

.toastui-editor-md-code,
.toastui-editor-md-code-block {
  font-family: Consolas, Courier, 'Lucida Grande', '\uB098\uB214\uBC14\uB978\uACE0\uB515', 'Nanum Barun Gothic', '\uB9D1\uC740\uACE0\uB515',
    'Malgun Gothic', sans-serif;
}

.toastui-editor-md-custom-block {
  color: #452d6b;
}
.toastui-editor-md-custom-block-line-background {
  background-color: #f9f7fd;
}
.toastui-editor-md-custom-block .toastui-editor-md-delimiter {
  color: #b8b3c0;
}
.toastui-editor-md-custom-block .toastui-editor-md-meta {
  color: #5200d0;
}
`;var ra=`[data-tka-desc-hidden] {display:none !important}
[data-tka-desc-full] [data-element-name="description_textArea"]:not([data-tka-desc-hidden]) {display:block !important;-webkit-line-clamp:unset !important;max-height:none !important;overflow:visible !important}
[data-tka-desc-full] [data-element-name="description_showMore"], [data-tka-desc-full] [data-element-name="description_showLess"] {display:none !important}
[data-tka-desc-top] {display:contents !important}
[data-tka-desc-top] > [data-tka-desc-heading] {order:-2 !important}
[data-tka-desc-top] > [data-tka-desc-paper] {order:-1 !important}
.tka-editor-inline button.tka-editor-button,.tka-editor-modes button.tka-editor-button {font:500 13px/1.75 Roboto,Helvetica,Arial,sans-serif;border:0;background:transparent;border-radius:4px;padding:4px 12px;color:var(--tka-action-color,#041863);cursor:pointer;white-space:nowrap;text-transform:none;box-shadow:none}
.tka-editor-inline button.tka-editor-button:hover,.tka-editor-modes button.tka-editor-button:hover {background-color:rgba(4,24,99,.06)}
.tka-editor-inline button.tka-editor-button:disabled,.tka-editor-modes button.tka-editor-button:disabled {opacity:.5;cursor:default}
.tka-editor-inline button:focus-visible,.tka-editor-modes button:focus-visible,[data-tka-desc-clickable]:focus-visible {outline:2px solid #041863;outline-offset:2px}
[data-tka-desc-clickable] {cursor:text}
[data-tka-desc-editing] [data-element-name="panel_description"] > :not(.tka-editor-inline),
[data-tka-desc-editing] .taskDetailsDescriptionTextarea > :not(.tka-editor-inline),
[data-tka-desc-editing] [data-element-name="summary_textArea"],
[data-tka-desc-editing] [data-element-name="summary_editButton"],
[data-tka-desc-editing] [data-element-name="summary_showEditModuleLink"],
[data-tka-desc-editing] .tka-markdown:not(.tka-editor-preview),
[data-tka-desc-editing] [data-element-name="description_showMore"],
[data-tka-desc-editing] [data-element-name="description_showLess"] {display:none !important}
[data-tka-desc-editing] [data-element-name="panel_description"], [data-tka-desc-editing] .taskDetailsDescriptionTextarea {display:block !important;cursor:default !important;max-height:none !important;overflow:visible !important}
.tka-markdown {font:inherit;line-height:1.6;white-space:normal;overflow-wrap:anywhere;color:inherit}
.tka-markdown p {margin:.6em 0;white-space:pre-wrap}
.tka-markdown h1,.tka-markdown h2,.tka-markdown h3 {font-size:1.3em;font-weight:650;margin:.9em 0 .4em}
.tka-markdown ul,.tka-markdown ol {padding-left:1.7em;margin:.5em 0}
.tka-markdown li {margin:.2em 0}.tka-markdown pre {white-space:pre-wrap;padding:12px;background:#f1f5f9;border-radius:8px}.tka-markdown code {font-family:Consolas,monospace;background:#f1f5f9}.tka-markdown blockquote {border-left:3px solid #cbd5e1;padding-left:12px;margin:10px 0}.tka-markdown table {border-collapse:collapse;width:100%;display:block;overflow-x:auto}.tka-markdown th,.tka-markdown td {border:1px solid #cbd5e1;padding:6px 10px}.tka-markdown input {margin-right:6px}.tka-markdown a {color:#1d4ed8;text-decoration:underline}
.tka-markdown.tka-collapsed {max-height:180px;overflow:hidden}
.tka-editor-inline {box-sizing:border-box;width:100%;min-width:0;padding:8px 0;background:#fff;color:inherit;font:inherit;cursor:default;white-space:normal}
.tka-editor-inline p {margin:8px 0 14px}.tka-editor-modes,.tka-editor-actions {display:flex;gap:8px;align-items:center;margin:12px 0;flex-wrap:wrap}
[data-tka-editor-heading] {display:flex !important;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.tka-editor-modes {gap:0;justify-content:flex-end;margin:0 0 8px auto;width:fit-content;max-width:100%;border:1px solid #dfe3e8;border-radius:4px;overflow:hidden}
[data-tka-editor-heading] > .tka-editor-modes {margin:0 0 0 auto}
.tka-editor-modes button.tka-editor-button {border-radius:0}
.tka-editor-inline .toastui-editor-defaultUI {min-width:0;max-width:100%}
.tka-editor-inline .toastui-editor-defaultUI-toolbar {flex-wrap:wrap;height:auto;min-height:45px;padding:0 6px}
.tka-editor-inline .toastui-editor-toolbar-group {flex-shrink:0}
.tka-editor-modes button[aria-pressed="true"] {background:#eef0f6;color:#041863}
.tka-editor-source {box-sizing:border-box;width:100%;min-height:340px;padding:12px;font:inherit;line-height:1.6;resize:vertical;border:1px solid #dfe3e8;border-radius:4px;color:inherit;background:#fff}
.tka-editor-status {color:#445c78;font-size:13px}.tka-editor-status:empty {display:none}.tka-editor-actions {justify-content:flex-end;margin:8px 0 0}.tka-editor-actions button.tka-primary {background:#041863;color:white;min-width:64px}
.tka-editor-actions button.tka-primary:hover {filter:brightness(.9);background:#041863}
.tka-editor-inline [hidden] {display:none !important}
`;var ia=`/* Match Accelo's relocation control while remaining visible off-hover. */
td.tka-timesheet-cell .ts_against_mask {padding-right:74px;}
td.tka-timesheet-cell.tka-timesheet-no-relocate .ts_against_mask {padding-right:38px;}
td.tka-timesheet-cell button.tka-timesheet-timer {display:inline-flex!important;visibility:visible!important;opacity:1!important;position:absolute;right:3px!important;top:3px;align-items:center;justify-content:center;width:32px;height:28px;padding:3px;cursor:pointer;color:#25466a;background:#fff;border:1px solid #ccd3dc;border-radius:4px;}
td.tka-timesheet-cell [tooltip="Relocate All Activities"] {right:38px!important;}
td.tka-timesheet-cell button.tka-timesheet-timer svg {width:20px;height:20px;fill:currentColor;}
html[data-tka-theme="dark"] td.tka-timesheet-cell button.tka-timesheet-timer {color:#b9d9ff!important;background:#243342!important;border-color:#60758a!important;}
html[data-tka-theme="dark"] td.tka-timesheet-cell button.tka-timesheet-timer:hover {background:#344b60!important;}
td.tka-timesheet-cell button.tka-timesheet-timer:disabled {cursor:wait;opacity:.55!important;}
td.tka-timesheet-cell button.tka-timesheet-timer:focus-visible {outline:2px solid #478ddd;outline-offset:2px;}
\r
`;var aa=`.tka-inbox-shortcut {display:inline-flex!important;align-items:center;gap:5px;margin-right:8px;cursor:pointer;font-family:inherit;font-size:inherit;}
.tka-inbox-shortcut svg {width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
.tka-inbox-delete {color:#e23c3c!important;background:#fff;border:1px solid #cbd3e3;border-radius:4px;padding:5px 10px;cursor:pointer;}
.tka-inbox-delete:hover {background:#fff1f1;}
.tka-inbox-delete:disabled {opacity:.55;cursor:default;}
.tka-inbox-shortcut {min-width:88px;justify-content:center;}
.tka-inbox-armed {background:#fff1f1;border-color:#e23c3c;}
.tka-inbox-shortcut:focus-visible {outline:2px solid #478ddd;outline-offset:3px;}
`;var sa=`.customListTable .tka-retainer-cell {min-width:200px;width:200px;max-width:240px;white-space:normal;text-align:center;vertical-align:middle;}
.customListTable th.tka-retainer-cell > div {padding:0;height:auto;line-height:normal;}
.customListTable .tka-retainer-cell > .tka-retainer-usage {min-width:180px;font:inherit;line-height:normal;height:auto;padding:0;}
.tka-retainer-bar {position:relative;isolation:isolate;overflow:hidden;border-radius:3px;height:22px;box-sizing:border-box;border:1px solid #d5d5d5;background:#fff;text-align:center;color:#999;}
.tka-retainer-fill,.tka-retainer-over {position:absolute;inset:0 auto 0 0;background:#e9ffee;z-index:-1;}
.tka-retainer-over {left:auto;right:0;background:#fee;}
.tka-retainer-label {display:block;padding:0 4px;line-height:20px;}
.tka-retainer-on-budget {color:#1c9a0e;}
.tka-retainer-over-budget {color:#b51212;}
.tka-retainer-note {display:block;font-size:12px;line-height:14px;margin-top:1px;}
.tka-retainer-note:hover {text-decoration:underline;}
.tka-retainer-empty {opacity:.7;}
.customListTable [data-tka-period="tasks"] {width:100px;min-width:100px;max-width:120px;}
.customListTable [data-tka-period="tasks"] > .tka-retainer-usage {min-width:0;}
.tka-retainer-tasks {display:flex;justify-content:center;gap:6px;align-items:center;}
.tka-retainer-task-count {display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:22px;padding:0 5px;box-sizing:border-box;border:1px solid #d5d5d5;border-radius:3px;background:#fff;font-weight:700;line-height:20px;}
.tka-retainer-task-count:hover {text-decoration:underline;}
.tka-retainer-task-count:focus-visible {outline:2px solid currentColor;outline-offset:2px;}
.tka-retainer-task-active {color:#1c9a0e;}
.tka-retainer-task-overdue {color:#c65b00;}
.tka-retainer-task-heading {display:block;font-weight:normal;line-height:14px;}
.customListTable th[data-tka-period="tasks"] {vertical-align:middle;text-align:center;line-height:normal;}
.customListTable th[data-tka-period="tasks"] > .bold {display:block;line-height:16px;}
.customListTable th[data-tka-period="tasks"] > .tka-retainer-task-heading {display:block;margin:0;height:14px!important;line-height:14px;}
html[data-tka-theme="dark"] .tka-retainer-task-count {background:#223140!important;border-color:#52687b!important;}
html[data-tka-theme="dark"] .tka-retainer-bar {background:#223140!important;border-color:#52687b!important;color:#e3e9f0!important;}
html[data-tka-theme="dark"] .tka-retainer-fill {background:#20482d!important;}
html[data-tka-theme="dark"] .tka-retainer-over {background:#883e48!important;}
html[data-tka-theme="dark"] .tka-retainer-on-budget,html[data-tka-theme="dark"] .tka-retainer-task-active {color:#7ee084!important;}
html[data-tka-theme="dark"] .tka-retainer-over-budget {color:#ff9696!important;}
html[data-tka-theme="dark"] .tka-retainer-task-overdue {color:#ffb66e!important;}
html[data-tka-theme="dark"] .tka-retainer-budget {color:#bbc5cd!important;}
`;globalThis.ToolkitThemeEngine=Object.freeze({enable:$i,disable:ea,setFetchMethod:ta});globalThis.ToolkitThemeStyles=[na,oa,ra,aa,ia,sa].join(`
`);})();
