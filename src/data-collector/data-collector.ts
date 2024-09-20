import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';

export class DataCollector {
    private tree: TreeType = {};
    private css: CssType = [];

    private defaultStyles: Record<string, string> = {};

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
        this.processTree(html);

        return { tree: this.tree, css: this.css };
    }

    private processTree (el: HTMLElement): void {
        const data: TreeType = {
            tagName: el.tagName.toUpperCase(),
        };
        const { styles, sameId } = this.collectUniqueStyles(el);

        if (sameId === undefined) {
            data.csId = this.css.length;
            this.css.push(styles);
        } else {
            data.csId = sameId;
        }

        console.log(data);
    }

    private getDefaultComputedStyles (): string {
        const defaultElement = document.createElement(`acq-default-element-${Date.now()}`);
        document.body.appendChild(defaultElement);
        this.setDefaultStyles(defaultElement);
        const styles = this.collectStyles(defaultElement);
        document.body.removeChild(defaultElement);
        return styles;
    }

    private setDefaultStyles (el: HTMLElement): void {
        const styleObj = window.getComputedStyle(el);
        for (let i = styleObj.length; i--; ) {
            const nameString = styleObj[i];
            this.defaultStyles[nameString] = `${styleObj.getPropertyValue(nameString)};`;
        }
    }

    private collectUniqueStyles (el: HTMLElement): {styles: string, sameId: number | undefined} {
        const styles = this.collectStyles(el);
        let sameId: number | undefined;

        for (let i = 0; i < this.css.length; i += 1) {
            if (styles === this.css[i]) {
                sameId = i;
                break;
            }
        }

        return { styles, sameId };
    }

    private collectStyles (el: HTMLElement): string {
        const styleObj = window.getComputedStyle(el);
        let styleString = '';

        for (let i = styleObj.length; i--; ) {
            const nameString = styleObj[i];
            styleString += nameString + ':' + styleObj.getPropertyValue(nameString) + styleObj.getPropertyPriority(nameString) + ';';
        }
        return styleString;
    }
}
