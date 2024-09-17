import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';
export class PageBuilder {
    private tree: TreeType | undefined;
    private css: CssType | undefined;

    constructor () {}

    makePage (content: {tree: TreeType, css: CssType }): string {
        this.tree = content.tree;
        this.css = content.css;
        return '<div><h1>Hello, World!</h1><p>This is a paragraph.</p></div>';
    }
}
