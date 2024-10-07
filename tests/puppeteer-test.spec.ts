/**
 * @jest-environment node
 */

import { launch, PuppeteerLaunchOptions } from 'puppeteer';
import { DataCollector } from '../src';
import { PageBuilder } from '../src';
import { TreeType } from '../src/types/tree-type';
import { CssType } from '../src/types/css-type';
import { version } from '../src/info.json';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

declare global {
    interface Window {
        dataCollector: DataCollector;
        pageBuilder: PageBuilder;
        infoVersion: string;
    }
}

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(10000);

describe('Puppeteer test', () => {
    const pupArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-startup-window',
        '--no-zygote',
        // Set persistent Window Size for Page
        `--window-size=1366,768`,
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--disable-prompt-on-repost',
        '--incognito',
    ];

    const processedOptions: PuppeteerLaunchOptions = Object.assign(
        {},
        {
            headless: false,
            args: pupArgs,
            waitForInitialPage: false,
            // Set default viewport for page
            defaultViewport: {
                width: 1366,
                height: 768,
            },
        },
    );
    beforeEach(() => {});

    describe('Create browser, extract page data and reassemble it', () => {
        it('should be created', async () => {
            const browser = await launch(processedOptions);
            try {
                const context = await browser.createBrowserContext();
                const page = await context.newPage();
                page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
                await page.goto('https://test-page-8.sidomon.com');
                const { tree, css } = await page.evaluate(async (dc: string, infoVersion: string) => {
                    window.infoVersion = infoVersion;
                    eval('window.DataCollector = ' + dc);
                    eval('window.dataCollector = new window.DataCollector(window.infoVersion)');
                    return await window.dataCollector.collectData(window.document.documentElement);
                }, DataCollector.toString(), version);

                await page.close();
                const newPage = await context.newPage();
                newPage.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
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

                const image = await newPage.screenshot();
                expect(image).toMatchImageSnapshot({
                    failureThreshold: 0.03,
                    failureThresholdType: 'percent',
                });
            } catch (e) {
                console.log('error', e);
            } finally {
                await browser?.close();
            }
        });
    });
});
