import { DataCollector } from './data-collector';

fdescribe('DataCollector', () => {
    let dataCollector: DataCollector;

    beforeEach(() => {
        dataCollector = new DataCollector();
    });

    it('DataCollector instantiated', () => {
        expect(dataCollector).toBeDefined();
    });

    describe('Collects data', () => {
        const html = document.createElement('html');
        html.innerHTML = '<head></head><body><div>test</div></body>';
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
            if (fakeComputedStyles.el?.tagName.startsWith('ACQ-DEFAULT-ELEMENT')) {
                switch (prop) {
                    case 'visibility':
                        return 'visible';
                    case 'color':
                        return 'red';
                    default:
                        return '';
                }
            }
            return '';
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
    });
});
