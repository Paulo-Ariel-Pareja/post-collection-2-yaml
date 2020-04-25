const postToYaml = require('post-collection-to-yaml');
const path = require('path');

const fileIn = 'prueba.postman_collection.json';
const fileOut = 'save.yaml';

const run = async () => {
    const options = {
        url: 'localhost:3030',
        description: 'otra cosa',
        title: 'titulo de prueba',
        version: '10.0.0',
        descriptionInfo: 'Otra descripcion',
        email: 'adndevelopersoftware@gmail.com'
    }
    const stringInput = path.join(__dirname, fileIn);
    const stringOutput = path.join(__dirname, fileOut);
    await postToYaml.convert(stringInput, stringOutput, options);
}

run();