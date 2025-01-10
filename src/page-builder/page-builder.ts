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
import { ElementType, ShadowRootType, TextNodeType, TreeType, CssType, ErrorHandlerType } from '../types';

type CssKVType = Record<string, string>;
const defaultErrorHandler: ErrorHandlerType = {
    onError: (msg: string, error?: unknown): void => {
        // eslint-disable-next-line
        console.error(msg, error);
    },
};

export class PageBuilder {
    css: CssType = [];
    constructor (readonly errorHandler: ErrorHandlerType = defaultErrorHandler) {}

    makePage (content: { tree: TreeType, css: CssType }): DocumentFragment {
        this.css = content.css;
        const rootCssList: CssKVType = {};
        const rootNode = this.traverseTree(content.tree, rootCssList);
        const docFragment = document.createDocumentFragment();
        if (!rootNode) {
            this.errorHandler.onError('Unable to make page from tree root');
            return docFragment;
        }
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

    private traverseTree (node: ElementType | TextNodeType, cssList: CssKVType): Node | null {
        if ('tn' in node) {
            return this.parseElementNode(node, cssList);
        }
        if ('t' in node) {
            return this.parseTextNode(node as TextNodeType);
        }
        this.errorHandler.onError('NodeType: Unknown node type');
        return null;
    }

    private parseElementNode (node: ElementType, cssList: CssKVType): HTMLElement| null {
        let element: HTMLElement;
        try {
            element = document.createElement(node.tn || '');
        } catch (error) {
            this.errorHandler.onError(`Invalid Tag name: ${node.tn}`, error);
            return null;
        }

        this.dataCsId(element, cssList, node.ci);
        this.setAttributes(element, node.a);
        this.setShadowDom(element, node.sr);
        this.appendChildren(element, cssList, node.c);
        return element;
    }

    private parseTextNode (node: TextNodeType): Text {
        return document.createTextNode(node.t);
    }

    private dataCsId (element: HTMLElement, cssList: CssKVType, nodeCsId?: number): void {
        if (nodeCsId !== undefined) {
            element.setAttribute(`data-cs-0`, '');
            element.setAttribute(`data-cs-${nodeCsId.toString()}`, '');
            cssList[nodeCsId] = this.css[nodeCsId];
        } else {
            this.errorHandler.onError(`Invalid data-cs-id: "${nodeCsId}"`);
        }
    }

    private setAttributes (element: HTMLElement, attributes?: Array<Array<string>>): void {
        (attributes || []).forEach((attribute) => {
            try {
                element.setAttribute(attribute[0], attribute[1] || '');
            } catch (error) {
                this.errorHandler.onError(`Invalid attribute name: ${attribute[0]}`, error);
            }
        });
    }

    private setShadowDom (element: HTMLElement, shadowRootNode?: ShadowRootType): void {
        if (!shadowRootNode) {
            return;
        }
        let shadowRoot: ShadowRoot;
        try {
            shadowRoot = element.attachShadow({ mode: 'open' });
        } catch (error) {
            this.errorHandler.onError('Shadowroot', error);
            return;
        }
        const shadowRootCssList: CssKVType = {};
        this.appendChildren(shadowRoot, shadowRootCssList, shadowRootNode.c);
        const styles = this.buildStyle(shadowRootCssList);
        shadowRoot.appendChild(styles);
    }

    private appendChildren (root: HTMLElement | ShadowRoot, cssList: CssKVType, children?: Array<ElementType | TextNodeType>): void {
        (children || []).forEach((child) => {
            const childNode = this.traverseTree(child, cssList);
            if (childNode) {
                root.appendChild(childNode);
            }
        });
    }
}
