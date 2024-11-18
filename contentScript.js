var whiteList = new Set()
var whiteListText = ""
var whiteListFromFiles = new Set()

fetch(chrome.runtime.getURL("data/whitelist.txt"))
    .then(response => response.text())
    .then(text => {
        var lines = text.split(/\r?\n/);
        var cleanedLines = lines.map(line => line.replace(/[\s]+/g, ''));
        cleanedLines.forEach(item => whiteList.add(item))
        cleanedLines.forEach(item => whiteListFromFiles.add(item))
    })
    .catch(error => console.error("Error fetching static file:", error));

const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            onDOMUpdate();
        }
    }
});

chrome.storage.sync.get(["whitelist"], function (items) {
    whiteListText = items["whitelist"];
    if (!whiteListText) {
        whiteListText = ""
        return;
    }

    var lines = whiteListText.split(/\r?\n/);
    var cleanedLines = lines.map(line => line.replace(/[\s]+/g, ''));
    cleanedLines.forEach(item => whiteList.add(item))
});

var hideBlueMark = false
var hideBlueMarkButton = false

const targetNode = document.body;

const config = { childList: true, subtree: true };

observer.observe(targetNode, config);


const logo = "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function isWhiteList(id) {
    return whiteList.has(id);
}

function addWhiteList(id) {
    whiteListText += "\n" + id;
    whiteList.add(id)
    chrome.storage.sync.set({ "whitelist": whiteListText }, function () {
    });
}

function removeWhiteList(id) {
    const lines = whiteListText.split('\n');
    const filteredLines = lines.filter(line => line.trim() !== id);
    const newText = filteredLines.join('\n');
    whiteListText = newText;
    whiteList.delete(id)
    chrome.storage.sync.set({ "whitelist": whiteListText }, function () {
    });
}

async function findObject(findQuery, time = 100, interval = 100) {
    var find = document.querySelectorAll(findQuery);
    if (find.length == 0) {
        for (var i = 0; i < time; i++) {
            find = document.querySelectorAll(findQuery);
            if (find.length != 0)
                break;
            await sleep(interval);
        }
    }
    return find[0]
}

async function findObjectFrom(findQuery, from) {
    var find = from.querySelectorAll(findQuery);
    if (find.length == 0) {
        for (var i = 0; i < 100; i++) {
            find = from.querySelectorAll(findQuery);
            if (find.length != 0)
                break;
            await sleep(100);
        }
    }
    return find[0]
}



async function findObjectAll(findQuery) {
    var find = document.querySelectorAll(findQuery);
    if (find.length == 0) {
        for (var i = 0; i < 100; i++) {
            find = document.querySelectorAll(findQuery);
            if (find.length != 0)
                break;
            await sleep(100);
        }
    }
    return find
}

function waitForNonNullAsync(objGetter, interval = 100) {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (objGetter() !== null) {
                clearInterval(checkInterval);
                resolve(objGetter());
            }
        }, interval);
    });
}

function getID(target) {
    var finalName = "error"
    var userName = target.querySelector('[data-testid="User-Name"]')
    if (userName) {
        var idHints = userName.querySelectorAll('[style="text-overflow: unset;"]')
        var atStartingElements = Array.from(idHints).filter(element =>
            element.innerHTML.trim().startsWith('@')
        );
        finalName = atStartingElements[0].innerHTML
    }
    return finalName
}

async function attachBlueBox(target, id) {
    if (target.querySelectorAll('[id="clickToSeeButton"]').length != 0)
        return;

    var original = target.firstChild
    original.style.display = 'none'
    var button = document.createElement('div');
    button.style.textAlign = 'center'
    button.id = "clickToSeeButton"
    button.innerHTML = '파란 딱지 [' + id + '] 의 트윗 숨겨짐 : 눌러서 트윗 열기'
    button.onclick = () => {
        if (original.style.display === 'none') {
            original.style.display = ''
            button.innerHTML = '파란 딱지 [' + id + '] 의 트윗 보여지는 중 : 눌러서 트윗 숨기기'
        }
        else {
            original.style.display = 'none'
            button.innerHTML = '파란 딱지 [' + id + '] 의 트윗 숨겨짐 : 눌러서 트윗 열기'
        }
    }
    target.prepend(button);
}



