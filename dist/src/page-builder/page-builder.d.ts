import { TreeType, CssType, ErrorHandlerType } from '../types';
export declare class PageBuilder {
    readonly errorHandler: ErrorHandlerType;
    css: CssType;
    constructor(errorHandler?: ErrorHandlerType);
    makePage(content: {
        dom_tree: TreeType;
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
