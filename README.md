**Arma3Sync** has the nasty limitation of writing the repository config files in Java's binary object serialization format, and gzipped for good measure. Yikes.
If you'd like to be able to serve **repository configs in human-readable form**, this small project is for you.  

# the short of it

* configure nginx to proxy all requests for `$repository/.a3s/*.json` files via `$port`
* copy config.example.json to config.json , adjust repositoryPath to match `$repository` and port to `$port`
* npm install
* compile typescript
* node main.js
* yay
