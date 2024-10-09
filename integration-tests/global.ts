import { DataCollector, PageBuilder } from '../src';
import { Browser } from 'puppeteer';

declare global {
    var __BROWSER_GLOBAL__: Browser;
    interface Window {
        dataCollector: DataCollector;
        pageBuilder: PageBuilder;
        infoVersion: string;
    }
}
