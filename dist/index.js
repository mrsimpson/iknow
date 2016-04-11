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
        sendToQueue(message, successCallback) {
            var params = {
                MessageBody: message,
                QueueUrl: this.queueURL,
                DelaySeconds: 0,
            };
            this.sqs.sendMessage(params, function (err, data) {
                if (err)
                    console.log(err, err.stack); // an error occurred
                else
                    successCallback(data); // successful response
            });
        }
        onSuccess(result) {
            console.log(result);
        }
        createSuccessText() {
            return "I am listening...";
        }
        recordRequest(request, response) {
            switch (request.method) {
                case 'GET':
                    var url = require('url');
                    var url_parts = url.parse(request.url, true);
                    var query = url_parts.query;
                    if (query.message) {
                        this.sendToQueue(query.message, this.onSuccess);
                        response.end(this.createSuccessText()); //todo: figure out how to move this to onSuccess - it's asynnchronous!
                    }
                    else
                        response.end("provide a message as url-parameter in GET (?message=...)");
                    break;
                case 'POST':
                    //todo: Test Post - only guessed
                    request.on('data', (data) => {
                        this.sendToQueue(data, this.onSuccess);
                        response.end(this.createSuccessText());
                    });
                default:
                    break;
            }
        }
        popMessage(response) {
            var params = {
                QueueUrl: this.queueURL,
                MaxNumberOfMessages: 10,
                VisibilityTimeout: 1
            };
            this.sqs.receiveMessage(params, (err, data) => {
                if (err) {
                    console.log(err);
                    response.end("Could not receive messages");
                }
                else if (data.Messages) {
                    var messageString;
                    messageString = "";
                    for (let index = 0; index < data.Messages.length; index++) {
                        var message = data.Messages[index];
                        messageString += message.Body + "\n";
                        this.sqs.deleteMessage({
                            QueueUrl: this.queueURL,
                            ReceiptHandle: message.ReceiptHandle
                        }, (err, data) => {
                            if (err)
                                console.log(err);
                        });
                    }
                    response.end(messageString);
                }
                else
                    response.end("no messages found");
            });
        }
    }
    // START-OF-SELECTION
    const PORT = 8080;
    var server = HTTP.createServer(handleRequest);
    var sqsMessageProxy;
    sqsMessageProxy = new SqsMessageProxy("https://sqs.eu-central-1.amazonaws.com/816870131057/iknow", "AKIAI4UKR5SC2IRRAQFA", "WttyJiNKntX68zlwk25aH/WS6xKg0oDOc+o+tY59", "eu-central-1");
    server.listen(PORT, () => {
        console.log("Server listening on port ", PORT);
    });
    function handleRequest(request, response) {
        if (request.url.match("\/bigbrother/post.*")) {
            sqsMessageProxy.recordRequest(request, response);
        }
        else if (request.url.match("\/bigbrother/receive.*")) {
            sqsMessageProxy.popMessage(response);
        }
        else {
            response.end("not found");
            response.statusCode = 404;
        }
    }
});
//# sourceMappingURL=index.js.map