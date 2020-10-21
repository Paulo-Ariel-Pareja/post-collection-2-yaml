const job = require('./app/converter');

const convert = async (input, output, options) => {
  job.converter(input, output, options)
}

module.exports = {
  convert
};
