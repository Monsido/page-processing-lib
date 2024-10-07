import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';
export declare class PageBuilder {
    css: CssType;
    makePage(content: {
        tree: TreeType;
        css: CssType;
    }): DocumentFragment;
    private appendStyle;
    private buildStyle;
    private traverseTree;
    private parseElementNode;
    private parseTextNode;
    private dataCsId;
    private setAttributes;
    private setShadowDom;
    private appendChildren;
}
