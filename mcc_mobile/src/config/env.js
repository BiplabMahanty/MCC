const DEFAULT_API_URL = 'http://10.0.2.2:4000/api';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ||DEFAULT_API_URL).replace(
  /\/$/,
  '',
);

const env = {
  apiUrl,
};

export default env;
//
