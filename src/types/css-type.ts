export type CssType = Array<string>;
export type PseudoElementType = ':before' | ':after';
export type PseudoClassMap = {
    [key in PseudoElementType]?: number
};

