
// sends message to background.js on event inside document body
// document.addEventListener("click", (event) => {
//     chrome.runtime.sendMessage({
//         click: true,
//       },
//       response => {
//         console.log("Received response", response);
//       }
//     );
// });

/* selector code */
const tags = [
    'DIV',
    'SECTION',
    'TABLE',
    'TD',
    'IFRAME',
    'LINK',
    'A',
    'IMG',
]

let curr = null;
let selectorEnabled = false;

// determine hovered node
document.addEventListener('mouseover', (e) => {

    if (!selectorEnabled) {
        // reset if needed
        if (curr != null) {
            curr.classList.remove("selector");
            curr = null;
        }
        return;
    }

    if (!tags.includes(e.target.tagName)) {
        //console.log(e.target.tagName);
        return;
    }
    if (e.target === document.body || 
        curr && curr === e.target) {
        return;
    }
    if (curr) {
        curr.classList.remove('selector');
        curr = null;
    }
    if (e.target) {
        curr = e.target;
        curr.classList.add('selector');
        //console.log(e.target);
    }
    },
    false
);

// for disabling and enabling links on document
function disableLinks() {
    getA().pointerEvents = 'none';
}
function enableLinks() {
    getA().pointerEvents = '';
}
function getA() {
    for (let i = 0; i < document.styleSheets.length; i++) {
        let styleSheet = document.styleSheets[i];
        let rules = styleSheet.cssRules;
        for (let j = 0; j < rules.length; j++) {
            let rule = rules[j];
            if (rule.selectorText === 'a') {
                return(rule.style);
            }
        }
    }
    return 0;
}

document.addEventListener('click', async () => {
    console.log('you clicked content while selector was %s', selectorEnabled);
    if (!selectorEnabled) return;

    chrome.runtime.sendMessage({
        type:       'element',
        id:         curr.id,
        name:       curr.className,
        tagname:    curr.tagName.toLowerCase(),
        classlist:  curr.classList,
        path: getXPathForElement(curr),
        },
        response => {
            console.log("content got response", response);
        });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.name === 'selectToggle') {
            selectorEnabled = !selectorEnabled;

            if (selectorEnabled) disableLinks();
            else enableLinks();

            sendResponse({
                selectStatus:   selectorEnabled,
            })
        }
    }
)

function getXPathForElement(element) {
    const idx = (sib, name) => sib 
        ? idx(sib.previousElementSibling, name||sib.localName) + (sib.localName == name)
        : 1;
    const segs = elm => !elm || elm.nodeType !== 1 
        ? ['']
        : elm.id && document.getElementById(elm.id) === elm
            ? [`id("${elm.id}")`]
            : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
    return segs(element).join('/');
}

function getElementByXPath(path) { 
    return (new XPathEvaluator()) 
        .evaluate(path, document.documentElement, null, 
                        XPathResult.FIRST_ORDERED_NODE_TYPE, null) 
        .singleNodeValue; 
} 