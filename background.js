/*
功能：人人2B过滤器
创建：2012.03.19
版本：1.2.3
更新：2012.04.03
作者：笃行天下
电邮:IamSigma.js@gmail.com
反馈：http://rrurl.cn/hM9mhk
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

chrome.webRequest.onCompleted.addListener(
  function(details){
  	var url = details.url ,
  		//http://photo.renren.com/photo/105663055/photo-5733354611/ajax
  		regPhoto = new RegExp(/^http:\/\/photo\.renren\.com\/photo\/\d{9}\/.+\/ajax/),//相册
  		//http://status.renren.com/feedcommentretrieve.do 
  		regCmt1 = new RegExp(/^http:\/\/status\.renren\.com\/feedcommentretrieve\.do/),//首页评论1
  		//http://page.renren.com/600002874/album/replyList 主页相册
  		//http://page.renren.com/699153758/note/replyList 主页日志
		//http://page.renren.com/doing/replyList 主页状态
  		regCmt2 = new RegExp(/^http:\/\/page\.renren\.com\/(\d{9}\/(album|note)|doing)\/replyList/);//首页评论2
  		//http://zhan.renren.com/topzhan/3674946092039551080/comment/list/top?count=100 小站
  		regCmt3 = new RegExp(/http:\/\/zhan\.renren\.com\/topzhan\/\d+\/comment\/list\/top/);

  	if ( regPhoto.test(url) || regCmt1.test(url) || regCmt2.test(url) || regCmt3.test(url)) {
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
