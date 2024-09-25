import { CssType } from '../types/css-type';
import { TextNodeType, TreeType } from '../types/tree-type';
import packageJson from '../../package.json';

export class DataCollector {
    private tree: TreeType = {};
    private css: CssType = [];

    private disallowedTagNames = ['STYLE', 'SCRIPT'];
    private defaultStyles?: Record<string, string>;

    async collectData (html: HTMLElement): Promise<{tree:TreeType, css:CssType, v: string}> {
        this.setDefaultComputedStyles();
        this.tree = await this.processTree(html);
        return { tree: this.tree, css: this.css, v: packageJson.version };
    }

    private processTree (el: HTMLElement | ShadowRoot): Promise<TreeType> {
        return new Promise(async (resolve) => {
            setTimeout(async () => {
                const data: TreeType = {};

                if (el.nodeType !== 11) { // not a shadowRoot
                    data.tagName = (el as HTMLElement).tagName.toUpperCase(),
                    data.csId = this.processStyles(el as HTMLElement);
                    data.attr = this.getAttributesList(el as HTMLElement);

                    const shadowRoot = (el as HTMLElement).shadowRoot;
                    if (shadowRoot) {
                        data.shadowRoot = await this.processTree(shadowRoot);
                    }
                }

                data.children = [];

                const nodes = Array.from(el.childNodes);
                const lastIndex = nodes.length - 1;

                if (!nodes.length && !data.children.length) {
                    delete data.children;
                    resolve(data);
                } else {
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
            }, 0);
        });
    }

    private setDefaultComputedStyles (): void {
        const defaultElement = document.createElement(`acq-default-element-${Date.now()}`);
        document.body.appendChild(defaultElement);
        this.defaultStyles = this.getStylesAsRecord(defaultElement);
        this.css.push(this.collectStyles(this.defaultStyles));
        document.body.removeChild(defaultElement);
    }

    private processStyles (el: HTMLElement): number | undefined {
        const { styles, sameId } = this.collectUniqueStyles(el);
        // No unique styles means the style is identical to the default
        let csId = 0;

        if (styles) {
            if (sameId === undefined) {
                csId = this.css.length;
                this.css.push(styles);
            } else {
                csId = sameId;
            }
        }
        return csId;
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
        const styles = this.collectStyles(this.getStylesAsRecord(el), this.defaultStyles);
        let sameId: number | undefined;

        if (styles.length) {
            const index = this.css.indexOf(styles);
            if (index !== -1) {
                sameId = index;
            }
        }
        return { styles, sameId };
    }

    private collectStyles (stylesObj: Record<string, string>, defaultStyles?: Record<string, string>): string {
        if (defaultStyles) {
            stylesObj = this.removeDefaultStyles(stylesObj, defaultStyles);
        }

        return Object.entries(stylesObj)
            .map(([key, value]) => `${key}:${value}`)
            .join('');
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

    private getAttributesList (el: HTMLElement): string[][] {
        const attrNames = Array.from(el.attributes);
        const result: string[][] = attrNames.map(n => [n.nodeName, n.nodeValue || '']);
        return result;
    }

    private cleanUpText (text: string): string {
        return text.replaceAll(/ +/g, ' ');
    }

}
