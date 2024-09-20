import { PageBuilder } from './page-builder';
import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';

describe('PageBuilder', () => {
    let pageBuilder: PageBuilder;

    beforeEach(() => {
        pageBuilder = new PageBuilder();
    });

    it('should build a page with given tree and css', () => {
        const tree: TreeType = {
            tagName: 'div',
            children: [{ tagName: 'p', children: [{ text: 'Hello World' }] }],
        };
        const css: CssType = ['color: red;'];
        const result = pageBuilder.makePage({ tree, css });
        // eslint-disable-next-line max-len
        expect(result).toContain('<!DOCTYPE html><html><head><style type=\"text/css\">[data-cs-0] {color: red;}</style></head><body><div><p>Hello World</p></div></body></html>');
    });

    it('should set attributes correctly', () => {
        const tree: TreeType = {
            tagName: 'div',
            attr: [['id', 'test-div'], ['aria-label', 'test-label']],
            children: [],
        };
        const css: CssType = [];

        const result = pageBuilder.makePage({ tree, css });

        expect(result).toContain('<div id="test-div" aria-label="test-label"></div>');
    });

    it('should handle shadow DOM elements', () => {
        const tree: TreeType = {
            tagName: 'div',
            hasShadow: true,
            children: [],
        };
        const css: CssType = [];
        const result = pageBuilder.makePage({ tree, css });
        expect(result).toContain('<template shadowrootmode=\"open\">');
    });

    it('should handle text nodes', () => {
        const tree: TreeType = {
            tagName: 'div',
            children: [
                { text: 'Just a text node' },
            ],
        };
        const css: CssType = [];
        const result = pageBuilder.makePage({ tree, css });
        expect(result).toContain('<div>Just a text node</div>');
    });

    it('should add multiple CSS rules to style', () => {
        const tree: TreeType = {
            tagName: 'div',
            children: [],
        };
        const css: CssType = ['color: red;', 'background-color: blue;'];
        const result = pageBuilder.makePage({ tree, css });
        expect(result).toContain('<style type="text/css">[data-cs-0] {color: red;} [data-cs-1] {background-color: blue;}</style>');
    });
});

