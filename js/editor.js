/**
 * Created by nocoolyoyo on 2017/6/17.
 */

//编辑器对象
var Editor = {};
//Mobile对象
var Mobile = {};

var ViewElems = {
    tools: document.querySelector('#tools'),
    editor:  document.querySelector('#container'),
    mobile:  document.querySelector('article'),
    clipboardBox: document.querySelector('#clipboardBox'),
    clipboard: document.querySelector('#clipContent')
};
var uniId = 0;
//辅助方法对象
var Helper = {
    getMatchLength: function (html) {
        var match = html.match(/\$(\w+)\$/g);
        return match.length;
    },
    //模板处理替换
    templateReplace: function (id,html) {
        // var reg =new RegExp("\\$" + oldVal + "\\$","g");
        return html.replace(/\$(\w+)\$/, '$1'+id)
    },
    //模板输出替换
    templateFilter: function (html) {
        // var reg =new RegExp("\\$" + oldVal + "\\$","g");
        return html
            //移除无用标签
            .replace(/data-view=\"\w+\"/g, '')
            //将data-id替换为版本表示
            .replace(/data-id=\"\w+\"/g, 'sbb-tag');
    },
    //辅助方法对象初始化拓展原生对象方法
    _appendObjLength: function () {
        Object.prototype.getLength = function (){
            return Object.keys(this).length;
        }
    },
    init:function () {
        Helper._appendObjLength();
    }
};
//顶层事件方法对象
var PageEventHander = {
    //为编辑器绑定输入框监听
    _bindOnchange: function () {
        ViewElems.editor.oninput = function (e) {
            e = e||window.event; //兼容IE8
            var target = e.target||e.srcElement;  //判断目标事件
            Mobile.EventsHandler.updateView(target.dataset.model,target.value);

        }
    },
    _getLoopFormat: function (type) {
        var _editorTemp = Editor.ArticleElements[type];
        var _mobileTemp = Mobile.ArticleElements[type];
        var length = Helper.getMatchLength(_editorTemp);
        for(var i = 0; i < length; i++){
            _editorTemp = Helper.templateReplace(uniId,_editorTemp);
            _mobileTemp = Helper.templateReplace(uniId,_mobileTemp);
            uniId++;
        }
        return {
            editorTemp:_editorTemp,
            mobileTemp:_mobileTemp
        }
    },
    addElems: function (type) {
        var template = PageEventHander._getLoopFormat(type);
        //渲染编辑器
        Editor.EventsHandler.addElems(template.editorTemp);
        //渲染Mobile
        Mobile.EventsHandler.addElems(template.mobileTemp);
    },
    delElems: function (elem) {
        var id = elem.dataset.id;
        Editor.EventsHandler.delElems(id);
        //渲染Mobile
        Mobile.EventsHandler.delElems(id);
    },
    openClipboard: function () {
        ViewElems.clipboardBox.style.display = 'block';
        var _outputHtml = Helper.templateFilter(ViewElems.mobile.innerHTML).trim();
        ViewElems.clipboard.value = _outputHtml;
    },
    closeClipboard: function () {
        ViewElems.clipboardBox.style.display = 'none';
    },
    output: function () {
        ViewElems.clipboard.select();
        try{
            if(document.execCommand('copy', false, null)){
                document.execCommand("Copy");
                alert("已复制好，可贴粘。");
            } else{
                alert("复制失败，请手动复制");
            }
        } catch(err){
            alert("复制失败，请手动复制");
        }
    },
    init: function () {
        PageEventHander._bindOnchange();
    }
};
//Mobile配置
Mobile.Config = {
    //参数
    device: 'iphone',
    dpr: 1
};
//Mobile可展示元素
Mobile.ArticleElements = {
    sbbContent: '<section class="sbb-content" data-id="$id$" data-view="$text$">这里是正文内容</section>',
    topTitle:'<div class="top-title" data-id="$id$"><div class="title"><div class="first-title" data-view="$text$">大标题</div><div class="second-title" data-view="$text$">子标题</div></div></div>',
    mainTitle: '<div class="main-title" data-id="$id$" ><div class="title" data-view="$text$">单标题</div></div>',
    subTitle: '<div class="sub-title" data-id="$id$" data-view="$text$">小标题</div>',
    listTitle:'<div class="list-title" data-id="$id$"><span data-view="$text$">01</span><span data-view="$text$">列表标题</span></div>',
    sbbSection1: '<section class="sbb-section1" data-id="$id$"><div class="title" data-view="$text$">我是标题</div><div class="content" data-view="$text$">这里是内容</div></section>',
    messageBox: '<section  class="message-box" data-id="$id$"><img class="avatar"  data-view="$src$" src="./img/avatar.jpg"><div class="content" data-view="$text$">这里是内容</div></section>',
    vedioBox: '<div class="media-box" data-id="$id$" data-view="$align$"><div class="media-inner-box" data-view="$width$" style="width: 100%;"><iframe data-view="$src$" src="./img/timg.jpg"></iframe><div class="title" data-view="$text$">这里是图片标题</div></div></div>',
    imageBox: '<div class="media-box" data-id="$id$" data-view="$align$"><div class="media-inner-box" data-view="$width$" style="width: 100%;"><img  data-view="$src$" src="./img/timg.jpg"><div class="title" data-view="$text$">这里是图片标题</div></div></div>',
    conclusion: '<section data-id="$id$" class="conclusion"><div class="content"  data-view="$text$">这里是结语</div></section>',
    blockquote: '<section data-id="$id$" class="blockquote"><div data-view="$text$">这里是话题导语</div></section>',
    articlequote: '<section class="articlequote" data-id="$id$"><div data-view="$text$">这里是导语</div></section>',
    introduction: '<section class="introduction"  data-id="$id$"><div data-view="$text$">这里替换内容</div></section>'
};
//Mobile处理页面事件
Mobile.EventsHandler = {
    //新增元素
    addElems: function (template) {
        ViewElems.mobile.innerHTML += template;
    },
    delElems: function (id){
        var mobileElem = ViewElems.mobile.querySelector('[data-id='+id+']');
        mobileElem.parentNode.removeChild(mobileElem);
        mobileElem = null;
    },
    //根据input变化更新视图
    updateView: function (id,value) {
        var viewElem = ViewElems.mobile.querySelector('[data-view='+id+']');

        console.log(viewElem)
        if(id.match(/text/)&&viewElem.dataset.view === id){
            viewElem.innerText = value;
            return;
        }
        if(id.match(/src/)&&viewElem.dataset.view === id){
            viewElem.src = value;
            return;
        }
        if(id.match(/width/)&&viewElem.dataset.view === id){
            viewElem.style.width = value+'%';
        }
        if(id.match(/align/)&&viewElem.dataset.view === id){
            if(value===1){
                viewElem.style.justifyContent = 'flex-start';
                viewElem.style.alignItems = 'flex-start';
                return;
            }
            if(value===2){
                viewElem.style.justifyContent = 'center';
                viewElem.style.alignItems = 'center';
                return;
            }
            if(value===3){
                viewElem.style.justifyContent = 'flex-end';
                viewElem.style.alignItems = 'flex-end';
            }
            // viewElem.style.width = value+'%';
        }
    }
};
//Mobile初始化
Mobile.Init = function () {
    // 设置 dpr 和 font-size
    var appRootElem = document.querySelector('#app');
    var clientWidth = appRootElem.clientWidth;

    appRootElem.dataset.dpr = Mobile.Config.dpr;
    appRootElem.style.fontSize = clientWidth / 10 + 'px';
};

Editor.Config = {

};
//编辑器处理页面事件
Editor.EventsHandler = {
    //新增元素
    addElems: function (template) {
        ViewElems.editor.innerHTML += template;
    },
    //删除元素
    delElems: function (id) {
        var editorElem = ViewElems.editor.querySelector('[data-id='+id+']');
        editorElem.parentNode.removeChild(editorElem);
        editorElem = null;
    }
};
//编辑器工具栏对象
Editor.tools = {
    //编辑器工具栏元素
    items: [{id: 'sbbContent', title:'内容块'},
            {id: 'topTitle',   title:'大标题'},
            {id: 'mainTitle',  title:'单标题'},
            {id: 'subTitle',   title:'小标题'},
            {id: 'listTitle',  title:'列表标题'},
            {id: 'sbbSection1',title:'内容类型1'},
            {id: 'messageBox', title:'消息盒'},
            {id: 'vedioBox',   title:'视频盒'},
            {id: 'imageBox',   title:'图片盒'},
            {id: 'conclusion', title:'结语'},
            {id: 'blockquote', title:'话题导语'},
            {id: 'articlequote',title:'导语'},
            {id: 'introduction',title:'引言'}],
    //编辑器工具栏元素节点生成
    _renderItems: function () {
        var tools = document.querySelector('#tools');
        var temp = '';
        for(var i = 0; i < Editor.tools.items.length; i++){
            temp += '<div class="tools-item" data-id="'+Editor.tools.items[i].id+'">';
            temp += Editor.tools.items[i].title;
            temp += '</div>';
        }
        tools.innerHTML = temp;
    },
    _bindEvents: function () {
        //编辑器工具栏事件管理
        ViewElems.tools.onclick = function (e) {
            e = e||window.event; //兼容IE8
            var target = e.target||e.srcElement;  //判断目标事件
            //绑定添加
            if(target.className==="tools-item")
                PageEventHander.addElems(target.dataset.id);
        };
        //编辑器内节点事件管理
        ViewElems.editor.onclick = function (e) {
            e = e||window.event; //兼容IE8
            var target = e.target||e.srcElement;  //判断目标事件
            //绑定删除
            if(target.className==="clear")
                PageEventHander.delElems(target.parentNode.parentNode);
        };
    },
    //编辑器工具栏初始化
    init: function () {
        Editor.tools._renderItems();
        Editor.tools._bindEvents();
    }
};

//编辑器可选元素
Editor.ArticleElements = {
    sbbContent:  '<div class="block" data-id="$id$">'+
                '<div class="header">'+
                '<div class="title">内容块</div>'+
                '<div class="clear">×</div>'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">内容：</span><textarea class="input" value="这里是内容"  data-model="$text$"></textarea>'+
                '</div>'+
                '</div>',
    topTitle: '<div class="block" data-id="$id$">'+
                '<div class="header">'+
                '<div class="title">大标题</div>'+
                '<div class="clear">×</div>'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">标题：</span><input class="input" data-model="$text$" value="大标题">'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">子标题：</span><input class="input" data-model="$text$" value="子标题">'+
                '</div>'+
                '</div>',
    mainTitle: '<div class="block" data-id="$id$">'+
                    '<div class="header">'+
                        '<div class="title">大标题</div>'+
                        '<div class="clear">×</div>'+
                    '</div>'+
                    '<div class="content">'+
                            '<span class="title">标题：</span><input class="input" data-model="$text$" value="大标题">'+
                    '</div>'+
                '</div>',
    subTitle: '<div class="block" data-id="$id$">'+
                '<div class="header">'+
                '<div class="title">小标题</div>'+
                '<div class="clear">×</div>'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">标题：</span><input class="input" value="这里是标题"  data-model="$text$" value="小标题">'+
                '</div>'+
                '</div>',
    listTitle: '<div class="block" data-id="$id$">'+
                    '<div class="header">'+
                        '<div class="title">列表标题</div>'+
                        '<div class="clear">×</div>'+
                    '</div>'+
                    '<div class="content">'+
                        '<span class="title">序号：</span><input class="list-input" value="01" data-model="$text$">'+
                        '<span class="title">标题：</span><input class="input" value="这里是标题"  data-model="$text$">'+
                        // '<span class="clear">×</span>'+
                    '</div>'+
                '</div>',
    sbbSection1: '<div class="block" data-id="$id$">'+
                        '<div class="header">'+
                        '<div class="title">内容类型1</div>'+
                        '<div class="clear">×</div>'+
                    '</div>'+
                    '<div class="content">'+
                        '<span class="title">标题：</span><input class="input" value="这里是标题"  data-model="$text$">'+
                        // '<span class="clear">×</span>'+
                    '</div>'+
                    '<div class="content">'+
                        '<span class="title">内容：</span><textarea class="input" value="这里是内容" data-model="$text$"></textarea>'+
                        // '<span class="clear">×</span>'+
                    '</div>'+
                    '</div>',
    messageBox: '<div class="block" data-id="$id$">'+
                    '<div class="header">'+
                    '<div class="title">消息盒子</div>'+
                    '<div class="clear">×</div>'+
                '</div>'+
                '<div class="content">'+
                    '<span class="title">链接：</span><input class="input" value="./img/avatar.jpg"  data-model="$src$">'+
                    // '<span class="clear">×</span>'+
                '</div>'+
                '<div class="content">'+
                    '<span class="title">内容：</span><textarea class="input" value="这里是内容"  data-model="$text$"></textarea>'+
                    // '<span class="clear">×</span>'+
                '</div>'+
                '</div>',
    vedioBox: '<div class="block" data-id="$id$">'+
                    '<div class="header">'+
                    '<div class="title">视频盒子</div>'+
                    '<div class="clear">×</div>'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">对齐：</span>' +
                '<select class="input"  data-model="$align$">'+
                '<option  value = "1">左对齐</option >'+
                '<option  value = "2" selected = "selected">居中</option>'+
                '<option  value = "3">右对齐</option>'+
                '</select >'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">大小：</span><input class="input" value="100" type="range" min="10" max="100" step="5"  data-model="$width$">'+
                // '<span class="clear">×</span>'+
                '</div>'+
                '<div class="content">'+
                    '<span class="title">链接：</span><input class="input" value="这里极大似"  data-model="$src$">'+
                    // '<span class="clear">×</span>'+
                '</div>'+
                '<div class="content">'+
                    '<span class="title">标题：</span><input class="input" value="这里极大似"  data-model="$text$">'+
                    // '<span class="clear">×</span>'+
                '</div>'+
                '</div>',
    imageBox: '<div class="block" data-id="$id$">'+
                '<div class="header">'+
                '<div class="title">图片盒子</div>'+
                '<div class="clear">×</div>'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">对齐：</span>' +
                '<select class="input"  data-model="$align$">'+
                '<option  value = "1">左对齐</option >'+
                '<option  value = "2" selected = "selected">居中</option>'+
                '<option  value = "3">右对齐</option>'+
                '</select >'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">大小：</span><input class="input" value="100" type="range" min="10" max="100" step="5" data-model="$width$">'+
                // '<span class="clear">×</span>'+
                '</div>'+

                '<div class="content">'+
                '<span class="title">链接：</span><input class="input" value="./img/timg.jpg"  data-model="$src$">'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">标题：</span><input class="input" value="这里是标题"  data-model="$text$">'+
                '</div>'+


                '</div>',
    conclusion:  '<div class="block" data-id="$id$">'+
                '<div class="header">'+
                '<div class="title">结语</div>'+
                '<div class="clear">×</div>'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">内容：</span><textarea class="input" value="这里是内容"  data-model="$text$"></textarea>'+
                // '<span class="clear">×</span>'+
                '</div>'+
                '</div>',
    blockquote:  '<div class="block" data-id="$id$">'+
                '<div class="header">'+
                '<div class="title">话题导语</div>'+
                '<div class="clear">×</div>'+
                '</div>'+
                '<div class="content">'+
                '<span class="title">内容：</span><textarea class="input" value="这里是内容"  data-model="$text$"></textarea>'+
                // '<span class="clear">×</span>'+
                '</div>'+
                '</div>',
    articlequote: '<div class="block" data-id="$id$">'+
                    '<div class="header">'+
                    '<div class="title">导语</div>'+
                    '<div class="clear">×</div>'+
                    '</div>'+
                    '<div class="content">'+
                    '<span class="title">内容：</span><textarea class="input" value="这里是内容"  data-model="$text$"></textarea>'+
                    // '<span class="clear">×</span>'+
                    '</div>'+
                    '</div>',
    introduction: '<div class="block" data-id="$id$">'+
                    '<div class="header">'+
                    '<div class="title">引言</div>'+
                    '<div class="clear">×</div>'+
                    '</div>'+
                    '<div class="content">'+
                    '<span class="title">内容：</span><textarea class="input" value="这里是内容"  data-model="$text$"></textarea>'+
                    '</div>'+
                    '</div>'
};

//编辑器初始化
Editor.Init = function () {
    Editor.tools.init()
};

var Run = function () {
    Helper.init();
    PageEventHander.init();
    Mobile.Init();
    Editor.Init();

};

Run();



