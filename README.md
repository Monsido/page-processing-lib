# page-processing-lib

## Api
The library exposes two classes **DataCollector** and **PageBuilder**.

### DataCollector
The DataCollector exposes one method **collectData** that takes a html document as parameter. The return value will be a json formatted object with tree and css properties.

usage:
```ts
import { DataCollector } from 'page-processing-lib';

const dataCollector = new DataCollector();
dataCollector.collectData(html: HTMLDocument): JSON<{ dom_tree, css }>;
```

### PageBuilder
The PageBuilder exposes one method **makePage** that takes a json formatted object with tree and css properties. The return value will then be a formatted html code.

usage:
```ts
import { PageBuilder } from 'page-processing-lib';

const pageBuilder = new PageBuilder();
pageBuilder.makePage(JSON<{ dom_tree, css}>): HTMLDocument;
```

## Data structure
```ts
// JSON<{dom_tree: Element, css: string[], version: string}>
dom_tree: Element = { // Tree of nodes
    tn?: string; // (Tag name)
    ci?: number; // (computed style id)
    a?: Array<Array<string>>;  // (attributes) [[‘font-size’, ‘17px’], [‘font-family’, ‘Arial’]]
    c?: Array<Element | { t: string }>;  // (children) contains elements OR textNodes
    sr?: { // (ShadowRoot)
        {
            tn?: string,
            ci?: number,
            a?: Array<Array<string>>,
            c?: Array<TreeType | TextNodeType>,
            sr?: TreeType,
        }
    }
}
css: Array<string>; // CSS data the 0-entry contains the default CS
version: string; // Library version
```
Example
```json
{
    "dom_tree": {
		"tn": "html",
		"ci": 0,
	    "a": [
		    ["lang", "en"]
        ],
        "c": [
            {
                "tn": "body",
                "ci": 1,
                "c": [
                    {
                        "tn": "div",
                        "ci": 2,
                        "a": [
                            ["class", "text"]
                        ],
                        "c": [
                            {
                                "t": "Hello!"
                            }
                        ]
                    },
                    {
                        "tn": "div",
                        "ci": 2,
                        "a": [
                            ["class", "text"]
                        ],
                        "sr": {
                            "c": [
                                {
                                    "t": "How are you doing?"
                                }
                            ]
                        }
                    }

                ]
            },
        ]
    },
    "css": [
        "animation-timing-function: ease;animation-timeline: auto;...zoom: 1;", // ci0
        "padding-top: 15px;font-size: 15px !important;", // ci1
        "color: rgb(153, 153, 153);", // ci2
        …
    ],
    "version": "1.0.0",
}

## Licence
page-processing-lib - A library for processing web pages and extracting data from them.
Copyright (C) 2024-2025 Acquia Inc.

page-processing-lib is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.

page-processing-lib is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with page-processing-lib. If not, see <http://www.gnu.org/licenses/>.

```
