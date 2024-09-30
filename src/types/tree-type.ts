export type TreeType = ElementType;

export type ElementType = {
    tn?: string,
    ci?: number,
    a?: Array<Array<string>>,
    c?: Array<TreeType | TextNodeType>,
    sr?: ShadowRootType,
} | Record<string, never>

export type ShadowRootType = {
    tn?: string,
    ci?: number,
    a?: Array<Array<string>>,
    c?: Array<TreeType | TextNodeType>,
    sr?: ShadowRootType,
}

export type TextNodeType = { t: string };
