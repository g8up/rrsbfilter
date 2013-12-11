/*
功能：人人2B过滤器
创建：2012.03.19
作者：笃行天下
微信：rrsbfilter
电邮：IamSigma.js@gmail.com
反馈：http://rrurl.cn/hM9mhk
版本：1.3.3
更新：2013年12月8日 03:02:32
*/
var VERSION = '1.3.3';
var isOpen = true;
var SBWORD = [
'互访', '求来访', '求关注', '求人气', '求围观', '求访', '访必回','互粉',
'关注我','互踩','刷人气','加好友','加我好友','求交往','求交友','请关注',
'速进','联系我','见状态','回访','欢迎来访','加微信',
'来看看吧','瘦身', '减肥','减重','淘宝兼职','淘宝店',
'taobao\.com'
];
//堆积的高频无意义纯字符
var punctuations = ['\\.','·','。',',','，','`','…','~','0','1','2','3','='];
var selectorSet = {
	'page':{item:'div.replies .p-reply',cmt:'p.text'},//公共主页
	'main':{item:'.feed-replies .a-reply',cmt:'p.text'},//首页
	'gossip':{item:'#talk .cmt-body',cmt:'div.text-content'},
	'blog':{item:'div.statuscmtitem.clearfix',cmt:'span.replycontent'},
	'status':{item:'div.statuscmtlist div.statuscmtitem:not([class~="reply-adding"])',cmt:'span.replycontent'}
}
var pageSet = [
	{
		title:'我的分享列表',//首页匹配范围的子集，所以置于首页前1.3.1
		reg:/http:\/\/www\.renren\.com\/\d{9}#!?\/\/share\/share\/\d{9}/,
		selector:{item:'.usertalk .replybody',cmt:'span.replycontent'}
	}
	,{
		title:'个人状态',//所有状态(未解决)
		reg:/http:\/\/www\.renren\.com\/\d{9}#\/\/status\/status/,
		selector:selectorSet['status']
	}
	,{//1.3.3
		title:'与我相关-我参与的',
		reg:/http:\/\/www\.renren\.com\/\d{9}#!\/\/matter/,
		selector:selectorSet['status']
	}
	,{//1.3.1
		title:'首页',
		reg:/http:\/\/www\.renren\.com\/\d{9}(((\?.*)?$)|((#.*)$))/,
		selector:selectorSet['main']
	}
	,{
		title:'个人主页',
		reg:/http:\/\/www\.renren\.com\/\d{9}\/profile/,
		selector:selectorSet['main']
	}
	,{
		title:'个人日志',
		reg:/http:\/\/blog\.renren\.com\/blog\/\d{9}\/.+/,
		selector:selectorSet['blog']
	}
	,{
		title:'留言板-好友',
		reg:/http:\/\/gossip\.renren\.com\/getgossiplist\.do\?id=\d{9}/,
		selector:selectorSet['gossip']
	}
	,{
		title:'留言板-个人',
		reg:/http:\/\/gossip\.renren\.com\/.*/,
		selector:selectorSet['gossip']
	}
	,{//1.3.1
		title:'公共主页日志',//公共主页首页的子集，前置
		reg:/http:\/\/page\.renren\.com\/.+\/note\/\d+/,
		selector:{item:'#commentlist li',cmt:'div.text-content'}
	}
	,{//1.3.3
		title:'公共主页日志2',//公共主页首页的子集，前置
		reg:/http:\/\/page\.renren\.com\/\d{9}\/channel\-noteshow/,
		selector:selectorSet['page']
	}
	,{//1.3.1
		title:'公共主页相册',
		reg:/http:\/\/page\.renren\.com\/\d{9}\/channel\-photoshow/,
		selector:selectorSet['page']
	}
	,{//1.3.3
		title:'公共主页相册2',
		reg:/http:\/\/page\.renren\.com\/\d{9}\/photo\/\d+/,
		selector:{item:'dl.replies dd',cmt:'p.content'}
	}
	,{//1.3.1
		title:'公共主页首页',
		reg:/http:\/\/page\.renren\.com\/\d{9}/,
		selector:selectorSet['main']
	}
	,{//1.3.1
		title:'小组',
		reg:/http:\/\/xiaozu\.renren\.com\/xiaozu\/\d+\/.+/,
		selector:{item:'.greply-area .floor-body',cmt:'div.floor-content'}
	}
	,{//1.3.1
		title:'小站',
		reg:/http:\/\/zhan\.renren\.com\/.*/,
		selector:{item:'.reply-list li',cmt:'span.comment-text'}
	}
	,{//1.3.1
		title:'他人分享',
		reg:/http:\/\/share\.renren\.com\/share\/\d{9}/,
		selector:selectorSet['blog']
	}
	,{//1.3.1
		title:'日志分享',
		reg:/http:\/\/blog\.renren\.com\/share\/\d{9}/,
		selector:{item:'#cmtsListCon>div.replies div.statuscmtitem.clearfix',cmt:'span.replycontent'}
	}
	,{
		title:'个人相册',//图片列表、图片详情
		reg:/http:\/\/photo\.renren\.com\/photo\/\d{9}/,
		selector:{item:'div.replies dl.replies dd:not([class^="digger"])' ,cmt:'p.content'}
	}
	,{
		title:'好友最新相册',
		reg:/http:\/\/photo\.renren\.com\/\d{9}#!\/photo\/\d{9}\/album\/friends/,
		selector:{item:'ul.photoViewerCommentsList li' ,cmt:'div'}
	}
];

chrome.extension.sendRequest({action: "getIsOpen"},function(response) {
	response.isOpen && killer();
});

function killer(){
	var curURL = window.location.href.toLowerCase();
	for( var i = 0 ,l = pageSet.length; i < l ; i ++){
		var curPage = pageSet[i];
		if( curPage.reg.test(curURL)){
			superKiller( curPage );
			break;
		}
	}
}

function setKilledNum( killedNum , scanCount ) {//设置回显个数
	var body = document.querySelector('body');
	body.setAttribute('rrsb_scancount', +(body.getAttribute('rrsb_scancount')||0) + scanCount );
	body.setAttribute('rrsb_killednum', +(body.getAttribute('rrsb_killednum')||0) + killedNum );

	chrome.extension.sendRequest({
		action: "setKilledNum",
		killedNum: killedNum + ''
	});
}
/*{
	item:containerId,容器id和item标签名，如'#comment_list dd'
	cmt:commentId  评论内容标签名，如'p.content span'
}*/
function superKiller( json ){
	try{
		var curPage = json.selector,
			pageTitle = json.title,
			itemSelector = curPage.item,
			cmtSelector = curPage.cmt;
		var items = document.querySelectorAll( itemSelector + ':not([rrsb])' );
		var len = items.length,
			curScanCount = 0,//本次扫描个数
			killedNum = 0;//本次sb
		if( len ){
			for( var i = 0 ; i < len ; i ++ ){
				var item = items[i];
				var cmtNode = item.querySelector( cmtSelector );
				if( cmtNode ){
					var	cmt = cmtNode.innerText;
					if( cmt && filter( cmt ) ){
						howToTreatSB( item , i , cmt );
						killedNum ++;
					}
					item.setAttribute("rrsb",1);
					curScanCount++;
				}
			}
			setKilledNum( killedNum , curScanCount );
			loger( killedNum, curScanCount , pageTitle );
		}else{
			dataCollector({
				page: pageTitle,
				total: curScanCount,
				sb: killedNum,
				msg:''
			});
		}
	}catch( e ){
		var url = encodeURIComponent( window.location.href ),
			error =  encodeURIComponent( e.toString() );
		if( !+localStorage.getItem( url ) ){
			localStorage.setItem( url , 1 );
			report( 'url=' + url + '&error=' + error );
		}
	}
}

function report( msg ){
	new Image().src = "http://xuediannao.sinaapp.com/chrome/rrsbfilter/infocenter.php?istest=0&" + msg;
}

/**
 *处理结果收集，用于功能过期预警
 *added 2013.05.19 ver1.3.2
 */
function dataCollector( json ){
	if( localStorage ){
		var prefix = getDay(),
		itemName   = prefix + '_' + window.location.href ;
		if( !+localStorage.getItem( itemName ) ){
			json.uid  = getId();
			if( json.uid ){
				json.url  = window.location.href;
				json.ver  = VERSION;
				var paras = [];
				for ( var i in json ){
					paras.push( i + '=' + encodeURIComponent( json[i] ) );
				}
				report( paras.join('&') );
			}
			localStorage.setItem( itemName , 1 );
		}
	}
}

function filter ( cmt ) {
	var _cmt = cmt.trim(),
		comm = getChinese( _cmt );
	if (comm == '') {//没有中文
		return punctuationFilter( _cmt );
	}
	for (var d = 0,	l = SBWORD.length; d < l; d++) {//扫描屏蔽词
		if (comm.indexOf(SBWORD[d]) >= 0) {
			return true;
		}
	}
	return false;
}

function punctuationFilter( cmt ){//过滤符号堆积的评论
	var comm = filtChinese( cmt );
	if( comm == '' ){
		return false;
	}
	for (var i = 0 ; i < punctuations.length; i++) {
		var reg = new RegExp( punctuations[i] + "+");
		if(comm.replace( reg , '') == ''){
			return true;
		}
	}
	return false;
}

var SBCmt = [];

function howToTreatSB( SBNode , i , cmt ){
	var n = 30 ,
	tBlur  = setInterval(function(){
		n--;
		SBNode.style.opacity = (n/100)+'';
		if(n==6){
			clearInterval( tBlur );
		}
	},400);
	SBCmt.push( { '屁':cmt.trim() } );
}

function loger ( killedNum, curScanCount, pageTitle ) {
	var body = document.querySelector('body'),
		scanCountPage = body.getAttribute('rrsb_scancount')||0,
		killedNumPage = body.getAttribute('rrsb_killednum')||0;
	console.log(
		'\n【人人2B过滤器\'s log】',
		'\n' + pageTitle + '：'+ window.location.href,
		'\n本次 SB ：' + killedNum + '/' + curScanCount ,
		'\n本页 SB ：' + killedNumPage + '/' + scanCountPage,
		'\n用户反馈：http://rrurl.cn/hM9mhk',
		'\n执行时刻：' + getTime() + '\n'
	);
	if( SBCmt.length ){
		console.table( SBCmt );
		SBCmt.length = 0;
	}
}

function getTime() {
	var str = '',
	d = new Date(),
	h = d.getHours(),
	m = d.getMinutes(),
	s = d.getSeconds();
	str = h + ':' + (m < 10 ? '0' + m: m) + ':' + (s < 10 ? '0' + s: s );
	return str;
}

function getDay(){
	var d = new Date(),
	y = d.getFullYear(),
	m = d.getMonth()+1,
	da = d.getDate();
	return y + '-' + m + '-' + da;
}

function getId(){
	var index = document.querySelector('#navBar .nav-main .menu-title a');
	if( index.length ){
		href = index.href;
		var id = href.replace(/http:\/\/.*\..*\.com\//,'');
		if( id.indexOf('id') > -1 ){
			id = id.replace(/home\?id=/,'');
		}
		return id;
	}
	return '';
}

function getChinese( str ) {
	 return str.replace( /[^\u4e00-\u9fa5]+/g , "" );
}

function filtChinese( str ){
	return str.replace( /[\u4e00-\u9fa5]+/g , "" );
}