const job = require('./converter');

const convert = async (input, output) => {
    job.converter(input, output)
}

module.exports = {
    convert
};