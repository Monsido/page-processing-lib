export type TreeType = ElementType;

export type ElementType = {
    tagName?: string,
    csId?: number,
    attr?: Array<Array<string>>,
    children?: Array<TreeType | TextNodeType>,
    shadowRoot?: TreeType,
} | Record<string, never>

export type TextNodeType = { text: string };
