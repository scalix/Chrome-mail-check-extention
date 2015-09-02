function getServerUrl(server, secure) {
    var protocol = 'http';
    if (secure) {
        protocol += 's';
    }
    return protocol + '://' + server;
}

function getScalixApiUrl(server, userName, path, secure) {
    return getServerUrl(server, secure) + '/api/' + userName + path;
}

function getWebmailUrl(settings) {
    return getServerUrl(settings.serverName, settings.useHTPPS) + '/webmail';
}

function openScalixWebmail(settings) {

    var func = function (settings) {
        window.open(getWebmailUrl(settings), '_blank');
    };

    if (settings)
        return func(settings);
    getSettings(func);
}

function getMailBoxUrl(settings, mailbox) {
    return getScalixApiUrl(
        settings.serverName,
        settings.userName,
        '/mailbox/' + mailbox + '?output=xml&flags=unread',
        settings.useHTPPS
    );
}

function getMailBoxUrls(settings) {
    return settings.checkFolders.map(function (item) {
        return getMailBoxUrl(settings, item)
    });
}

function getSettings(callback) {
    chrome.storage.sync.get({
            serverName: '',
            userName: '',
            userPassword: '',
            useHTPPS: true,
            checkFolders: []
        },
        callback
    );
}

function fetchData(url, userName, password, onSuccess, showError) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(userName + ':' + password));
    xhr.withCredentials = true;
    xhr.addEventListener("load", function () {
        if (xhr.status == 200) {
            var xmlDoc = xhr.responseXML;
            if (!xmlDoc)
                showError("Could not parse response");
            onSuccess(xmlDoc);
        } else {
            showError("Error occurred while fetching data.\nStatus: " + xhr.statusText);
        }
    }, false);
    xhr.addEventListener("error", function () {
        showError("Error occurred while  fetching data.\nStatus:  " + xhr.statusText);
    }, false);
    xhr.addEventListener("abort", function () {
        showError("Request was aborted.\n Status:" + xhr.statusText);
    }, false);
    xhr.send();
}

function htmlDecode(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}