import { CssType } from '../types/css-type';
import { ElementType, TextNodeType, TreeType } from '../types/tree-type';

export class PageBuilder {
    makePage (content: { tree: TreeType, css: CssType }): DocumentFragment {
        const rootNode = this.traverseTree(content.tree);
        const docFragment = document.createDocumentFragment();
        docFragment.appendChild(rootNode);

        const styles = this.buildStyle(content.css);
        this.appendStyle(docFragment, styles);

        return docFragment;
    }

    private appendStyle (docFragment: DocumentFragment, styles: HTMLStyleElement): void {
        const headEl = docFragment.querySelector('head');
        if (headEl) {
            headEl.appendChild(styles);
        } else {
            docFragment.appendChild(styles);
        }
    }

    private buildStyle (css: CssType): HTMLStyleElement {
        const styleElement = document.createElement('style');

        if (css && css.length) {
            const styles = css.map((style: string, index: number) => {
                return `[data-cs-${index}] {${style}}`;
            }).join(' ');

            styleElement.textContent = styles;
        }

        return styleElement;
    }

    private traverseTree (node: ElementType | TextNodeType): Node {
        if ('tagName' in node) {
            return this.parseElementNode(node);
        }
        return this.parseTextNode(node as TextNodeType);
    }

    private parseElementNode (node: TreeType): HTMLElement {
        if (!node.tagName) {
            throw new Error('ElementNode must have a tagName property');
        }

        const element = document.createElement(node.tagName);

        if (node.csId !== undefined && node.csId >= 0) {
            this.dataCsId(element, node.csId);
        }
        if (node.attr && node.attr.length) {
            this.setAttributes(element, node.attr);
        }

        if (node.shadowRoot?.children && node.shadowRoot.children.length) {
            this.setShadowDom(element, node.shadowRoot.children);
        }

        if (node.children && node.children.length) {
            this.appendChildren(element, node.children);
        }
        return element;
    }

    private parseTextNode (node: TextNodeType): Text {
        if (!node.text) {
            throw new Error('TextNode must have a text property');
        }
        return document.createTextNode(node.text || '');
    }

    private dataCsId (element: HTMLElement, nodeCsId: number): void {
        element.setAttribute(`data-cs-${nodeCsId.toString()}`, '');
    }

    private setAttributes (element: HTMLElement, attributes: Array<Array<string>>): void {
        attributes.forEach((attribute) => {
            element.setAttribute(attribute[0], attribute[1]);
        });
    }

    private setShadowDom (element: HTMLElement, children: (ElementType | TextNodeType)[]): void {
        const shadowRoot = element.attachShadow({ mode: 'open' });
        this.appendChildren(shadowRoot, children);
    }

    private appendChildren (root: HTMLElement | ShadowRoot, children: Array<ElementType | TextNodeType>): void {
        children.forEach((child) => {
            const childNode = this.traverseTree(child);
            root.appendChild(childNode);
        });
    }
}
