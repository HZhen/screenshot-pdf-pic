<template>
  <div class="vue-cropper" ref="cropper">
    <div class="cropper-box">
      <div class="cropper-box-canvas">
        <!-- pdf的操作按钮组 -->
        <div class="tools">
          <el-button type="primary" size="mini" @click.stop="prePage" class="mr10"> 上一页</el-button>
          <el-button type="primary" size="mini" @click.stop="nextPage" class="mr10"> 下一页</el-button>
          <div class="page">{{pageNum}}/{{pageTotalNum}} </div>
          <el-button type="primary" size="mini" @click.stop="clock" class="mr10"> 顺时针</el-button>
          <el-button type="primary" size="mini" @click.stop="counterClock" class="mr10"> 逆时针</el-button>
        </div>
        <div class="pdf-con" id="pdf-con" ref="pdfCon">
          <!-- 展示的pdf -->
          <pdf ref="pdf"
            :src="img" 
            :page="pageNum"
            :rotate="pageRotate"  
            @progress="loadedRatio = $event"
            @page-loaded="pageLoaded($event)" 
            @num-pages="pageTotalNum=$event" 
            @error="pdfError($event)" 
            @link-clicked="page = $event">
          </pdf>
          
          <!-- 截图框 -->
          <div class="cropper-modal" v-show="cropping">
            <div
              class="cropper-crop-box "
              :style="{
                'width': cropW + 'px',
                'height': cropH + 'px',
                'transform': 'translate3d('+ cropOffsertX + 'px,' + cropOffsertY + 'px,' + '0)'
              }">
              <span
                class="cropper-face cropper-move"
                @mousedown="cropMove"
              ></span>
              <span class="crop-info" :style="{'top': cropInfo}">{{  this.cropW > 0 ? this.cropW : 0 }} × {{ this.cropH > 0 ? this.cropH : 0 }}</span>
              <span>
                <span class="crop-line line-w" @mousedown="changeCropSize($event, false, true, 0, 1)"></span>
                <span class="crop-line line-a" @mousedown="changeCropSize($event, true, false, 1, 0)"></span>
                <span class="crop-line line-s" @mousedown="changeCropSize($event, false, true, 0, 2)"></span>
                <span class="crop-line line-d" @mousedown="changeCropSize($event, true, false, 2, 0)"></span>
                <span class="crop-point point1" @mousedown="changeCropSize($event, true, true, 1, 1)"></span>
                <span class="crop-point point2" @mousedown="changeCropSize($event, false, true, 0, 1)"></span>
                <span class="crop-point point3" @mousedown="changeCropSize($event, true, true, 2, 1)"></span>
                <span class="crop-point point4" @mousedown="changeCropSize($event, true, false, 1, 0)"></span>
                <span class="crop-point point5" @mousedown="changeCropSize($event, true, false, 2, 0)"></span>
                <span class="crop-point point6" @mousedown="changeCropSize($event, true, true, 1, 2)"></span>
                <span class="crop-point point7" @mousedown="changeCropSize($event, false, true, 0, 2)"></span>
                <span class="crop-point point8" @mousedown="changeCropSize($event, true, true, 2, 2)"></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
   
  </div>
</template>

