# Todo
webpack+vue构建Todo应用
# 1. vue+webpack项目工程配置
## 1-1 vue-loader+webpack项目配置
首先，我们需要准备一个空的文件夹来存放我们即将要生成的项目，假设这个文件夹名为test。接下来在Terminal上运行：
```
npm init  
//该指令执行后就会在test目录下生成一个node_modules目录，它用于存放通过npm安
//装的模块，同时还会生成package.json和package-lock.json,package.json会列出你
//的项目所依赖的所有模块的信息
npm i webpack vue-loader
//安装webpack和vue-loader
npm i css-loader vue-template-compile
//安装css-loader和vue-template-compile
//为什么要安装这些模块呢？
//因为webpack原本是用来打包JS文件的，当他遇到像ES2015这样它自己不能理解的东
//西就需要借助一些工具
```
在安装过程中可能会遇到错误：
EPERM：operation not permitted scandir 'E:\Web\...'
解决：
打开开始菜单，输入cmd,然后按Ctrl+Shift+enter，就会以管理员身份打开命令行，找到test目录，再次运行命令。

在test下新建一个src文件夹，src下建app.vue（这是一个模板），内容如下：
```html
<template>
    <div id="test">{{text}}</div>
</template>

<script>
    export default {
        data: function () {
            return {
                text: 'abc'
            }
        }
    }
</script>

<style>
    #test {
        color: red;
    }
</style>
```
然后我们需要在test目录下新建webpack.config.js也就是webpack的配置文件，我们在这个文件里声明入口（入口要用绝对路径）
```
const path = require('path');

module.exports = {
    entry: path.join(__dirname, './src/index.js'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, './dist')
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    }
};
```
说明：<br>
path是node里的一个模块，我们通过join将根目录与后面的字符串拼接形成一个绝对路径。（注意：__dirname表示项目的根目录，前面有两个下划线）；output指明输出文件的名字和路径，下面的module则是为我们待打包的package声明一些规则，指明他们依赖的loader。

我们还需要在`pakage.json`中的“scripts”中加入：
```
"build": "webpack --config webpack.config.js"
```
这样做的目的是，让我们的项目使用我们自己定义的webpack配置文件，而不是使用全局的。

接下来我们在src下新建一个index.js作为入口文件，我们通过这个文件将vue挂载到HTML上。
```javascript
import Vue from 'vue'
import App from './app.vue'

const root = document.createElement('div');
document.body.appendChild(root);

new Vue({
    render: (h) => h(App)
}).$mount(root);
```
我们发现这个文件中引用了vue，所以，如果我们的项目中如果还没有装vue，现在就应该装上了。在Terminal上运行`npm install vue`

好了，到此为止我们项目的基本配置就弄好了。我们通过`npm run build`来运行 一下，会发现在test目录中多了一个dist目录，里面有一个bundle.js文件。

## 1-2 关于css文件和图片的相关配置
首先我们需要准备一些图片和css文件备用。在src下建一个assets目录，在assets下建一个style目录和一个images目录，images目录下放是三张图片：1.png,2.png,3.png。style目录下放一个css文件test.css：
```css
body {
    color: red;
    background-image: url("../images/1.png");
}
```
然后在`webpack.config.js`中进行配置：给rules增加以下内容：
```javascript
{
    test:/\.css/,
    use: [
        'style-loader',
        'css-loader'
        //这两个的顺序不能变
    ]
},
{
    test: /\.(gif|jpg|jpeg|png|svg)$/,
    use: [
        {
            //url-loader用于将我们的图片直接生成base-64代码，
            //写到js文件中，而不用向服务器请求
            loader: 'url-loader',
            options: {
                limit: 1024, //限制了文件大小
                name: '[name].[ext]'
                //name是图片的原名，这样生成的图片名字就是不一样的
            }
        }
    ]
}
```
如果你的图片大于1K（因为我们设置的limit是1024）,它就会被输出到dist目录下，如果它小于1K，就会被转成base64，打包到js文件中去。
OK，这部分的配置完成。

我们补充一点关于css预处理器的东西。
以`stylus`为例，其它的css预处理器类似。首先我们需要安装`stylus-loader`
```
npm i stylus stylus-loader
```
然后我们在webpack.config.js中对它进行配置。在rules中增加：
```
{
    test: /\.styl$/,
    use: [
        'style-loader',
        'css-loader',
        'stylus-loader'
    ]
}
```
我们在styles下建一个`test-stylus.styl`文件来测试一下。文件内容：
```
body
  font-size 20px
```
然后我们在index.js中引入这个文件。
```
import './assets/styles/test-stylus.styl'
```
跑一下：
```
npm run build
```
在bundle.js中找`font-size`找到了就说明成功了。


