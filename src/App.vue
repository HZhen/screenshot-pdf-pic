<template>
  <div id="app">
    <div class="demo-con">
      <div class="img-demo">
        <el-image 
          style="width: 100px; height: 100px"
          :src="imgSrc"
          @click="clickImg(imgSrc)"
        >
        </el-image>
      </div>
      <div class="pdf-demo">
        <span @click="clickPdf(pdfSrc)">
          <pdf :src="pdfSrc"/>
        </span>
        <div class="btn-con">
          <el-button type="primary" @click="openPdf(pdfSrc)">新窗口打开</el-button>
        </div>
      </div>
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      fullscreen
      v-loading="loading"
      :before-close="handleClose">
      <imgEditor :linkSrc="linkSrc" :fileType="fileType"/>
    </el-dialog>
  </div>
</template>
<script>
import imgEditor from './components/img-editor.vue'
import pdf from "vue-pdf";
export default {
  components: {
    imgEditor,
    pdf
  },
  data () {
    return {
      imgSrc: 'http://10.72.2.111:30000/timeline-service/file/ftp/preview?ftpPath=/RisImgDir/US/2021-02-03/US000044/44210203152406878.1.JPG',
      pdfSrc: 'http://wapi-test.arioncc.cn/oss-service/oss/aegle/20211221T110326-500_设置cookie和禁止自动更新谷歌浏览器的配置文档.pdf',
      dialogVisible: false,
      linkSrc: '',
      fileType: 'pdf',
      loading: false
    }
  },
  methods: {
    // 关闭弹窗
    handleClose () {
      this.dialogVisible = false;
    },
    // 关闭loading效果
    closeLoading () {
      let that = this;
      setTimeout(() => {
        that.loading = false
      }, 800);
    },
    // 打开图片进行截图操作
    clickImg (imgSrc) {
      this.linkSrc = imgSrc;
      this.fileType = 'img'
      this.loading = true
      this.dialogVisible = true
      this.closeLoading()
    },
    // 打开pdf进行截图操作
    async clickPdf (pdfSrc) {
      this.linkSrc = pdfSrc;
      this.fileType = 'pdf'
      this.loading = true
      this.dialogVisible = true
      this.closeLoading()
    },
    // 新窗口打开pdf
    openPdf (pdfSrc) {
      window.open(pdfSrc)
    }

  }
}
</script>
<style lang="less">
html,body {
  height: 100%;
  width: 100%;
}
#app {
  height: 100%;
  width: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.el-dialog__body {
  height: calc(100% - 30px);
  padding: 0 20px!important;
}
.demo-con {
  display: flex;
  justify-content: space-between;
  .img-demo,.pdf-demo {
    flex: 1;
    padding: 20px;
    background-color: #fafafa;
    .el-image {
      height: auto!important;
      width: 200px!important;
    }
  }
  .pdf-demo {
    margin-left: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    span {
      width: 200px;
      height: auto;
    }
  }
}
#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
