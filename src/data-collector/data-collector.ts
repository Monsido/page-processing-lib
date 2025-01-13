/*
    page-processing-lib - A library for processing web pages and extracting data from them.
    Copyright (C) 2024-2025 Acquia Inc.

    This file is part of page-processing-lib.

    page-processing-lib is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    page-processing-lib is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with page-processing-lib. If not, see <http://www.gnu.org/licenses/>.
*/
import { CssType, TreeType, TextNodeType } from '../types';
import { version } from '../../package.json';

export class DataCollector {
    private tree: TreeType = {};
    private css: CssType = [];
    private disallowedTagNames = ['STYLE', 'SCRIPT', 'MONSIDO-EXTENSION'];
    private monsidoIframeId = 'monsido-extension-iframe';
    private defaultStyles?: Record<string, string>;

    async collectData (html: HTMLElement): Promise<{ tree: TreeType, css: CssType, html: string, v: string, vv: { w: number, h: number } }> {
        const { width, height } = this.getViewPortSize(html);
        if (!width || !height) {
            throw new Error('No viewport size found');
        }
        this.setDefaultComputedStyles();
        const newHtml = this.removeExtensionElements(html);
        const cleanedHtml = this.cleanUpText(newHtml.outerHTML);
        this.tree = await this.processTree(html);
        return { tree: this.tree, css: this.css, html: cleanedHtml, v: version, vv: { w: width, h: height } };
    }

    private removeExtensionElements (html: HTMLElement): HTMLElement {
        const htmlClone = html.cloneNode(true) as HTMLElement;
        const extensionElements = [`IFRAME#${this.monsidoIframeId}`, this.disallowedTagNames[2]];
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
                            const tagName = (node as HTMLElement).tagName.toUpperCase();
                            if (
                                this.disallowedTagNames.includes(tagName) ||
                                (tagName === 'IFRAME' && (node as HTMLElement).getAttribute('id') === this.monsidoIframeId)
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

    private setDefaultComputedStyles (): void {
        this.defaultStyles = this.getStylesAsRecord(document.documentElement);
        this.css.push(this.collectStyles(this.defaultStyles));
    }

    private getViewPortSize (html: HTMLElement): { width: number, height: number } {
        const viewportWidth = window.visualViewport?.width || window.innerWidth || html.clientWidth;
        const viewportHeight = window.visualViewport?.height || window.innerHeight || html.clientHeight;

        return {
            width: viewportWidth,
            height: viewportHeight,
        };
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
        for (let i = styleObj.length; i--;) {
            const nameString = styleObj[i];
            result[nameString] = `${styleObj.getPropertyValue(nameString)};`;
        }
        return result;
    }

    private collectUniqueStyles (el: HTMLElement): { styles: string, sameId: number | undefined } {
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
