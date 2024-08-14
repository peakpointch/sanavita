import { Script, Stylesheet } from '../../library/script';

var WEBFLOW_ENV = WEBFLOW_ENV || {}
var WEBFLOW_CONFIG = WEBFLOW_CONFIG || {}
var page: Document
let host: string
let csspath: string
let jspath: string

function buildWebflowConfig() {
  csspath = 'assets/css'

  if (WEBFLOW_ENV.development) {
    jspath = 'assets/js'
    host = 'http://localhost:3000'
  } else if (WEBFLOW_ENV.production) {
    jspath = 'dist'
    host = 'https://cdn.jsdelivr.net/gh/lukas-peakpoint@latest'
  } else {
    return
  }

  WEBFLOW_CONFIG.js.forEach(file => {
    let url: string = `${host}/dist/${file}.js`
    let script = new Script(url)
    script.addAttribute('data-dyn-js', 'true')
    page.body.appendChild(script.element)
  });

  WEBFLOW_CONFIG.css.forEach(file => {
    let url: string = `${host}/${csspath}/${file}.css`
    let stylesheet = new Stylesheet(url)
    stylesheet.addAttribute('data-dyn-js', 'true')
    page.head.appendChild(stylesheet.element)
  });

  setTimeout(() => {
    const event = new CustomEvent('buildWebflowConfig')
    window.dispatchEvent(event)
  }, 200)

}

buildWebflowConfig()