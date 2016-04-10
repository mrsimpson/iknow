(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "http"], factory);
    }
})(function (require, exports) {
    'user strict';
    "use strict";
    /// <reference path="../typings/node.d.ts" />
    const HTTP = require("http");
    const PORT = 8080;
    var server = HTTP.createServer(handleRequest);
    server.listen(PORT, () => {
        console.log("Server listening on port ", PORT);
    });
    function handleRequest(request, response) {
        switch (request.url) {
            case "/bigbrother":
                recordRequest(request, response);
            default:
                response.end("not found");
                response.statusCode = 404;
        }
    }
    function recordRequest(request, response) {
        response.end("Gotcha");
    }
});
//# sourceMappingURL=index.js.map