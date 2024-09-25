import axios from "axios";

let axiosInstance = null;

function getInstance() {
  if (axiosInstance != null) {
    return axiosInstance
  }
  axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': true
    },
    timeout: 5000 // request timeout
  })
  //hook interceptor cài ở đây
  axiosInstance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      console.log(error)
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.response.use(
    response => {
      const res = response.data;
      return res;
    },
    error => {
      if (error.response && error.response.status === 403) {
        // Redirect to login page
        window.location.href = '/auth/sign-in'; // Adjust the path as necessary
      }
      console.log(error);
      return Promise.reject(error);
    }
  );
  return axiosInstance;
}


function get(endpointApiUrl, payload = {}, config = {}) {
  return getInstance().get(endpointApiUrl, {
    params: payload,
    ...config,
  });
}

function post(endpointApiUrl, payload = {}, config = {}) {
  return getInstance().post(endpointApiUrl, payload, config);
}

function put(endpointApiUrl, payload = {}, config = {}) {
  return getInstance().put(endpointApiUrl, payload, config);
}

function del(endpointApiUrl, payload = {}, config = {}) {
  return getInstance().delete(endpointApiUrl, payload, config);
}

function patch(endpointApiUrl, payload = {}, config = {}) {
  return getInstance().patch(endpointApiUrl, payload, config);
}

export const Axios = {
  axiosInstance,
  get,
  post,
  put,
  del,
  patch
}