async function onDOMUpdate() {
    if (!hideBlueMark)
        return;

    var timeline = await findObject('[aria-label^="타임라인"]');

    if (!timeline)
        return;

    if (!whiteList) {
        await waitForNonNullAsync(() => whiteList, 1);
    }

    var cellInnerDivs = timeline.querySelectorAll('[data-testid="cellInnerDiv"]');

    for (var i = 0; i < cellInnerDivs.length; i++) {
        var current = cellInnerDivs[i];

        if (current.querySelectorAll('[aria-label="인증된 계정"]').length != 0) {
            var id = getID(current)

            if (isWhiteList(id))
                continue;

            if (hideBlueMarkButton) {
                current.innerHTML = ''
                continue;
            }

            attachBlueBox(current, id)
            current.style.border = '1px solid #303030'
        }
    }
}

function OnHideBlueMark(message) {
    hideBlueMark = message.hideBlueMark
    hideBlueMarkButton = message.hideBlueMarkButton
}


async function makeWhiteListButton() {
    var isTimeline = await findObject('[aria-label="프로필 타임라인"]', 100, 10);
    if (!isTimeline) {
        return;
    }

    var button = await findObject('[aria-label="더 보기"]')
    if (!button) {
        return;
    }

    var checkButton = document.querySelectorAll('[id="whiteListButton"]')
    if (checkButton.length != 0) {
        while (checkButton.length > 0) {
            if (checkButton[0].parentNode)
                checkButton[0].parentElement.removeChild(checkButton[0]);
            else
                break;
        }
    }

    var profile = await findObject('[data-testid="UserName"]')
    if (!profile) {
        return;
    }

    var profilespans = profile.getElementsByTagName('span');
    var id = ''
    for (var i = 0; i < profilespans.length; i++) {
        if (profilespans[i].innerHTML.startsWith('@'))
            id = profilespans[i].innerHTML;
    }

    var buttonParent = button;
    var buttonParentParent = buttonParent.parentNode;
    var newButton = buttonParent.cloneNode(true);
    newButton.id = 'whiteListButton'
    var svgs = newButton.getElementsByTagName('svg');
    while (svgs.length > 0) {
        svgs[0].parentNode.removeChild(svgs[0]);
    }

    var spans = newButton.getElementsByTagName('span');
    var buttonInnerSpan = spans[0]

    if (isWhiteList(id)) {
        buttonInnerSpan.innerHTML = "화이트리스트 O"
        buttonInnerSpan.parentNode.parentNode.style.backgroundColor = "white"
        buttonInnerSpan.style.color = "black"
    }
    else {
        buttonInnerSpan.innerHTML = "화이트리스트 X"
        buttonInnerSpan.parentNode.parentNode.style.backgroundColor = "black"
        buttonInnerSpan.style.color = "white"
    }

    buttonInnerSpan.style.paddingLeft = '10px'
    buttonInnerSpan.style.paddingRight = '10px'

    newButton.onclick = () => {
        var checkIsWhiteList = isWhiteList(id)
        if (checkIsWhiteList)
        {
            if(whiteListFromFiles.has(id))
            {
                alert("파일에서 추가된 화이트리스트는 버튼으로 제거할 수 없습니다. data/whitelist.txt 파일에서 제거해주세요.")
                return;
            }
            removeWhiteList(id)
        }
        else
            addWhiteList(id)

        if (!checkIsWhiteList) {
            buttonInnerSpan.innerHTML = "화이트리스트 O"
            buttonInnerSpan.parentNode.parentNode.style.backgroundColor = "white"
            buttonInnerSpan.style.color = "black"
        }
        else {
            buttonInnerSpan.innerHTML = "화이트리스트 X"
            buttonInnerSpan.parentNode.parentNode.style.backgroundColor = "black"
            buttonInnerSpan.style.color = "white"
        }

    }

    buttonParentParent.insertBefore(newButton, buttonParent.parentNode.lastElementChild);
}

