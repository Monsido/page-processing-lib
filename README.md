# page-processing-lib

## Idea
We need to collect the data from page in 2 parts: 
DOM elements with arguments
CSS for every HTML element
Process
Get the list of computed styles (CS) for HTML element - it will be used as the default one (approx. 379 entries) (Create a random element and get default CS from it, since HTML element may be affected by styles)
Iterate through DOM, processing element by element.
Collect CS for the element. 
Get a diff (keep only the properties which are different compared to the default CS) compared to the default CS.
Stringify the diff.
If there is a diff, and there is no such value yet in the collection, then add it to the collection.
Associate the added diff with a cs-id, to use it as a reference for the element. Many elements may have the same CS diff, that will allow us to re-use the CS, identifying it by cs-id.
The tag name, and the attributes of the cloned element should be saved in the resulting JSON structure. The attributes should be saved in the order they visually appear in the element’s tag.

## Optionally
Remove irrelevant properties from CS (e.g. proprietary properties [--webkit-*], specifying properties [border-bottom] - since it is expected that the “border” property already contains its value - testing & confirmation is required)
Use the same package for serializing the data in Extension and Scanner, maybe share it as dependency.

## Data structure
JSON<{tree; css;}>
tree: Tree of nodes: Element = {
tagName: string; 
csId: number; 
attr?: Array<Array<string>>; // [[‘font-size’, ‘17px’], [‘font-family’, ‘Arial’]] 
children?: Array<Element | { text: string }>; // contains elements OR textNodes
hasShadow?: boolean;
}
css: CSS data: Array<string> // the 0-entry contains the default CS
Example
```json 
{
    tree: {
		tagName: ‘html’,
		csId: 0,
	    attr: [
		    [‘lang’, ‘en’]
        ],
        children: [
            {
                tagName: ‘body’,
                csId: 1,
                children: [
                    {
                        tagName: ‘div’,
                        csId: 2,
                        attr: [
                            [‘class’, ‘text’]
                        ],
                        children: [
                            {
                                text: ‘Hello!’
                            }
                        ]   
                    },
                    {
                        tagName: ‘div’,
                        csId: 2,
                        attr: [
                            [‘class’, ‘text’]
                        ],
                        children: [
                            {
                                text: ‘How are you doing?’
                            }
                        ]
                    }

                ]
            },
        ]
    },
    css: [
        ‘animation-timing-function: ease;animation-timeline: auto;...zoom: 1;’, // csId0
        ‘padding-top: 15px;font-size: 15px !important;’, // csId1
        ‘color: rgb(153, 153, 153);’, // csId2
        …
    ]
}
```
