import { CssType } from '../types/css-type';
import { ElementType, TextNodeType, TreeType } from '../types/tree-type';

export class PageBuilder {
    private css: CssType | undefined;
    private tree: TreeType | undefined;

    constructor () {}

    makePage (content: { tree: TreeType, css: CssType }): string {
        this.tree = content.tree;
        this.css = content.css;

        return this.buildHtmlFromTree(this.tree);
    }

    private buildHtmlFromTree (tree: TreeType): string {
        const body = this.parseNode(tree);
        const head = this.buildStyle();

        return `<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`;
    }

    private buildStyle (): string {
        if (this.css) {
            const styles = this.css.map((css: string, index: number) => {
                return `[data-cs-${index}] {${css}}`;
            }).join(' ');
            return `<style type="text/css">${styles}</style>`;
        }
        return '';
    }

    private parseNode (node: ElementType | TextNodeType): string {
        if ('tagName' in node) {
            return this.parseElementNode(node);
        } else {
            return this.parseTextNode(node);
        }
    }

    private parseElementNode (node: ElementType): string {
        let nodeDataCsId = '';
        let nodeShadowTemplate = '';
        let nodeChildren = '';
        let nodeAttributes = '';

        if (node.csId !== undefined) {
            nodeDataCsId = this.setCsId(node.csId);
        }

        if (node.attr && node.attr.length) {
            nodeAttributes = this.setAttributes(node.attr);
        }

        if (Boolean(node.hasShadow)) {
            const shadowChildren = node.children && node.children.length ? this.appendChildren(node.children) : '';
            nodeShadowTemplate = this.setShadowDom(shadowChildren);
        }

        if (!Boolean(node.hasShadow)) {
            nodeChildren = node.children && node.children.length ? this.appendChildren(node.children) : '';
        }

        return `<${node.tagName}${nodeDataCsId ? ' ' + nodeDataCsId : ''}${nodeAttributes ? ' ' + nodeAttributes : ''}>${nodeShadowTemplate}${nodeChildren}</${node.tagName}>`;
    }

    private parseTextNode (node: TextNodeType): string {
        return node.text || '';
    }

    private setCsId (csId: number): string {
        return `data-cs-${csId}`;
    }

    private setShadowDom (children: string): string {
        return `<template shadowrootmode="open">${children}</template>`;
    }

    private setAttributes (attributes: Array<Array<string>>): string {
        return attributes.map(attr => `${attr[0]}="${attr[1]}"`).join(' ');
    }

    private appendChildren (children: Array<ElementType | TextNodeType>): string {
        let childrenHtml = '';
        children.forEach((child) => {
            childrenHtml += this.parseNode(child);
        });
        return childrenHtml;
    }
}
