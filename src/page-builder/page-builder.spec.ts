import { PageBuilder } from './page-builder';
import { CssType } from '../types/css-type';
import { TreeType } from '../types/tree-type';
describe('PageBuilder', () => {
    let pageBuilder: PageBuilder;
    let mockTree: TreeType;
    let mockCss: CssType;

    beforeEach(() => {
        pageBuilder = new PageBuilder();
        mockTree = {
            tagName: 'div',
            csId: 1,
            children: [
                {
                    tagName: 'h1',
                    csId: 2,
                    children: [],
                },
            ],
        };
        mockCss = [
            'backgroundColor:"red";color: "white";',
            'fontSize:"24px";fontWeight:"bold";',
            'fontSize:"16px";',
        ];
    });

    it('should create an instance of PageBuilder', () => {
        expect(pageBuilder).toBeInstanceOf(PageBuilder);
    });

    it('should set tree and css properties when makePage is called', () => {
        const content = { tree: mockTree, css: mockCss };
        const output = pageBuilder.makePage(content);
        expect(output).toBe('<div><h1>Hello, World!</h1><p>This is a paragraph.</p></div>' as unknown as HTMLElement);
    });
});
