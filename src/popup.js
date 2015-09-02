document.querySelector('#settings').addEventListener("click", function () {

    if (chrome.runtime.openOptionsPage) {
        // New way to open options pages, if supported (Chrome 42+).
        chrome.runtime.openOptionsPage();
    } else {
        // Reasonable fallback.
        window.open(chrome.runtime.getURL('options.html'));
    }
});

document.querySelector('#open_webmail').addEventListener("click", function () {
    getSettings(function (settings) {
        if (settings.serverName) {
            openScalixWebmail(settings);
        } else {
            document.querySelector('#settings').dispatchEvent(new Event('click'));
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('total_new_messages').textContent = chrome.extension.getBackgroundPage().newMsgsTotalText;
    chrome.alarms.get("scalixCheckMail", function (alarm) {
        document.getElementById("update_interval").textContent = alarm.periodInMinutes;
        if (alarm.scheduledTime) {
            var date = new Date(alarm.scheduledTime);
            document.getElementById("next_update_at").textContent = "Next request \
                for updates will be sent  " + date.toLocaleTimeString();
        }
    })
});


