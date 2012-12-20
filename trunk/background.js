/*
功能：人人2B过滤器
创建：2012.03.19
作者：笃行天下
微信：rrsbfilter
电邮：IamSigma.js@gmail.com
反馈：http://rrurl.cn/hM9mhk
版本：1.3.0
更新：2012年10月15日 01:16:35
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
//异步加载
chrome.webRequest.onCompleted.addListener(
  function(details){
  	var url = details.url ,
  		//http://photo.renren.com/photo/105663055/photo-5733354611/ajax
  		regPhoto = new RegExp(/^http:\/\/photo\.renren\.com\/photo\/\d{9}\/.+\/ajax/),//相册
  		//http://status.renren.com/feedcommentretrieve.do
  		regCmt1 = new RegExp(/^http:\/\/status\.renren\.com\/feedcommentretrieve\.do/),//首页-展开评论1
  		//http://page.renren.com/600002874/album/replyList 主页相册
  		//http://page.renren.com/699153758/note/replyList 主页日志
		//http://page.renren.com/doing/replyList 主页状态
  		regCmt2 = new RegExp(/^http:\/\/page\.renren\.com\/(\d{9}\/(album|note)|doing)\/replyList/);//首页-展开评论2
  		regCmt3 = new RegExp(/http:\/\/www\.renren\.com\/feedretrieve2\.do/);//首页-新鲜事
  		regCmt4 = new RegExp(/http:\/\/zhan\.renren\.com\/.*\/\d+\/comment\/list/);//小站
  		regCmt5 = new RegExp(/http:\/\/share\.renren\.com\/share\/showcomment\.do/);//我的分享-评论
  		regCmt6 = new RegExp(/http:\/\/share\.renren\.com\/share\/getmorecomment\.do/);//他人的分享-评论
  		regCmt7 = new RegExp(/http:\/\/share\.renren\.com\/share\/comment\/moreurlcomment/);//他人的视频分享-显示较早之前的评论

  	if ( regPhoto.test(url) || regCmt1.test(url) || regCmt2.test(url) || regCmt3.test(url) || regCmt4.test(url) || regCmt5.test(url) || regCmt6.test(url) || regCmt7.test(url) ) {
	  	chrome.tabs.executeScript(null, {file:"killer.js"});
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