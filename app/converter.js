const yaml = require('js-yaml');
const fs = require('fs');
const {
  basicAuth,
  apiKeyAuth,
  bearer
} = require('../constants/authType');

const paths = {};
const components = { securitySchemes: {} };

const recursiveFolder = (folder) => {
  if (folder.item) {
    for (let index = 0; index < folder.item.length; index++) {
      folder.item[index].request ? makeSwagger(folder.item[index]) : recursiveFolder(folder.item[index]);
    }
  } else {
    makeSwagger(folder);
  }

}

const makeSwagger = (elements) => {
  const originalItem = elements;
  const originalMethod = originalItem.request.method.toLowerCase();
  const summary = originalItem.name;
  console.log(`****** Creating:  ${originalMethod} - ${summary} ******`);

  let pathOriginal = '';
  originalItem.request.url.path.forEach(value => {
    pathOriginal = `${pathOriginal}/${value}`
  })

  if (!paths[pathOriginal]) paths[pathOriginal] = {}
  paths[pathOriginal][originalMethod] = {}
  paths[pathOriginal][originalMethod]['summary'] = summary

  let parameters = [];
  try {
    if (originalItem.request.body && originalMethod !== 'get' && originalMethod !== 'delete') {
      if (originalItem.request.body.raw || originalItem.request.body.raw === '') {
        let example = originalItem.request.body.raw;
        if (example === '') example = '{}';
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
        console.log('Request.body not supported');
      }
    }
  } catch (error) {
    console.log(`Error request body:
    ${JSON.stringify(error.message, null, 2)}`)
  }

  try {
    if (originalItem.request.auth) {
      let object = {}
      switch (originalItem.request.auth.type) {
        case 'bearer':
          components.securitySchemes['bearerAuth'] = bearer
          object['bearerAuth'] = [];
          break;
        case 'apikey':
          components.securitySchemes['apiKeyAuth'] = apiKeyAuth
          object['apiKeyAuth'] = [];
          break;
        case 'basic':
          components.securitySchemes['basicAuth'] = basicAuth
          object['basicAuth'] = [];
          break;
        default:
          break;
      }
      paths[pathOriginal][originalMethod]['security'] = [object]
    }
  } catch (error) {
    console.log(`Error auth param:
    ${JSON.stringify(error.message, null, 2)}`)

  }

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
    console.log(`Error header: ${error.message}`);
  }

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
    console.log(`Error query: ${error.message}`);
  }

  if (parameters.length > 0) {
    paths[pathOriginal][originalMethod]['parameters'] = parameters
  }

  paths[pathOriginal][originalMethod]['tags'] = ['Default']

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
          const body = JSON.parse(responseItem.body);
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
    console.log(`Error response: ${error.message}`);
  }
}

module.exports.converter = async (input, output, options = {}) => {
  let postmanRaw;
  try {
    postmanRaw = require(input);
  } catch (error) {
    console.log(`****** Postman collection not found: ${input} ******`);
    return;
  }

  try {
    const pathsOfPostman = postmanRaw.item;

    pathsOfPostman.forEach(element => {
      const folder = element;
      recursiveFolder(folder);
    });

    let servers = [];
    if (options.server && Array.isArray(options.server)) {
      for (let i = 0; i < options.server.length; i++) {
        const srv = options.server[i];
        const url = srv.url || 'localhost:8080';
        const description = srv.description || `Server description ${i}`;
        servers.push({ url, description });
      }
    } else {
      const url = options.url || 'localhost:8080';
      const description = options.description || 'An description';
      servers.push({ url, description });
    }
    const descriptionInfo = options.descriptionInfo || 'Some description';
    const version = options.version || '1.0.0';
    const title = options.title || 'Post-collection-2-yaml';
    const email = options.email || 'adndevelopersoftware@gmail.com';

    const data = {
      openapi: '3.0.0',
      servers,
      info: {
        description: descriptionInfo,
        version,
        title,
        contact: {
          email
        }
      },
      tags: [{ name: 'Default', description: 'tag default' }],
      paths,
      components
    };

    let yamlStr = yaml.safeDump(data);
    fs.writeFileSync(output, yamlStr, 'utf8');
  } catch (error) {
    console.log(`General error:
  ${JSON.stringify(error.message, null, 2)}`)
  }
};
