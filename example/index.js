const postToYaml = require('post-collection-to-yaml');
const path = require('path');

const fileIn = 'YOUR-POSTMAN-COLLECTION.json';
const fileOut = 'save.yaml';

const run = async () => {
  const options = {
    url: 'localhost:3030',
    description: 'server description',
    title: 'titulo de prueba',
    version: '1.2.3',
    descriptionInfo: 'service description',
    email: 'my.awesome.email@mail.com'
  }
/*   const options = {
    title: 'titulo de prueba',
    version: '1.2.3',
    descriptionInfo: 'service description',
    email: 'my.awesome.email@mail.com',
     server: [{
      url: 'localhost:3030',
      description: 'server local'
    }, {
      url: 'localhost:3031',
      description: 'server produccion'
    }
    ]
  } */
  // put your server array or you unique url and only one description
  const stringInput = path.join(__dirname, fileIn);
  const stringOutput = path.join(__dirname, fileOut);
  await postToYaml.convert(stringInput, stringOutput, options);
}

run();
