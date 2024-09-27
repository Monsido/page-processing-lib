# page-processing-lib

## Idea
We need to collect the data from page in 2 parts: 
DOM elements with arguments
CSS for every HTML element
### Process
- Get the list of computed styles (CS) for HTML element - it will be used as the default one (approx. 379 entries) (Create a random element and get default CS from it, since HTML element may be affected by styles)
- Iterate through DOM, processing element by element.
- Collect CS for the element. 
- Get a diff (keep only the properties which are different compared to the default CS) compared to the default CS.
- Stringify the diff.
- If there is a diff, and there is no such value yet in the collection, then add it to the collection.
- Associate the added diff with a cs-id, to use it as a reference for the element. Many elements may have the same CS diff, that will allow us to re-use the CS, identifying it by cs-id.
- The tag name, and the attributes of the cloned element should be saved in the resulting JSON structure. The attributes should be saved in the order they visually appear in the element’s tag.

## Optionally
Remove irrelevant properties from CS (e.g. proprietary properties [--webkit-*], specifying properties [border-bottom] - since it is expected that the “border” property already contains its value - testing & confirmation is required)
Use the same package for serializing the data in Extension and Scanner, maybe share it as dependency.

## Api
The library exposes two classes **DataCollector** and **PageBuilder**.
### DataCollector
The DataCollector exposes one method **collectData** that takes a html document as parameter. The return value will be a json formatted object with tree and css properties.

usage:
```ts
import { DataCollector } from 'page-processing-lib';

const dataCollector = new DataCollector();
dataCollector.collectData(html: HTMLDocument): JSON<{ tree, css }>;
```

### PageBuilder
The PageBuilder exposes one method **makePage** that takes a json formatted object with tree and css properties. The return value will then be a formatted html code.

usage:
```ts
import { PageBuilder } from 'page-processing-lib';

const pageBuilder = new PageBuilder();
pageBuilder.makePage(JSON<{ tree, css}>): HTMLDocument;
```

## Data structure
```ts
// JSON<{tree; css;}>
tree: Element = { // Tree of nodes
    tn?: string; // (Tag name)
    ci?: number; // (computed style id)
    a?: Array<Array<string>>;  // (attributes) [[‘font-size’, ‘17px’], [‘font-family’, ‘Arial’]] 
    c?: Array<Element | { text: string }>;  // (children) contains elements OR textNodes
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
css: Array<string> // CSS data the 0-entry contains the default CS
```
Example
```json 
{
    "tree": {
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
                                text: "Hello!"
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
                                    "text": "How are you doing?"
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
    ]
}
```


## Snippets
Collecting CS
```js 
(() => {
    const styleObj = window.getComputedStyle(document.querySelectorAll('a')[1]);
    console.log(styleObj.length);
    for (let i = styleObj.length; i--; ) {
        const nameString = styleObj[i];
        console.log(nameString + ' :  ' + styleObj.getPropertyValue(nameString) + styleObj.getPropertyPriority(nameString)) + ';';
      }
})();
```
