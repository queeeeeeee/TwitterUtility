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


const OnHeartClean = async() => {
    const activeTab = await getActiveTabURL();
    var message = {
        delay: -1,
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
    if (activeTab.url.includes("twitter.com")) {
        OnChangeLogo();
        container.innerHTML = '작동중';
    } else {
        containter.innerHTML = '트위터에서만 사용 가능합니다.'
    }

    var slider = document.getElementById("DelayRange");
    var output = document.getElementById("delayValue");
    output.innerHTML = slider.value;

    slider.oninput = function() {
        output.innerHTML = this.value;
    }

    if (activeTab.url.includes("twitter.com") && activeTab.url.includes("with_replies")) {
        const container = document.getElementsByName("container")[0];
        container.innerHTML = '';

        var fieldset = document.createElement('fieldset');

        var legend = document.createElement('legend');
        legend.textContent = '옵션 선택하기';
        fieldset.appendChild(legend);

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

    } else if (activeTab.url.includes("twitter.com") && activeTab.url.includes("likes")) {
        const container = document.getElementsByName("container")[0];
        container.innerHTML = '';

        var button = document.createElement('button');
        button.onclick = OnHeartClean;
        button.classList.add("button-17")
        button.innerHTML = "마음함 청소하기";
        container.appendChild(button);
    } else {
        const container = document.getElementsByName("container")[0];
        container.innerHTML = '트윗 청소기를 사용하시려면 본인의 트윗 및 답글 페이지, 혹은 마음 페이지를 열어주세요.';
        var button = document.getElementsByClassName("CleanButton")[0];
        if (button != null)
            button.parentNode.removeChild(button);
    }
});