## 1-3 Webpack-dev-server的配置与使用
webpack-dev-server是一个供开发者使用的webpack，我们在生产和开发时使用的webpack是不一样的，所以我们还需要在package.json中定义变量来标识我们正在使用什么版本，而再不同的平台定义变量的方式不同，为了统一，我们还需要安装一个工具cross-env。
以管理员权限运行：
```
npm i webpack-dev-server cross-env
```
在package.json的“scripts”中添加：
```
"dev": "cross-env NODE_ENV=development webpack-dev-server --config webpack.config.js"
```
`cross-env`是用来声明变量的，NODE_ENV是我们取的变量名。然后我们在build也写一下这个变量。
```
"build": "cross-env NODE_ENV=production webpack --config webpack.config.js"
```
我们通过`cross-env`声明的这些变量都保存在`process.env`这个对象中，我们在配置文件中可以取到这个对象，在webpack.config.js中增加：
```javascript
const isDev = process.env.NODE_ENV === 'development';
```
在module.exports中增加：
```
target: 'web'
```
因为我们使用的webpack版本不同，所以module.exports会有所不同，所以我们用一个变量来把它保存起来。
```javascript
const config = {...} //括号里面是module.exports原有内容
module.exports = config
```
网页都是以html的形式呈现的，所以我们还需要“html-webpack-plugin”。
```
npm i html-webpack-plugin
```
在配置文件中引入：
```
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
```
然后我们需要在config这个对象中加入：
```
plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        }),
        new HTMLPlugin()
    ]
```
我们还需要判断当处于开发模式时应该执行的操作：
```
if(isDev) {
    config.devServer = {
        port: 8000, //端口号
        host: '0.0.0.0', //设置为0.0.0.0,不仅可以通过本机的localhost访问，还能在内网通过IP地址访问
        overlay: {
            errors: true //将错误信息展示出来
        },
        hot: true //热加载
    };
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(), //热加载模块
        new webpack.NoEmitOnErrorsPlugin() //处理错误的模块
    );
    config.devtool = '#cheap-module-eval-source-map';
    //浏览器执行的是讲过打包编译的代码，而为了方便调试，我们想看到自己
    //写的代码，这个语句就能完成将打包编译过的代码映射为源代码的功能。
}
```
我们通过运行`npm run dev`来跑一下，等server正常启动后，我们在浏览器输入：`localhost：8000`会加载出来一个html页面，配置成功。<br>
<b>注：如果你在run的时候报错：Cannot find module 'webpack/lib/node/NodeTemplatePlugin'，你需要在“我的电脑右键”-“属性”-“高级系统设置”-“环境变量”中添加环境变量或者更改环境变量“NODE\_PATH”将他的值设为你项目里的node\_modules,例：E:\Web\XGL\test\node_modules</b>

# 2.构建Todo项目
## 2-1 配置vue的jsx写法以及postcss
首先还是安装：
```
npm i postcss-loader autoprefixer babel-loader babel-core
```
解释一下：<br>
postcss可以理解为一个平台，它能让插件在上面跑，起到加工css的效果，autoprefixer就是一个插件，能够为我们主动处理css中浏览器的兼容性问题。<br>
在test下新建配置文件`.babelrc`和`postcss.config.js`：
```javascript
//.babelrc
{
  "presets": [
    "env"
  ],
  "plugins": [
    "transform-vue-jsx"
  ]
}
//postcss.config.js
const autoprefixer = require('autoprefixer');

module.exports = {
    plugins: [
        autoprefixer()
    ]
};
```
在webpack.config.js中进行相关配置,rules里面加：
```javascript
{
    test: /\.jsx$/,
    loader: 'babel-loader'
},
{
    test: /\.styl$/,
    use: [
        'style-loader',
        'css-loader',
        {
            loader: 'postcss-loader',
            options: {
                sourceMap: true
            }
        },
        'stylus-loader'
    ]
}
//在原有的基础上增加了花括号里的那部分
```
<b>说明:</b>因为stylus-loder会生成sourceMap，css-loader也会生成sourceMaap，将sourceMap设置为true，就会有：如果stylus-loder已经生成了sourceMap，css-loader就可以直接使用，而不用重新生成，这样就会提高效率。
跑一下
```
npm run dev 
```
没报错，成功了。

## 2-2 实现Todo应用的界面
我们先将之前写在app.vue中的东西删掉,还有index.js中不用的全局变量也需要删掉。然后我们在src下新建todo文件夹，里面放我们的todo应用。在该文件夹下建：`header.vue`, `footer.jsx`, `todo.vue`,因为todo里面还有选项和条目，所以再建两个文件`tabs.vue`和`item.vue`。然后我们还需要一个文件来设置全局的样式，在styles下建`global.styl`,并把它引入`index.js`里。接下来我们就可以填充上面的vue和jsx文件了。
`app.vue`文件，引入需要的组件，写好样式。我们不能在`footer.jsx`中写样式，所以我们需要单独建一个文件，我们在styles下建`footer.styl`。
<b>我们应该把主要数据都声明在一个顶层文件里如`todo.vue`，这样方便管理。</b><br>
我们将这些文件填充好后，项目就完成啦！
