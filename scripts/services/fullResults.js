const Http = require("sf-core/net/http");
var http = new Http();
var reSplit = /.{1,100000}/g;
var guid = require("../lib/guid");

exports.create = create;

function create(record, callback) {
    reSplit.lastIndex = 0;
    var data = JSON.parse(JSON.stringify(record));
    
    for(var i in data.fullResult) {
        delete data.fullResult[i].script;
    }
    
    data.failures = data.fullResult.filter(function(test) {
        return !test.result;
    });
    
    data.failures = JSON.stringify(data.failures);
    data.fullResult = JSON.stringify(data.fullResult);
    if (!data.testID)
        data.testID = guid();

    var parts = data.fullResult.match(reSplit);
    reSplit.lastIndex = 0;
    var failParts = data.failures.match(reSplit);
    console.log("Number of parts = " + parts.length);
    var partIndex = 0;

    next();

    function next(err, response) {
        if (err) {
            callback && callback(err);
            return;
        }
        var part = parts.shift();
        var final = parts.length === 0;
        var requestData = {
            fields: {
                fullResult: part,
                OS: data.OS,
                successRate: data.successRate,
                failures: failParts.shift(),
                fullResultPart: partIndex++,
                final: final,
                testID: data.testID
            }
        };
        if (!final)
            makeRequest(requestData, next);
        else {
            makeRequest(requestData, callback);
        }
    }



}


function makeRequest(data, next) {
    http.request({
        'url': 'https://api.airtable.com/v0/appMU10XmNVlBi6dD/fullResult',
        'headers': {
            "Authorization": "Bearer key3NgimFX2rFVr8k",
            "Content-type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify(data),
        onLoad: function(response) {
            bodyParser(response);
            next && next(null, response);

        },
        onError: function(err) {
            bodyParser(err);
            next && next(err);
        }
    });
}


function bodyParser(response) {
    const contentType = (response.headers && getContentType(response.headers)) || "";
    switch (true) {
        case !contentType.startsWith("image"):
            response.body = response.body.toString();

        case contentType === "application/json":
            try {
                response.body = JSON.parse(response.body);
                console.log("Response body = " + JSON.stringify(response.body, null, "\t"));
            }
            catch (ex) {
                console.log("Response is not a  JSON\nResponse Body = " + response.body);
            }
            break;
    }
}

function getContentType(headers) {
    headers = headers || {};
    var contentType = headers["Content-Type"];
    if (!contentType) {
        for (var h in headers) {
            if (h.toLowerCase() === "content-type") {
                contentType = headers[h];
                break;
            }
        }
    }
    return contentType;
}
