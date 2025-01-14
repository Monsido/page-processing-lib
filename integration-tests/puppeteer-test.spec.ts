/*
    page-processing-lib - A library for processing web pages and extracting data from them.
    Copyright (C) 2024-2025 Acquia Inc.

    This file is part of page-processing-lib.

    page-processing-lib is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    page-processing-lib is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with page-processing-lib. If not, see <http://www.gnu.org/licenses/>.
*/

import { CssType, TreeType } from '../src/types';
import { PageBuilder, DataCollector } from '../src';
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

ensureScreenshotFolderExists(SCREENSHOTS_DIR);

describe('Puppeteer test', () => {
    beforeEach(() => {});

    describe('Create browser, extract page data and reassemble it', () => {
        it('rendered page should be the same as the reconstructed page after using the page-processing-lib', async () => {
            const context = await globalThis.__BROWSER_GLOBAL__.createBrowserContext();
            const page = await context.newPage();
            await page.goto(URL);
            await page.evaluate(`window.DataCollector = ${DataCollector.toString()}`);
            const parsedEncodedPage = await page.evaluate( async () => {
                const dataCollector = new window.DataCollector();
                dataCollector.setVersion('1.0.0');
                return dataCollector.collectData(document.documentElement);
            });
            await page.screenshot({ path: SOURCE_IMAGE_PATH });
            await context.close();

            const newContext = await globalThis.__BROWSER_GLOBAL__.createBrowserContext();
            const newPage = await newContext.newPage();
            newPage.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
            await newPage.setViewport({ width: parsedEncodedPage.vv.w, height: parsedEncodedPage.vv.h });
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
                parsedEncodedPage.tree,
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