async function changeLogo(message) {
    if (!message.hideElements)
        return
    element = await findObject('[rel="shortcut icon"]');
    if (element) {
        var originalElement = element;
        var clonedElement = originalElement.cloneNode(true);
        clonedElement.href = "//abs.twimg.com/favicons/twitter.2.ico"
        clonedElement.id = "new icon";
        var parentElement = originalElement.parentNode;
        parentElement.insertBefore(clonedElement, originalElement.nextSibling);
        parentElement.removeChild(originalElement);
    }

    var element = await findObject('[href="/home"]');
    if (element.childNodes.length > 0) {
        const pathElement = element.childNodes[0].childNodes[0].childNodes[0].childNodes[0];

        if (pathElement) {
            pathElement.setAttribute('d', logo);
        }
    }

    element = await findObject('[aria-label="그록"]');
    if (element) {
        element.style.cssText = 'display: None;'
    }

    element = await findObject('[aria-label="Premium"]');
    if (element) {
        element.style.cssText = 'display: None;'
    }

    element = await findObject('[aria-label="커뮤티"]');
    if (element) {
        element.style.cssText = 'display: None;'
    }

    element = await findObject('[aria-label="Premium 구독하기"]');
    if (element) {
        element.style.cssText = 'display: None;'
    }

    element = await findObject('[aria-label="인증된 조직"]');
    if (element) {
        element.style.cssText = 'display: None;'
    }

}

async function makeButton() {
    const currentUrl = window.location.href;
    if (currentUrl.endsWith("quotes"))
        return;

    var retweets = await findObjectAll('[data-testid="retweet"], [data-testid="unretweet"]');
    var retweet = null;
    for (var i = 0; i < retweets.length; i++) {
        var now = retweets[i];
        var target = now.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        // alert(target.innerHTML)
        if (target.getAttribute('tabindex') === "-1") {
            retweet = retweets[i];
            break;
        }
    }
    if (retweet == null) {
        await sleep(200);
        makeButton();
        return;
    }

    var newNode = retweet.parentNode.cloneNode(true);
    retweet.parentNode.after(newNode);

    var retweetHolder = newNode.childNodes[0].childNodes[0].childNodes[0];
    retweetHolder.parentNode.removeChild(retweetHolder);
    var textHolder = newNode.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
    textHolder.innerHTML = "인용 보기";

    newNode.addEventListener('click', async function (event) {
        var target = newNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        var caret = await findObjectFrom('[data-testid="caret"]', target);
        caret.click();
        var quotes = await findObject('[data-testid="tweetEngagements"]');
        quotes.click();
    });
}

