/*
功能：人人2B过滤器
创建：2012.03.19
版本：1.2.3
更新：2012.04.03
作者：笃行天下
电邮:IamSigma.js@gmail.com
反馈：http://rrurl.cn/hM9mhk
*/
var isOpen = true;
var killedNum = 0;//本次sb
var len = 0 ; //本次扫描总数
//词库目前不够智能，向误伤的孩纸表示哀怜，后续会更新成动态词库 -Sigma
var SBWORD = [
'求互访', '求来访', '求关注', '求人气', '求围观', '求访客','求访', '互访','访必回',
'加好友','关注我','加我好友','求交往','求交友','互踩','刷人气',
'瘦身', '减肥','减重','速进','联系我','见状态',
'来访','回访','来看看吧','关注'
];

chrome.extension.sendRequest({
		action: "getIsOpen"
	},
	function(response) {
		isOpen = response.isOpen;
		if (isOpen) {
			killer();
		}
});

function killer(){
	//杀SB集中营
	var curURL = window.location.href.toLowerCase(),
	//http://www.renren.com/103433276
	//http://www.renren.com/236499442?portal=homeFootprint&ref=home_footprint
	//http://www.renren.com/103433276/profile
	//http://www.renren.com/103433276#/103433276
	regPerson  = new RegExp(/http:\/\/www\.renren\.com\/\d{9}((\?.*)?|\/profile|#.*)/),//个人主页
	//http://gossip.renren.com/getgossiplist.do?id=236499442&age=recent
	regComment = new RegExp(/http:\/\/gossip\.renren\.com\/getgossiplist\.do\?id=\d{9}/),//留言板
	//http://page.renren.com/699153758/note/813996479?re
	regPage    = new RegExp(/http:\/\/page\.renren\.com\/.+\/note\/\d+/), //公共主页日志
	//http://blog.renren.com/blog/243278337/813798012?fromfriendblog
	//http://blog.renren.com/blog/236499442/788024815
	regBlog    = new RegExp(/http:\/\/blog\.renren\.com\/blog\/\d{9}\/.+/),//个人日志
	//http://xiaozu.renren.com/xiaozu/137061/336284849
	//http://xiaozu.renren.com/xiaozu/137061/thread/336526378?home(未优化dom结构)
	regGroup  = new RegExp(/http:\/\/xiaozu\.renren\.com\/xiaozu\/\d+\/.+/);//小组
	//http://page.renren.com/600002874/photo/5735164746?ref=
	regPhoto = new RegExp(/http:\/\/page\.renren\.com\/\d{9}\/photo\/\d+/);//相册
	//http://zhan.renren.com/topzhan?ref=hotnewsfeed&sfet=3732&fin=27&ff_id=&from=PubNewFeed（观察）
	//regZhan(小站)

	if(regPerson.test(curURL)){
		killPerson();
	}else if(regPage.test(curURL)) {
		killPage();
	}else if(regBlog.test(curURL) || regPhoto.test(curURL)){
		killBlog();
	}else if(regGroup.test(curURL)){
		killGroup();
	}
	setKilledNum(killedNum); 
	loger(len);//日志输出
}

function setKilledNum(n) {//设置回显个数
	chrome.extension.sendRequest({
		action: "setKilledNum",
		killedNum: n + ''
	});
}

function killGroup ( ) {
	var contents = document.getElementsByClassName('content');
	if(contents){
		len = contents.length;
		for (var i = 0 ; i < len; i++ ) {
			var cmtObj = contents[i],
			cmt        = cmtObj.innerHTML;
			if( filter(cmt) ){
				var p = cmtObj.parentNode.parentNode;//<div>
				if ( p.tagName.toLowerCase() == 'li' ) {
					howToTreatSB( p , i , cmt );
				}
			}
		}
	}
}
function killBlog () {
	var contents = document.getElementsByClassName('content');
	if(contents){
		len = contents.length;
		for (var i = 0 ; i < len; i++ ) {
			var cmtObj = contents[i],
			cmt        = cmtObj.innerHTML;
			if( filter(cmt) ){
				var p = cmtObj.parentNode.parentNode;//<dd>
				if (p.tagName.toLowerCase() == 'dd') {
					howToTreatSB( p , i , cmt );
				}
			}
		}
	}
}
function killPerson ( ) {
	var rcs = document.getElementsByClassName('replycontent');
	if (rcs) {
		len = rcs.length;
		for (var i = 0; i < len; i++) {
			var cmtObj = rcs[i],
			cmt        = cmtObj.innerHTML;
			if( filter(cmt) ){
				var p = cmtObj.parentNode.parentNode;
				if (p.tagName.toLowerCase() == 'div' && ( trim( p.className ) == 'statuscmtitem' || trim( p.className ) == 'statuscmtitem more')) {
					howToTreatSB( p , i , cmt );
				}
			}
		}
	}
}
function killPage() {
	//杀灭公共主页日志
	var cl = document.getElementById("commentlist");
	if (cl) {
		var cmtObjs = cl.getElementsByClassName('text-content');
		len         = cmtObjs.length;
		for (var i = 0; i < len; i++) { //扫描评论
			var cmtObj = cmtObjs[i],
			cmt        = cmtObj.innerHTML;
			if ( filter(cmt) ) {
				var p = cmtObj.parentNode.parentNode;
				if (p.tagName.toLowerCase() == 'li') {
					howToTreatSB( p , i , cmt );
				}
			}
		}
	}
}


function filter ( cmt ) {
	var _cmt = trim (cmt);
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
		var punctuations = ['\\.','。',',','，','`','…','0','1','2','3'];
		for (var i = 0 ; i < punctuations.length; i++) {
			var reg = new RegExp( punctuations[i] + "+");
			if(comm.replace( reg , '') == ''){
				return true;
			}
		}
		return false;
}
function howToTreatSB( SBNode , i , cmt ){
	if (SBNode.getAttribute("RRSB") != 1) {
		var n = 30 ,
		tBlur  = setInterval(function(){//频繁开启导致闪烁，待改进
			n--;
			SBNode.style.opacity = (n/100)+'';
			if(n==5){
				clearInterval( tBlur );
			}
		},400);
		SBNode.setAttribute("RRSB",1);//标记处理
		killedNum ++;
		console.log( i + 'sb:' + trim(cmt));
	};
}

function loger ( len ) {
	chrome.extension.sendRequest({
		action: "getSBNumCurPage"
	},function( response ){
		var SBNumCurPage = response.SBNumCurPage;
		console.log('【人人2B过滤器\'s log】');
		console.log('当前地址：' + window.location.href);
		console.log('扫描个数：' + len);
		console.log('本页 SB ：' + SBNumCurPage + '头');
		console.log('本次 SB ：' + killedNum + '头');
		console.log('用户反馈：http://rrurl.cn/hM9mhk');
		console.log('执行时刻：' + getTime());
		console.log('\n');		
	});
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
function trim( str ) {     
     return str.replace( /(^\s*)|(\s*$)/g , "" );
}
function getChinese( str ) {
     return str.replace( /[^\u4e00-\u9fa5]+/g , "" );
}
function filtChinese( str ){
	return str.replace( /[\u4e00-\u9fa5]+/g , "" );
}