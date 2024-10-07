"use strict";var c=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var y=Object.getOwnPropertyNames;var u=Object.prototype.hasOwnProperty;var g=(i,e)=>{for(var s in e)c(i,s,{get:e[s],enumerable:!0})},f=(i,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of y(e))!u.call(i,r)&&r!==s&&c(i,r,{get:()=>e[r],enumerable:!(t=h(e,r))||t.enumerable});return i};var E=i=>f(c({},"__esModule",{value:!0}),i);var S={};g(S,{DataCollector:()=>d,PageBuilder:()=>l,version:()=>m});module.exports=E(S);var l=class{css=[];makePage(e){this.css=e.css;let s={},t=this.traverseTree(e.tree,s),r=document.createDocumentFragment();r.appendChild(t);let n=this.buildStyle(s);return this.appendStyle(r,n),r}appendStyle(e,s){let t=e.querySelector("head");t?t.appendChild(s):e.appendChild(s)}buildStyle(e){let s=document.createElement("style"),t="";return Object.keys(e||{}).forEach(r=>{t+=`[data-cs-${r}] {${e[parseInt(r)]}} `}),s.textContent=t.trimEnd(),s}traverseTree(e,s){if("tn"in e)return this.parseElementNode(e,s);if("t"in e)return this.parseTextNode(e);throw new Error("NodeType: Unknown node type")}parseElementNode(e,s){let t;try{t=document.createElement(e.tn||"")}catch(r){throw new Error(`TagName: ${r}`)}return this.dataCsId(t,s,e.ci),this.setAttributes(t,e.a),this.setShadowDom(t,e.sr),this.appendChildren(t,s,e.c),t}parseTextNode(e){return document.createTextNode(e.t)}dataCsId(e,s,t){if(t!==void 0)e.setAttribute(`data-cs-${t.toString()}`,""),s[t]=this.css[t];else throw new Error(`Invalid data-cs-id: "${t}"`)}setAttributes(e,s){(s||[]).forEach(t=>{try{e.setAttribute(t[0],t[1]||"")}catch(r){throw new Error(`Attribute: ${r}`)}})}setShadowDom(e,s){if(!s)return;let t;try{t=e.attachShadow({mode:"open"})}catch(o){throw new Error(`ShadowRoot: ${o}`)}let r={};this.appendChildren(t,r,s.c);let n=this.buildStyle(r);t.appendChild(n)}appendChildren(e,s,t){(t||[]).forEach(r=>{let n=this.traverseTree(r,s);e.appendChild(n)})}};var d=class{tree={};css=[];version;disallowedTagNames=["STYLE","SCRIPT","MONSIDO-EXTENSION"];monsidoIframeId="monsido-extension-iframe";defaultStyles;constructor(e){this.version=e}async collectData(e){return this.setDefaultComputedStyles(),this.tree=await this.processTree(e),{tree:this.tree,css:this.css,v:this.version}}processTree(e){return new Promise(async s=>{setTimeout(async()=>{let t={};if(e.nodeType!==11){t.tn=e.tagName.toUpperCase(),t.ci=this.processStyles(e),t.a=this.getAttributesList(e);let o=e.shadowRoot;o&&(t.sr=await this.processTree(o))}t.c=[];let r=Array.from(e.childNodes),n=r.length-1;if(!r.length&&!t.c.length)delete t.c,s(t);else for(let o=0;o<r.length;o+=1){let a=r[o];if(a.nodeType===1){let p=a.tagName.toUpperCase();if(!(this.disallowedTagNames.includes(p)||p==="IFRAME"&&a.getAttribute("id")===this.monsidoIframeId)){let T=await this.processTree(a);t.c.push(T)}}else a.nodeType===3&&t.c.push({t:this.cleanUpText(a.textContent||"")});n===o&&(t.c&&!t.c.length&&delete t.c,s(t))}},0)})}setDefaultComputedStyles(){let e=document.createElement(`acq-default-element-${Date.now()}`);document.body.appendChild(e),this.defaultStyles=this.getStylesAsRecord(e),this.css.push(this.collectStyles(this.defaultStyles)),document.body.removeChild(e)}processStyles(e){let{styles:s,sameId:t}=this.collectUniqueStyles(e),r=0;return s&&(t===void 0?(r=this.css.length,this.css.push(s)):r=t),r}getStylesAsRecord(e){let s=window.getComputedStyle(e),t={};for(let r=s.length;r--;){let n=s[r];t[n]=`${s.getPropertyValue(n)};`}return t}collectUniqueStyles(e){let s=this.collectStyles(this.getStylesAsRecord(e),this.defaultStyles),t;if(s.length){let r=this.css.indexOf(s);r!==-1&&(t=r)}return{styles:s,sameId:t}}collectStyles(e,s){return s&&(e=this.removeDefaultStyles(e,s)),Object.entries(e).map(([t,r])=>`${t}:${r}`).join("")}removeDefaultStyles(e,s){let t={};for(let r of Object.keys(e))e[r]!==s[r]&&(t[r]=e[r]);return t}getAttributesList(e){return Array.from(e.attributes).map(r=>[r.nodeName,r.nodeValue||""])}cleanUpText(e){return e.replaceAll(/ +/g," ")}};var m="1.0.0";
