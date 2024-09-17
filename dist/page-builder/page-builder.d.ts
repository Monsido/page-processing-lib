import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';
export declare class PageBuilder {
    private tree;
    private css;
    constructor();
    makePage(content: {
        tree: TreeType;
        css: CssType;
    }): string;
}