async function makeRandomButton() {
    var doesRandomButtonExists = document.querySelectorAll('[id="randomButton"]');
    if (doesRandomButtonExists.length > 0)
        return;

    var backButton = await findObject('[data-testid="app-bar-back"]');
    var newButton = backButton.parentNode.cloneNode(true);
    backButton.parentNode.parentNode.childNodes[1].after(newButton);
    newButton.id = "randomButton";
    var pathElement = newButton.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0];

    if (pathElement) {
        pathElement.setAttribute('d', "M7.0498 7.0498H7.0598M10.5118 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V10.5118C3 11.2455 3 11.6124 3.08289 11.9577C3.15638 12.2638 3.27759 12.5564 3.44208 12.8249C3.6276 13.1276 3.88703 13.387 4.40589 13.9059L9.10589 18.6059C10.2939 19.7939 10.888 20.388 11.5729 20.6105C12.1755 20.8063 12.8245 20.8063 13.4271 20.6105C14.112 20.388 14.7061 19.7939 15.8941 18.6059L18.6059 15.8941C19.7939 14.7061 20.388 14.112 20.6105 13.4271C20.8063 12.8245 20.8063 12.1755 20.6105 11.5729C20.388 10.888 19.7939 10.2939 18.6059 9.10589L13.9059 4.40589C13.387 3.88703 13.1276 3.6276 12.8249 3.44208C12.5564 3.27759 12.2638 3.15638 11.9577 3.08289C11.6124 3 11.2455 3 10.5118 3ZM7.5498 7.0498C7.5498 7.32595 7.32595 7.5498 7.0498 7.5498C6.77366 7.5498 6.5498 7.32595 6.5498 7.0498C6.5498 6.77366 6.77366 6.5498 7.0498 6.5498C7.32595 6.5498 7.5498 6.77366 7.5498 7.0498Z");
    }

    newButton.addEventListener('click', async function (event) {
        OnRandom();
    });

    var newButton = backButton.parentNode.cloneNode(true);
    backButton.parentNode.parentNode.childNodes[1].after(newButton);
    newButton.id = "staticsButton";
    var pathElement = newButton.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0];

    if (pathElement) {
        pathElement.setAttribute('d', "M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z");
    }

    newButton.addEventListener('click', async function (event) {
        OnRetweetStatics();
    });
}

//random rt

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

function getRandomItem(set) {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
}

async function OnRandom() {
    const initialUrl = window.location.href;
    if (!initialUrl.endsWith("retweets")) {
        alert("추첨은 리트윗 페이지에서만 가능합니다.");
        return;
    }

    alert("추첨 시작");

    var element = await findObject('[aria-label="타임라인: 재게시"]');

    var prevY = 0;

    window.scroll(0, 0);

    await sleep(500);

    while (true) {

        if (initialUrl != window.location.href) {
            alert("추첨 소됨");
            return;
        }

        var currentY = window.scrollY + 500;

        if (currentY == prevY)
            break;

        window.scroll(0, currentY);


        await sleep(500);

        prevY = currentY;
    }

    window.scroll(0, getRandomInt(0, prevY));
    await sleep(500);


    var find = element.querySelectorAll('[data-testid="cellInnerDiv"]');
    var numbers = new Set();
    for (var i = 0; i < find.length; i++) {
        numbers.add(i);
    }

    var index = getRandomItem(numbers);

    if (find[index].getElementsByClassName('span').length == 0) {
        numbers.delete(index);
        index = getRandomItem(numbers);
    }

    find[index].scrollIntoView();
    find[index].style.backgroundColor = "dimgrey";

    window.scroll(0, window.scrollY - 150);
    await sleep(200);
    alert("추첨 완료!");
}


