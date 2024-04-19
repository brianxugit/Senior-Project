
var myfile = null;

let OUT = {
    "URL": [],
    "HTML": []
};

let currURL;
let homeURL;
let surprise;

console.log(document.querySelector('#tag'));

chrome.devtools.panels.create("Senior Project", "icon.png", "panel.html", panel => {
    // code invoked on panel creation
    
    panel.onShown.addListener( (extpanel) => {

        // initialize navbar
        const panelTabs = extpanel.document.getElementsByClassName("tab");
        for (let tab of panelTabs) {
            tab.addEventListener('click', async() => {
                openTab(extpanel.document, tab.innerHTML);
            });
        }

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

// assigns output data to an object URL
function makeOutFile(data) {
    // write output data to downloadable JSON
    const filedata = new Blob([JSON.stringify(data)], {type: "application/json"});

    if (myfile !== null) window.URL.revokeObjectURL(myfile);
    myfile = window.URL.createObjectURL(filedata);
    return myfile
}

// downloads the output file
function downloadFile() {
    // generate a hidden DOM element
    const link = document.createElement('a');
    link.setAttribute('href', myfile);
    link.setAttribute('download', "mydata.json");
    document.body.appendChild(link);
    link.click();
}

function openTab(doc, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = doc.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = doc.getElementsByClassName("tab");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    doc.getElementById(tabName).style.display = "block";
}