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
    getSettings(function (items) {
        if (items.serverName) {
            window.open(getServerUrl(items.serverName, items.useHTPPS) + '/webmail', '_blank');
        } else {
            document.querySelector('#settings').dispatchEvent(new Event('click'));
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('total_new_messages').textContent = chrome.extension.getBackgroundPage().newMsgsTotalText;
});
