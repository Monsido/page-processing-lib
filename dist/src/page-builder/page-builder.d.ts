import { TreeType, CssType } from '../types';
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
