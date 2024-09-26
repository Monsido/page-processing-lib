export type TreeType = ElementType;

export type ElementType = {
    tagName?: string,
    csId?: number,
    attr?: Array<Array<string>>,
    children?: Array<TreeType | TextNodeType>,
    shadowRoot?: ShadowRootType,
} | Record<string, never>

export type ShadowRootType = {
    tagName?: string,
    csId?: number,
    attr?: Array<Array<string>>,
    children?: Array<TreeType | TextNodeType>,
    shadowRoot?: TreeType,
}

export type TextNodeType = { text: string };