async function OnRetweetStatics() {
    const initialUrl = window.location.href;
    if (!initialUrl.endsWith("retweets")) {
        alert("RT 목록 취합은 리트윗 페이지에서만 가능합니다.");
        return;
    }

    alert("RT 목록 취합 시작");

    var element = await findObject('[aria-label="타임라인: 재게시"]');

    var prevY = 0;

    var retweeters = new Set();
    window.scroll(0, 0);

    await sleep(500);

    while (true) {

        if (initialUrl != window.location.href) {
            alert("취합 취소됨");
            return;
        }

        var currentY = window.scrollY + 500;

        if (currentY == prevY)
            break;

        window.scroll(0, currentY);

        await sleep(500);

        var foundRetweets = element.querySelectorAll('[data-testid="cellInnerDiv"]');
        for (var i = 0; i < foundRetweets.length; i++) {
            retweeters.add(foundRetweets[i]);
        }

        prevY = currentY;
    }


    let retweetersArray = Array.from(retweeters);

    var statics = [];
    var log = "";
    log += retweetersArray.length;
    log += "retweets. <br>";


    var removed = new Set();

    for (var i = 0; i < retweetersArray.length; i++) {
        var result = [];

        var spans = retweetersArray[i].querySelectorAll("span");
        for (var j = 0; j < spans.length; j++) {
            if (!!spans[j].innerHTML) {
                if (removed.has(spans[j].parentNode))
                    continue;


                var findInnerImg = spans[j].querySelectorAll("img");

                if (findInnerImg.length > 0) {
                    var finalName = "";
                    var childs = findInnerImg[0].parentNode.childNodes;

                    for (var k = 0; k < childs.length; k++) {
                        console.log(childs[k]);
                        console.log(childs[k].tagName);

                        if (childs[k].tagName === "SPAN")
                            finalName += childs[k].innerHTML;
                        if (childs[k].tagName === "IMG")
                            finalName += childs[k].alt;
                    }

                    result.push(finalName);
                    log += finalName;
                    log += " | ";
                    removed.add(findInnerImg[0].parentNode);
                    continue;
                }

                var findInnerSpan = spans[j].querySelectorAll("span");

                if (findInnerSpan.length > 0) {
                    continue;
                }

                var findInnerA = spans[j].querySelectorAll("a");

                if (findInnerA.length > 0) {
                    result.push(findInnerA[0].innerHTML);
                    log += findInnerA[0].innerHTML;
                    log += " | ";
                    removed.add(findInnerA[0].parentNode);
                    continue;
                }

                var findInnerSvg = spans[j].querySelectorAll("svg");

                if (findInnerSvg.length > 0) {
                    continue;
                }


                result.push(spans[j].innerHTML);
                log += spans[j].innerHTML;
                log += " | ";
                removed.add(spans[j].parentNode);
            }
        }

        log += "<br>========================<br>";
        statics.push(result);
    }

    var newWindow = window.open('', '_blank');

    var output = '\
        <table border="1">\
	        <th>이름</th>\
	        <th>ID</th>\
            <th>상대가 나를 팔로우</th>\
            <th>내가 상대를 팔로우</th>\
    ';


    for (var i = 0; i < statics.length - 1; i++) {
        output += "<tr>";

        var current = statics[i];
        output += '<td>' + current[0] + '</td>';
        output += '<td>' + current[1] + '</td>';
        if (current[2] === "나를 팔로우합니다") {
            output += "<td>O</td>";
            if (current[3] === "팔로잉")
                output += "<td>O</td>";
            else
                output += "<td>X</td>";
        }
        else {
            output += "<td>X</td>";
            if (current[2] === "팔로잉")
                output += "<td>O</td>";
            else
                output += "<td>X</td>";
        }

        output += "</tr>";
    }

    output += "</table>";

    output += "<br><br><br><br>";
    newWindow.document.write(output);
    //newWindow.document.write(log);
}

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

