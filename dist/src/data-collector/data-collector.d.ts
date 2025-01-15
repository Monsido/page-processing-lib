import { CssType, TreeType } from '../types';
export declare class DataCollector {
    private tree;
    private css;
    private disallowedTagNames;
    private monsidoIframeId;
    private defaultStyles?;
    collectData(html: HTMLElement): Promise<{
        dom_tree: TreeType;
        css: CssType;
        html: string;
        version: string;
        viewport: {
            w: number;
            h: number;
        };
    }>;
    private removeExtensionElements;
    private processTree;
    private setDefaultComputedStyles;
    private getViewPortSize;
    private processStyles;
    private getStylesAsRecord;
    private collectUniqueStyles;
    private collectStyles;
    private removeDefaultStyles;
    private getAttributesList;
    private cleanUpText;
}
