let http = require('http');

http.createServer((req, res) => {
  console.log(`New incomming request at: ${req.url}`);

  for(let header in req.headers) {
    res.setHeader(header, req.headers[header]);
  }

  req.pipe(res);
}).listen(8080);