async function OnTweetClean(message) {
    alert("트윗 삭제 시작");
    const overlay = document.createElement('div');
    overlay.id = 'tweet-clean-overlay'; // ID 추가
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;

    const messageText = document.createElement('div');
    messageText.style.cssText = `
        color: white;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
    `;
    messageText.textContent = '트윗 청소중...';

    const actionButton = document.createElement('button');
    actionButton.style.cssText = `
        padding: 10px 20px;
        font-size: 16px;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
    `;
    actionButton.textContent = '취소';
    actionButton.addEventListener('mouseover', () => {
        actionButton.style.backgroundColor = '#c0392b';
    });
    actionButton.addEventListener('mouseout', () => {
        actionButton.style.backgroundColor = '#e74c3c';
    });
    actionButton.addEventListener('click', () => {
        overlay.remove();
        window.location.reload();
    });

    const statusText = document.createElement('div');
    statusText.style.cssText = `
        color: #cccccc;
        font-size: 16px;
        text-align: center;
        margin: 10px 0 20px 0;
        max-width: 80%;
        word-wrap: break-word;
    `;
    statusText.textContent = '시작 중...';

    const countText = document.createElement('div');
    countText.style.cssText = `
        color: #cccccc;
        font-size: 16px;
        text-align: center;
        margin-bottom: 20px;
    `;
    countText.textContent = '삭제된 트윗: 0개';

    overlay.appendChild(messageText);
    overlay.appendChild(actionButton);
    overlay.insertBefore(statusText, actionButton);
    overlay.insertBefore(countText, actionButton);

    document.body.appendChild(overlay);

    let deletedCount = 0;

    const delete_options = {
        "old_tweets": false,
        "unretweet": message.deleteRetweet,
        "delete_message_with_url_only": false,
        "match_any_keywords": message.excludeKeywords || [],
        "tweets_to_ignore": [],
        "after_date": message.startDate || new Date(0),
        "before_date": message.endDate || new Date(),
        "do_not_remove_pinned_tweet": false,
        "statusCallback": (status) => {
            statusText.textContent = status;
        },
        "countCallback": (count) => {
            deletedCount = count;
            countText.textContent = `삭제된 트윗: ${count}개`;
        }
    };
    
    try {
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "getHeaders" }, resolve);
        });

        if (!response.headers || !response.headers.authorization || !response.headers.clientTid) {
            messageText.textContent = "필요한 인증 정보를 수집 중입니다. 잠시 후 다시 시도해주세요.";
            actionButton.textContent = '확인';
            return;
        }

        const pathSegments = window.location.pathname.split('/');
        const currentUsername = pathSegments[1]; 

        const runOptions = {
            ...delete_options,
            headers: {
                ...response.headers,
                username: currentUsername 
            },
            csrf_token: getCookie("ct0"),
            user_id: getCookie("twid").substring(4)
        };

        await run(runOptions);
        //await sleep(5000);
        
        messageText.textContent = '트윗 청소가 완료되었습니다!';
        statusText.textContent = `총 ${deletedCount}개의 트윗이 삭제되었습니다.`;
        countText.style.display = 'none';
        actionButton.textContent = '확인';

    } catch (error) {
        console.error("트윗 삭제 중 오류 발생:", error);
        messageText.textContent = "트윗 청소 중 오류가 발생했습니다.";
        actionButton.textContent = '확인';
    }
}

async function OnHeartClean(message) {


    var skipSet = new Set();
    var totalDeleteCount = 0

    var timelineElement = document.querySelectorAll('[aria-label^="타임라인:"]');
    if (timelineElement.length == 0) {
        throw ("Timeline find failed");
    }

    while (true) {
        var cellInnverDives = timelineElement[0].querySelectorAll('[data-testid="cellInnerDiv"]');

        for (var i = 0; i < cellInnverDives.length; i++) {
            if (skipSet.has(cellInnverDives[i]))
                continue
            skipSet.add(cellInnverDives[i])
            var unlike = timelineElement[0].querySelectorAll('[data-testid="unlike"]');
            if (unlike.length == 0) {
                continue;
            }
            for (var i = 0; i < unlike.length; i++) {
                unlike[i].click();
                totalDeleteCount++;
            }
        }

        var isScrolled = false
        for (var i = 0; i < 10; i++) {
            var beforeScroll = window.scrollY
            window.focus();
            window.scrollBy(0, 500);
            await sleep(message.delay);
            var nowScroll = window.scrollY

            if (beforeScroll != nowScroll) {
                isScrolled = true
                break
            }
        }

        if (!isScrolled)
            break
    }

    alert("마음 삭제 완료!");
}



chrome.runtime.onMessage.addListener((obj, sender, response) => {
    if (obj === "makeButton")
        makeButton();
    else if (obj === "makeRandomButton")
        makeRandomButton();
    else if (obj.isDeleteHeart)
        OnHeartClean(obj);
    else if (obj.deleteMytweet || obj.deleteRetweet)
        OnTweetClean(obj);
    else if (obj.type === "changeLogo") {
        changeLogo(obj);
        makeWhiteListButton();
    }
    else if (obj.type === "hideBlueMark")
        OnHideBlueMark(obj)
});
