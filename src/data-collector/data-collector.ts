import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';

export class DataCollector {
    private tree: TreeType = { tagName: '', csId: -1 };
    private css: CssType = [];

    constructor () {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    collectData (html: string): {tree:TreeType, css:CssType} {
        // Mock up data for tree
        this.tree = {
            tagName: 'div',
            csId: 1,
            children: [
                {
                    tagName: 'h1',
                    csId: 2,
                    children: [
                        {
                            text: 'Hello, World!',
                        },
                    ],
                },
                {
                    tagName: 'p',
                    csId: 3,
                    children: [
                        {
                            text: 'This is a paragraph.',
                        },
                    ],
                },
            ],
        };

        // Mock up data for css
        this.css = [
            'backgroundColor:"red";color: "white";',
            'fontSize:"24px";fontWeight:"bold";',
            'fontSize:"16px";',
        ];
        return { tree: this.tree, css: this.css };
    }
}
