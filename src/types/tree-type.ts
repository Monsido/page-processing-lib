export type TreeType = ElementType | TextNodeType;

export type ElementType = {
    tagName: string,
    csId?: number,
    attr?: Array<Array<string>>,
    children?: Array<ElementType | TextNodeType>
    hasShadow?: boolean
}

export type TextNodeType = { text: string };
