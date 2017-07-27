<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span class="dot" :class="{active: currentPageIndex === index}" v-for="(item, index) in dots"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {addClass} from 'common/js/dom'
  import BScroll from 'better-scroll'

  export default {
    name: 'slider',
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 4000
      }
    },
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    mounted() {
      // 定时器异步区 确保dom正常渲染
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()
        this._initSlider()
        if (this.autoplay) {
          this._play()
        }
      }, 20)
      // 监听 resize事件 更新sliderWidth
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
        this.slider.refresh()
      })
    },
    methods: {
      _setSliderWidth(isResize) {
        // 将sliderGroup的子元素 挂载到当前组件实例的 children上 不要转换为getter setter 无需再data中声明
        this.children = this.$refs.sliderGroup.children

        let width = 0
        // 取slider容器的宽度
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item')
          // 添加类名 slider-item 并设置宽度
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        // 如果是连续滚动 并且不是重新调整大小
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        // sliderGroup 容器的width
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initSlider() {
        // 初始化参数 better-scroll api
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: true,
          snapLoop: this.loop,
          snapThreshold: 0.3,
          snapSpeed: 400
        })
        // better-scroll 派发的事件 scrollEnd 滚动解释时触发
        this.slider.on('scrollEnd', () => {
          // 当 snap 为 true 时，获取滚动的当前页，返回的对象结构为 {x, y, pageX, pageY}，
          // 其中 x,y 代表滚动横向和纵向的位置；pageX，pageY 表示横向和纵向的页面索引
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) {
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex

          if (this.autoPlay) {
            clearTimeout(this.timer)
            this._play()
          }
        })
      },
      _initDots() {
        // 对应的索引 数量
        this.dots = new Array(this.children.length)
      },
      _play() {
        let pageIndex = this.currentPageIndex + 1
        if (this.loop) {
          pageIndex += 1
        }
        // 将timer属性 挂载到当前实例上 便于调用
        this.timer = setTimeout(() => {
          // better-scroll Api goToPage(x, y, time, easing)
          // 当 snap 为 true，滚动到对应的页面，x 表示横向页面索引，y 表示纵向页面索引，time 表示动画，easing 表示缓动函数
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }
    },
    // 组件销毁时 清除定时器
    destroyed() {
      clearTimeout(this.timer)
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .slider
    position: relative
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>