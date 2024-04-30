
var myfile = null;

let OUT = {
    "HOMEURL": "",
    "LEAGUES": {
        "URLS": [],
        "HTML": {
            
        }
    },
    "CLUBS":   {
        "URLS": [],
        "HTML": {
            
        }
    },
    "TEAMS":   {
        "URLS": [],
        "HTML": {
            
        }
    },
    "PLAYERS": {
        "URLS": [],
        "HTML": {

        }
    },
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

        //let select = extpanel.document.querySelector('#select');
        surprise    = extpanel.document.querySelector('#surprise');

        // league
        let getLeague = extpanel.document.querySelector('#league');
        let getLeague_name = extpanel.document.querySelector('#league-name');
        let showLeague = extpanel.document.querySelector('#leagueURL');

        // club
        let getClub = extpanel.document.querySelector('#club');
        let getClub_name = extpanel.document.querySelector('#club-name');
        let showClub = extpanel.document.querySelector('#clubURL');

        // team
        let getTeam = extpanel.document.querySelector('#team');
        let getTeam_name = extpanel.document.querySelector('#team-name');
        let showTeam = extpanel.document.querySelector('#teamURL');

        // player
        let getPlayer = extpanel.document.querySelector('#player');
        let getPlayer_name = extpanel.document.querySelector('#player-name');
        let showPlayer = extpanel.document.querySelector('#playerURL');

        let download = extpanel.document.querySelector('#download');

        let debug = extpanel.document.querySelector('#debug');
        debugText = extpanel.document.querySelector('#debugText');

        setHome.addEventListener('click', async() => {
            homeURL = await chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, (tab) => {
                OUT.HOMEURL = tab.url;
                displayHome.innerHTML = tab.url;
            });
        });
        // select.addEventListener('click', () => {
        //     backgroundConnection = chrome.runtime.connect({
        //         name: "devtools-page"
        //     });
        //     backgroundConnection.postMessage({
        //         name:   'selectToggle',
        //         tabId: chrome.devtools.inspectedWindow.tabId,
        //     })
        // });

        getLeague.addEventListener('click', async() => {
            await chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, (tab) => {
                addURL(OUT.LEAGUES.URLS, tab.url);
                showLeague.innerHTML = tab.url;
            });
        });
        getLeague_name.addEventListener('click', () => {
            backgroundConnection = chrome.runtime.connect({
                name: "devtools-page"
            });
            backgroundConnection.postMessage({
                name:   'selectToggle',
                set:    'league',
                type:   'name',
                tabId: chrome.devtools.inspectedWindow.tabId,
            })
        });

        getClub.addEventListener('click', async() => {
            await chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, (tab) => {
                addURL(OUT.CLUBS.URLS, tab.url);
                showClub.innerHTML = ` added ${tab.url} to club URLs`;
            });
        });
        getClub_name.addEventListener('click', () => {
            backgroundConnection = chrome.runtime.connect({
                name: "devtools-page"
            });
            backgroundConnection.postMessage({
                name:   'selectToggle',
                set:    'club',
                type:   'name',
                tabId: chrome.devtools.inspectedWindow.tabId,
            })
        });

        getTeam.addEventListener('click', async() => {
            await chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, (tab) => {
                addURL(OUT.TEAMS.URLS, tab.url);
                showTeam.innerHTML = ` added ${tab.url} to team URLs`;
            });
        });
        getTeam_name.addEventListener('click', () => {
            backgroundConnection = chrome.runtime.connect({
                name: "devtools-page"
            });
            backgroundConnection.postMessage({
                name:   'selectToggle',
                set:    'team',
                type:   'name',
                tabId: chrome.devtools.inspectedWindow.tabId,
            })
        });

        getPlayer.addEventListener('click', async() => {
            await chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, (tab) => {
                addURL(OUT.PLAYERS.URLS, tab.url);
                showPlayer.innerHTML = ` added ${tab.url} to player URLs`;
            });
        });
        getPlayer_name.addEventListener('click', () => {
            backgroundConnection = chrome.runtime.connect({
                name: "devtools-page"
            });
            backgroundConnection.postMessage({
                name:   'selectToggle',
                set:    'player',
                type:   'name',
                tabId: chrome.devtools.inspectedWindow.tabId,
            })
        });

        download.addEventListener('click', async() => {
            myfile = makeOutFile(OUT);
            downloadFile();
        });

        debug.addEventListener('click', () => {
            debugText.innerHTML = JSON.stringify(OUT);
        });

        openTab(extpanel.document, 'Home');
    });
});

// on message from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.name == 'select') {
        element = request.element;
        if (surprise) {
            surprise.innerHTML = `got response ${JSON.stringify(request)}`;
        };
        sendResponse('got element');
        switch (request.set) {
            case 'home':
                break;
            case 'league':
                addProperty(OUT.LEAGUES.HTML, request.type, request.path);
                break;
            case 'club':
                addProperty(OUT.CLUBS.HTML, request.type, request.path);
                break;
            case 'team':
                addProperty(OUT.TEAMS.HTML, request.type, request.path);
                break;
            case 'player':
                addProperty(OUT.PLAYERS.HTML, request.type, request.path);
                break;
        }
    }
    if (request.type =='URL') {
        currURL = request.URL;
    }
});

function addURL(list, URL) {
    if(!list.includes(URL)) list.push(URL);
    console.log(list);
}

function addProperty(prop, key, val) {
    prop[key] = val;
    console.log(prop, key, value);
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