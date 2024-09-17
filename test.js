/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { DataCollector, PageBuilder } from './dist/bundle.js';

function collectData () {
    const html = document.querySelector('#htmlinput').value;
    const dataCollector = new DataCollector();
    const output = dataCollector.collectData(html);
    document.querySelector('#data_collector_output').innerText = JSON.stringify(output, null, 2);
}

const collectBtn = document.querySelector('#collectBtn');
collectBtn.addEventListener('click', collectData);

function buildHtml () {
    const content = document.querySelector('#contentinput').value;
    const pageBuilder = new PageBuilder();
    const output = pageBuilder.makePage(content);
    document.querySelector('#page_builder_output').innerText = JSON.stringify(output, null, 2);
}

const buildBtn = document.querySelector('#buildBtn');
buildBtn.addEventListener('click', buildHtml);
