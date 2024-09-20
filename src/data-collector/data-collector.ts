import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';

export class DataCollector {
    private tree: TreeType = {};
    private css: CssType = [];

    private disallowedTagNames = ['STYLE', 'SCRIPT'];
    private defaultStyles?: Record<string, string>;

    constructor () {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    collectData (html: HTMLElement): {tree:TreeType, css:CssType} {

        // Mock up data for tree
        /* this.tree = {
            tagName: 'div',
            csId: 1,
            children: [
                {
                    tagName: 'h1',
                    csId: 2,
                    children: [
                        {
                            text: 'Hello, World!',
                        },
                    ],
                },
                {
                    tagName: 'p',
                    csId: 3,
                    children: [
                        {
                            text: 'This is a paragraph.',
                        },
                    ],
                },
            ],
        }; */
        this.css.push(this.getDefaultComputedStyles());

        const tree = this.processTree(html);
        console.log(tree);

        return { tree: this.tree, css: this.css };
    }

    private processTree (el: HTMLElement): TreeType {
        const data: TreeType = {
            tagName: el.tagName.toUpperCase(),
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
        data.children = [];
        el.childNodes.forEach(node => {
            if (node.nodeType === 1) {
                if (!this.disallowedTagNames.includes((node as HTMLElement).tagName.toUpperCase())) {
                    (data.children as TreeType[]).push(this.processTree(node as HTMLElement));
                }
            } else if (node.nodeType === 3) {

            }
        });
        return data;
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
