import { CssType } from '../types/css-type';
import { ElementType, ShadowRootType, TextNodeType, TreeType } from '../types/tree-type';

type CssKVType = Record<string, string>;
export class PageBuilder {
    css: CssType = [];
    makePage (content: { tree: TreeType, css: CssType }): DocumentFragment {
        this.css = content.css;
        const rootCssList: CssKVType = {};
        const rootNode = this.traverseTree(content.tree, rootCssList);
        const docFragment = document.createDocumentFragment();
        docFragment.appendChild(rootNode);

        const styles = this.buildStyle(rootCssList);
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

    private buildStyle (css: CssKVType): HTMLStyleElement {
        const styleElement = document.createElement('style');
        let styles = '';
        Object.keys(css || {}).forEach((key: string) => {
            styles += `[data-cs-${key}] {${css[parseInt(key)]}} `;
        });

        styleElement.textContent = styles.trimEnd();
        return styleElement;
    }

    private traverseTree (node: ElementType | TextNodeType, cssList: CssKVType): Node {
        if ('tagName' in node) {
            return this.parseElementNode(node, cssList);
        }
        if ('text' in node) {
            return this.parseTextNode(node as TextNodeType);
        }
        throw new Error('NodeType: Unknown node type');
    }

    private parseElementNode (node: ElementType, cssList: CssKVType): HTMLElement {
        let element: HTMLElement;
        try {
            element = document.createElement(node.tagName);
        } catch (error) {
            throw new Error(`TagName: ${error}`);
        }

        this.dataCsId(element, cssList, node.csId);
        this.setAttributes(element, node.attr);
        this.setShadowDom(element, node.shadowRoot);
        this.appendChildren(element, cssList, node.children);
        return element;
    }

    private parseTextNode (node: TextNodeType): Text {
        return document.createTextNode(node.text);
    }

    private dataCsId (element: HTMLElement, cssList: CssKVType, nodeCsId?: number): void {
        if (nodeCsId !== undefined) {
            element.setAttribute(`data-cs-${nodeCsId.toString()}`, '');
            cssList[nodeCsId] = this.css[nodeCsId];
        } else {
            throw new Error(`Invalid data-cs-id: "${nodeCsId}"`);
        }
    }

    private setAttributes (element: HTMLElement, attributes?: Array<Array<string>>): void {
        (attributes || []).forEach((attribute) => {
            try {
                element.setAttribute(attribute[0], attribute[1] || '');
            } catch (error) {
                throw new Error(`Attribute: ${error}`);
            }
        });
    }

    private setShadowDom (element: HTMLElement, shadowRootNode?: ShadowRootType): void {
        if (!shadowRootNode) {
            return;
        }
        const shadowRoot = element.attachShadow({ mode: 'open' });
        const shadowRootCssList: CssKVType = {};
        this.appendChildren(shadowRoot, shadowRootCssList, shadowRootNode.children);
        const styles = this.buildStyle(shadowRootCssList);
        shadowRoot.appendChild(styles);
    }

    private appendChildren (root: HTMLElement | ShadowRoot, cssList: CssKVType, children?: Array<ElementType | TextNodeType>): void {
        (children || []).forEach((child) => {
            const childNode = this.traverseTree(child, cssList);
            root.appendChild(childNode);
        });
    }
}
