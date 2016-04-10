'user strict';
/// <reference path="../typings/node.d.ts" />

import * as HTTP from "http";

const PORT = 8080;

var server = HTTP.createServer(handleRequest)

server.listen(PORT, () => {
    console.log("Server listening on port ", PORT);
});

function handleRequest(request: HTTP.IncomingMessage, response  : HTTP.ServerResponse) {
    switch (request.url) {
        case "/bigbrother":
            recordRequest(request, response);
        default:
            response.end("not found");
            response.statusCode = 404;
    }
}

function recordRequest(request: HTTP.IncomingMessage, response  : HTTP.ServerResponse) {
    response.end( "Gotcha" );
    console.log(request);
}