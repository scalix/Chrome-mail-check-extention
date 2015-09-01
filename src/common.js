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


function getMailBoxUrls(settings) {
    return settings.checkFolders.map(function (item) {
        return getScalixApiUrl(
            settings.serverName,
            settings.userName,
            '/mailbox/' + item + '?output=xml&flags=unread',
            settings.useHTPPS
        );
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
    xhr.addEventListener("load", function (evt) {
        if (xhr.status == 200) {
            var xmlDoc = xhr.responseXML;
            if (!xmlDoc)
                showError("Could not parse response");
            onSuccess(xmlDoc);
        } else {
            showError("Erorr ocured while fetching folder list");
        }
    }, false);
    xhr.addEventListener("error", function (evt) {
        showError("Erorr ocured while fetching folder list");
    }, false);
    xhr.addEventListener("abort", function (evt) {
        showError("Request was aborted");
    }, false);
    xhr.send();
}