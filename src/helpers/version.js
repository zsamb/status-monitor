const check = (callback) => {
    //TODO: Check for version updates here and return latest
    let latest = "0.1.0";
    callback(null, latest);
}

module.exports.check = check;