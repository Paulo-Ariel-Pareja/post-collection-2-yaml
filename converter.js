const yaml = require('js-yaml');
const fs = require('fs');

module.exports.converter = async (input, output, options = {}) => {
    const postmanRaw = require(input);
    const pathsOfPostman = postmanRaw.item;
    const paths = {}

    pathsOfPostman.forEach(element => {
        const originalItem = element;
        const originalMethod = originalItem.request.method.toLowerCase();
        const summary = originalItem.name;
        console.log(`INI ${originalMethod} - ${summary}`);

        let pathOriginal = '';
        originalItem.request.url.path.forEach(value => {
            pathOriginal = `${pathOriginal}/${value}`
        })

        if (!paths[pathOriginal]) paths[pathOriginal] = {}
        paths[pathOriginal][originalMethod] = {}
        paths[pathOriginal][originalMethod]['summary'] = summary

        let parameters = [];
        try {
            //body
            if (originalItem.request.body && originalMethod !== 'get' && originalMethod !== 'delete') {
                if (originalItem.request.body.raw || originalItem.request.body.raw === '') {
                    let example = originalItem.request.body.raw;
                    let type = 'object'
                    example = JSON.parse(example)

                    let object = {
                        content: {
                            'application/json': {
                                schema: {
                                    type,
                                    example
                                }
                            }
                        }
                    }
                    paths[pathOriginal][originalMethod]['requestBody'] = object
                } else if (originalItem.request.body.formdata) {
                    let proper = {};
                    for (let i = 0; i < originalItem.request.body.formdata.length; i++) {
                        const data = {
                            type: 'string',
                            example: originalItem.request.body.formdata[i].value
                        }
                        proper[originalItem.request.body.formdata[i].key] = data
                    }
                    let requestBody = {
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: proper
                                }
                            }
                        }
                    }
                    paths[pathOriginal][originalMethod]['requestBody'] = requestBody
                } else if (originalItem.request.body.urlencoded) {
                    let proper = {};
                    for (let i = 0; i < originalItem.request.body.urlencoded.length; i++) {
                        const data = {
                            type: 'string',
                            example: originalItem.request.body.urlencoded[i].value
                        }
                        proper[originalItem.request.body.urlencoded[i].key] = data
                    }
                    let requestBody = {
                        content: {
                            'application/x-www-form-urlencoded': {
                                schema: {
                                    type: 'object',
                                    properties: proper
                                }
                            }
                        }
                    }
                    paths[pathOriginal][originalMethod]['requestBody'] = requestBody
                } else {
                    console.log('TIPO DE DATO EN BODY NO SOPORTADO!!!');
                }
            }
        } catch (error) {
            console.log('**************');
            console.log(error.message);
            console.log('**************');
        }

        //parametros de authorization
        try {
            if (originalItem.request.auth) {
                let object = {}
                object[originalItem.request.auth.type] = [];
                paths[pathOriginal][originalMethod]['security'] = [object]
            }
        } catch (error) {
            console.log('**************');
            console.log(error.message);
            console.log('**************');
        }

        //headers
        try {
            if (originalItem.request.header) {
                for (let i = 0; i < originalItem.request.header.length; i++) {
                    let query = {
                        in: 'header',
                        name: originalItem.request.header[i].key,
                        schema:
                        {
                            type: 'string',
                            example: originalItem.request.header[i].value
                        }

                    }
                    parameters.push(query);
                }
            }
        } catch (error) {
            console.log('**************');
            console.log(error.message);
            console.log('**************');
        }
        // otros parametros

        try {
            if (originalItem.request.url.query) {
                for (let i = 0; i < originalItem.request.url.query.length; i++) {
                    let query = {
                        in: 'query',
                        name: `${originalItem.request.url.query[i].value}(${i})`,
                        schema: {
                            type: 'string',
                            example: originalItem.request.url.query[i].key
                        }
                    }
                    parameters.push(query);
                }
            }
        } catch (error) {
            console.log('**************');
            console.log(error.message);
            console.log('**************');
        }

        if (parameters.length > 0) {
            paths[pathOriginal][originalMethod]['parameters'] = parameters
        }

        paths[pathOriginal][originalMethod]['tags'] = ['Default']
        //responses
        try {
            if (originalItem.response) {
                if (originalItem.response.length === 0) {
                    const body = {};
                    const description = 'no description';
                    paths[pathOriginal][originalMethod]['responses'] = {};
                    const statusDefautl = 200;
                    paths[pathOriginal][originalMethod]['responses'][statusDefautl] = {};
                    paths[pathOriginal][originalMethod]['responses'][statusDefautl]['description'] = description;
                    paths[pathOriginal][originalMethod]['responses'][statusDefautl]['content'] = {}
                    paths[pathOriginal][originalMethod]['responses'][statusDefautl]['content']['application/json'] = {};
                    paths[pathOriginal][originalMethod]['responses'][statusDefautl]['content']['application/json']['schema'] = {}
                    paths[pathOriginal][originalMethod]['responses'][statusDefautl]['content']['application/json']['schema']['example'] = body
                } else {
                    for (let i = 0; i < originalItem.response.length; i++) {
                        const responseItem = originalItem.response[i];
                        const body = responseItem.body;
                        const description = responseItem.name;
                        paths[pathOriginal][originalMethod]['responses'] = {};
                        paths[pathOriginal][originalMethod]['responses'][responseItem.code] = {};
                        paths[pathOriginal][originalMethod]['responses'][responseItem.code]['description'] = description;
                        paths[pathOriginal][originalMethod]['responses'][responseItem.code]['content'] = {}
                        paths[pathOriginal][originalMethod]['responses'][responseItem.code]['content']['application/json'] = {};
                        paths[pathOriginal][originalMethod]['responses'][responseItem.code]['content']['application/json']['schema'] = {}
                        paths[pathOriginal][originalMethod]['responses'][responseItem.code]['content']['application/json']['schema']['example'] = body
                    }
                }
            }
        } catch (error) {
            console.log('**************');
            console.log(error.message);
            console.log('**************');
        }
        console.log(`FIN ${originalMethod} - ${summary}`);

    });

    const url = options.url || 'localhost:8080';
    const description = options.description || 'An description';
    const descriptionInfo = options.descriptionInfo || 'Some description';
    const version = options.version || '1.0.0';
    const title = options.title || 'Post-collection-2-yaml';
    const email = options.email || 'adndevelopersoftware@gmail.com';

    const data = {
        openapi: '3.0.0',
        servers: [
            {
                url,
                description
            }
        ],
        info: {
            description: descriptionInfo,
            version,
            title,
            contact: {
                email
            }
        },
        tags: [{ name: 'Default', description: 'tag default' }],
        paths
    };

    let yamlStr = yaml.safeDump(data);
    fs.writeFileSync(output, yamlStr, 'utf8');
};
