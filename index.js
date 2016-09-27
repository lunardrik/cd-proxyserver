let https = require('https');
let http = require('http');
let path = require('path');
let fs = require('fs');
let request = require('request');
let options = require('./options.json');
let argv = require('yargs')
    .usage('Usage: node $0 [options]')
    .example('node $0 -p 80 -x google.com')
    .alias('p', 'port')
    .nargs('p', 1)
    .describe('p', 'Specify a forwarding port')
    .alias('x', 'host')
    .nargs('x', 1)
    .describe('x', 'Specify a forwarding host')
    .alias('s', 'port-ssl')
    .nargs('s', 1)
    .describe('s', 'Specify a SSL forwarding port')
    .alias('u', 'host-ssl')
    .nargs('u', 1)
    .describe('u', 'Specify a SSL forwarding host')
    .default('x', '127.0.0.1')
    .default('u', '127.0.0.1')
//    .alias('e', 'exec')
//    .nargs('e', 1)
//    .describe('e', 'Specify a process to proxy instead')
    .alias('l', 'log')
    .nargs('l', 1)
    .describe('l', 'Specify a output log file')
    .help('h')
    .alias('h', 'help')
    .epilog('Copyright (c) 2016')
    .argv;
let ssl_options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

let scheme = 'http://';
let ssl_scheme = 'https://';
let port = argv.port || (argv.host === '127.0.0.1' ? 8080 : 80);
let ssl_port = argv["port-ssl"] || (argv["host-ssl"] === '127.0.0.1' ? 8443 : 443);

let logPath = argv.log && path.join(__dirname, argv.log);
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout;

let destinationUrl = argv.url || scheme  + argv.host + ':' + port;
let destinationSSLUrl = argv.url || ssl_scheme  + argv["host-ssl"] + ':' + ssl_port;
let proxy_port = 8081;
let proxy_ssl_port = 8444;

let logLevels = {
    "OFF": 0,
    "FATAL": 1,
    "ERROR": 2,
    "WARN": 3,
    "INFO": 4,
    "DEBUG": 5,
    "ALL": 6
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let log = (level, msg) => {
    if (logLevels[level] <= logLevels[options.logLevel]) {
        if (typeof msg === 'string') {
            logStream.write(msg);
        } else if (typeof msg.pipe === 'function') {
            msg.pipe(logStream, {end: false});
        }
    }
}

http.createServer((req, res) => {
    log("INFO", `[SRVER] New incoming request at: ${req.url}\n`);

    for(let header in req.headers) {
      res.setHeader(header, req.headers[header]);
    }

    log("DEBUG", JSON.stringify(req.headers)+'\n');
    log("DEBUG", req);
    req.pipe(res);
}).listen(port, function() {
    log("INFO", `Server listening on port ${port}\n`);
});

https.createServer(ssl_options, (req, res) => {
    log("INFO", `[SRVER] New incoming SSL request at: ${req.url}\n`);

    for(let header in req.headers) {
      res.setHeader(header, req.headers[header]);
    }

    log("DEBUG", JSON.stringify(req.headers)+'\n');
    log("DEBUG", req);
    req.pipe(res);
}).listen(ssl_port, function() {
    log("INFO", `SSL Server listening on port ${ssl_port}\n`);
});

http.createServer((req, res) => {
    let outgoing_destination = req.headers['x-destination-url'] || destinationUrl;
    log("INFO", `[PROXY] Proxying incoming request to: ${outgoing_destination}${req.url}\n`);
    let options = {
        method: req.method,
        headers: req.headers,
        url: `${outgoing_destination}${req.url}`
    };

    let downstreamResponse = req.pipe(request(options));
    log("DEBUG", JSON.stringify(downstreamResponse.headers)+'\n');
    log("DEBUG", downstreamResponse);
    downstreamResponse.pipe(res);
}).listen(proxy_port, function() {
    log("INFO", `Proxy listening on port ${proxy_port}\n`);
});

https.createServer(ssl_options, (req, res) => {
    let outgoing_destination = req.headers['x-destination-url'] || destinationSSLUrl;
    log("INFO", `[PROXY] Proxying incoming SSL request to: ${outgoing_destination}${req.url}\n`);
    let options = {
        method: req.method,
        headers: req.headers,
        url: `${outgoing_destination}${req.url}`
    };

    let downstreamResponse = req.pipe(request(options));
    log("DEBUG", JSON.stringify(downstreamResponse.headers)+'\n');
    log("DEBUG", downstreamResponse);
    downstreamResponse.pipe(res);
}).listen(proxy_ssl_port, function() {
    log("INFO", `SSL Proxy listening on port ${proxy_ssl_port}\n`);
});
