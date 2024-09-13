import axios from "axios";
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const getToken = () => {
  const tokenFromCookies = Cookies.get('token'); 
  const tokenFromLocalStorage = localStorage.getItem('token'); 
  return tokenFromCookies || tokenFromLocalStorage;
};

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} else {
  console.error('No token found'); // Debugging line
}

export default api;
