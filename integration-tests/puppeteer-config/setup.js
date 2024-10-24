const { mkdir, writeFile } = require('fs').promises;
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

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
const processedOptions = Object.assign(
    {},
    {
        headless: 'new',
        args: pupArgs,
        waitForInitialPage: false,
        ignoreDefaultArgs: ['--hide-scrollbars'],
        // Set default viewport for page
        defaultViewport: {
            width: 1366,
            height: 768,
        },
    },
);


module.exports = async function () {
    const browser = await puppeteer.launch(processedOptions);
    // store the browser instance so we can teardown it later
    // this global is only available in the teardown but not in TestEnvironments
    globalThis.__BROWSER_GLOBAL__ = browser;

    // use the file system to expose the wsEndpoint for TestEnvironments
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
};
