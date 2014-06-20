exports.stringifyIfObject = function (val) {
    return typeof val === 'object' ? JSON.stringify(val) : val;
};

exports.formRequestPayload = function (req, data) {
    if (data.files) {
        var formData = new FormData();

        addMultiformData(formData, data);
        addFiles(formData, data.files);

        return formData;
    }

    req.setRequestHeader('Content-type','application/json; charset=utf-8');
    return JSON.stringify(data);
};

exports.parseIfJSON = function (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
};

exports.compileRoute = function (route, params) {
    return route.replace(/(:[a-zA-Z-_]{1,})/g, function () {
        return params[arguments[0].substr(1)];
    });
};

function addMultiformData (formData, data) {
    var key, arr, i;

    for (key in data) {
        if (data.hasOwnProperty(key) && key !== 'files') {
            if (data[key] instanceof Array) {
                arr = data[key];

                for (i = 0; i < arr.length; i += 1) {
                    formData.append(key + '[' + i + ']', exports.stringifyIfObject(arr[i]));
                }
            } else {
                formData.append(key, exports.stringifyIfObject(data[key]));
            }
        }
    }
}

function addFiles (formData, files) {
    var file, arr, key, i;

    for (key in files) {
        if (files.hasOwnProperty(key)) {

            if (files[key] instanceof Array) {
                arr = files[key];

                for (i = 0; i < arr.length; i += 1) {
                    formData.append(key + '[' + i + ']', arr[i]);
                }
            } else {
                file = files[key];
                formData.append(key, file);
            }
        }
    }
}