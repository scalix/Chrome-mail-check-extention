var notID = 0;

var newMsgsTotal = 0;
var newMsgsTotalText = 'There are no new messages';

function showError(message) {
    chrome.notifications.create(
        'sxNotId' + notID++,  // icon url - can be relative
        {
            type: 'basic',
            title: 'Error ocurred when chacking one of your mailboxes',
            iconUrl: 'icon.png',
            message: message
        }
    );
}

function updateInfo() {
    var text = 'There are no new messages';
    if (newMsgsTotal > 0) {
        text = 'You have ' + newMsgsTotal + ' unread messages in your mail box';
    }
    newMsgsTotalText = text;
}

function showNotification(mailbox, items) {
    if (!items)
        return;
    var list = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var listItem = {
            title: '',
            message: ''
        };
        var from = item.getElementsByTagName("from") || [];
        if (from) {
            listItem['title'] = htmlDecode(from[0].textContent);
        }
        var subject = item.getElementsByTagName("subject") || [];
        if (subject) {
            listItem['message'] = htmlDecode(subject[0].textContent);
        }
        list.push(listItem);
    }
    chrome.notifications.create(
        'sxNotId' + notID++,  // icon url - can be relative
        {
            type: 'list',
            title: 'New mail in ' + mailbox,
            iconUrl: 'icon.png',
            message: 'You have new mail in ' + mailbox,
            items: list,
            isClickable: true
        }
    );
}

function checkMail() {

    newMsgsTotal = 0;
    newMsgsTotalText = 'Checking ...';
    getSettings(function (settings) {
        for (var i = 0; i < settings.checkFolders.length; i++) {
            var mailbox = settings.checkFolders[i];
            fetchData(
                getMailBoxUrl(settings, mailbox),
                settings.userName,
                settings.userPassword,
                function (xmlDoc) {
                    var items = xmlDoc.getElementsByTagName("item") || [];
                    newMsgsTotal += items.length;
                    updateInfo();
                    showNotification(mailbox, items);
                },
                function (msg) {
                    showError("Failed to proccess " + mailbox + " " + msg);
                }
            );
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {

    chrome.alarms.create("scalixCheckMail", {
        delayInMinutes: 1,
        periodInMinutes: 5
    });

    chrome.alarms.onAlarm.addListener(function () {
        checkMail();
    });
    checkMail();
});

chrome.notifications.onClicked.addListener(function () {
    openScalixWebmail();
});