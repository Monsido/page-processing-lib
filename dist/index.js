var a=class{css=[];makePage(t){this.css=t.css;let s={},e=this.traverseTree(t.tree,s),r=document.createDocumentFragment();r.appendChild(e);let n=this.buildStyle(s);return this.appendStyle(r,n),r}appendStyle(t,s){let e=t.querySelector("head");e?e.appendChild(s):t.appendChild(s)}buildStyle(t){let s=document.createElement("style"),e="";return e+=`html {${t[0]}} `,Object.keys(t||{}).forEach(r=>{e+=`[data-cs-${r}] {${t[parseInt(r)]}} `}),s.textContent=e.trimEnd(),s}traverseTree(t,s){if("tn"in t)return this.parseElementNode(t,s);if("t"in t)return this.parseTextNode(t);throw new Error("NodeType: Unknown node type")}parseElementNode(t,s){let e;try{e=document.createElement(t.tn||"")}catch(r){throw new Error(`TagName: ${r}`)}return this.dataCsId(e,s,t.ci),this.setAttributes(e,t.a),this.setShadowDom(e,t.sr),this.appendChildren(e,s,t.c),e}parseTextNode(t){return document.createTextNode(t.t)}dataCsId(t,s,e){if(e!==void 0)t.setAttribute(`data-cs-${e.toString()}`,""),s[e]=this.css[e];else throw new Error(`Invalid data-cs-id: "${e}"`)}setAttributes(t,s){(s||[]).forEach(e=>{try{t.setAttribute(e[0],e[1]||"")}catch(r){throw new Error(`Attribute: ${r}`)}})}setShadowDom(t,s){if(!s)return;let e;try{e=t.attachShadow({mode:"open"})}catch(i){throw new Error(`ShadowRoot: ${i}`)}let r={};this.appendChildren(e,r,s.c);let n=this.buildStyle(r);e.appendChild(n)}appendChildren(t,s,e){(e||[]).forEach(r=>{let n=this.traverseTree(r,s);t.appendChild(n)})}};var p={name:"page-processing-lib",version:"2.0.1",main:"dist/index.js",types:"dist/src/index.d.ts",repository:"git@github.com:Monsido/page-processing-lib.git",author:"Monsido frontend team",license:"MIT",private:!0,scripts:{build:"node build/build.mjs",serve:"node build/serve.mjs",lint:"eslint src --ext .ts",test:"jest","test:u":"jest --config=jest.unit.config.js","test:i":"jest --config=jest.integration.config.js",version:"yarn version"},files:["dist/**/*.js","dist/**/*.d.ts"],jest:{projects:["<rootDir>/jest.unit.config.js","<rootDir>/jest.integration.config.js"]},devDependencies:{"@monsido/eslint-config-typescript":"git+ssh://git@github.com:Monsido/eslint-config-typescript.git#1.0.9","@types/jest":"29.5.13","@types/jsdom":"21.1.7","@types/node":"22.5.4","@types/pixelmatch":"5.2.6","@typescript-eslint/eslint-plugin":"6.21.0","@typescript-eslint/parser":"6.21.0",esbuild:"0.21.5",eslint:"8.57.0",jest:"29.7.0","jest-environment-jsdom":"29.7.0","jest-environment-node":"29.7.0",pixelmatch:"5.3.0","png-js":"1.0.0",puppeteer:"21.11.0","ts-jest":"29.2.5",typescript:"5.6.2"}};var l=class{tree={};css=[];disallowedTagNames=["STYLE","SCRIPT","MONSIDO-EXTENSION"];monsidoIframeId="monsido-extension-iframe";defaultStyles;async collectData(t){this.setDefaultComputedStyles();let s=this.removeExtensionElements(t),e=this.cleanUpText(s.outerHTML);return this.tree=await this.processTree(t),{tree:this.tree,css:this.css,html:e,v:p.version}}removeExtensionElements(t){let s=t.cloneNode(!0);return[`IFRAME#${this.monsidoIframeId}`,this.disallowedTagNames[2]].forEach(r=>{let n=s.querySelectorAll(r);n&&n.forEach(i=>{i.remove()})}),s}processTree(t){return new Promise(async s=>{setTimeout(async()=>{let e={};if(t.nodeType!==11){e.tn=t.tagName.toUpperCase(),e.ci=this.processStyles(t),e.a=this.getAttributesList(t);let i=t.shadowRoot;i&&(e.sr=await this.processTree(i))}e.c=[];let r=Array.from(t.childNodes),n=r.length-1;if(!r.length&&!e.c.length)delete e.c,s(e);else for(let i=0;i<r.length;i+=1){let o=r[i];if(o.nodeType===1){let c=o.tagName.toUpperCase();if(!(this.disallowedTagNames.includes(c)||c==="IFRAME"&&o.getAttribute("id")===this.monsidoIframeId)){let m=await this.processTree(o);e.c.push(m)}}else o.nodeType===3&&e.c.push({t:this.cleanUpText(o.textContent||"")});n===i&&(e.c&&!e.c.length&&delete e.c,s(e))}},0)})}setDefaultComputedStyles(){this.defaultStyles=this.getStylesAsRecord(document.documentElement),this.css.push(this.collectStyles(this.defaultStyles))}processStyles(t){let{styles:s,sameId:e}=this.collectUniqueStyles(t),r=0;return s&&(e===void 0?(r=this.css.length,this.css.push(s)):r=e),r}getStylesAsRecord(t){let s=window.getComputedStyle(t),e={};for(let r=s.length;r--;){let n=s[r];e[n]=`${s.getPropertyValue(n)};`}return e}collectUniqueStyles(t){let s=this.collectStyles(this.getStylesAsRecord(t),this.defaultStyles),e;if(s.length){let r=this.css.indexOf(s);r!==-1&&(e=r)}return{styles:s,sameId:e}}collectStyles(t,s){return s&&(t=this.removeDefaultStyles(t,s)),Object.entries(t).map(([e,r])=>`${e}:${r}`).join("")}removeDefaultStyles(t,s){let e={};for(let r of Object.keys(t))t[r]!==s[r]&&(e[r]=t[r]);return e}getAttributesList(t){return Array.from(t.attributes).map(r=>[r.nodeName,r.nodeValue||""])}cleanUpText(t){return t.replaceAll(/ +/g," ")}};export{l as DataCollector,a as PageBuilder};
