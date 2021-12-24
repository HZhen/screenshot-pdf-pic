<template>
  <div class="img-editor">
    <div class="img-con">
      <template v-if="fileType === 'img'">
        <vueCropper
          ref="cropper"
          :img="option.img"
          :outputSize="option.size"
          :outputType="option.outputType"
          :autoCrop="option.autoCrop"
          :autoCropHeight="option.autoCropHeight"
          :autoCropWidth="option.autoCropWidth"
          :centerBox="option.centerBox"
          :canMove="false"
          @realTime="realTime"
        ></vueCropper>
      </template>
      <template v-else>
        <PdfCropper
          ref="cropper"
          :img="option.img"
          :outputSize="option.size"
          :outputType="option.outputType"
          :autoCrop="option.autoCrop"
          :autoCropHeight="option.autoCropHeight"
          :autoCropWidth="option.autoCropWidth"
          :centerBox="option.centerBox"
          :canMove="true"
          @realTime="realTime"
        ></PdfCropper>
      </template>
    </div>
    <div class="text-con">
      <div class="btn-con">
        <el-button type="primary" @click="startScreenshot">开始截图</el-button>
        <el-button type="primary" @click="clearScreenshot">停止截图</el-button>
        <el-button type="primary" @click="getScreenshot">识别当前截图的内容</el-button>
      </div>
      <el-input
        type="textarea"
        :rows="6"
        placeholder=""
        v-model="textarea">
      </el-input>
    </div>
  </div>
</template>

<script>
import { VueCropper,PdfCropper }  from './vue-cropper/index' 
import { getText } from "../api/request/cm";
export default {
  name: 'imgEditor',
  props: {
    linkSrc: {
      type: [String, Blob, null, File],
      default: ""
    },
    fileType: {
      type: [String],
      default: ""
    }
  },
  components: {
    VueCropper,
    PdfCropper
  },
  data () {
    return {
      option: {
        img: ``,
        size: 1,
        outputType: 'png',
        autoCrop: false,
        autoCropHeight: 200,
        autoCropWidth: 680,
        centerBox: true
      },
      previews: {
        w: '',
        h: '',
        div: ''
      },
      textarea: ''
    }
  },
  created () {
    this.option.img = this.linkSrc
  },
  mounted () {
    // new ScreenShort();
  },
  watch: {
    linkSrc (val) {
      if(val) {
        this.option.img = val;
        this.$refs.cropper.refresh()
      }
    }
  },
  methods: {
    // 实时预览事件
    realTime (data) {
      this.previews = data
    },
    // 开始截图
    startScreenshot () {
      this.$refs.cropper.goAutoCrop()
    },
    // 停止截图
    clearScreenshot () {
      this.$refs.cropper.clearCrop()
    },
    // base64转为file
    base64toFile (dataurl, filename = 'file') {
      let arr = dataurl.split(',')
      let mime = arr[0].match(/:(.*?);/)[1]
      let suffix = mime.split('/')[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], `${filename}.${suffix}`, {
        type: mime
      })
    },
    
    getScreenshot () {
      this.$refs.cropper.getCropData(async data => {
        console.log(data) 
        let filename = "识别图片"
        // 转为file文件
        let file = this.base64toFile(data,filename);
        let params = {
          "file": file
        }
        let res = await getText(params);
        if (res.code === 0) {
          this.textarea = res.data
        } else {
          this.$message.error(res.msg);
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.img-editor {
  width: 100%;
  height: 100%;
  display: flex;
  .img-con {
    flex: 1;
    width: 50%;
    height: 100%;
  }
  .text-con {
    padding: 20px;
    flex: 1;
    margin-left: 25px;
    .btn-con {
      margin-bottom: 20px;
    }
  }
}
</style>
