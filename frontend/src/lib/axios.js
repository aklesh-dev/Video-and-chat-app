import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true,  // to send cookies along with the request
});

export default axiosInstance;