import http from '../axios/index'

// 图片文字识别接口
export let getText = function (params) {
    console.log(params)
    debugger
    return http.post(`/public-service/open/ocr/getText/v1`, params);
}

// pdf转图片
export let setPdfToImg = function (params) {
    return http.post(`/public-service/PDF/pdfToPng`, params);
}