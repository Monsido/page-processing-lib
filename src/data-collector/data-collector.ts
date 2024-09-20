import { CssType } from '../types/css-type';
import { TextNodeType, TreeType } from '../types/tree-type';

export class DataCollector {
    private tree: TreeType = {};
    private css: CssType = [];

    private disallowedTagNames = ['STYLE', 'SCRIPT'];
    private defaultStyles?: Record<string, string>;

    constructor () {}

    async collectData (html: HTMLElement): Promise<{tree:TreeType, css:CssType}> {
        this.css.push(this.getDefaultComputedStyles());

        const tree = await this.processTree(html);

        console.log(JSON.stringify(tree, null, 4));
        //    console.log(JSON.stringify(this.css, null, 4));

        return { tree: this.tree, css: this.css };
    }

    private processTree (el: HTMLElement): Promise<TreeType> {
        return new Promise(async (resolve) => {
            setTimeout(async () => {
                const data: TreeType = {
                    tagName: el.tagName.toUpperCase(),
                    attr: this.getAttributesList(el),
                };
                const { styles, sameId } = this.collectUniqueStyles(el);

                if (styles) {
                    if (sameId === undefined) {
                        data.csId = this.css.length;
                        this.css.push(styles);
                    } else {
                        data.csId = sameId;
                    }
                } else {
                    data.csId = 0;
                }

                const nodes = Array.from(el.childNodes);
                const lastIndex = nodes.length - 1;

                if (!nodes.length) {
                    resolve(data);
                } else {
                    data.children = [];

                    for (let i = 0; i < nodes.length; i += 1) {
                        const node = nodes[i];
                        if (node.nodeType === 1) {
                            if (!this.disallowedTagNames.includes((node as HTMLElement).tagName.toUpperCase())) {
                                const child = await this.processTree(node as HTMLElement);
                                (data.children as TreeType[]).push(child);
                            }
                        } else if (node.nodeType === 3) {
                            (data.children as TextNodeType[]).push({
                                text: this.cleanUpText(node.textContent || ''),
                            });
                        }

                        if (lastIndex === i) {
                            if (data.children && !data.children.length) {
                                delete data.children;
                            }
                            resolve(data);
                        }
                    }
                }

                /* el.childNodes.forEach(async node => {
                    if (node.nodeType === 1) {
                        if (!this.disallowedTagNames.includes((node as HTMLElement).tagName.toUpperCase())) {
                            (data.children as TreeType[]).push(await this.processTree(node as HTMLElement));
                        }
                    } else if (node.nodeType === 3) {
                        (data.children as TextNodeType[]).push({
                            text: this.cleanUpText(node.textContent || ''),
                        });
                    }
                }); */
            });

        });
    }

    private cleanUpText (text: string): string {
        return text.replaceAll(/ +/g, ' ');
    }

    private getAttributesList (el: HTMLElement): string[][] {
        const attrNames = Array.from(el.attributes);
        const result: string[][] = attrNames.map(n => [n.nodeName, n.nodeValue || '']);
        return result;
    }

    private getDefaultComputedStyles (): string {
        const defaultElement = document.createElement(`acq-default-element-${Date.now()}`);
        document.body.appendChild(defaultElement);
        const styles = this.collectStyles(defaultElement);
        this.defaultStyles = this.getStylesAsRecord(defaultElement);
        document.body.removeChild(defaultElement);
        return styles;
    }

    private getStylesAsRecord (el: HTMLElement): Record<string, string> {
        const styleObj = window.getComputedStyle(el);
        const result: Record<string, string> = {};
        for (let i = styleObj.length; i--; ) {
            const nameString = styleObj[i];
            result[nameString] = `${styleObj.getPropertyValue(nameString)};`;
        }
        return result;
    }

    private collectUniqueStyles (el: HTMLElement): {styles: string, sameId: number | undefined} {
        const styles = this.collectStyles(el, this.defaultStyles);
        let sameId: number | undefined;

        if (styles.length) {
            for (let i = 0; i < this.css.length; i += 1) {
                if (styles === this.css[i]) {
                    sameId = i;
                    break;
                }
            }
        }
        return { styles, sameId };
    }

    private collectStyles (el: HTMLElement, defaultStyles?: Record<string, string>): string {
        let stylesObj = this.getStylesAsRecord(el);
        let styleString = '';

        if (defaultStyles) {
            stylesObj = this.removeDefaultStyles(stylesObj, defaultStyles);
        }

        for (const k of Object.keys(stylesObj)) {
            styleString += k + ':' + stylesObj[k];
        }

        return styleString;
    }

    private removeDefaultStyles (stylesObj: Record<string, string>, defaultObj: Record<string, string>): Record<string, string> {
        const result: Record<string, string> = {};

        for (const k of Object.keys(stylesObj)) {
            if (stylesObj[k] !== defaultObj[k]) {
                result[k] = stylesObj[k];
            }
        }
        return result;
    }
}
