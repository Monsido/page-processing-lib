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

        // A broken line means a new text entry into the result Tree

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
