# How to use

### Install dependency

```
npm i post-collection-2-yaml
```
### Import and use

```
const postToYaml = require('post-2-yaml');

const stringInput = 'path/to/post-collection.json';
const stringOutput = 'path/to/save.yaml';

await postToYaml.convert(stringInput, stringOutput);

```
### Params
Recive 2 params: a string of path and file from Postman Collection and a string of output, place to save you swagger file. Can create your report when lifting your service.

### Personalize some params (Optional)
```
const postToYaml = require('post-2-yaml');

const stringInput = 'path/to/post-collection.json';
const stringOutput = 'path/to/save.yaml';

const options = {
    url = 'localhost:8080',
    description = 'An description',
    title = 'Post-collection-2-yaml',
    version = '1.0.0',
    descriptionInfo = 'Some description',
    email = 'adndevelopersoftware@gmail.com'
}
await postToYaml.convert(stringInput, stringOutput, options);

```
### Credits
By Paulo Ariel Pareja