export type TreeType = {
    tagName: string,
    csId?: number,
    attr?: Array<Array<string>>,
    children?: Array<ElementType | TextNodeType>
    hasShadow?: boolean
}

export type ElementType = {
    tagName: string,
    csId?: number,
    attr?: Array<Array<string>>,
    children?: Array<ElementType | TextNodeType>
    hasShadow?: boolean
}

export type TextNodeType = { text: string };
