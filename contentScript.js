const logo = "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function findObject(findQuery) {
    var find = document.querySelectorAll(findQuery);
    if (find.length == 0) {
        for (var i = 0; i < 100; i++) {
            find = document.querySelectorAll(findQuery);
            if (find.length != 0)
                break;
            await sleep(100);
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



async function changeLogo(text, backgroundColor, coordinates) {
    var element = await findObject('[href="/home"]');
    if (element.childNodes.length > 0) {
        const pathElement = element.childNodes[0].childNodes[0].childNodes[0].childNodes[0];

        if (pathElement) {
            pathElement.setAttribute('d', logo);
        }
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

    newNode.addEventListener('click', async function(event) {
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

    newButton.addEventListener('click', async function(event) {
        OnRandom();
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
            alert("추첨 취소됨");
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

async function OnTweetClean(message) {


    window.focus();
    window.scroll(0, 0);
    await sleep(500);

    var scrollCounter = 0

    var delay = message.delay
    var deleteRetweet = message.deleteRetweet
    var deleteMytweet = message.deleteMytweet

    var notMyTweetSet = new Set();
    var totalDeleteCount = 0;
    while (true) {
        if (!deleteRetweet && !deleteMytweet)
            break

        var deletecount = 0;

        var timelineElement = document.querySelectorAll('[aria-label^="타임라인:"]');
        if (timelineElement.length == 0) {
            throw ("Timeline find failed");
        }

        var cellInnverDives = timelineElement[0].querySelectorAll('[data-testid="cellInnerDiv"]');
        for (var i = 0; i < cellInnverDives.length; i++) {
            var cellElement = cellInnverDives[i];

            if (notMyTweetSet.has(cellElement))
                continue;

            var socialContext = cellElement.querySelectorAll('[data-testid="socialContext"]');
            if (socialContext.length != 0) {
                if (socialContext[0].childNodes[0].textContent == "재게시했습니다" && deleteRetweet) {
                    var unretweet = cellElement.querySelectorAll('[aria-label$="재게시. 재게시함"]');

                    if (unretweet.length == 0) {
                        continue;
                    }

                    (unretweet[0]).click();
                    await sleep(delay);
                    var unretweetConfirm = document.querySelectorAll('[data-testid="unretweetConfirm"]');
                    unretweetConfirm[0].click();
                    deletecount += 1;
                }
            } else if (deleteMytweet) {
                var moreButton = cellElement.querySelectorAll('[aria-label="더 보기"]');

                if (moreButton.length == 0)
                    continue;

                moreButton[0].click();
                await sleep(delay)

                var dropdown = document.querySelectorAll('[data-testid="Dropdown"]');

                if (dropdown.length == 0)
                    continue;

                var firstButton = dropdown[0].querySelectorAll('[role="menuitem"]')[0];

                if (firstButton.querySelector('span').textContent == "삭제하기") {
                    firstButton.click();
                    await sleep(delay);
                    var button = document.querySelectorAll('[data-testid="confirmationSheetConfirm"]');
                    if (button.length != 0) {
                        button[0].click();
                        deletecount += 1;
                    }
                } else {
                    dropdown[0].parentNode.removeChild(dropdown[0]);
                    notMyTweetSet.add(cellElement);
                }
            }

            await sleep(delay);
        }
        totalDeleteCount += deletecount;

        var flag = false;
        if (deletecount <= 10) {

            while (true) {
                var before = window.screenTop

                window.focus();
                window.scrollBy(0, 400);
                await sleep(delay);
                var after = window.screenTop

                if (before == after) {
                    scrollCounter++;
                    if (scrollCounter > 10) {
                        flag = true;
                        break;
                    }
                } else
                    break;
            }

            if (flag)
                break;
        }
    }

    alert(totalDeleteCount + "개의 트윗 삭제 완료!");
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
            if (unlike.length == 0)
                continue
            unlike[0].click()
            totalDeleteCount++
        }

        var isScrolled = false
        for (var i = 0; i < 10; i++) {
            var beforeScroll = window.scrollY
            window.focus();
            window.scrollBy(0, 500);
            await sleep(300);
            var nowScroll = window.scrollY

            if (beforeScroll != nowScroll) {
                isScrolled = true
                break
            }
        }

        if (!isScrolled)
            break
    }

    alert(totalDeleteCount + "개의 마음 삭제 완료!");
}



chrome.runtime.onMessage.addListener((obj, sender, response) => {
    if (obj === "changeLogo")
        changeLogo();
    else if (obj === "makeButton")
        makeButton();
    else if (obj === "makeRandomButton")
        makeRandomButton();
    else if (obj.isDeleteHeart)
        OnHeartClean(obj);
    else if (obj.deleteMytweet || obj.deleteRetweet)
        OnTweetClean(obj);
});