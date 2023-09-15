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
    var message = {
        type: "changeLogo"
    }

    chrome.tabs.sendMessage(activeTab.id, message, OnResult);
}

document.addEventListener("DOMContentLoaded", async() => {
    const activeTab = await getActiveTabURL();
    var container = document.getElementsByName("container")[0];
    if (activeTab.url.includes("twitter.com")) {
        OnChangeLogo();
        container.innerHTML = '작동중';
    } else {
        containter.innerHTML = '트위터에서만 사용 가능합니다.'
    }
});