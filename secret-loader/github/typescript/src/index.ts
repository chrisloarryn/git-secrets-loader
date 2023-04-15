import axios from 'axios';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

enum GitlabEnvironment {
  Development = 'development',
  Testing = 'testing',
  Production = 'production'
}

const environment = GitlabEnvironment.Development;

// read variables from .env file
const result = dotenv.config({
  path: `.env.${environment}`
});

if (result.error) {
  throw result.error;
}

// get variables from .env file
const { parsed } = result;

// const headers = {
//   'PRIVATE-TOKEN': token
// };

const data = {
  encrypted_value: 'YOUR_ENCRYPTED_VALUE',
  key_id: 'YOUR_KEY_ID',

  environment_scope: environment,
  environment_name: environment,
  environment_secret: environment,
};

// convert object to array
const variables = Object.entries(parsed);

// ignore GT_TOKEN and GT_OWNER and GT_REPO
const ignoreVars = ['GT_TOKEN', 'GT_OWNER', 'GT_REPO'];

let token = '';
let owner = '';
let repo = '';

// loop through variables
variables.forEach(async (variable) => {
  const [key, value] = variable;

  if (key === 'GT_TOKEN') token = value;
  if (key === 'GT_OWNER') owner = value;
  if (key === 'GT_REPO') repo = value;

  if (ignoreVars.includes(key)) return;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  const url = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${key}`;
  const urlGet = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`;

  // encrypt value with base64
  data.encrypted_value = Buffer.from(value).toString('base64');

  // find key id 
  const dataResponse = await axios.get(urlGet, { headers });
  console.log('====================================');
  console.log(dataResponse.data);
  console.log('====================================');

  data.key_id = dataResponse.data.key_id || data.key_id;

  axios.put(url, data, { headers })
    .then((response) => {
      console.log('====================================');
      console.log('update secret ' + key + ' success');
      console.log('====================================');
      console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });
});