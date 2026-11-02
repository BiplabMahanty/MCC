// const DEFAULT_API_URL = 'https://cms-qfrz.onrender.com/api';
// // const DEFAULT_API_URL = 'http://10.0.2.2:4000/api';
console.log('process.env.EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL);

const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL 
const apiUrl = (DEFAULT_API_URL).replace(
  /\/$/,
  '',
);

const env = {
  apiUrl,
  instituteName: 'Mahapatra Coaching Center',
};

export default env;
