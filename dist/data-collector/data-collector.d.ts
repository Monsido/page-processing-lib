import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';
export declare class DataCollector {
    private tree;
    private css;
    constructor();
    collectData(html: string): {
        tree: TreeType;
        css: CssType;
    };
}
