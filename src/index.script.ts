import { PageBuilder } from './page-builder/page-builder';
import { DataCollector } from './data-collector/data-collector';

((): void => {
    window.pageBuilder = new PageBuilder();
    window.dataCollector = new DataCollector();
})();
