import { CssType } from '../../dist/src/types';
import { TreeType } from '../types';
import { DataCollector } from './data-collector';

describe('DataCollector', () => {
    let dataCollector: DataCollector;


    beforeEach(() => {
        dataCollector = new DataCollector();
        Object.defineProperty(window, 'visualViewport', {
            value: { width: 1024, height: 768 },
            configurable: true,
        });
    });

    afterEach(() => {
        delete (window as any).visualViewport;
    });

    it('DataCollector instantiated', () => {
        expect(dataCollector).toBeDefined();
    });

    describe('getViewPortSize', () => {
        let html: HTMLElement;

        beforeEach(() => {
            html = document.createElement('html');
            delete (window as any).visualViewport;
            delete (window as any).innerWidth;
            delete (window as any).innerHeight;
            delete (html as any).clientWidth;
            delete (html as any).clientHeight;
        });

        it('should return viewport size from visualViewport', async () => { 
            Object.defineProperty(window, 'visualViewport', {
                value: { width: 1024, height: 768 },
                configurable: true,
            });  
            const result = await dataCollector.collectData(html);
            expect(result.vv).toEqual({ w: 1024, h: 768 });
        });

        it('should return viewport size from innerWidth and innerHeight', async () => {
            Object.defineProperty(window, 'innerWidth', {
                value: 800,
                configurable: true,
            });
            Object.defineProperty(window, 'innerHeight', {
                value: 600,
                configurable: true,
            });

            const result = await dataCollector.collectData(html);
            expect(result.vv).toEqual({ w: 800, h: 600 });
        });

        it('should return viewport size from html clientWidth and clientHeight', async () => {
            Object.defineProperty(html, 'clientWidth', {
                value: 640,
                configurable: true,
            });
            Object.defineProperty(html, 'clientHeight', {
                value: 480,
                configurable: true,
            });

            const result = await dataCollector.collectData(html);
            expect(result.vv).toEqual({ w: 640, h: 480 });
        });

        it('should throw an error if not viewport size available', async () => {
            await expect(dataCollector.collectData(html)).rejects.toThrow('No viewport size found');
        });
    });

    describe('Collects data', () => {
        let html: HTMLElement;

        beforeEach(() => {
            html = document.createElement('html');
            html.innerHTML = '<head></head><body><div>test</div></body>';
        });

        const expectedTree = { 'a': [], 'c': [{ 'a': [], 'ci': 1, 'tn': 'HEAD' }, { 'a': [], 'c': [{ 'a': [], 'c': [{ 't': 'test' }], 'ci': 3, 'tn': 'DIV' }], 'ci': 2, 'tn': 'BODY' }], 'ci': 0, 'tn': 'HTML' };
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
            const elements = (result.tree.c as TreeType[])[1].c as TreeType[];

            expect(elements[1].ci).toEqual(3);
            expect(elements[3].ci).toEqual(3);
        });

        it('same styles are added only once', async () => {
            const result = await dataCollector.collectData(html);
            expect(
                result.css.filter(i => i === 'color:blue;display:inline-block;').length,
            ).toEqual(1);
        });

    });

    describe('Collects default CSS', () => {
        const html = document.createElement('html');
        const htmlWithChild = document.createElement('html')
        htmlWithChild.appendChild(document.createElement('body'))

        let windowSpy: jest.SpyInstance<unknown>;

        beforeEach(() => {
            windowSpy = jest.spyOn(window, 'getComputedStyle');
        });

        afterEach(() => {
            windowSpy.mockRestore();
        });

        const fakeComputedStyles: string[] & {getPropertyValue?: (prop: string) => string; el?: HTMLElement} = ['visibility', 'color'];
        fakeComputedStyles.getPropertyValue = (prop: string): string => {
            const isDefaultStylesElement = fakeComputedStyles.el?.tagName === 'HTML';
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
            const result = await dataCollector.collectData(htmlWithChild);
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
                ((result.tree.c as TreeType[])[1].c as TreeType[])[1].a,
            ).toEqual([['hidden', ''], ['style', 'padding:2px'], ['id', 'testDiv']]);
        });

        it('should collect attributes in the correct order - another element', async () => {
            const result = await dataCollector.collectData(html);
            expect(
                ((result.tree.c as TreeType[])[1].c as TreeType[])[3].a,
            ).toEqual([['style', 'padding:2px'], ['id', 'testDiv'], ['hidden', '']]);
        });

    });

});
