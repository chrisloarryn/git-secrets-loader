import axios from 'axios';
import dotenv from 'dotenv';

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

const token = parsed.GT_TOKEN;
const projectId = parsed.GT_PID;

const url = `https://gitlab.com/api/v4/projects/${projectId}/variables`;

const headers = {
  'PRIVATE-TOKEN': token
};

const data = {
  key: 'TEST_VARIABLE',
  value: 'test value',
  protected: true,
  // masked: true,
  environment_scope: environment
};

// convert object to array
const variables = Object.entries(parsed);

// ignore GT_TOKEN and GT_PID and 
const ignoreVars = ['GT_TOKEN', 'GT_PID'];

// loop through variables
variables.forEach((variable) => {
  const [key, value] = variable;
  if (ignoreVars.includes(key)) return;
  data.key = key;
  data.value = value;

  axios.post(url, data, { headers })
    .then((response) => {
      console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });
});