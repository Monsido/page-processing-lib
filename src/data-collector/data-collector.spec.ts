import { TreeType } from '../types/tree-type';
import { DataCollector } from './data-collector';

describe('DataCollector', () => {
    let dataCollector: DataCollector;

    beforeEach(() => {
        dataCollector = new DataCollector();
    });

    it('DataCollector instantiated', () => {
        expect(dataCollector).toBeDefined();
    });

    describe('Collects data', () => {
        let html: HTMLElement;

        beforeEach(() => {
            html = document.createElement('html');
            html.innerHTML = '<head></head><body><div>test</div></body>';
        });

        const expectedTree = { 'attr': [], 'children': [{ 'attr': [], 'csId': 1, 'tagName': 'HEAD' }, { 'attr': [], 'children': [{ 'attr': [], 'children': [{ 'text': 'test' }], 'csId': 3, 'tagName': 'DIV' }], 'csId': 2, 'tagName': 'BODY' }], 'csId': 0, 'tagName': 'HTML' };
        const expectedCss = ['visibility:visible;', 'display:none;', 'margin:8px;display:block;', 'display:block;'];

        it('should collect HTML as tree', async () => {
            const result = await dataCollector.collectData(html);
            expect(result.tree).toEqual(expectedTree);
        });

        it('should collect Styles as css', async () => {
            const result = await dataCollector.collectData(html);
            expect(result.css).toEqual(expectedCss);
        });

        it('should ignore disallowed elements', async () => {
            (html.querySelector('head') as HTMLElement).appendChild(document.createElement('style'));
            (html.querySelector('body') as HTMLElement).appendChild(document.createElement('script'));

            const result = await dataCollector.collectData(html);
            expect(result.tree).toEqual(expectedTree);
        });
    });

    describe('Collects styles', () => {
        const html = document.createElement('html');
        html.innerHTML = `<head></head><body>
        <div style="display: inline-block;color: blue;">test 1</div>
        <div style="display: inline-block;color: blue;">test 2</div>
        </body>`;

        // A new line means a new text entry into the result Tree

        it('elements with the same styles should have the same csId', async () => {
            const result = await dataCollector.collectData(html);
            const elements = (result.tree.children as TreeType[])[1].children as TreeType[];

            expect(elements[1].csId).toEqual(3);
            expect(elements[3].csId).toEqual(3);
        });

        it('same styles are added only once', async () => {
            const result = await dataCollector.collectData(html);
            expect(
                result.css.filter(i => i === 'color:blue;display:inline-block;').length,
            ).toEqual(1);
        });

    });

    describe('Collects default CSS', () => { // Disabled since Jest/JSDOM does not provide correct style inheritance
        const html = document.createElement('html');

        let windowSpy: jest.SpyInstance<unknown>;

        beforeEach(() => {
            windowSpy = jest.spyOn(window, 'getComputedStyle');
        });

        afterEach(() => {
            windowSpy.mockRestore();
        });

        const fakeComputedStyles: string[] & {getPropertyValue?: (prop: string) => string; el?: HTMLElement} = ['visibility', 'color'];
        fakeComputedStyles.getPropertyValue = (prop: string): string => {
            const isDefaultStylesElement = fakeComputedStyles.el?.tagName.startsWith('ACQ-DEFAULT-ELEMENT');
            switch (prop) {
                case 'visibility':
                    return 'visible';
                case 'color':
                    return isDefaultStylesElement ? 'red' : 'green';
                default:
                    return '';
            }
        };

        it('should collect Styles as css', async () => {
            windowSpy.mockImplementation(
                (el: HTMLElement): typeof fakeComputedStyles => {
                    fakeComputedStyles.el = el;
                    return fakeComputedStyles;
                },
            );
            const result = await dataCollector.collectData(html);
            expect(result.css[0]).toEqual('color:red;visibility:visible;');
        });

        it('should collect element Styles only if they are different from Default', async () => {
            windowSpy.mockImplementation(
                (el: HTMLElement): typeof fakeComputedStyles => {
                    fakeComputedStyles.el = el;
                    return fakeComputedStyles;
                },
            );
            const result = await dataCollector.collectData(html);
            expect(result.css[1]).toEqual('color:green;');
        });
    });

    describe('Collects attributes', () => {
        const html = document.createElement('html');
        html.innerHTML = `<head></head><body>
        <div hidden style="padding:2px" id="testDiv">test</div>
        <div style="padding:2px" id="testDiv" hidden>test</div>
        </body>`;

        // A new line means a new text entry into the result Tree

        it('should collect attributes in the correct order - one element', async () => {
            const result = await dataCollector.collectData(html);
            expect(
                ((result.tree.children as TreeType[])[1].children as TreeType[])[1].attr,
            ).toEqual([['hidden', ''], ['style', 'padding:2px'], ['id', 'testDiv']]);
        });

        it('should collect attributes in the correct order - another element', async () => {
            const result = await dataCollector.collectData(html);
            expect(
                ((result.tree.children as TreeType[])[1].children as TreeType[])[3].attr,
            ).toEqual([['style', 'padding:2px'], ['id', 'testDiv'], ['hidden', '']]);
        });

    });

});
