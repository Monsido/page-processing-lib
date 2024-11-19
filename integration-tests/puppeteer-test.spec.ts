import { CssType, TreeType } from '../src/types';
import { PageBuilder } from '../src';
import pixelmatch from 'pixelmatch';
import fs from 'fs';
import { join } from 'path';
const PNG = require('pngjs').PNG;
import '../src/types/global';
import { encodedPage } from './test-page-8-encoded-page.json'

const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
const SOURCE_IMAGE_PATH = join(SCREENSHOTS_DIR, 'screenshot_original.png');
const COMPARE_IMAGE_PATH = join(SCREENSHOTS_DIR, 'screenshot_compare.png');
const URL = 'https://test-page-8.sidomon.com';
const WIDTH = 1366;
const HEIGHT = 768;

ensureScreenshotFolderExists(SCREENSHOTS_DIR);

describe('Puppeteer test', () => {
    beforeEach(() => {});

    describe('Create browser, extract page data and reassemble it', () => {
        it('rendered page should be the same as the reconstructed page after using the page-processing-lib', async () => {
                const context = await globalThis.__BROWSER_GLOBAL__.createIncognitoBrowserContext();
                const page = await context.newPage();
                await page.setViewport({ width: WIDTH, height: HEIGHT });
                await page.goto(URL);
                await page.screenshot({ path: SOURCE_IMAGE_PATH });
                await context.close();

                const newContext = await globalThis.__BROWSER_GLOBAL__.createIncognitoBrowserContext();
                const newPage = await newContext.newPage();
                newPage.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
                let parsedEncodedPage: { dom_tree: TreeType, css: CssType, viewport: { w: number, h: number }, v: string } = {
                    dom_tree: {},
                    css: [],
                    viewport: { w: 0, h: 0 },
                    v: ''
                };
                try {
                    parsedEncodedPage = JSON.parse(encodedPage);
                } catch (e) {
                    console.log('could not parse encoded page', e);
                }
                await newPage.setViewport({ width: parsedEncodedPage.viewport.w, height: parsedEncodedPage.viewport.h });

                await newPage.evaluate(`window.PageBuilder = ${PageBuilder.toString()}`);
                await newPage.evaluate(
                    (treeIn: TreeType, cssIn: CssType) => {
                        const builder = new window.PageBuilder({
                            onError: (msg: string, error?: unknown): void => {
                                console.error(msg, error);
                            },
                        });
                        const docFragment = builder.makePage({ tree: treeIn, css: cssIn });
                        document.open();
                        document.write(docFragment.querySelector('html')?.outerHTML ?? '');
                        document.close();
                    },
                    parsedEncodedPage.dom_tree,
                    parsedEncodedPage.css
                );

                await newPage.screenshot({ path: COMPARE_IMAGE_PATH });

                const sourceImg = PNG.sync.read(fs.readFileSync(SOURCE_IMAGE_PATH));
                const compareImg = PNG.sync.read(fs.readFileSync(COMPARE_IMAGE_PATH));

                // Create a diff image
                const { width, height } = sourceImg;
                const diff = new PNG({ width, height });

                const numDiffPixels = pixelmatch(sourceImg.data, compareImg.data, diff.data, width, height);
                await newContext.close();
                expect(numDiffPixels).toBe(0);
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
