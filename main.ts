import {createServer, IncomingMessage, ServerResponse} from "http"
import {readFileSync} from "fs"
import {gunzip} from "zlib"

const io = require("java.io")
const InputObjectStream = io.InputObjectStream

interface Config {
    repositoryPath: string
    port: number
}

const config = JSON.parse(readFileSync(__dirname + "/config.json").toString()) as Config

if (config.repositoryPath.endsWith('/')) {
    config.repositoryPath = config.repositoryPath.substr(-1)
}
if (config.repositoryPath.endsWith('.a3s')) {
    config.repositoryPath = config.repositoryPath.substr(-4)
}

function getFullFilePath(httpPath: string): string {
    let [fileName, directory] = httpPath.split('/').reverse()
    if (directory === ".a3s") {
        return `${config.repositoryPath}/${directory}/${fileName}`
    }
    throw new Error("something's off here")
}

createServer({}, (req: IncomingMessage, res: ServerResponse) => {


    let filename = getFullFilePath(req.url)
    var buf = readFileSync(filename)
    console.debug(`buf length: ${buf.length} for file ${filename}`)
    gunzip(buf, (err,data) => {

        var inStream = new InputObjectStream(data)
         console.log(inStream)
        var obj = inStream.readObject()

        res.write(JSON.stringify(obj))
        res.end()
    })
}).listen(config.port)

console.info(`listening on ${config.port}`)
