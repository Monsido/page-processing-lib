import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';
export declare class DataCollector {
    private tree;
    private css;
    private disallowedTagNames;
    private monsidoIframeId;
    private defaultStyles?;
    collectData(html: HTMLElement): Promise<{
        tree: TreeType;
        css: CssType;
        v: string;
    }>;
    private processTree;
    private setDefaultComputedStyles;
    private processStyles;
    private getStylesAsRecord;
    private collectUniqueStyles;
    private collectStyles;
    private removeDefaultStyles;
    private getAttributesList;
    private cleanUpText;
}
