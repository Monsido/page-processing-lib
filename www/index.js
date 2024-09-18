new EventSource('/esbuild').addEventListener('change', () => location.reload());

// src/page-builder/page-builder.ts
var PageBuilder = class {
  tree;
  css;
  constructor() {
  }
  makePage(content) {
    this.tree = content.tree;
    this.css = content.css;
    return "<div><h1>Hello, World!</h1><p>This is a paragraph.</p></div>";
  }
};

// src/data-collector/data-collector.ts
var DataCollector = class {
  tree = { tagName: "", csId: -1 };
  css = [];
  constructor() {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  collectData(html) {
    this.tree = {
      tagName: "div",
      csId: 1,
      children: [
        {
          tagName: "h1",
          csId: 2,
          children: [
            {
              text: "Hello, World!"
            }
          ]
        },
        {
          tagName: "p",
          csId: 3,
          children: [
            {
              text: "This is a paragraph."
            }
          ]
        }
      ]
    };
    this.css = [
      'backgroundColor:"red";color: "white";',
      'fontSize:"24px";fontWeight:"bold";',
      'fontSize:"16px";'
    ];
    return { tree: this.tree, css: this.css };
  }
};
export {
  DataCollector,
  PageBuilder
};
//# sourceMappingURL=index.js.map
