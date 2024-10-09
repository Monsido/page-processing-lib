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
        html: string;
        v: string;
    }>;
    private removeExtensionElements;
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
