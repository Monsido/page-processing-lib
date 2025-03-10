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


/**
 * @jest-environment jsdom
 */
import { PageBuilder } from './page-builder';
import { TreeType, CssType } from '../types';

describe('PageBuilder', () => {
    let pageBuilder: PageBuilder;
    let docFragment = document.createDocumentFragment();
    const onError = (msg: string, error: unknown): void => {};
    let pageBuilderOnErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        while (docFragment.firstChild) {
            docFragment.removeChild(docFragment.firstChild);
        }
        pageBuilder = new PageBuilder({
            onError,
        });
        pageBuilderOnErrorSpy = jest.spyOn(pageBuilder.errorHandler, 'onError');
    });

    describe('Create document fragment from tree and css', () => {
        const dom_tree: TreeType = {
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
            docFragment = pageBuilder.makePage({ dom_tree, css });
        });

        it('should be created', () => {
            expect(docFragment.querySelector('div')?.outerHTML)
                .toEqual(`<div data-cs-0="" name="container"><p data-cs-0="" data-cs-1="">Hello, World!</p></div>`);
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
        const dom_tree: TreeType = {
            tn: 'div',
            ci: 0,
            a: [['id', 'main'], ['name', 'container']],
            c: [],
        };

        const css: CssType = ['color: red;'];
        docFragment = pageBuilder.makePage({ dom_tree, css });
        const divElement = docFragment.querySelector('div');
        expect(divElement?.outerHTML).toContain('id="main" name="container"');
    });

    it('should throw an error if an attribute has an empty key', () => {
        const dom_tree: TreeType = {
            tn: 'div',
            ci: 0,
            a: [['', 'main']],
            c: [],
        };

        const css: CssType = ['color: red;'];

        pageBuilder.makePage({ dom_tree, css });
        expect(pageBuilderOnErrorSpy).toHaveBeenCalledWith('Invalid attribute name: ', expect.anything());
    });

    it('should throw an error if an csId is undefined', () => {
        const dom_tree: TreeType = {
            tn: 'div',
            a: [],
            c: [],
        };

        const css: CssType = ['color: red;'];

        pageBuilder.makePage({ dom_tree, css });
        expect(pageBuilderOnErrorSpy).toHaveBeenCalledWith('Invalid data-cs-id: "undefined"');
    });

    it('should throw an error if an element node has an empty tagName', () => {
        const dom_tree: TreeType = {
            tn: '',
            ci: 0,
            c: [],
        };

        const css: CssType = ['color: red;'];

        pageBuilder.makePage({ dom_tree, css });
        expect(pageBuilderOnErrorSpy).toHaveBeenNthCalledWith(1, 'Invalid Tag name: ', expect.anything());
    });

    it('should throw an error if Node does not have a tagName or text property', () => {
        const dom_tree: TreeType = {
        };

        const css: CssType = ['color: red;'];

        pageBuilder.makePage({ dom_tree, css });
        expect(pageBuilderOnErrorSpy).toHaveBeenNthCalledWith(1, 'NodeType: Unknown node type');
    });

    it('should append styles to the head element if it exists', () => {
        const dom_tree: TreeType = {
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
        docFragment = pageBuilder.makePage({ dom_tree, css });
        expect(docFragment.querySelector('head style')?.outerHTML).toBe('<style>[data-cs-0] {color: red;}</style>');
    });

    it('should append styles to the document fragment if head does not exists', () => {
        const dom_tree: TreeType = {
            tn: 'div',
            ci: 0,
            a: [['name', 'container']],
            c: [],
        };

        const css: CssType = ['color: red;'];

        docFragment = pageBuilder.makePage({ dom_tree, css });

        expect(docFragment.querySelector('style')?.outerHTML).toContain('<style>[data-cs-0] {color: red;}</style>');
    });

    describe('Create shadowDom', () => {
        it('should create shadowDOM and add children', () => {
            const dom_tree: TreeType = {
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
            docFragment = pageBuilder.makePage({ dom_tree, css });

            const shadowHost = docFragment.querySelector('div');
            const shadowRoot = shadowHost?.shadowRoot;
            expect(shadowRoot?.querySelector('span')?.textContent).toBe('Inside Shadow DOM');
        });

        it('should style tag in shadowDOM for children', () => {
            const dom_tree: TreeType = {
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
            docFragment = pageBuilder.makePage({ dom_tree, css });

            const shadowHost = docFragment.querySelector('div');
            const shadowRoot = shadowHost?.shadowRoot;
            expect(shadowRoot?.querySelector('style')?.textContent).toBe('[data-cs-1] {font-size: 16px;}');
        });
    });

    it('should handle nested elements', () => {
        const dom_tree: TreeType = {
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
        docFragment = pageBuilder.makePage({ dom_tree, css });
        const pElement = docFragment.querySelector('div > section > p');
        expect(pElement?.textContent).toBe('Nested paragraph');
    });

    it('should handle elements with no children', () => {
        const dom_tree: TreeType = {
            tn: 'div',
            ci: 0,
            c: [],
        };
        const css: CssType = ['color: red;'];
        docFragment = pageBuilder.makePage({ dom_tree, css });
        const divElement = docFragment.querySelector('div');
        expect(divElement?.children.length).toBe(0);
    });
});
