var T={onError:(a,e)=>{console.error(a,e)}},l=class{constructor(e=T){this.errorHandler=e}css=[];makePage(e){this.css=e.css;let s={},t=this.traverseTree(e.tree,s),r=document.createDocumentFragment();if(!t)return this.errorHandler.onError("Unable to make page from tree root"),r;r.appendChild(t);let n=this.buildStyle(s);return this.appendStyle(r,n),r}appendStyle(e,s){let t=e.querySelector("head");t?t.appendChild(s):e.appendChild(s)}buildStyle(e){let s=document.createElement("style"),t="";return Object.keys(e||{}).forEach(r=>{t+=`[data-cs-${r}] {${e[parseInt(r)]}} `}),s.textContent=t.trimEnd(),s}traverseTree(e,s){return"tn"in e?this.parseElementNode(e,s):"t"in e?this.parseTextNode(e):(this.errorHandler.onError("NodeType: Unknown node type"),null)}parseElementNode(e,s){let t;try{t=document.createElement(e.tn||"")}catch(r){return this.errorHandler.onError(`Invalid Tag name: ${e.tn}`,r),null}return this.dataCsId(t,s,e.ci),this.setAttributes(t,e.a),this.setShadowDom(t,e.sr),this.appendChildren(t,s,e.c),t}parseTextNode(e){return document.createTextNode(e.t)}dataCsId(e,s,t){t!==void 0?(e.setAttribute("data-cs-0",""),e.setAttribute(`data-cs-${t.toString()}`,""),s[t]=this.css[t]):this.errorHandler.onError(`Invalid data-cs-id: "${t}"`)}setAttributes(e,s){(s||[]).forEach(t=>{try{e.setAttribute(t[0],t[1]||"")}catch(r){this.errorHandler.onError(`Invalid attribute name: ${t[0]}`,r)}})}setShadowDom(e,s){if(!s)return;let t;try{t=e.attachShadow({mode:"open"})}catch(i){this.errorHandler.onError("Shadowroot",i);return}let r={};this.appendChildren(t,r,s.c);let n=this.buildStyle(r);t.appendChild(n)}appendChildren(e,s,t){(t||[]).forEach(r=>{let n=this.traverseTree(r,s);n&&e.appendChild(n)})}};var p={name:"page-processing-lib",version:"2.0.2",main:"dist/index.js",types:"dist/src/index.d.ts",repository:"git@github.com:Monsido/page-processing-lib.git",author:"Monsido frontend team",license:"MIT",private:!0,scripts:{build:"node build/build.mjs",serve:"node build/serve.mjs",lint:"eslint src --ext .ts",test:"jest","test:u":"jest --config=jest.unit.config.js","test:i":"jest --config=jest.integration.config.js",version:"yarn version"},files:["dist/**/*.js","dist/**/*.d.ts"],jest:{projects:["<rootDir>/jest.unit.config.js","<rootDir>/jest.integration.config.js"]},devDependencies:{"@monsido/eslint-config-typescript":"git+ssh://git@github.com:Monsido/eslint-config-typescript.git#1.0.9","@types/jest":"29.5.13","@types/jsdom":"21.1.7","@types/node":"22.5.4","@types/pixelmatch":"5.2.6","@typescript-eslint/eslint-plugin":"6.21.0","@typescript-eslint/parser":"6.21.0",esbuild:"0.21.5",eslint:"8.57.0",jest:"29.7.0","jest-environment-jsdom":"29.7.0","jest-environment-node":"29.7.0",pixelmatch:"5.3.0","png-js":"1.0.0",puppeteer:"21.11.0","ts-jest":"29.2.5",typescript:"5.6.2"}};var d=class{tree={};css=[];disallowedTagNames=["STYLE","SCRIPT","MONSIDO-EXTENSION"];monsidoIframeId="monsido-extension-iframe";defaultStyles;async collectData(e){this.setDefaultComputedStyles();let s=this.removeExtensionElements(e),t=this.cleanUpText(s.outerHTML);return this.tree=await this.processTree(e),{tree:this.tree,css:this.css,html:t,v:p.version}}removeExtensionElements(e){let s=e.cloneNode(!0);return[`IFRAME#${this.monsidoIframeId}`,this.disallowedTagNames[2]].forEach(r=>{let n=s.querySelectorAll(r);n&&n.forEach(i=>{i.remove()})}),s}processTree(e){return new Promise(async s=>{setTimeout(async()=>{let t={};if(e.nodeType!==11){t.tn=e.tagName.toUpperCase(),t.ci=this.processStyles(e),t.a=this.getAttributesList(e);let i=e.shadowRoot;i&&(t.sr=await this.processTree(i))}t.c=[];let r=Array.from(e.childNodes),n=r.length-1;if(!r.length&&!t.c.length)delete t.c,s(t);else for(let i=0;i<r.length;i+=1){let o=r[i];if(o.nodeType===1){let c=o.tagName.toUpperCase();if(!(this.disallowedTagNames.includes(c)||c==="IFRAME"&&o.getAttribute("id")===this.monsidoIframeId)){let m=await this.processTree(o);t.c.push(m)}}else o.nodeType===3&&t.c.push({t:this.cleanUpText(o.textContent||"")});n===i&&(t.c&&!t.c.length&&delete t.c,s(t))}},0)})}setDefaultComputedStyles(){this.defaultStyles=this.getStylesAsRecord(document.documentElement),this.css.push(this.collectStyles(this.defaultStyles))}processStyles(e){let{styles:s,sameId:t}=this.collectUniqueStyles(e),r=0;return s&&(t===void 0?(r=this.css.length,this.css.push(s)):r=t),r}getStylesAsRecord(e){let s=window.getComputedStyle(e),t={};for(let r=s.length;r--;){let n=s[r];t[n]=`${s.getPropertyValue(n)};`}return t}collectUniqueStyles(e){let s=this.collectStyles(this.getStylesAsRecord(e),this.defaultStyles),t;if(s.length){let r=this.css.indexOf(s);r!==-1&&(t=r)}return{styles:s,sameId:t}}collectStyles(e,s){return s&&(e=this.removeDefaultStyles(e,s)),Object.entries(e).map(([t,r])=>`${t}:${r}`).join("")}removeDefaultStyles(e,s){let t={};for(let r of Object.keys(e))e[r]!==s[r]&&(t[r]=e[r]);return t}getAttributesList(e){return Array.from(e.attributes).map(r=>[r.nodeName,r.nodeValue||""])}cleanUpText(e){return e.replaceAll(/ +/g," ")}};export{d as DataCollector,l as PageBuilder};
