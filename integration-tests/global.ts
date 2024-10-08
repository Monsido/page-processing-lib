import { DataCollector, PageBuilder } from '../src';

declare global {
    interface Window {
        dataCollector: DataCollector;
        pageBuilder: PageBuilder;
        infoVersion: string;
    }
}
