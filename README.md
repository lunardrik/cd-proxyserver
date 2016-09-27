# CoderSchool Proxy Server

This is a Proxy Server for Node.js submitted as the [pre-work](http://courses.codepath.com/snippets/intro_to_nodejs/prework) requirement for CodePath.

Time spent: 6.0

Completed:

* [x] Required: Requests to port `8080` are echoed back with the same HTTP headers and body
* [x] Required: Requests/reponses are proxied to/from the destination server
* [x] Required: The destination server is configurable via the `--host`, `--port`  or `--url` arguments
* [x] Required: The destination server is configurable via the `x-destination-url` header
* [x] Required: Client requests and respones are printed to stdout
* [x] Required: The `--logfile` argument outputs all logs to the file specified instead of stdout
* [ ] Optional: The `--exec` argument proxies stdin/stdout to/from the destination program
* [x] Optional: The `--loglevel` argument sets the logging chattiness
* [x] Optional: Supports HTTPS
* [x] Optional: `-h` argument prints CLI API

Walkthrough Gif:

![Video Walkthrough](walkthrough.gif)

## Starting the Server

```bash
npm start
```

## Features

### Echo Server:

```bash
curl -v -X POST http://127.0.0.1:8080 -d "hello self" -H "x-asdf: yodawg"
* Rebuilt URL to: http://127.0.0.1:8080/
*   Trying 127.0.0.1...
* Connected to 127.0.0.1 (127.0.0.1) port 8080 (#0)
> POST / HTTP/1.1
> Host: 127.0.0.1:8080
> User-Agent: curl/7.43.0
> Accept: */*
> x-asdf: yodawg
> Content-Length: 10
> Content-Type: application/x-www-form-urlencoded
>
* upload completely sent off: 10 out of 10 bytes
< HTTP/1.1 200 OK
< host: 127.0.0.1:8080
< user-agent: curl/7.43.0
< accept: */*
< x-asdf: yodawg
< content-length: 10
< content-type: application/x-www-form-urlencoded
< Date: Tue, 27 Sep 2016 12:59:11 GMT
< Connection: keep-alive
<
* Connection #0 to host 127.0.0.1 left intact
hello self
```

### Proxy Server:

Port 8081 will proxy to the echo server on port 8000.

```bash
curl -v http://127.0.0.1:8081/asdf -d "hello proxy"
*   Trying 127.0.0.1...
* Connected to 127.0.0.1 (127.0.0.1) port 8081 (#0)
> POST /asdf HTTP/1.1
> Host: 127.0.0.1:8081
> User-Agent: curl/7.43.0
> Accept: */*
> Content-Length: 11
> Content-Type: application/x-www-form-urlencoded
>
* upload completely sent off: 11 out of 11 bytes
< HTTP/1.1 200 OK
< host: 127.0.0.1:8081
< user-agent: curl/7.43.0
< accept: */*
< content-length: 11
< content-type: application/x-www-form-urlencoded
< connection: close
< date: Tue, 27 Sep 2016 13:24:29 GMT
<
* Closing connection 0
hello proxy
```

### Configuration:

#### CLI Arguments:

The following CLI arguments are supported:

##### `--host`

The host of the destination server. Defaults to `127.0.0.1`.

##### `--port`

The port of the destination server. Defaults to `80` or `8080` when a host is not specified.

##### `--url`

A single url that overrides the above. E.g., `https://www.amazon.com`

##### `--logfile`

Specify a file path to redirect logging to.

#### Headers

The follow http header(s) are supported:

##### `x-destination-url`

Specify the destination url on a per request basis. Overrides and follows the same format as the `--url` argument.
