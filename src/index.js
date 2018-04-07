import Vue from 'vue'
import App from './app.vue'

// 引入全局CSS样式
import './assets/styles/global.styl'

const root = document.createElement('div');
document.body.appendChild(root);

new Vue({
    render: (h) => h(App)
}).$mount(root);