<script>
import pdf from 'vue-pdf'
export default {
  components: {
    pdf
  },
  data: function () {
    return {
      // 容器高宽
      w: 0,
      h: 0,
      // 图片缩放比例
      scale: 1,
      // 图片偏移x轴
      x: 0,
      // 图片偏移y轴
      y: 0,
      // 图片真实宽度
      trueWidth: 0,
      // 图片真实高度
      trueHeight: 0,
      move: true,
      // 移动的x
      moveX: 0,
      // 移动的y
      moveY: 0,
      // 开启截图
      crop: false,
      // 正在截图
      cropping: false,
      // 裁剪框大小
      cropW: 0,
      cropH: 0,
      cropOldW: 0,
      cropOldH: 0,
      // 判断是否能够改变
      canChangeX: false,
      canChangeY: false,
      // 改变的基准点
      changeCropTypeX: 1,
      changeCropTypeY: 1,
      // 裁剪框的坐标轴
      cropX: 0,
      cropY: 0,
      cropChangeX: 0,
      cropChangeY: 0,
      cropOffsertX: 0,
      cropOffsertY: 0,
      // 支持的滚动事件
      support: '',
      pageNum: 1,
      pageTotalNum: 1,
      pageRotate: 0,
      // 加载进度
      loadedRatio: 0,
      curPageNum: 0,
    }
  },
  props: {
    img: {
      type: String,
      default: ''
    },
    // 输出图片压缩比
    outputSize: {
      type: Number,
      default: 1
    },
    outputType: {
      type: String,
      default: 'jpeg'
    },
    // 是否可以拖动截图框
    canMoveBox: {
      type: Boolean,
      default: true
    },
  },
  computed: {
    cropInfo () {
      return this.cropOffsertY > 20 ? '-20px' : '0px'
    }
  },
  watch: {
    // 如果图片改变， 重新布局
    img () {
      // 当传入图片时, 读取图片信息同时展示;
      this.reload();
    },
    cropW () {
      this.cropW = ~~(this.cropW)
    },
    cropH () {
      this.cropH = ~~(this.cropH)
    },
  },
  mounted () {
    // 获取pdf的展现的相关信息
    this.reload();
    // 计算pdf的页码
    this.getNumPages(this.img);
    let that = this
    // 兼容blob
    if (!HTMLCanvasElement.prototype.toBlob) {
     Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      value: function (callback, type, quality) {
        let binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
            len = binStr.length,
            arr = new Uint8Array(len)
        for (let i=0; i<len; i++ ) {
         arr[i] = binStr.charCodeAt(i)
        }
        callback( new Blob( [arr], {type: that.type || 'image/png'} ) )
      }
     })
    }
  },
  methods: {
    // 获得pdf的页码相关信息
    getNumPages(url) {
      this.$nextTick(()=> {
        let loadingTask = pdf.createLoadingTask(url)
        loadingTask.promise.then(pdf => {
          this.url = loadingTask
          this.numPages = pdf.numPages
        }).catch((err) => {
          console.error('pdf加载失败')
        })
      })
    },
    // 上一页函数，
    prePage() {
      let page = this.pageNum
      page = page > 1 ? page - 1 : this.pageTotalNum
      this.pageNum = page
    },
    // 下一页函数
    nextPage() {
      let page = this.pageNum
      page = page < this.pageTotalNum ? page + 1 : 1
      this.pageNum = page
    },
    // 页面顺时针翻转90度。
    clock() {
      this.pageRotate += 90
    },
    // 页面逆时针翻转90度。
    counterClock() {
      this.pageRotate -= 90
    },
    // 页面加载回调函数，其中e为当前页数
    pageLoaded(e) {
      this.curPageNum = e
    },
    // 其他的一些回调函数。
    pdfError(error) {
      console.error(error)
    },
    // 移动图片
    moveImg (e) {
      e.preventDefault()
      let nowX = e.clientX;
      let nowY = e.clientY;
      this.$nextTick(() => {
        this.x = ~~(nowX - this.moveX)
        this.y = ~~(nowY - this.moveY)
      })
    },
    // 移动图片结束
    leaveImg (e) {
      window.removeEventListener('mousemove', this.moveImg);
      window.removeEventListener('mouseup', this.leaveImg);
    },
    
    // 创建截图框
    // 获取截图框的宽高和x、y的偏移量
    createCrop (e) {
      e.preventDefault()
      // 移动生成大小
      let nowX = e.clientX ? e.clientX : 0
      let nowY = e.clientY ? e.clientY : 0
      this.$nextTick(() => {
        let fw = ~~(nowX - this.cropX)
        let fh = ~~(nowY - this.cropY)
        if (fw > 0) {
          this.cropW = fw + this.cropChangeX > this.w ? this.w - this.cropChangeX : fw
          this.cropOffsertX = this.cropChangeX
        } else {
          this.cropW = (this.w - this.cropChangeX + Math.abs(fw)) > this.w ? this.cropChangeX : Math.abs(fw)
          this.cropOffsertX = this.cropChangeX  + fw > 0 ? this.cropChangeX + fw : 0
        }

        if (fh > 0) {
          this.cropH = fh + this.cropChangeY > this.h ? this.h - this.cropChangeY : fh
          this.cropOffsertY = this.cropChangeY
        } else {
          this.cropH = (this.h - this.cropChangeY + Math.abs(fh)) > this.h ? this.cropChangeY : Math.abs(fh)
          this.cropOffsertY = this.cropChangeY  + fh > 0 ? this.cropChangeY + fh : 0
        }
       
      })
    },

    // 改变截图框大小
    // 获取截图框的宽高和x、y的偏移量
    changeCropSize (e, w, h, typeW, typeH) {
      e.preventDefault()
      window.addEventListener('mousemove', this.changeCropNow)
      window.addEventListener('mouseup', this.changeCropEnd)
      this.canChangeX = w;
      this.canChangeY = h;
      this.changeCropTypeX = typeW;
      this.changeCropTypeY = typeH;
      this.cropX = e.clientX;
      this.cropY = e.clientY;
      this.cropOldW = this.cropW;
      this.cropOldH = this.cropH;
      this.cropChangeX = this.cropOffsertX
      this.cropChangeY = this.cropOffsertY
    },
    // 正在改变
    changeCropNow (e) {
      e.preventDefault()
      let nowX = e.clientX;
      let nowY = e.clientY;
      this.$nextTick(() => {
        let fw = ~~(nowX - this.cropX)
        let fh = ~~(nowY - this.cropY)
        if (this.canChangeX) {
          if (this.changeCropTypeX === 1) {
            if (this.cropOldW - fw > 0) {
              this.cropW = this.w - this.cropChangeX - fw <= this.w ? this.cropOldW - fw : this.cropOldW + this.cropChangeX
              this.cropOffsertX = this.w - this.cropChangeX - fw <= this.w ? this.cropChangeX + fw : 0
            } else {
              this.cropW = Math.abs(fw) + this.cropChangeX <= this.w ? Math.abs(fw) - this.cropOldW : this.w - this.cropOldW - this.cropChangeX
              this.cropOffsertX = this.cropChangeX + this.cropOldW
            }
          } else if (this.changeCropTypeX === 2) {
            if (this.cropOldW + fw > 0) {
              this.cropW = this.cropOldW + fw + this.cropOffsertX <= this.w ? this.cropOldW + fw : this.w - this.cropOffsertX
              this.cropOffsertX = this.cropChangeX
            } else {
              this.cropW = (this.w - this.cropChangeX + Math.abs(fw + this.cropOldW)) <= this.w ? Math.abs(fw + this.cropOldW) : this.cropChangeX
              this.cropOffsertX = (this.w - this.cropChangeX + Math.abs(fw + this.cropOldW)) <= this.w ? this.cropChangeX - Math.abs(fw + this.cropOldW) : 0
            }
          }
        }

        if (this.canChangeY) {
          if (this.changeCropTypeY === 1) {
            if (this.cropOldH - fh > 0) {
              this.cropH = this.h - this.cropChangeY - fh <= this.h ? this.cropOldH - fh : this.cropOldH + this.cropChangeY
              this.cropOffsertY = this.h - this.cropChangeY - fh <= this.h ? this.cropChangeY + fh : 0
            } else {
              this.cropH = Math.abs(fh) + this.cropChangeY <= this.h ? Math.abs(fh) - this.cropOldH : this.h - this.cropOldH - this.cropChangeY
              this.cropOffsertY = this.cropChangeY + this.cropOldH
            }
          } else if (this.changeCropTypeY === 2) {
            if (this.cropOldH + fh > 0) {
              this.cropH = this.cropOldH + fh + this.cropOffsertY <= this.h ? this.cropOldH + fh : this.h - this.cropOffsertY
              this.cropOffsertY = this.cropChangeY
            } else {
              this.cropH = (this.h - this.cropChangeY + Math.abs(fh + this.cropOldH)) <= this.h ? Math.abs(fh + this.cropOldH) : this.cropChangeY
              this.cropOffsertY = (this.h - this.cropChangeY + Math.abs(fh + this.cropOldH)) <= this.h ? this.cropChangeY - Math.abs(fh + this.cropOldH) : 0
            }
          }
        }
      })
    },

    // 结束改变
    changeCropEnd (e) {
      window.removeEventListener('mousemove', this.changeCropNow)
      window.removeEventListener('mouseup', this.changeCropEnd)
    },

    // 创建完成
    endCrop () {
      if (this.cropW === 0 && this.cropH === 0) {
        this.cropping = false
      }
      window.removeEventListener('mousemove', this.createCrop)
      window.removeEventListener('mouseup', this.endCrop)
    },
    // 开始截图
    startCrop () {
      this.crop = true
    },
    // 停止截图
    stopCrop () {
      this.crop = false
    },
    // 清除截图
    clearCrop () {
      this.cropping = false
      this.cropW = 0
      this.cropH = 0
    },
    // 截图移动
    cropMove (e) {
      e.preventDefault()
      if (!this.canMoveBox) {
        this.crop = false
        return false
      }
      window.addEventListener('mousemove', this.moveCrop)
      window.addEventListener('mouseup', this.leaveCrop)
      this.cropX = e.clientX - this.cropOffsertX
      this.cropY = e.clientY - this.cropOffsertY
    },

    moveCrop (e) {
      e.preventDefault()
      let nowX = e.clientX;
      let nowY = e.clientY;
      this.$nextTick(() => {
        let fw = ~~(nowX - this.cropX);
        let fh = ~~(nowY - this.cropY)
        if (fw <= 1) {
          this.cropOffsertX = 1
        } else if (~~(fw + this.cropW) > this.w) {
          this.cropOffsertX = this.w - this.cropW - 1
        } else {
          this.cropOffsertX = fw
        }

        if (fh <= 1) {
          this.cropOffsertY = 1
        } else if (~~(fh + this.cropH) > this.h) {
          this.cropOffsertY = this.h - this.cropH - 1
        } else {
          this.cropOffsertY = fh
        }
      })
    },

    leaveCrop (e) {
      window.removeEventListener('mousemove', this.moveCrop)
      window.removeEventListener('mouseup', this.leaveCrop)
    },
    // 截图的时候，获取pdf生成的canvas，然后转为base64的
    getPDfToPng () {
      const canvas =  document.getElementById('pdf-con').getElementsByTagName('span')[0].getElementsByTagName('canvas')[0];
      let dataURL = canvas.toDataURL();
      return dataURL
    },
    // 获取转换成base64 的图片信息
    getCropData (cb) {
      let imgData = this.getPDfToPng()
      let canvas = document.createElement('canvas')
      let img = new Image;
      let trueWidth = this.trueWidth
      let trueHeight = this.trueHeight
      let cropOffsertX = this.cropOffsertX
      let cropOffsertY = this.cropOffsertY
      img.onload = () => {
        if (~~(this.cropW) !== 0) {
          let ctx = canvas.getContext('2d')
          let width = this.cropW
          let height = this.cropH
          let imgW = trueWidth * this.scale
          let imgH = trueHeight * this.scale
          // 图片x轴偏移
          let dx = (this.x - cropOffsertX) + this.trueWidth * (1 - this.scale) / 2
          // 图片y轴偏移
          let dy = (this.y - cropOffsertY) + this.trueHeight * (1 - this.scale) / 2
          // 输出原图比例截图
          setCanvasSize(width / this.scale, height / this.scale);
          ctx.save()
          ctx.drawImage(img, dx, dy, imgW, imgH)
          
          ctx.restore()
        } else {
          this.$message({
            message: '截图框选中的范围太小，请重新选择',
            type: 'warning'
          });
        }

        let data = canvas.toDataURL('image/' + this.outputType, this.outputSize)
        cb(data)
      }
      img.src = imgData;
      function setCanvasSize(width, height) {
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
      }
    },
    // reload 图片布局函数
    reload() {
        // 读取图片的信息原始信息， 解析是否需要旋转
        // 读取图片的旋转信息
        // 得到外层容器的宽度高度
        this.w = parseFloat(window.getComputedStyle(this.$refs.pdfCon).width);
        this.h = parseFloat(window.getComputedStyle(this.$refs.pdfCon).height);
        // 存入图片真实高度
        this.trueWidth = this.w;
        this.trueHeight = this.h;
        this.$nextTick(() => {
          this.x =
            -(this.trueWidth - this.trueWidth * this.scale) / 2 +
            (this.w - this.trueWidth * this.scale) / 2;
          this.y =
            -(this.trueHeight - this.trueHeight * this.scale) / 2 +
            (this.h - this.trueHeight * this.scale) / 2;
        });
     
    },
    // 自动截图函数
    goAutoCrop () {
      this.cropping = true
      // 截图框默认大小
      // 如果为0 那么计算容器大小 默认为80%
      let w = 680
      let h = 200
      this.changeCrop(w, h)
    },
    // 手动改变截图框大小函数
    changeCrop (w, h) {
      // 判断是否大于容器
      this.cropW = w
      this.cropH = h
      // 居中走一走
      this.cropOffsertX = (this.w - w) / 2
      this.cropOffsertY = (this.h - h) / 2
    },
    // 重置函数， 恢复组件置初始状态
    refresh () {
      this.scale = 1
      this.crop = false
      this.rotate = 0
      this.w = 0
      this.h = 0
      this.trueWidth = 0
      this.trueHeight = 0
      this.clearCrop()
    }
  }
}
</script>

