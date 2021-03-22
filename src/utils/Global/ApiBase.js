import RNFetchBlob from 'rn-fetch-blob';
import Constants from './Constants';

const futch = (url, opts = {}, onProgress) => {
  global._url = url;
  console.log(url, opts);
  return new Promise((res, rej) => {
    var xhr = new XMLHttpRequest();
    xhr.open(opts.method || 'get', url);
    for (var k in opts.headers || {}) xhr.setRequestHeader(k, opts.headers[k]);
    xhr.onload = (e) => res(e.target);
    xhr.onerror = rej;
    if (xhr.upload && onProgress) xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
    xhr.send(opts.body);
  });
};

const formDataCall = (subUrl, body, headers, callBack) => {
  futch(
    Constants.HOST_URL + subUrl,
    {
      method: 'post',
      body: body,
      headers: headers,
    },
    (progressEvent) => {
      const progress = progressEvent.loaded / progressEvent.total;
      console.log(progress);
    },
  ).then(
    function (resJson) {
      console.log('formDataCall response from server === >>>');
      try {
        console.log('before parsing: ', resJson.response.substring(0, 100));
        // console.log('before parsing: ', resJson.response);
        res = JSON.parse(resJson.response);
        console.log('after parsing: ', res);
        callBack(res, null);
      } catch (exception) {
        console.error('exception:', exception);
        callBack(null, exception);
      }
    },
    (err) => {
      console.error('parsing err: ', err);
      callBack(null, err);
    },
  );
};

const formFileDataCall = (subUrl, body, callBack) => {
  RNFetchBlob.fetch(
    'POST',
    Constants.HOST_URL + subUrl,
    {
      'Content-Type': 'multipart/form-data',
    },
    body,
  )
    .then((resJson) => {
      console.log('formDataCall response from server === >>>');
      try {
        // console.log('before parsing: ', resJson.data.substring(0, 100));
        console.log('before parsing: ', resJson.data);
        res = JSON.parse(resJson.data);
        console.log('after parsing: ', res);
        callBack(res, null);
      } catch (exception) {
        console.error('exception:', exception);
        callBack(null, exception);
      }
    })
    .catch((err) => {
      console.error('parsing err: ', err);
      callBack(null, err);
    });
};

export {formDataCall, formFileDataCall};
