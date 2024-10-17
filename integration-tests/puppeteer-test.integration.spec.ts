import { CssType, TreeType } from '../src/types';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import '../src/types/global';
import { ElementHandle } from 'puppeteer';

expect.extend({ toMatchImageSnapshot });

describe('Puppeteer test', () => {
    beforeEach(() => {});

    describe('Create browser, extract page data and reassemble it', () => {
        it('rendered page should be the same as the reconstructed page after using the page-processing-lib', async () => {
            try {
                const context = await globalThis.__BROWSER_GLOBAL__.createIncognitoBrowserContext()
                const page = await context.newPage();
                await page.setViewport({ width: 1366, height: 768 });
                await page.goto('https://test-page-8.sidomon.com');

                const pathToScript = '../dist/index.script.js';
                const injectedScript: ElementHandle = await page.addScriptTag({ path: require.resolve(pathToScript) });
                await injectedScript.evaluate((domEl) => {
                    domEl.remove();
                });

                const { css, tree } = await page.evaluate(async (): Promise<{tree: TreeType, css: CssType}> => {
                    return await window.dataCollector.collectData(window.document.documentElement);
                });
                await context.close();

                const newContext = await globalThis.__BROWSER_GLOBAL__.createIncognitoBrowserContext();
                const newPage = await newContext.newPage();
                await newPage.setViewport({ width: 1366, height: 768 });
                const injectedScriptNewPage: ElementHandle = await newPage.addScriptTag({ path: require.resolve(pathToScript) });
                await injectedScriptNewPage.evaluate((domEl) => {
                    domEl.remove();
                });
                await newPage.evaluate(
                    (treeIn: TreeType, cssIn: CssType) => {
                        const docFragment = window.pageBuilder.makePage({ tree: treeIn, css: cssIn });
                        document.open();
                        document.write(docFragment.querySelector('html')?.outerHTML ?? '');
                        document.close();
                    },
                    tree,
                    css,
                );

                const image = await newPage.screenshot();
                await newContext.close();
                expect(image).toMatchImageSnapshot();
            } catch (e) {
                console.log('error', e);
            }
        }, 30000);
    });
});
