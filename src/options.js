// Saves options to chrome.storage

function geServerName() {
    return document.getElementById('server').value || '';
}

function getUserName() {
    return document.getElementById('username').value || '';
}

function getUseHttps() {
    return document.getElementById('usehttps').checked;
}

function getUserPassword() {
    return document.getElementById('password').value || '';
}

function showError(msg) {
    document.getElementById('error').textContent = msg;
}

function clearErrors() {
    showError('');
}

function initFolders(folders) {
    clearErrors();
    var success = function (xmlDoc) {
        var serverFolders = xmlDoc.getElementsByTagName("folder");
        if (!serverFolders)
            showError("Could not parse response");
        var foldersHTML = '';
        for (var i = 0; i < serverFolders.length; i++) {
            var folder = serverFolders[i];
            var checked = '';
            if (folders.indexOf(folder.getAttribute('name')) !== -1) {
                checked = 'checked="checked"'
            }
            foldersHTML += '<li><label>\
                    <input type="checkbox" name="checkFolders[]" \
                    value="' + folder.getAttribute('name') + '" '
                + checked + '>' + folder.getAttribute('name')
                + '</label></li>';
        }
        var folderListElem = document.getElementById('folderList');
        folderListElem.innerHTML = '';
        folderListElem.innerHTML = foldersHTML;
    };
    fetchData(
        getScalixApiUrl(geServerName(), getUserName(), '/mailbox?output=xml', getUseHttps()),
        getUserName(),
        getUserPassword(),
        success,
        showError
    );

}


function save_options() {
    var serverName = geServerName();
    var userName = getUserName();
    var userPassword = getUserPassword();
    var useHTPPS = getUseHttps();
    var checkFolders = [];
    var folders = document.getElementsByName('checkFolders[]') || [];
    for (var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        if (folder.checked) {
            checkFolders.push(folder.value);
        }
    }

    chrome.storage.sync.set({
        serverName: serverName,
        userName: userName,
        userPassword: userPassword,
        useHTPPS: useHTPPS,
        checkFolders: checkFolders
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    clearErrors();
    // Use default value color = 'red' and likesColor = true.
    getSettings(function (items) {
        var serverName = document.getElementById('server');
        document.getElementById('server').value = items.serverName;
        document.getElementById('username').value = items.userName;
        document.getElementById('password').value = items.userPassword;
        document.getElementById('usehttps').checked = items.useHTPPS;
        initFolders(items.checkFolders);
        serverName.dispatchEvent(new Event('input'));
    });

}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('update_folder_list').addEventListener('click', function () {
    getSettings(function (items) {
        initFolders(items.checkFolders);
    });
});


function showUrl() {
    document.getElementById('url').textContent = getScalixApiUrl(geServerName(), getUserName(), '', getUseHttps());
}


Array.prototype.slice.call(document.querySelectorAll('#server, #username')).forEach(function (elem) {
    elem.addEventListener('input', showUrl);
});

document.getElementById('usehttps').addEventListener('change', showUrl);
