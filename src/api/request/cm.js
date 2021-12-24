import http from '../axios/index'

/**
  * 上传文件
  * @param {*} file
  */
 export let uploadFile = function (type, file) {
    const data = new FormData();
    data.append('files', file);
    data.append('type', type);
    return http.post(`/cm-service/common/uploadFileList`,
        data,
    );
}

// 图片文字识别接口
export let getText = function (params) {
    return http.post(`/public-service/open/ocr/getText/v1`, params);
}

// pdf转图片
export let setPdfToImg = function (params) {
    return http.post(`/public-service/PDF/pdfToPng`, params);
}