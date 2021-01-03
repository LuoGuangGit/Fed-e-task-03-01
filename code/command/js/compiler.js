class Compiler {
  constructor (vm) {
    this.$el = vm.$el
    this.vm = vm
    this.compile(this.$el)
  }
  compile (el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        this.compileElement(node)
      }
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  compileElement (node) {
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node, key, attrName)
      }
    })
  }
  update (node, key, attrName) {
    if(this.isOnDirective(attrName)) {
      let eventType = attrName.substr(3)
      attrName = 'on'
      let updateFn = this[attrName + 'Updater']
      updateFn && updateFn.call(this, node, this.vm[key], eventType)
      return
    }
    let updateFn = this[attrName + 'Updater']
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }
  textUpdater (node, value, key) {
    node.textContent = value
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
  modelUpdater (node, value, key) {
    node.value = value
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
  htmlUpdater (node, value, key) {
    node.innerHTML = value
    new Watcher(this.vm, key, newValue => {
      node.innerHTML = newValue
    })
  }
  onUpdater (node, value, eventType) {
    node.addEventListener(eventType, value)
  }
  compileText (node) {
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if (reg.test(value)) {
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    }
  }
  isDirective (attrName) {
    return attrName.startsWith('v-')
  }
  isOnDirective (attrName) {
    return attrName.startsWith('on:')
  }
  isTextNode (node) {
    return node.nodeType === 3
  }
  isElementNode (node) {
    return node.nodeType === 1
  }
}