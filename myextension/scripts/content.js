
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
    'DT',
    'DD',
    'H1','H2','H3','H4','H5','H6',
]

let curr = null;
let selectorEnabled = false;
let set = null;
let type = null;

/* grabs a copy of all links present on the page
   because we need to disable and re-enable them */
const pageLinks = [], l = document.links;
for (var i = 0; i < l.length; i++) {
    pageLinks.push(l[i].href);
}

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

function disableLinks() {
    for (var i = 0; i < l.length; i++) {
        document.links[i].href = 'javascript:void(0)';
    }
}
function enableLinks() {
    for (var i = 0; i < l.length; i++) {
        document.links[i].href = pageLinks[i];
    }
}

document.addEventListener('click', async () => {
    //console.log('you clicked content while selector was %s', selectorEnabled);
    if (!selectorEnabled) return;

    console.log(`set is ${set}`);

    chrome.runtime.sendMessage({
        name:   'select',
        set:    set,
        type:   type,
        path:   getXPathForElement(curr),
        url:    location.href,
        },
        response => {
            console.log("content got response", response);
        });
    selectorEnabled = false;
    setTimeout(() => {
        enableLinks();
    }, "10");
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.name === 'selectToggle') {
            console.dir(request);
            selectorEnabled = !selectorEnabled;

            if (selectorEnabled) disableLinks();
            else enableLinks();

            set = request.set;
            type = request.type;

            console.log(`set is ${set}`);

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