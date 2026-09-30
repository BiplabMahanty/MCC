const DEFAULT_API_URL = 'https://cms-qfrz.onrender.com/api';
//const DEFAULT_API_URL = 'http://10.0.2.2:4000/api';

const apiUrl = (DEFAULT_API_URL).replace(
  /\/$/,
  '',
);

const env = {
  apiUrl,
  instituteName: 'Mahapatra Coaching Center',
};

export default env;
