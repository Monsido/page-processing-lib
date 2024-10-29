/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * @jest-environment jsdom
 */
import { PageBuilder } from './page-builder';
import { TreeType, CssType } from '../types';

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
            tn: 'div',
            ci: 0,
            a: [['name', 'container']],
            c: [
                {
                    tn: 'p',
                    ci: 1,
                    c: [{ t: 'Hello, World!' }],
                },
            ],
        };
        const css: CssType = ['color: red;', 'font-size: 16px;'];

        beforeEach(() => {
            docFragment = pageBuilder.makePage({ tree, css });
        });

        it('should be created', () => {
            expect(docFragment.querySelector('div')?.outerHTML).toEqual(`<div data-cs-0="" name="container"><p data-cs-0="" data-cs-1="">Hello, World!</p></div>`);
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
            tn: 'div',
            ci: 0,
            a: [['id', 'main'], ['name', 'container']],
            c: [],
        };

        const css: CssType = ['color: red;'];
        docFragment = pageBuilder.makePage({ tree, css });
        const divElement = docFragment.querySelector('div');
        expect(divElement?.outerHTML).toContain('id="main" name="container"');
    });

    it('should throw an error if an attribute has an empty key', () => {
        const tree: TreeType = {
            tn: 'div',
            ci: 0,
            a: [['', 'main']],
            c: [],
        };

        const css: CssType = ['color: red;'];

        expect(() => pageBuilder.makePage({ tree, css })).toThrow('InvalidCharacterError: \"\" did not match the Name production');
    });

    it('should throw an error if an csId is undefined', () => {
        const tree: TreeType = {
            tn: 'div',
            a: [],
            c: [],
        };

        const css: CssType = ['color: red;'];

        expect(() => pageBuilder.makePage({ tree, css })).toThrow('Invalid data-cs-id: "undefined"');
    });

    it('should throw an error if an element node has an empty tagName', () => {
        const tree: TreeType = {
            tn: '',
            ci: 0,
            c: [],
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
            tn: 'html',
            a: [['lang', 'en']],
            ci: 0,
            c: [
                {
                    tn: 'head',
                    ci: 0,
                    c: [],
                },
                {
                    tn: 'body',
                    ci: 0,
                    a: [['name', 'container']],
                    c: [
                        {
                            tn: 'div',
                            ci: 0,
                            a: [['name', 'div']],
                            c: [],
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
            tn: 'div',
            ci: 0,
            a: [['name', 'container']],
            c: [],
        };

        const css: CssType = ['color: red;'];

        docFragment = pageBuilder.makePage({ tree, css });

        expect(docFragment.querySelector('style')?.outerHTML).toContain('<style>[data-cs-0] {color: red;}</style>');
    });

    describe('Create shadowDom', () => {
        it('should create shadowDOM and add children', () => {
            const tree: TreeType = {
                tn: 'div',
                ci: 0,
                sr: {
                    c: [
                        {
                            tn: 'span',
                            ci: 1,
                            c: [{ t: 'Inside Shadow DOM' }],
                        },
                    ],
                },
                c: [],
            };

            const css: CssType = ['color: red;'];
            docFragment = pageBuilder.makePage({ tree, css });

            const shadowHost = docFragment.querySelector('div');
            const shadowRoot = shadowHost?.shadowRoot;
            expect(shadowRoot?.querySelector('span')?.textContent).toBe('Inside Shadow DOM');
        });

        it('should style tag in shadowDOM for children', () => {
            const tree: TreeType = {
                tn: 'div',
                ci: 0,
                sr: {
                    c: [
                        {
                            tn: 'span',
                            ci: 1,
                            c: [{ t: 'Inside Shadow DOM' }],
                        },
                    ],
                },
                c: [],
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
            tn: 'div',
            ci: 0,
            c: [
                {
                    tn: 'section',
                    ci: 1,
                    c: [
                        {
                            tn: 'p',
                            ci: 2,
                            c: [{ t: 'Nested paragraph' }],
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
            tn: 'div',
            ci: 0,
            c: [],
        };
        const css: CssType = ['color: red;'];
        docFragment = pageBuilder.makePage({ tree, css });
        const divElement = docFragment.querySelector('div');
        expect(divElement?.children.length).toBe(0);
    });
});
