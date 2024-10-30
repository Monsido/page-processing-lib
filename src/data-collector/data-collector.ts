import { CssType, TreeType, TextNodeType } from '../types';
import packageJson from '../../package.json';
import { PseudoClassMap } from '../types/css-type';
import { PseudoElementsList } from '../constants/pseudo-elements-list.constant';
import { CssStringSerializer } from '../utils/css-string-serializer';

export class DataCollector {
    private tree: TreeType = {};
    private css: CssType = [];
    private disallowedTagNames = ['STYLE', 'SCRIPT', 'MONSIDO-EXTENSION'];
    private monsidoIframeId = 'monsido-extension-iframe';
    private monsidoExtensionRootStyleId = 'mon-root-filter';
    private defaultStyles?: Record<string, string>;

    async collectData (html: HTMLElement): Promise<{tree:TreeType, css:CssType, html:string, v: string}> {
        this.setDefaultComputedStyles();
        const newHtml = this.removeExtensionElements(html);
        const cleanedHtml = this.cleanUpText(newHtml.outerHTML);
        this.tree = await this.processTree(html);
        return { tree: this.tree, css: this.css, html: cleanedHtml, v: packageJson.version };
    }

    private removeExtensionElements (html: HTMLElement): HTMLElement {
        const htmlClone = html.cloneNode(true) as HTMLElement;
        const extensionElements = [
            `IFRAME#${this.monsidoIframeId}`,
            `[data-monsido-extension-id][monsido-extension-version]`,
            `style#${this.monsidoExtensionRootStyleId}`,
            this.disallowedTagNames[2],
        ];
        extensionElements.forEach(selector => {
            const elements = htmlClone.querySelectorAll(selector);
            if (elements) {
                elements.forEach(element => {
                    element.remove();
                });
            }
        });
        return htmlClone;
    }

    private processTree (el: HTMLElement | ShadowRoot): Promise<TreeType> {
        return new Promise(async (resolve) => {
            setTimeout(async () => {
                const data: TreeType = {};

                if (el.nodeType !== 11) { // not a shadowRoot
                    data.tn = (el as HTMLElement).tagName.toUpperCase(),
                    data.ci = this.processStyles(el as HTMLElement);
                    const pseudoClassIndices = this.processPseudoElements(el as HTMLElement);
                    if (pseudoClassIndices) {
                        data.pcis = pseudoClassIndices;
                    }

                    data.a = this.getAttributesList(el as HTMLElement);

                    const shadowRoot = (el as HTMLElement).shadowRoot;
                    if (shadowRoot) {
                        data.sr = await this.processTree(shadowRoot);
                    }
                }

                data.c = [];

                const nodes = Array.from(el.childNodes);
                const lastIndex = nodes.length - 1;

                if (!nodes.length && !data.c.length) {
                    delete data.c;
                    resolve(data);
                } else {
                    for (let i = 0; i < nodes.length; i += 1) {
                        const node = nodes[i];
                        if (node.nodeType === 1) {
                            if (
                                this.isNodeExcluded(node as HTMLElement)
                            ) {
                                // do nothing; cannot use 'continue' since need to go until resolve
                            } else {
                                const child = await this.processTree(node as HTMLElement);
                                (data.c as TreeType[]).push(child);
                            }
                        } else if (node.nodeType === 3) {
                            (data.c as TextNodeType[]).push({
                                t: this.cleanUpText(node.textContent || ''),
                            });
                        }

                        if (lastIndex === i) {
                            if (data.c && !data.c.length) {
                                delete data.c;
                            }
                            resolve(data);
                        }
                    }
                }
            }, 0);
        });
    }

    private isNodeExcluded (node: HTMLElement): boolean {
        const tagName = node.tagName.toUpperCase();
        if (this.disallowedTagNames.includes(tagName)) {
            return true;
        }
        if ((tagName === 'IFRAME' && node.getAttribute('id') === this.monsidoIframeId)) {
            return true;
        }

        if (node.getAttribute('data-monsido-extension-id') && node.getAttribute('monsido-extension-version')) {
            return true;
        }

        if (node.tagName === 'STYLE' && node.getAttribute('id') === this.monsidoExtensionRootStyleId) {
            return true;
        }

        return false;
    }

    private processPseudoElements (el: HTMLElement): number[] | null {
        const result: number[] = [];
        for (const pseudoElementType of PseudoElementsList) {
            const { styles, sameId } = this.collectUniqueStyles(el, pseudoElementType);
            let csId = 0;

            if (styles) {
                if (sameId === undefined) {
                    csId = this.css.length;
                    this.css.push(CssStringSerializer.encode(styles, pseudoElementType));
                } else {
                    csId = sameId;
                }

                if (csId !== 0) {
                    result.push(csId);
                }
            }
        }

        if (result.length === 0) {
            return null;
        }

        return result;
    }

    private setDefaultComputedStyles (): void {
        this.defaultStyles = this.getStylesAsRecord(document.documentElement);
        this.css.push(this.collectStyles(this.defaultStyles));
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

    private getStylesAsRecord (el: HTMLElement, pseudoElement: string | null = null): Record<string, string> {
        const styleObj = window.getComputedStyle(el, pseudoElement);
        const result: Record<string, string> = {};
        if (pseudoElement !== null && (styleObj.content === 'none')) {
            return result;

        }
        for (let i = styleObj.length; i--; ) {
            const nameString = styleObj[i];
            result[nameString] = `${styleObj.getPropertyValue(nameString)};`;
        }
        return result;
    }

    private collectUniqueStyles (el: HTMLElement, pseudoElement: string | null = null): {styles: string, sameId: number | undefined} {
        const styles = this.collectStyles(this.getStylesAsRecord(el, pseudoElement), this.defaultStyles);
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
