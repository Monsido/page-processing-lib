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
const { readFile } = require('fs').promises;
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');
const NodeEnvironment = require('jest-environment-node').TestEnvironment;

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

class PuppeteerEnvironment extends NodeEnvironment {
    constructor (config) {
        super(config);
    }

    async setup () {
        await super.setup();
        // get the wsEndpoint
        const wsEndpoint = await readFile(path.join(DIR, 'wsEndpoint'), 'utf8');
        if (!wsEndpoint) {
            throw new Error('wsEndpoint not found');
        }

        // connect to puppeteer
        this.global.__BROWSER_GLOBAL__ = await puppeteer.connect({
            browserWSEndpoint: wsEndpoint,
        });
    }

    async teardown () {
        if (this.global.__BROWSER_GLOBAL__) {
            this.global.__BROWSER_GLOBAL__.disconnect();
        }
        await super.teardown();
    }

    getVmContext () {
        return super.getVmContext();
    }
}

module.exports = PuppeteerEnvironment;
