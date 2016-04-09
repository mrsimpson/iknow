var http = require('http');
const PORT = 8080;


function handleRequest(request, response) {
    console.log(request);
}

var server = http.createServer(handleRequest)

server.listen(PORT, () => {
    console.log("Server listening on port ", PORT);
});