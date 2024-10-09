import { DataCollector, PageBuilder, version } from '../src';
import { CssType, TreeType } from '../src/types';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import './global';

expect.extend({ toMatchImageSnapshot });

describe('Puppeteer test', () => {
    beforeEach(() => {});

    describe('Create browser, extract page data and reassemble it', () => {
        it('rendered page should be the same as the reconstructed page after using the page-processing-lib', async () => {
            try {
                const context = await globalThis.__BROWSER_GLOBAL__.createBrowserContext();
                const page = await context.newPage();
                await page.setViewport({ width: 1366, height: 768 });
                await page.goto('https://test-page-8.sidomon.com');
                const { tree, css } = await page.evaluate(async (dc: string, infoVersion: string): Promise<{css: CssType, tree: TreeType, v: string}> => {
                    window.infoVersion = infoVersion;
                    eval('window.DataCollector = ' + dc);
                    eval('window.dataCollector = new window.DataCollector(window.infoVersion)');
                    return await window.dataCollector.collectData(window.document.documentElement);
                }, DataCollector.toString(), version);
                await page.close();

                const newPage = await context.newPage();
                await newPage.setViewport({ width: 1366, height: 768 });
                await newPage.evaluate(
                    (pb: string, treeIn: TreeType, cssIn: CssType) => {
                        eval('window.PageBuilder = ' + pb);
                        eval('window.pageBuilder = new window.PageBuilder()');
                        const docFragment = window.pageBuilder.makePage({ tree: treeIn, css: cssIn });
                        document.open();
                        document.write(docFragment.querySelector('html')?.outerHTML ?? '');
                        document.close();
                    },
                    PageBuilder.toString(),
                    tree,
                    css,
                );
                // this stops the browser from closing to inspect more closely
                // await newPage.evaluate(() => {
                //     debugger;
                // });
                // await newPage.waitForFunction('false');

                const image = await newPage.screenshot();
                expect(image).toMatchImageSnapshot({
                    failureThreshold: 0.01,
                    failureThresholdType: 'percent',
                });
            } catch (e) {
                console.log('error', e);
            }
        });
    });
});
