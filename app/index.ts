'user strict';
/// <reference path="../typings/node.d.ts" />
/// <reference path="../typings/aws-sdk/aws-sdk.d.ts" />

import * as HTTP from "http";
import * as AWS from "aws-sdk";


/**
 * SqsMessageProxy
 */
class SqsMessageProxy {
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

	private sendToQueue(message: string, successCallback: Function) {
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
			if (err) 
			console.log(err, err.stack); // an error occurred
			else 
			successCallback(data);           // successful response
		});
	}
	
	private onSuccess(result: AWS.SQS.SendMessageResult): void{
		console.log(result);
	}
	
	private createSuccessText(): String{
		return "I am listening..."
	}
	
	public recordRequest(request: HTTP.IncomingMessage, response: HTTP.ServerResponse):void {
		switch (request.method) {
			case 'GET':
				var url = require('url');
				var url_parts = url.parse(request.url, true);
				var query = url_parts.query;
				if (query.message){
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
	
	public popMessage(response: HTTP.ServerResponse):void{
		var params: AWS.SQS.ReceiveMessageParams = {
			QueueUrl: this.queueURL,
			MaxNumberOfMessages: 10,
			VisibilityTimeout: 1
		};
		
		this.sqs.receiveMessage(params, (err, data) =>{
			if(err){
				console.log(err);
				response.end("Could not receive messages");
			}
			else if(data.Messages){
				var messageString: String;
				messageString = "";
				for (let index = 0; index < data.Messages.length; index++) {
					var message = data.Messages[index];
					messageString += message.Body + "\n";
					this.sqs.deleteMessage({
						QueueUrl: this.queueURL,
						ReceiptHandle: message.ReceiptHandle
					}, (err, data)=>{
						if(err) console.log(err);
					})
				}
				response.end(messageString);
			}
			else
				response.end("no messages found");
		})
	}
}

// START-OF-SELECTION

const PORT = 8080;

var server = HTTP.createServer(handleRequest)
var sqsMessageProxy: SqsMessageProxy;
sqsMessageProxy = new SqsMessageProxy(
			"https://sqs.eu-central-1.amazonaws.com/816870131057/iknow",
			"AKIAI4UKR5SC2IRRAQFA",
			"WttyJiNKntX68zlwk25aH/WS6xKg0oDOc+o+tY59",
			"eu-central-1"
		);

server.listen(PORT, () => {
	console.log("Server listening on port ", PORT);
});

function handleRequest(request: HTTP.IncomingMessage, response: HTTP.ServerResponse) {
	if (request.url.match("\/bigbrother/post.*")) {
		sqsMessageProxy.recordRequest(request, response);
	}
	else if (request.url.match("\/bigbrother/receive.*")) {
		sqsMessageProxy.popMessage(response);
	}
	else
	{
		response.end("not found");
		response.statusCode = 404;
	}
}