/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * @jest-environment jsdom
 */
import { PageBuilder } from './page-builder';
import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';

describe('PageBuilder', () => {
    let pageBuilder: PageBuilder;
    let docFragment = document.createDocumentFragment();

    beforeEach(() => {
        while (docFragment.firstChild) {
            docFragment.removeChild(docFragment.firstChild);
        }
        pageBuilder = new PageBuilder();
    });

    it('should create a document fragment with the given tree and css', () => {
        const tree: TreeType = {
            tagName: 'div',
            csId: 0,
            attr: [['name', 'container']],
            children: [
                {
                    tagName: 'p',
                    csId: 1,
                    children: [{ text: 'Hello, World!' }],
                },
            ],
        };

        const css: CssType = ['color: red;', 'font-size: 16px;'];

        docFragment = pageBuilder.makePage({ tree, css });

        expect(docFragment.querySelector('div')).not.toBeNull();
        expect(docFragment.querySelector('div')?.getAttribute('name')).toBe('container');
        expect(docFragment.querySelector('p')?.textContent).toBe('Hello, World!');
        expect(docFragment.querySelector('style')?.textContent).toContain('[data-cs-0] {color: red;}');
        expect(docFragment.querySelector('style')?.textContent).toContain('[data-cs-1] {font-size: 16px;}');
    });

    it('should handle elements with attributes', () => {
        const tree: TreeType = {
            tagName: 'div',
            csId: 0,
            attr: [['id', 'main'], ['name', 'container']],
            children: [],
        };

        const css: CssType = ['color: red;'];
        docFragment = pageBuilder.makePage({ tree, css });
        const divElement = docFragment.querySelector('div');
        expect(divElement).not.toBeNull();
        expect(divElement?.getAttribute('id')).toEqual('main');
        expect(divElement?.getAttribute('name')).toEqual('container');
    });

    it('should throw an error if an attribute has an empty key', () => {
        const tree: TreeType = {
            tagName: 'div',
            csId: 0,
            attr: [['', 'main']],
            children: [],
        };

        const css: CssType = ['color: red;'];

        expect(() => pageBuilder.makePage({ tree, css })).toThrow('Attribute key cannot be empty');
    });

    it('should throw an error if an element node has an empty tagName', () => {
        const tree: TreeType = {
            tagName: '',
            csId: 0,
            children: [],
        };

        const css: CssType = ['color: red;'];

        expect(() => pageBuilder.makePage({ tree, css })).toThrow('Tag name cannot be empty for an element node');
    });

    it('should throw an error if Node does not have a tagName or text property', () => {
        const tree: TreeType = {
        };

        const css: CssType = ['color: red;'];

        expect(() => pageBuilder.makePage({ tree, css })).toThrow('Unknown node type');
    });

    it('should append styles to the head element if it exists', () => {
        const tree: TreeType = {
            tagName: 'html',
            attr: [['lang', 'en']],
            children: [
                {
                    tagName: 'head',
                    children: [],
                },
                {
                    tagName: 'body',
                    csId: 0,
                    attr: [['name', 'container']],
                    children: [
                        {
                            tagName: 'div',
                            csId: 0,
                            attr: [['name', 'div']],
                            children: [],
                        },
                    ],
                },
            ],
        };

        const css: CssType = ['color: red;'];
        docFragment = pageBuilder.makePage({ tree, css });

        expect(docFragment.querySelector('head')).not.toBeNull();
        expect(docFragment.querySelector('head style')).not.toBeNull();
        expect(docFragment.querySelector('head style')?.textContent).toContain('[data-cs-0] {color: red;}');
    });

    it('should append styles to the document fragment if head does not exists', () => {
        const tree: TreeType = {
            tagName: 'div',
            csId: 0,
            attr: [['name', 'container']],
            children: [],
        };

        const css: CssType = ['color: red;'];

        docFragment = pageBuilder.makePage({ tree, css });

        expect(docFragment.querySelector('style')).not.toBeNull();
        expect(docFragment.querySelector('style')?.textContent).toContain('[data-cs-0] {color: red;}');
    });

    it('should handle shadow DOM elements', () => {
        const tree: TreeType = {
            tagName: 'div',
            csId: 0,
            shadowRoot: {
                children: [
                    {
                        tagName: 'span',
                        csId: 1,
                        children: [{ text: 'Inside Shadow DOM' }],
                    },
                ],
            },
            children: [],
        };

        const css: CssType = ['color: red;'];
        docFragment = pageBuilder.makePage({ tree, css });

        const shadowHost = docFragment.querySelector('div');
        expect(shadowHost).not.toBeNull();
        const shadowRoot = shadowHost?.shadowRoot;
        expect(shadowRoot).not.toBeNull();
        expect(shadowRoot?.querySelector('span')?.textContent).toBe('Inside Shadow DOM');
    });

    it('should handle nested elements', () => {
        const tree: TreeType = {
            tagName: 'div',
            csId: 0,
            children: [
                {
                    tagName: 'section',
                    csId: 1,
                    children: [
                        {
                            tagName: 'p',
                            csId: 2,
                            children: [{ text: 'Nested paragraph' }],
                        },
                    ],
                },
            ],
        };

        const css: CssType = ['color: red;', 'font-size: 16px;', 'margin: 10px;'];

        docFragment = pageBuilder.makePage({ tree, css });

        const divElement = docFragment.querySelector('div');
        const sectionElement = docFragment.querySelector('section');
        const pElement = docFragment.querySelector('p');

        expect(divElement).not.toBeNull();
        expect(sectionElement).not.toBeNull();
        expect(pElement).not.toBeNull();
        expect(pElement?.textContent).toBe('Nested paragraph');
    });

    it('should handle elements with no children', () => {
        const tree: TreeType = {
            tagName: 'div',
            csId: 0,
            children: [],
        };

        const css: CssType = ['color: red;'];

        docFragment = pageBuilder.makePage({ tree, css });

        const divElement = docFragment.querySelector('div');
        expect(divElement).not.toBeNull();
        expect(divElement?.children.length).toBe(0);
    });
});
