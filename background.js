async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });

    return tabs[0];
}
const OnResult = (result) => {};


async function OnChangeLogo() {
    const activeTab = await getActiveTabURL();
    chrome.storage.sync.get(["hideElements"], function(items){
        var message = {
            type: "changeLogo",
            hideElements: items["hideElements"]
        }
    
        chrome.tabs.sendMessage(activeTab.id, message, OnResult);
    });
}

async function OnRemoveBlueMark(){
    const activeTab = await getActiveTabURL();
    chrome.storage.sync.get(["hideBlueMark","hideBlueMarkButton"], function(items){
        var message = {
            type: "hideBlueMark",
            hideBlueMark: items["hideBlueMark"],
            hideBlueMarkButton: items["hideBlueMarkButton"]
        }

        chrome.tabs.sendMessage(activeTab.id, message, OnResult);
    });
}

async function OnMakeButton() {
    const activeTab = await getActiveTabURL();
    var message = "makeButton"
    chrome.tabs.sendMessage(activeTab.id, message, OnResult);
}

async function OnMakeRandomButton() {
    const activeTab = await getActiveTabURL();
    var message = "makeRandomButton"
    chrome.tabs.sendMessage(activeTab.id, message, OnResult);
}

function checkIsTwitter(tab) {
    return (tab.url.indexOf("twitter.com") != -1 || tab.url.indexOf("x.com") != -1)
}

function urlContains(tab, text) {
    return tab.url.indexOf(text) != -1;
}

function urlEndsWith(tab, text) {
    return tab.url.endsWith(text);
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status != "complete")
        return;
    if (!checkIsTwitter(tab))
        return;

    OnChangeLogo();
    OnRemoveBlueMark();

    if (urlContains(tab, "status")) {
        if (urlEndsWith(tab, "retweets") | urlEndsWith(tab, "quotes") | urlEndsWith(tab, "likes")) {
            OnMakeRandomButton();
        } else {
            OnMakeButton();
        }
    }
})

