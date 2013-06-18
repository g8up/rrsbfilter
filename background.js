/*
功能：人人2B过滤器
创建：2012.03.19
作者：笃行天下
微信：rrsbfilter
电邮：IamSigma.js@gmail.com
反馈：http://rrurl.cn/hM9mhk
版本：1.3.2
更新：2013年6月16日 14:01:19
*/
var isOpen = true ,
	DELAY_POPICON = 2000,
	DELAY_KILLEDICON = 5000,
	SBNumCurPage = 0;

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		switch( request.action ){
			case 'getIsOpen':
				sendResponse({isOpen: isOpen});
				break;
			case 'setKilledNum':
				if( parseInt(request.killedNum) > 0 ){
					setBadge( request.killedNum + 'sb' ,  [255 , 0, 0, 100] );
					removeBadge( DELAY_KILLEDICON );
				}else{
					setBadge( request.killedNum + 'sb' ,  [0 , 255, 0, 100] );
					removeBadge( DELAY_KILLEDICON );
				}
				SBNumCurPage += parseInt(request.killedNum);//累加
				break;
			case 'getSBNumCurPage':
				sendResponse({SBNumCurPage: SBNumCurPage});
				break;
			default:break;
		}
	}
);

chrome.browserAction.onClicked.addListener(function(tabs) {
	switchIcon();
	isOpen = !isOpen ;
	isOpen ? console.log('\u4EBA\u4EBA2B\u8FC7\u6EE4\u5668OPEN -' + getTime()) : console.log('\u4EBA\u4EBA2B\u8FC7\u6EE4\u5668CLOSE-' + getTime());
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
	  		title:'他人的分享-评论',
	  		reg:/http:\/\/share\.renren\.com\/share\/getmorecomment\.do/
	  	},
	  	{
	  		title:'他人的视频分享-显示较早之前的评论',
	  		reg:/http:\/\/share\.renren\.com\/share\/comment\/moreurlcomment/
	  	},
	  	{
	  		title:'我的分享-列表-异步评论',
	  		reg:/http:\/\/share\.renren\.com\/share\/comment\/getcomments/
	  	}
	  	,{//http://gossip.renren.com/ajaxgossiplist.do
	  		title:'留言板-好友',
	  		reg:/http:\/\/gossip\.renren\.com\/ajaxgossiplist\.do/
	  	}
	  	,{//http://gossip.renren.com/getconversation.do
	  		title:'留言板-个人',
	  		reg:/http:\/\/gossip\.renren\.com\/getconversation\.do/
	  	}
	  	,{
	  		title:'公共主页-相册',
	  		reg:/http:\/\/page\.renren\.com\/ajaxcomment\/list/
	  	}
];

//异步加载
chrome.webRequest.onCompleted.addListener(
  function(details){
  	var url = details.url;
  	for( var i = 0 , len = asynchReqSet.length; i < len ; i++ ){
  		if( asynchReqSet[i].reg.test( url ) ){
  			console.log('synch-title:' + asynchReqSet[i].title + '-' + url );//调试信息
		  	chrome.tabs.executeScript(null, {file:"killer.js"});
		  	break;
  		}
  	}
  }, {urls: ["http://*.renren.com/*"]}
);


function getTime(){
	var str = '',
		d = new Date(),
		h = d.getHours(),
		m = d.getMinutes(),
		s = d.getSeconds();
	str = h + ':' + ( m < 10 ? '0' + m : m ) + ':' + ( s < 10 ? '0' + s : s );
	return str;
}

function setBadge( text , color ){
	chrome.browserAction.setBadgeText({"text": text || ''});
	color && chrome.browserAction.setBadgeBackgroundColor({"color": color });
}

function removeBadge( delay ){
	//移除标记
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