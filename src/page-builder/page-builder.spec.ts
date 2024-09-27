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

    describe('Create document fragment from tree and css', () => {
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

        beforeEach(() => {
            docFragment = pageBuilder.makePage({ tree, css });
        });

        it('should be created', () => {
            expect(docFragment.querySelector('div')?.outerHTML).toEqual(`<div data-cs-0="" name="container"><p data-cs-1="">Hello, World!</p></div>`);
        });

        it('should contain a div with attribute', () => {
            expect(docFragment.querySelector('div')?.getAttribute('name')).toBe('container');
        });

        it('should contain p tag with a text node', () => {
            expect(docFragment.querySelector('p')?.textContent).toBe('Hello, World!');
        });

        it('should contain style tag', () => {
            expect(docFragment.querySelector('style')?.textContent).toContain('[data-cs-0] {color: red;} [data-cs-1] {font-size: 16px;}');
        });
    });

    it('should set attributes in the right order', () => {
        const tree: TreeType = {
            tagName: 'div',
            csId: 0,
            attr: [['id', 'main'], ['name', 'container']],
            children: [],
        };

        const css: CssType = ['color: red;'];
        docFragment = pageBuilder.makePage({ tree, css });
        const divElement = docFragment.querySelector('div');
        expect(divElement?.outerHTML).toContain('id="main" name="container"');
    });

    it('should throw an error if an attribute has an empty key', () => {
        const tree: TreeType = {
            tagName: 'div',
            csId: 0,
            attr: [['', 'main']],
            children: [],
        };

        const css: CssType = ['color: red;'];

        expect(() => pageBuilder.makePage({ tree, css })).toThrow('InvalidCharacterError: \"\" did not match the Name production');
    });

    it('should throw an error if an csId is undefined', () => {
        const tree: TreeType = {
            tagName: 'div',
            attr: [],
            children: [],
        };

        const css: CssType = ['color: red;'];

        expect(() => pageBuilder.makePage({ tree, css })).toThrow('Invalid data-cs-id: "undefined"');
    });

    it('should throw an error if an element node has an empty tagName', () => {
        const tree: TreeType = {
            tagName: '',
            csId: 0,
            children: [],
        };

        const css: CssType = ['color: red;'];

        expect(() => pageBuilder.makePage({ tree, css })).toThrow('TagName: InvalidCharacterError: "" did not match the Name production');
    });

    it('should throw an error if Node does not have a tagName or text property', () => {
        const tree: TreeType = {
        };

        const css: CssType = ['color: red;'];

        expect(() => pageBuilder.makePage({ tree, css })).toThrow('NodeType: Unknown node type');
    });

    it('should append styles to the head element if it exists', () => {
        const tree: TreeType = {
            tagName: 'html',
            attr: [['lang', 'en']],
            csId: 0,
            children: [
                {
                    tagName: 'head',
                    csId: 0,
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
        expect(docFragment.querySelector('head style')?.outerHTML).toBe('<style>[data-cs-0] {color: red;}</style>');
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

        expect(docFragment.querySelector('style')?.outerHTML).toContain('<style>[data-cs-0] {color: red;}</style>');
    });

    describe('Create shadowDom', () => {
        it('should create shadowDOM and add children', () => {
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
            const shadowRoot = shadowHost?.shadowRoot;
            expect(shadowRoot?.querySelector('span')?.textContent).toBe('Inside Shadow DOM');
        });

        it('should style tag in shadowDOM for children', () => {
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

            const css: CssType = ['color: red;' , 'font-size: 16px;'];
            docFragment = pageBuilder.makePage({ tree, css });

            const shadowHost = docFragment.querySelector('div');
            const shadowRoot = shadowHost?.shadowRoot;
            expect(shadowRoot?.querySelector('style')?.textContent).toBe('[data-cs-1] {font-size: 16px;}');
        });
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
        const pElement = docFragment.querySelector('div > section > p');
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
        expect(divElement?.children.length).toBe(0);
    });
});
