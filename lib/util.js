// If given value is an object return as stringified JSON

exports.stringifyIfObject = function (val) {
    return typeof val === 'object' ? JSON.stringify(val) : val;
};

// Creates payload of request (Transforms into multipart form data if a
// `files` field is present in the `data` object)

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

// If given string represent a JSON object, parses it, otherwise returns the
// original string

exports.parseIfJSON = function (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
};

// Builds the final URL from a dynamic route given an object containing the
// route `params`

exports.compileRoute = function (route, params) {
    return route.replace(/(:[a-zA-Z-_]{1,})/g, function () {
        return params[arguments[0].substr(1)];
    });
};

// Helper used by `formRequestPayload` to append data to FormData instance

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

// Helper used by `formRequestPayload` to append files to a FormData instance

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