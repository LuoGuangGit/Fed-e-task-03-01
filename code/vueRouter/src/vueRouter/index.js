let _Vue = null

export default class VueRouter {
  constructor (options) {
    this.options = options
    this.routeMap = {}
    this.data = _Vue.observable({
      current: '/'
    })
  }
  static install (Vue) {
    if (VueRouter.install.installed && _Vue === Vue) return
    VueRouter.install.installed = true
    _Vue = Vue
    _Vue.mixin({
      beforeCreate () {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      }
    })
  }
  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }
  initEvent () {
    window.addEventListener('load', this.hashChange.bind(this))
    window.addEventListener('hashchange', this.hashChange.bind(this))
  }
  createRouteMap () {
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }
  initComponents (Vue) {
    const self = this
    Vue.component('router-link', {
      props: {
        to: String
      },
      render (h) {
        return h('a', {
          attrs: {
            href: '#' + this.to
          },
          on: {
            click: this.clickHandler
          }
        }, [this.$slots.default])
      },
      methods: {
        clickHandler (e) {
          window.location.hash = '#' + this.to
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })
    Vue.component('router-view', {
      render (h) {
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    })
  }

  hashChange () {
    if (!window.location.hash) window.location.hash = '#/'
    this.data.current = window.location.hash.substr(1)
  }
}