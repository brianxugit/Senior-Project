
var myfile = null;

let OUT = {
    "URL": [],
    "HTML": []
};

let currURL;
let homeURL;
let surprise;

chrome.devtools.panels.create("Senior Project", "icon.png", "panel.html", panel => {
    // code invoked on panel creation
    
    panel.onShown.addListener( (extpanel) => {

        let setHome = extpanel.document.querySelector('#home');
        let displayHome = extpanel.document.querySelector('#homeURL');

        let select = extpanel.document.querySelector('#select');
        surprise    = extpanel.document.querySelector('#surprise');

        let download = extpanel.document.querySelector('#download');

        let debug = extpanel.document.querySelector('#debug');
        debugText = extpanel.document.querySelector('#debugText');

        setHome.addEventListener('click', async() => {
            homeURL = await chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, (tab) => {
                addURL(OUT.URL, tab.url);
                displayHome.innerHTML = tab.url;
            });
        });

        select.addEventListener('click', () => {
            backgroundConnection = chrome.runtime.connect({
                name: "devtools-page"
            });
            backgroundConnection.postMessage({
                name:   'selectToggle',
                tabId: chrome.devtools.inspectedWindow.tabId,
            })
        });

        download.addEventListener('click', async() => {
            myfile = makeOutFile(OUT);
            downloadFile();
        });

        debug.addEventListener('click', () => {
            debugText.innerHTML = JSON.stringify(OUT.URL);
        })
    });
});

// on message from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.type == 'element') {
        element = request.element;
        console.log("devtools got %O from content", element);
        chrome.devtools.inspectedWindow.eval('alert(request.classlist);');
        if (surprise) {
            surprise.innerHTML = `look it's ${JSON.stringify(request)}`;
        };
        sendResponse('got element');
    }
    if (request.type =='URL') {
        currURL = request.URL;
    }
});

function addURL(list, URL) {
    if(!list.includes(URL)) list.push(URL);
    console.log(list);
}

// initial connection
let backgroundConnection = chrome.runtime.connect({
    name: "devtools-page"
});
backgroundConnection.postMessage({
    name: 'newTab',
    tabId: chrome.devtools.inspectedWindow.tabId,
});

// writes data to a file and assigns an object URL
function makeOutFile(data) {
    const filedata = new Blob([JSON.stringify(data)], {type: "application/json"});

    if (myfile !== null) window.URL.revokeObjectURL(myfile);
    myfile = window.URL.createObjectURL(filedata);
    return myfile
}

// creates a pseudo-element which downloads the output file
function downloadFile() {
    const link = document.createElement('a');
    link.setAttribute('href', myfile);
    link.setAttribute('download', "mydata.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild('a');
}