"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var fs_1 = require("fs");
var zlib_1 = require("zlib");
var io = require("java.io");
var InputObjectStream = io.InputObjectStream;
var config = JSON.parse(fs_1.readFileSync(__dirname + "/config.json").toString());
if (config.repositoryPath.endsWith('/')) {
    config.repositoryPath = config.repositoryPath.substr(0, -1);
}
if (config.repositoryPath.endsWith('.a3s')) {
    config.repositoryPath = config.repositoryPath.substr(0, -4);
}
function getFullFilePath(httpPath) {
    var _a = httpPath.split('/').reverse(), fileName = _a[0], directory = _a[1];
    console.log(fileName);
    console.log(directory);
    if (directory === ".a3s" && fileName.endsWith(".json") && directory.indexOf("..") === -1) {
        return config.repositoryPath + "/" + directory + "/" + fileName.split('.').reverse().slice(1).reverse().join('.');
    }
    throw new Error("something's off here: httpPath=" + httpPath + ", repositoryPath=" + config.repositoryPath);
}
http_1.createServer({}, function (req, res) {
    var filename;
    try {
        filename = getFullFilePath(req.url);
    }
    catch (e) {
        res.writeHead(400);
        res.end(e.message);
        return;
    }
    if (!fs_1.existsSync(filename)) {
        res.writeHead(404);
        res.write("file " + filename + " not found");
        res.end();
        return;
    }
    console.info("will try to read " + filename);
    var buf = fs_1.readFileSync(filename);
    console.debug("buf length: " + buf.length + " for file " + filename);
    zlib_1.gunzip(buf, function (err, data) {
        var inStream = new InputObjectStream(data);
        var obj = inStream.readObject();
        var replacer = function (k, v) {
            if (k === 'parent') {
                return undefined;
            }
            return v;
        };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(obj, replacer, config.pretty ? "\t" : undefined));
        res.end();
    });
}).listen(config.port);
console.info("listening on " + config.port);
