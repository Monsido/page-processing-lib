# page-processing-lib

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
