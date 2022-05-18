const sources = {
    ping: require("./ping")
}

module.exports = (name) => {
    let source = sources[name];
    if (source) { return source }
    else { return undefined }
}