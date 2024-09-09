function checkIsTwitter(tab) {
    return (tab.url.indexOf("twitter.com") != -1 || tab.url.indexOf("x.com") != -1)
}

async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });

    return tabs[0];
}
const OnResult = (result) => {};


async function OnChangeLogo() {
    var activeTab = await getActiveTabURL();
    chrome.storage.sync.get(["hideElements"], function(items){
        var message = {
            type: "changeLogo",
            hideElements: items["hideElements"]
        }
    
        chrome.tabs.sendMessage(activeTab.id, message, OnResult);
    });

    activeTab = await getActiveTabURL();
    chrome.storage.sync.get(["hideBlueMark","hideBlueMarkButton"], function(items){
        var message = {
            type: "hideBlueMark",
            hideBlueMark: items["hideBlueMark"],
            hideBlueMarkButton: items["hideBlueMarkButton"]
        }

        chrome.tabs.sendMessage(activeTab.id, message, OnResult);
    });
}

function refreshCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var tab = tabs[0];

      console.log('reload start')
      chrome.tabs.reload(tab.id,{ bypassCache: true });
      console.log('reload fin')
    });
  }


const OnHeartClean = async() => {
    const activeTab = await getActiveTabURL();
    var slider = document.getElementById("DelayRange");
    var message = {
        delay: slider.value,
        deleteRetweet: false,
        deleteMytweet: false,
        isDeleteHeart: true
    }

    chrome.tabs.sendMessage(activeTab.id, message, OnResult);
}

const OnTweetClean = async() => {

    var value1 = document.getElementById("checkbox1").checked
    var value2 = document.getElementById("checkbox2").checked

    const activeTab = await getActiveTabURL();
    var slider = document.getElementById("DelayRange");
    var message = {
        delay: slider.value,
        deleteRetweet: value1,
        deleteMytweet: value2,
        isDeleteHeart: false
    }

    chrome.tabs.sendMessage(activeTab.id, message, OnResult);
}

document.addEventListener("DOMContentLoaded", async() => {
    const activeTab = await getActiveTabURL();
    var container = document.getElementsByName("container")[0];
    var slidercontainer = document.getElementsByName("slidecontainer")[0];
    if (checkIsTwitter(activeTab)) {
        OnChangeLogo();
        container.innerHTML = '작동중';
    } else {
        containter.innerHTML = '트위터에서만 사용 가능합니다.'
        slidercontainer.style.display = 'none'
    }

    var slider = document.getElementById("DelayRange");
    var output = document.getElementById("delayValue");
    output.innerHTML = slider.value;

    slider.oninput = function() {
        output.innerHTML = this.value;
    }

    var hideElement = document.getElementById("hideElements");
    hideElement.addEventListener('change', function() {
        chrome.storage.sync.set({ "hideElements": this.checked }, function(){
            refreshCurrentTab()
        });
    });

    chrome.storage.sync.get(["hideElements"], function(items){
        hideElement.checked = items["hideElements"];
    });


    var hideBlueMarkButton = document.getElementById("hideBlueMarkButton");
    hideBlueMarkButton.addEventListener('change', function() {
        chrome.storage.sync.set({ "hideBlueMarkButton": this.checked }, function(){
            refreshCurrentTab()
        });
    });

    chrome.storage.sync.get(["hideBlueMarkButton"], function(items){
        hideBlueMarkButton.checked = items["hideBlueMarkButton"];
    });

    var hideBlueMark = document.getElementById("hideBlueMark");
    hideBlueMark.addEventListener('change', function() {
        var value = this.checked
        chrome.storage.sync.set({ "hideBlueMark": this.checked }, function(){
            if(value)
                hideBlueMarkButton.parentNode.style.display = 'flex'
            else
                hideBlueMarkButton.parentNode.style.display = 'none'

            refreshCurrentTab()
        });
    });

    chrome.storage.sync.get(["hideBlueMark"], function(items){
        hideBlueMark.checked = items["hideBlueMark"];

        if(items["hideBlueMark"])
            hideBlueMarkButton.parentNode.style.display = 'flex'
        else
            hideBlueMarkButton.parentNode.style.display = 'none'
    });


    if (checkIsTwitter(activeTab) && activeTab.url.includes("with_replies")) {
        const slidercontainer = document.getElementsByName("slidecontainer")[0];
        slidercontainer.style.display = ''

        const container = document.getElementsByName("container")[0];
        container.innerHTML = '';

        var fieldset = document.createElement('fieldset');

        var legend = document.createElement('legend');
        legend.textContent = '트윗 청소기 옵션';
        fieldset.appendChild(legend);
        fieldset.appendChild(slidercontainer)

        var checkbox1Div = document.createElement('div');
        checkbox1Div.style.display = 'flex';
        checkbox1Div.style.alignItems = 'center';
        var checkbox1 = document.createElement('input');
        checkbox1.type = 'checkbox';
        checkbox1.id = 'checkbox1';
        checkbox1.checked = true;
        checkbox1Div.appendChild(checkbox1);
        var label1 = document.createElement('label');
        label1.textContent = '리트윗 지우기';
        label1.style.marginLeft = '8px';
        label1.setAttribute('for', 'checkbox1');
        checkbox1Div.appendChild(label1);
        fieldset.appendChild(checkbox1Div);

        var checkbox2Div = document.createElement('div');
        checkbox2Div.style.display = 'flex';
        checkbox2Div.style.alignItems = 'center';
        var checkbox2 = document.createElement('input');
        checkbox2.type = 'checkbox';
        checkbox2.id = 'checkbox2';
        checkbox2.checked = true;
        checkbox2Div.appendChild(checkbox2);
        var label2 = document.createElement('label');
        label2.textContent = '내 트윗 지우기';
        label2.style.marginLeft = '8px';
        label2.setAttribute('for', 'checkbox2');
        checkbox2Div.appendChild(label2);
        fieldset.appendChild(checkbox2Div);

        container.appendChild(fieldset)

        var button = document.createElement('button');
        button.onclick = OnTweetClean;
        button.classList.add("button-17")
        button.innerHTML = "트윗 청소하기";
        button.style = "margin-top: 1rem;margin-bottom: 1rem"
        container.appendChild(button);

    } else if ((checkIsTwitter(activeTab))&& activeTab.url.includes("likes")) {
        const container = document.getElementsByName("container")[0];
        container.innerHTML = '';
        const slidercontainer = document.getElementsByName("slidecontainer")[0];
        slidercontainer.style.display = ''

        var button = document.createElement('button');
        button.onclick = OnHeartClean;
        button.classList.add("button-17")
        button.innerHTML = "마음함 청소하기";
        container.appendChild(button);
    } else {
        const slidercontainer = document.getElementsByName("slidecontainer")[0];
        slidercontainer.style.display = 'none'
        const container = document.getElementsByName("container")[0];
        container.innerHTML = '트윗 청소기를 사용하시려면 본인의 트윗 및 답글 페이지, 혹은 마음 페이지를 열어주세요.';
        var button = document.getElementsByClassName("CleanButton")[0];
        if (button != null)
            button.parentNode.removeChild(button);
    }
});