<style scoped lang="less">
  .vue-cropper {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    direction: ltr;
    background-color: #e6e7ec;
  }

  .cropper-box, .cropper-box-canvas, .cropper-drag-box, .cropper-crop-box, .cropper-face{
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    user-select: none;
  }
  #toPngDom {
    height: 1142px;
    width: 800px;
    margin: 15px auto;
    position: relative;
    user-select: none;
    transform: none;
    max-width: none;
    max-height: none;
  }
  .tools {
    line-height: 50px;
    width: 800px;
    padding: 15px 0;
    background-color: #fff;
    display: flex;
    justify-content: center;
    margin: 10px auto;
    button {
      height: 28px;
    }
  }
  .page {
    font-size: 16px;
    min-width: 100px;
    line-height: 28px;
    padding: 0 5px;
  }
  .cropper-box-canvas .pdf-con {
    height: 1142px;
    width: 800px;
    margin: 0 auto;
    position: relative;
    user-select: none;
    transform: none;
    max-width: none;
    max-height: none;
    .cropper-modal {
      top: 0;
      left: 0;
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }

  .cropper-box {
    overflow: hidden;
  }

  .cropper-move {
    cursor: move;
  }

  .cropper-crop {
    cursor: crosshair;
  }

  .cropper-crop-box {
    background-color: transparent;
    border: 2px solid red;
  }

  .cropper-view-box {
    display: block;
    overflow: hidden;
    width: 100%;
    height: 100%;
    outline: 1px solid red;
    outline-color: red;
    user-select: none;
  }

  .cropper-view-box img {
    user-select: none;
    max-width: none;
    max-height: none;
  }

  .cropper-face {
    top: 0;
    left: 0;
    background-color: #fff;
    opacity: 0.1;
  }

  .crop-info {
    position: absolute;
    left: 0px;
    min-width: 65px;
    text-align: center;
    color: white;
    line-height: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    font-size: 12px;
  }

  .crop-line {
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    opacity: .1;
  }

  .line-w {
    top: -3px;
    left: 0;
    height: 5px;
    cursor: n-resize;
  }

  .line-a {
    top: 0;
    left: -3px;
    width: 5px;
    cursor: w-resize;
  }

  .line-s {
    bottom: -3px;
    left: 0;
    height: 5px;
    cursor: s-resize;
  }

  .line-d {
    top: 0;
    right: -3px;
    width: 5px;
    cursor: e-resize;
  }

  .crop-point {
    position: absolute;
    width: 8px;
    height: 8px;
    opacity: .75;
    background-color: red;
    border-radius: 100%;
  }

  .point1 {
    top: -4px;
    left: -4px;
    cursor: nw-resize;
  }

  .point2 {
    top: -5px;
    left: 50%;
    margin-left: -3px;
    cursor: n-resize;
  }

  .point3 {
    top: -4px;
    right: -4px;
    cursor: ne-resize;
  }

  .point4 {
    top: 50%;
    left: -4px;
    margin-top: -3px;
    cursor: w-resize;
  }

  .point5 {
    top: 50%;
    right: -4px;
    margin-top: -3px;
    cursor: w-resize;
  }

  .point6 {
    bottom: -5px;
    left: -4px;
    cursor: sw-resize;
  }

  .point7 {
    bottom: -5px;
    left: 50%;
    margin-left: -3px;
    cursor: s-resize;
  }

  .point8 {
    bottom: -5px;
    right: -4px;
    cursor: nw-resize;
  }

  @media screen and (max-width: 500px) {
    .crop-point {
      position: absolute;
      width: 20px;
      height: 20px;
      opacity: .45;
      background-color: #39f;
      border-radius: 100%;
    }

    .point1 {
      top: -10px;
      left: -10px;
    }

    .point2, .point4, .point5, .point7 {
      display: none;
    }

    .point3 {
      top: -10px;
      right: -10px;
    }

    .point4 {
      top: 0;
      left: 0;
    }

    .point6 {
      bottom: -10px;
      left: -10px;
    }

    .point8 {
      bottom: -10px;
      right: -10px;
    }
  }
</style>
