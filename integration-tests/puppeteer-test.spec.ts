import { CssType, TreeType } from '../src/types';
import { ElementHandle } from 'puppeteer';
import pixelmatch from 'pixelmatch';
import fs from 'fs';
import { join } from 'path';
const PNG = require('pngjs').PNG;
import '../src/types/global';

const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
const SOURCE_IMAGE_PATH = join(SCREENSHOTS_DIR, 'screenshot_original.png');
const COMPARE_IMAGE_PATH = join(SCREENSHOTS_DIR, 'screenshot_compare.png');
const SCRIPT_PATH = '../dist/index.script.js';
const URL = 'https://test-page-8.sidomon.com';
const WIDTH = 1366;
const HEIGHT = 768;

ensureScreenshotFolderExists(SCREENSHOTS_DIR);

describe('Puppeteer test', () => {
    beforeEach(() => {});

    describe('Create browser, extract page data and reassemble it', () => {
        it('rendered page should be the same as the reconstructed page after using the page-processing-lib', async () => {
            try {
                const context = await globalThis.__BROWSER_GLOBAL__.createIncognitoBrowserContext();
                const page = await context.newPage();
                await page.setViewport({ width: WIDTH, height: HEIGHT });
                await page.goto(URL);

                const injectedScript: ElementHandle = await page.addScriptTag({ path: require.resolve(SCRIPT_PATH) });
                await injectedScript.evaluate((domEl) => {
                    domEl.remove();
                });

                const { css, tree } = await page.evaluate(async (): Promise<{ tree: TreeType; css: CssType }> => {
                    return await window.monAccPplDataCollector.collectData(window.document.documentElement);
                });

                await page.screenshot({ path: SOURCE_IMAGE_PATH });
                await context.close();

                const newContext = await globalThis.__BROWSER_GLOBAL__.createIncognitoBrowserContext();
                const newPage = await newContext.newPage();
                await newPage.setViewport({ width: WIDTH, height: HEIGHT });
                const injectedScriptNewPage: ElementHandle = await newPage.addScriptTag({
                    path: require.resolve(SCRIPT_PATH),
                });
                await injectedScriptNewPage.evaluate((domEl) => {
                    domEl.remove();
                });
                await newPage.evaluate(
                    (treeIn: TreeType, cssIn: CssType) => {
                        const docFragment = window.monAccPplPageBuilder.makePage({ tree: treeIn, css: cssIn });
                        document.open();
                        document.write(docFragment.querySelector('html')?.outerHTML ?? '');
                        document.close();
                    },
                    tree,
                    css
                );

                await newPage.screenshot({ path: COMPARE_IMAGE_PATH });

                const sourceImg = PNG.sync.read(fs.readFileSync(SOURCE_IMAGE_PATH));
                const compareImg = PNG.sync.read(fs.readFileSync(COMPARE_IMAGE_PATH));

                // Create a diff image
                const { width, height } = sourceImg;
                const diff = new PNG({ width, height });

                const numDiffPixels = pixelmatch(sourceImg.data, compareImg.data, diff.data, width, height, { threshold: 0.1 });
                await newContext.close();
                expect(numDiffPixels).toBe(0);
            } catch (e) {
                console.log('error', e);
            }
        }, 30000);
    });
});

function ensureScreenshotFolderExists(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Folder created: ${folderPath}`);
    } else {
        console.log(`Folder already exists: ${folderPath}`);
    }
}

