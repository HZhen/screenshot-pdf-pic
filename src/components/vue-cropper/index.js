import VueCropper from './vue-cropper'
import PdfCropper from './pdf-cropper'

const install = function(Vue) {
  Vue.component('VueCropper', VueCropper);
  Vue.component('PdfCropper', PdfCropper);
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export { VueCropper,PdfCropper }

export default {
  version: '0.5.8',
  install,
  VueCropper,
  PdfCropper,
  vueCropper: VueCropper,
  PdfCropper: PdfCropper
}
