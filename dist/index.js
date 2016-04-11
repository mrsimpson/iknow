(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "http", "aws-sdk"], factory);
    }
})(function (require, exports) {
    'user strict';
    "use strict";
    /// <reference path="../typings/node.d.ts" />
    /// <reference path="../typings/aws-sdk/aws-sdk.d.ts" />
    const HTTP = require("http");
    const AWS = require("aws-sdk");
    const PORT = 8080;
    var server = HTTP.createServer(handleRequest);
    server.listen(PORT, () => {
        console.log("Server listening on port ", PORT);
    });
    function handleRequest(request, response) {
        if (request.url.match("\/bigbrother.*")) {
            var sqsMessageProxy = new SqsMessageProxy("https://sqs.eu-central-1.amazonaws.com/816870131057/iknow", "AKIAI4UKR5SC2IRRAQFA", "WttyJiNKntX68zlwk25aH/WS6xKg0oDOc+o+tY59", "eu-central-1");
            sqsMessageProxy.recordRequest(request, response);
        }
        else {
            response.end("not found");
            response.statusCode = 404;
        }
    }
    /**
     * SqsMessageProxy
     */
    class SqsMessageProxy {
        constructor(queueURL, accessKeyId, secretAccessKey, region) {
            this.queueURL = queueURL;
            this.accessKeyId = accessKeyId;
            this.secretAccessKey = secretAccessKey;
            this.region = region;
            this.sqs = new AWS.SQS({
                endpoint: this.queueURL,
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
                region: this.region
            });
        }
        sendToQueue(message) {
            var params = {
                MessageBody: message,
                QueueUrl: this.queueURL,
                DelaySeconds: 0,
            };
            this.sqs.sendMessage(params, function (err, data) {
                if (err)
                    console.log(err, err.stack); // an error occurred
                else
                    console.log(data); // successful response
            });
        }
        recordRequest(request, response) {
            switch (request.method) {
                case 'GET':
                    var url = require('url');
                    var url_parts = url.parse(request.url, true);
                    var query = url_parts.query;
                    if (query.message) {
                        this.sendToQueue(query.message);
                        response.end("I've got you");
                    }
                    else
                        response.end("provide a message as url-parameter in GET (?message=...)");
                    break;
                default:
                    break;
            }
        }
    }
    exports.SqsMessageProxy = SqsMessageProxy;
});
//# sourceMappingURL=index.js.map