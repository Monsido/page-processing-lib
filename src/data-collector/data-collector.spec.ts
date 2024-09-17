import { DataCollector } from './data-collector';
import { TreeType } from '../types/tree-type';
import { CssType } from '../types/css-type';
describe('DataCollector', () => {
    let dataCollector: DataCollector;

    beforeEach(() => {
        dataCollector = new DataCollector();
    });

    it('should collect data and return tree and css', () => {
        const html = '<div><h1>Hello, World!</h1><p>This is a paragraph.</p></div>';
        const result = dataCollector.collectData(html);

        const expectedTree: TreeType = {
            tagName: 'div',
            csId: 1,
            children: [
                {
                    tagName: 'h1',
                    csId: 2,
                    children: [
                        {
                            text: 'Hello, World!',
                        },
                    ],
                },
                {
                    tagName: 'p',
                    csId: 3,
                    children: [
                        {
                            text: 'This is a paragraph.',
                        },
                    ],
                },
            ],
        };

        const expectedCss: CssType = [
            'backgroundColor:"red";color: "white";',
            'fontSize:"24px";fontWeight:"bold";',
            'fontSize:"16px";',
        ];

        expect(result.tree).toEqual(expectedTree);
        expect(result.css).toEqual(expectedCss);
    });
});
