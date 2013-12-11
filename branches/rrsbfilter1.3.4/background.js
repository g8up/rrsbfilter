/*
功能：人人2B过滤器
创建：2012.03.19
作者：笃行天下
微信：rrsbfilter
电邮：IamSigma.js@gmail.com
反馈：http://rrurl.cn/hM9mhk
版本：1.3.3
更新：2013年12月8日 03:02:37
*/
var isOpen = true ,
	DELAY_POPICON = 2000,
	DELAY_KILLEDICON = 5000,
	scanCount = 0,//检测总数
	SBNumCurPage = 0;

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		switch( request.action ){
			case 'getIsOpen':
				sendResponse({'isOpen': isOpen});
				break;
			case 'setKilledNum':
				if( parseInt(request.killedNum) > 0 ){
					setBadge( request.killedNum + 'sb' ,  [255 , 0, 0, 100] );
					removeBadge( DELAY_KILLEDICON );
				}else{
					setBadge( request.killedNum + 'sb' ,  [0 , 255, 0, 100] );
					removeBadge( DELAY_KILLEDICON );
				}
				break;
			default:break;
		}
	}
);

chrome.browserAction.onClicked.addListener(function(tabs) {
	switchIcon();
	isOpen = !isOpen ;
	chrome.tabs.executeScript(null, {file:"killer.js"});
});

//需要处理的异步请求集合
var asynchReqSet = [
	{
		title:'相册',
		//http://photo.renren.com/photo/105663055/photo-5733354611/ajax
		reg:/^http:\/\/photo\.renren\.com\/photo\/\d{9}\/.+\/ajax///
	},
	{
		title:'首页-日志评论',
		//http://status.renren.com/feedcommentretrieve.do
		reg:/^http:\/\/status\.renren\.com\/feedcommentretrieve\.do///
	},
	{
		title:'首页-新鲜事评论',
		//http://page.renren.com/600002874/album/replyList 相册
		//http://page.renren.com/699153758/note/replyList 日志
		//http://page.renren.com/600002570/photo/replyList 公共主页-图片
		//http://page.renren.com/699139427/share/replyList
		//http://page.renren.com/doing/replyList 公共主页-状态
		reg:/^http:\/\/page\.renren\.com\/((\d{9}\/(album|note|photo|share))|doing)\/replyList/
	},
	{
		title:'首页-更多新鲜事',
		reg:/http:\/\/www\.renren\.com\/feedretrieve\d\.do/
	},
	{
		title:'小站',//“较早的评论”
		reg:/http:\/\/zhan\.renren\.com\/.*\/\d+\/comment\/list/
	},
	{
		title:'我的分享-评论',
		reg:/http:\/\/share\.renren\.com\/share\/showcomment\.do/
	},
	{
		title:'好友的分享-评论',
		reg:/http:\/\/share\.renren\.com\/share\/getmorecomment\.do/
	},
	{
		title:'好友的视频分享-显示较早之前的评论',
		reg:/http:\/\/share\.renren\.com\/share\/comment\/moreurlcomment/
	},
	{
		title:'好友的最新相册',
		reg:/http:\/\/photo\.renren\.com\/photo\/\d{9}\/photo\-\d+\/ajaxmsy/
	},
	{//added by 1.3.3
		title:'首页-好友-图片动态-还有N条回复',
		reg:/http:\/\/photo\.renren\.com\/photo\/feedcommentretrieve\.do/
	},
	{
		title:'我的分享-列表-异步评论',
		reg:/http:\/\/share\.renren\.com\/share\/comment\/getcomments/
	}
	,{
		title:'留言板-好友',
		reg:/http:\/\/gossip\.renren\.com\/ajaxgossiplist\.do/
	}
	,{
		title:'留言板-个人',
		reg:/http:\/\/gossip\.renren\.com\/getconversation\.do/
	}
	,{
		title:'公共主页-相册',
		reg:/http:\/\/page\.renren\.com\/ajaxcomment\/list/
	}
	,{
		title:'公共主页-相册2',
		reg:/http:\/\/page\.renren\.com\/ajaxgetphoto\.do/
	}
	,{
		title:'公共主页-相册2-翻页',
		reg:/http:\/\/page\.renren\.com\/ajaxgetphotocomment/
	}
];

//异步加载
var executeScriptTimer;
chrome.webRequest.onCompleted.addListener(function(details){
  	var url = details.url;
  	for( var i = 0 , len = asynchReqSet.length; i < len ; i++ ){
  		if( asynchReqSet[i].reg.test( url ) ){
  			clearTimeout( executeScriptTimer );
		  	executeScriptTimer = setTimeout(function(){
		  		chrome.tabs.executeScript(null, {file:"killer.js","runAt":"document_end"});
	  			console.log( asynchReqSet[i].title , url );//调试信息
	  		},1e3 );
		  	break;
  		}
  	}
},
{urls: ["http://*.renren.com/*"]});

function setBadge( text , color ){
	chrome.browserAction.setBadgeText({"text": text || ''});
	color && chrome.browserAction.setBadgeBackgroundColor({"color": color });
}

function removeBadge( delay ){//移除标记
	clearTimeout( window["t"] );
	window["t"] = setTimeout(function(){
		setBadge();
		clearTimeout( window["t"] );
	}, delay );
}

function switchIcon(){
	var icon = "logo48.png",
		badgeText = 'OPN',
		color = [255, 0, 0, 50];
	if( isOpen ){//2B allowed
		icon = "logo48_.png";
		badgeText = 'CLS';
		color = [0, 255, 0, 50];
	}
	chrome.browserAction.setIcon({path:icon});
	setBadge( badgeText, color );
	removeBadge( DELAY_POPICON );
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-31304107-1']);
_gaq.push(['_trackPageview']);

document.addEventListener('DOMContentLoaded', function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.querySelector('body');
	s.appendChild(ga, s);
});