import { PageBuilder } from './page-builder/page-builder';
import { DataCollector } from './data-collector/data-collector';

((): void => {
    window.monAccPplPageBuilder = new PageBuilder();
    window.monAccPplDataCollector = new DataCollector();
})();
