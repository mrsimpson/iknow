'user strict';
/// <reference path="../typings/node.d.ts" />
/// <reference path="../typings/aws-sdk/aws-sdk.d.ts" />

import * as HTTP from "http";
import * as AWS from "aws-sdk";

const PORT = 8080;

var server = HTTP.createServer(handleRequest)

server.listen(PORT, () => {
	console.log("Server listening on port ", PORT);
});

function handleRequest(request: HTTP.IncomingMessage, response: HTTP.ServerResponse) {
	if (request.url.match("\/bigbrother.*")) {
		var sqsMessageProxy = new SqsMessageProxy(
			"https://sqs.eu-central-1.amazonaws.com/816870131057/iknow",
			"AKIAI4UKR5SC2IRRAQFA",
			"WttyJiNKntX68zlwk25aH/WS6xKg0oDOc+o+tY59",
			"eu-central-1"
		)

		sqsMessageProxy.recordRequest(request, response);
	}
	else{
		response.end("not found");
		response.statusCode = 404;
	}
}

/**
 * SqsMessageProxy
 */
export class SqsMessageProxy {
	/*constructor(credentialsPath: string, queueURL: string) {
		AWS.config.loadFromPath(credentialsPath);
		
		this.queueURL = queueURL;
	}*/

	protected queueURL: string;
	protected accessKeyId: string;
	protected secretAccessKey: string;
	protected region: string;
	protected sqs: AWS.SQS;

	constructor(queueURL: string, accessKeyId: string, secretAccessKey: string, region: string) {
		this.queueURL = queueURL;
		this.accessKeyId = accessKeyId;
		this.secretAccessKey = secretAccessKey;
		this.region = region;

		this.sqs = new AWS.SQS(
			{
				endpoint: this.queueURL,
				accessKeyId: this.accessKeyId,
				secretAccessKey: this.secretAccessKey,
				region: this.region
			});
	}

	private sendToQueue(message: string) {
		var params = {
			MessageBody: message, /* required */
			QueueUrl: this.queueURL, /* required */
			DelaySeconds: 0,
			/*MessageAttributes: {
				someKey: {
					DataType: 'STRING_VALUE', 
					BinaryListValues: [
						new Buffer('...') || 'STRING_VALUE',
					],
					BinaryValue: new Buffer('...') || 'STRING_VALUE',
					StringListValues: [
						'STRING_VALUE',
					],
					StringValue: 'STRING_VALUE'
				},
			}*/
		};
		this.sqs.sendMessage(params, function(err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else console.log(data);           // successful response
		});
	}

	recordRequest(request: HTTP.IncomingMessage, response: HTTP.ServerResponse) {
		switch (request.method) {
			case 'GET':
				var url = require('url');
				var url_parts = url.parse(request.url, true);
				var query = url_parts.query;
				if (query.message){
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