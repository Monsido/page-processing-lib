var a=class{css=[];makePage(e){this.css=e.css;let s={},t=this.traverseTree(e.tree,s),r=document.createDocumentFragment();r.appendChild(t);let n=this.buildStyle(s);return this.appendStyle(r,n),r}appendStyle(e,s){let t=e.querySelector("head");t?t.appendChild(s):e.appendChild(s)}buildStyle(e){let s=document.createElement("style"),t="";return Object.keys(e||{}).forEach(r=>{t+=`[data-cs-${r}] {${e[parseInt(r)]}} `}),s.textContent=t.trimEnd(),s}traverseTree(e,s){if("tn"in e)return this.parseElementNode(e,s);if("t"in e)return this.parseTextNode(e);throw new Error("NodeType: Unknown node type")}parseElementNode(e,s){let t;try{t=document.createElement(e.tn||"")}catch(r){throw new Error(`TagName: ${r}`)}return this.dataCsId(t,s,e.ci),this.setAttributes(t,e.a),this.setShadowDom(t,e.sr),this.appendChildren(t,s,e.c),t}parseTextNode(e){return document.createTextNode(e.t)}dataCsId(e,s,t){if(t!==void 0)e.setAttribute(`data-cs-${t.toString()}`,""),s[t]=this.css[t];else throw new Error(`Invalid data-cs-id: "${t}"`)}setAttributes(e,s){(s||[]).forEach(t=>{try{e.setAttribute(t[0],t[1]||"")}catch(r){throw new Error(`Attribute: ${r}`)}})}setShadowDom(e,s){if(!s)return;let t;try{t=e.attachShadow({mode:"open"})}catch(i){throw new Error(`ShadowRoot: ${i}`)}let r={};this.appendChildren(t,r,s.c);let n=this.buildStyle(r);t.appendChild(n)}appendChildren(e,s,t){(t||[]).forEach(r=>{let n=this.traverseTree(r,s);e.appendChild(n)})}};var c={name:"page-processing-lib",version:"1.3.2",main:"dist/index.js",types:"dist/src/index.d.ts",repository:"git@github.com:Monsido/page-processing-lib.git",author:"Monsido frontend team",license:"MIT",private:!0,scripts:{build:"node build/build.mjs",serve:"node build/serve.mjs",lint:"eslint src --ext .ts",test:"jest","test:u":"jest --config=jest.unit.config.js","test:i":"jest --config=jest.integration.config.js",version:"yarn version"},files:["dist/**/*.js","dist/**/*.json","dist/**/*.d.ts"],exports:{".":{require:"./dist/index.cjs.js",import:"./dist/index.js"}},devDependencies:{"@monsido/eslint-config-typescript":"git+ssh://git@github.com:Monsido/eslint-config-typescript.git#1.0.9","@types/jest":"29.5.13","@types/jest-image-snapshot":"6.4.0","@types/jsdom":"21.1.7","@types/node":"22.5.4","@typescript-eslint/eslint-plugin":"6.21.0","@typescript-eslint/parser":"6.21.0",esbuild:"0.21.5",eslint:"8.57.0",jest:"29.7.0","jest-environment-jsdom":"29.7.0","jest-environment-node":"29.7.0","jest-image-snapshot":"6.4.0",puppeteer:"22.15.0","ts-jest":"29.2.5",typescript:"5.6.2"},jest:{projects:["<rootDir>/jest.unit.config.js","<rootDir>/jest.integration.config.js"]}};var l=class{tree={};css=[];disallowedTagNames=["STYLE","SCRIPT","MONSIDO-EXTENSION"];monsidoIframeId="monsido-extension-iframe";defaultStyles;async collectData(e){this.setDefaultComputedStyles();let s=this.removeExtensionElements(e),t=this.cleanUpText(s.outerHTML);return this.tree=await this.processTree(e),{tree:this.tree,css:this.css,html:t,v:c.version}}removeExtensionElements(e){let s=e.cloneNode(!0);return[`IFRAME#${this.monsidoIframeId}`,this.disallowedTagNames[2]].forEach(r=>{let n=s.querySelectorAll(r);n&&n.forEach(i=>{i.remove()})}),s}processTree(e){return new Promise(async s=>{setTimeout(async()=>{let t={};if(e.nodeType!==11){t.tn=e.tagName.toUpperCase(),t.ci=this.processStyles(e),t.a=this.getAttributesList(e);let i=e.shadowRoot;i&&(t.sr=await this.processTree(i))}t.c=[];let r=Array.from(e.childNodes),n=r.length-1;if(!r.length&&!t.c.length)delete t.c,s(t);else for(let i=0;i<r.length;i+=1){let o=r[i];if(o.nodeType===1){let d=o.tagName.toUpperCase();if(!(this.disallowedTagNames.includes(d)||d==="IFRAME"&&o.getAttribute("id")===this.monsidoIframeId)){let m=await this.processTree(o);t.c.push(m)}}else o.nodeType===3&&t.c.push({t:this.cleanUpText(o.textContent||"")});n===i&&(t.c&&!t.c.length&&delete t.c,s(t))}},0)})}setDefaultComputedStyles(){let e=document.createElement(`acq-default-element-${Date.now()}`);document.body.appendChild(e),this.defaultStyles=this.getStylesAsRecord(e),this.css.push(this.collectStyles(this.defaultStyles)),document.body.removeChild(e)}processStyles(e){let{styles:s,sameId:t}=this.collectUniqueStyles(e),r=0;return s&&(t===void 0?(r=this.css.length,this.css.push(s)):r=t),r}getStylesAsRecord(e){let s=window.getComputedStyle(e),t={};for(let r=s.length;r--;){let n=s[r];t[n]=`${s.getPropertyValue(n)};`}return t}collectUniqueStyles(e){let s=this.collectStyles(this.getStylesAsRecord(e),this.defaultStyles),t;if(s.length){let r=this.css.indexOf(s);r!==-1&&(t=r)}return{styles:s,sameId:t}}collectStyles(e,s){return s&&(e=this.removeDefaultStyles(e,s)),Object.entries(e).map(([t,r])=>`${t}:${r}`).join("")}removeDefaultStyles(e,s){let t={};for(let r of Object.keys(e))e[r]!==s[r]&&(t[r]=e[r]);return t}getAttributesList(e){return Array.from(e.attributes).map(r=>[r.nodeName,r.nodeValue||""])}cleanUpText(e){return e.replaceAll(/ +/g," ")}};var y="1.3.2";export{l as DataCollector,a as PageBuilder,y as version};
