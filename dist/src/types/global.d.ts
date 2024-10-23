import { Browser } from 'puppeteer';
import { DataCollector } from '../data-collector/data-collector';
import { PageBuilder } from '../page-builder/page-builder';
declare global {
    var __BROWSER_GLOBAL__: Browser;
    interface Window {
        monAccPplDataCollector: DataCollector;
        monAccPplPageBuilder: PageBuilder;
    }
}
