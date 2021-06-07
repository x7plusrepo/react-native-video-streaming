import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';

const host = 'http://107.180.73.164:3000';
//const host = 'http://192.168.1.110:3000';

export const api = axios.create({
  baseURL: `${host}`,
});

api.defaults.timeout = 50000; //TODO I  think we need to set timeout for api calls.

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@token'); // This takes so short. 0.003 seconds
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// response middleware
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const errorResponse = error.response || error;
    return Promise.reject(errorResponse);
  },
);

const futch = async (url, opts = {}, onProgress) => {
  global._url = url;
  console.log(url, opts);
  let apiCall = api.get;
  if (opts.method === 'post') {
    apiCall = api.post;
  } else if (opts.method === 'put') {
    apiCall = api.put;
  } else if (opts.method === 'patch') {
    apiCall = api.patch;
  }

  let response;
  if (opts.method === 'get') {
    response = await api.get(url, {
      params: opts.body,
      headers: opts.headers,
    });
  } else {
    response = await apiCall(url, opts.body, { headers: opts.headers });
  }

  return response;
  // return new Promise((res, rej) => {
  //   var xhr = new XMLHttpRequest();
  //   xhr.open(opts.method || 'get', url);
  //   for (var k in opts.headers || {}) xhr.setRequestHeader(k, opts.headers[k]);
  //   xhr.onload = (e) => res(e.target);
  //   xhr.onerror = rej;
  //   if (xhr.upload && onProgress) xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
  //   xhr.send(opts.body);
  // });
};

const formDataCall = (subUrl, body, headers, callBack, method = 'post') => {
  futch(
    subUrl,
    {
      method: method,
      body: body,
      headers: headers,
    },
    (progressEvent) => {
      const progress = progressEvent.loaded / progressEvent.total;
      console.log(progress);
    },
  )
    .then(function (resJson) {
      try {
        const res = resJson;
        callBack(res, null);
      } catch (exception) {
        console.error('exception:', exception);
        callBack(null, exception);
      }
    })
    .catch((err) => {
      console.error('parsing err: ', err.data || {});
      callBack(null, err.data || {});
    });
};

// const formFileDataCall = (subUrl, body, callBack) => {
//   RNFetchBlob.fetch(
//     'POST',
//     Constants.HOST_URL + subUrl,
//     {
//       'Content-Type': 'multipart/form-data',
//     },
//     body,
//   )
//     .then((resJson) => {
//       console.log('formDataCall response from server === >>>');
//       try {
//         // console.log('before parsing: ', resJson.data.substring(0, 100));
//         console.log('before parsing: ', resJson.data);
//         const res = JSON.parse(resJson.data);
//         console.log('after parsing: ', res);
//         callBack(res, null);
//       } catch (exception) {
//         console.error('exception:', exception);
//         callBack(null, exception);
//       }
//     })
//     .catch((err) => {
//       console.error('parsing err: ', err);
//       callBack(null, err);
//     });
// };

export { formDataCall };
