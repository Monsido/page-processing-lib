import { Browser } from 'puppeteer';
import { DataCollector } from '../data-collector/data-collector';
import { PageBuilder } from '../page-builder/page-builder';

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention,no-var
    var __BROWSER_GLOBAL__: Browser;

    interface Window {
        DataCollector: typeof DataCollector;
        PageBuilder: typeof PageBuilder;
    }
}
