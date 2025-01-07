var h={onError:(a,e)=>{console.error(a,e)}},l=class{constructor(e=h){this.errorHandler=e}css=[];makePage(e){this.css=e.css;let s={},t=this.traverseTree(e.tree,s),r=document.createDocumentFragment();if(!t)return this.errorHandler.onError("Unable to make page from tree root"),r;r.appendChild(t);let n=this.buildStyle(s);return this.appendStyle(r,n),r}appendStyle(e,s){let t=e.querySelector("head");t?t.appendChild(s):e.appendChild(s)}buildStyle(e){let s=document.createElement("style"),t="";return Object.keys(e||{}).forEach(r=>{t+=`[data-cs-${r}] {${e[parseInt(r)]}} `}),s.textContent=t.trimEnd(),s}traverseTree(e,s){return"tn"in e?this.parseElementNode(e,s):"t"in e?this.parseTextNode(e):(this.errorHandler.onError("NodeType: Unknown node type"),null)}parseElementNode(e,s){let t;try{t=document.createElement(e.tn||"")}catch(r){return this.errorHandler.onError(`Invalid Tag name: ${e.tn}`,r),null}return this.dataCsId(t,s,e.ci),this.setAttributes(t,e.a),this.setShadowDom(t,e.sr),this.appendChildren(t,s,e.c),t}parseTextNode(e){return document.createTextNode(e.t)}dataCsId(e,s,t){t!==void 0?(e.setAttribute("data-cs-0",""),e.setAttribute(`data-cs-${t.toString()}`,""),s[t]=this.css[t]):this.errorHandler.onError(`Invalid data-cs-id: "${t}"`)}setAttributes(e,s){(s||[]).forEach(t=>{try{e.setAttribute(t[0],t[1]||"")}catch(r){this.errorHandler.onError(`Invalid attribute name: ${t[0]}`,r)}})}setShadowDom(e,s){if(!s)return;let t;try{t=e.attachShadow({mode:"open"})}catch(i){this.errorHandler.onError("Shadowroot",i);return}let r={};this.appendChildren(t,r,s.c);let n=this.buildStyle(r);t.appendChild(n)}appendChildren(e,s,t){(t||[]).forEach(r=>{let n=this.traverseTree(r,s);n&&e.appendChild(n)})}};var p="3.2.0";var d=class{tree={};css=[];disallowedTagNames=["STYLE","SCRIPT","MONSIDO-EXTENSION"];monsidoIframeId="monsido-extension-iframe";defaultStyles;async collectData(e){let{width:s,height:t}=this.getViewPortSize(e);if(!s||!t)throw new Error("No viewport size found");this.setDefaultComputedStyles();let r=this.removeExtensionElements(e),n=this.cleanUpText(r.outerHTML);return this.tree=await this.processTree(e),{tree:this.tree,css:this.css,html:n,v:p,vv:{w:s,h:t}}}removeExtensionElements(e){let s=e.cloneNode(!0);return[`IFRAME#${this.monsidoIframeId}`,this.disallowedTagNames[2]].forEach(r=>{let n=s.querySelectorAll(r);n&&n.forEach(i=>{i.remove()})}),s}processTree(e){return new Promise(async s=>{setTimeout(async()=>{let t={};if(e.nodeType!==11){t.tn=e.tagName.toUpperCase(),t.ci=this.processStyles(e),t.a=this.getAttributesList(e);let i=e.shadowRoot;i&&(t.sr=await this.processTree(i))}t.c=[];let r=Array.from(e.childNodes),n=r.length-1;if(!r.length&&!t.c.length)delete t.c,s(t);else for(let i=0;i<r.length;i+=1){let o=r[i];if(o.nodeType===1){let c=o.tagName.toUpperCase();if(!(this.disallowedTagNames.includes(c)||c==="IFRAME"&&o.getAttribute("id")===this.monsidoIframeId)){let m=await this.processTree(o);t.c.push(m)}}else o.nodeType===3&&t.c.push({t:this.cleanUpText(o.textContent||"")});n===i&&(t.c&&!t.c.length&&delete t.c,s(t))}},0)})}setDefaultComputedStyles(){this.defaultStyles=this.getStylesAsRecord(document.documentElement),this.css.push(this.collectStyles(this.defaultStyles))}getViewPortSize(e){let s=window.visualViewport?.width||window.innerWidth||e.clientWidth,t=window.visualViewport?.height||window.innerHeight||e.clientHeight;return{width:s,height:t}}processStyles(e){let{styles:s,sameId:t}=this.collectUniqueStyles(e),r=0;return s&&(t===void 0?(r=this.css.length,this.css.push(s)):r=t),r}getStylesAsRecord(e){let s=window.getComputedStyle(e),t={};for(let r=s.length;r--;){let n=s[r];t[n]=`${s.getPropertyValue(n)};`}return t}collectUniqueStyles(e){let s=this.collectStyles(this.getStylesAsRecord(e),this.defaultStyles),t;if(s.length){let r=this.css.indexOf(s);r!==-1&&(t=r)}return{styles:s,sameId:t}}collectStyles(e,s){return s&&(e=this.removeDefaultStyles(e,s)),Object.entries(e).map(([t,r])=>`${t}:${r}`).join("")}removeDefaultStyles(e,s){let t={};for(let r of Object.keys(e))e[r]!==s[r]&&(t[r]=e[r]);return t}getAttributesList(e){return Array.from(e.attributes).map(r=>[r.nodeName,r.nodeValue||""])}cleanUpText(e){return e.replaceAll(/ +/g," ")}};export{d as DataCollector,l as PageBuilder};
