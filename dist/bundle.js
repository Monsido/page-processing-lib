var r=class{tree;css;constructor(){}makePage(e){return this.tree=e.tree,this.css=e.css,"<div><h1>Hello, World!</h1><p>This is a paragraph.</p></div>"}};var s=class{tree={tagName:"",csId:-1};css=[];constructor(){}collectData(e){return this.tree={tagName:"div",csId:1,children:[{tagName:"h1",csId:2,children:[{text:"Hello, World!"}]},{tagName:"p",csId:3,children:[{text:"This is a paragraph."}]}]},this.css=['backgroundColor:"red";color: "white";','fontSize:"24px";fontWeight:"bold";','fontSize:"16px";'],{tree:this.tree,css:this.css}}};export{s as DataCollector,r as PageBuilder};
