import {createServer, IncomingMessage, ServerResponse} from "http"
import {existsSync, readFileSync} from 'fs'
import {gunzip} from "zlib"

const io = require("java.io")
const InputObjectStream = io.InputObjectStream

interface Config {
    repositoryPath: string
    port: number
    pretty: boolean
}

const config = JSON.parse(readFileSync(__dirname + "/config.json").toString()) as Config

if (config.repositoryPath.endsWith('/')) {
    config.repositoryPath = config.repositoryPath.substr(0, -1)
}
if (config.repositoryPath.endsWith('.a3s')) {
    config.repositoryPath = config.repositoryPath.substr(0, -4)
}

function getFullFilePath(httpPath: string): string {
    let [fileName, directory] = httpPath.split('/').reverse()

    console.log(fileName)
    console.log(directory)
    if (directory === ".a3s" && fileName.endsWith(".json") && directory.indexOf("..") === -1) {
        return `${config.repositoryPath}/${directory}/${fileName.split('.').reverse().slice(1).reverse().join('.')}`
    }

    throw new Error(`something's off here: httpPath=${httpPath}, repositoryPath=${config.repositoryPath}`)
}

createServer({}, (req: IncomingMessage, res: ServerResponse) => {
    let filename
    try {
        filename = getFullFilePath(req.url)
    } catch (e) {
        res.writeHead(400);
        res.end(e.message);
        return;
    }
    if (!existsSync(filename)) {
        res.writeHead(404);
        res.write(`file ${filename} not found`)
        res.end();
        return;
    }
    console.info(`will try to read ${filename}`)
    const buf = readFileSync(filename);
    console.debug(`buf length: ${buf.length} for file ${filename}`)
    gunzip(buf, (err,data) => {
        const inStream = new InputObjectStream(data);
        const obj = inStream.readObject();

        res.write(JSON.stringify(obj, null, config.pretty ? "\t" : undefined))
        res.end()
    })
}).listen(config.port)

console.info(`listening on ${config.port}`)
