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
        chrome.notifications.create(
            'sxNotId' + notID++,  // icon url - can be relative
            {
                type: 'basic',
                title: 'New mail',
                iconUrl: 'icon.png',
                message: text
            }
        );
    }
    newMsgsTotalText = text;
}

function checkMail() {

    newMsgsTotal = 0;
    newMsgsTotalText = 'Checking ...';
    getSettings(function (settings) {
        getMailBoxUrls(settings).forEach(function (url) {
            fetchData(url, settings.userName, settings.userPassword, function (xmlDoc) {
                newMsgsTotal += xmlDoc.getElementsByTagName("item").length;
                updateInfo();
            }, showError);
        });
    });
}
document.addEventListener('DOMContentLoaded', function () {

    chrome.alarms.create("scalixCheckMail", {
        delayInMinutes: 1,
        periodInMinutes: 1
    });
    chrome.alarms.onAlarm.addListener(function (alarm) {
        checkMail();
    });

});
