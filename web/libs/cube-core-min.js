(function(y){window.indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;window.IDBTransaction=window.IDBTransaction||window.webkitIDBTransaction||window.msIDBTransaction;window.IDBKeyRange=window.IDBKeyRange||window.webkitIDBKeyRange||window.msIDBKeyRange;var z=navigator.userAgent.toLowerCase();var B=z.match(/ipad/i)=="ipad";var m=z.match(/iphone os/i)=="iphone os";var c=z.match(/midp/i)=="midp";var k=z.match(/rv:1.2.3.4/i)=="rv:1.2.3.4";var f=z.match(/ucweb/i)=="ucweb";var E=z.match(/android/i)=="android";var u=z.match(/windows ce/i)=="windows ce";var h=z.match(/windows mobile/i)=="windows mobile";var l=document.compatMode=="CSS1Compat";var F=z.indexOf("opera")>-1;var e=z.indexOf("chrome")>-1;var i=z.indexOf("firefox")>-1;var C=!e&&(/webkit|khtml/).test(z);var b=C&&z.indexOf("webkit/5")!=-1;var x=("ActiveXObject" in window);var w=x&&!window.XMLHttpRequest;var v=x&&window.XMLHttpRequest&&!document.documentMode;var t=x&&!-[1]&&document.documentMode;var s=(navigator.appName=="Microsoft Internet Explorer")&&navigator.appVersion.match(/9./i)=="9.";var p=x&&(/10\.0/).test(z);var n=x&&z.indexOf("rv:11.0")>-1;var r=!C&&!e&&z.indexOf("gecko")>-1;var a=r&&z.indexOf("rv:1.9")>-1;var A=x&&!l;var D=(z.indexOf("windows")!=-1||z.indexOf("win32")!=-1);var j=(z.indexOf("macintosh")!=-1||z.indexOf("mac os x")!=-1);var g=(z.indexOf("adobeair")!=-1);var q=(z.indexOf("linux")!=-1);var d=window.location.href.toLowerCase().indexOf("https")===0;var o=/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;y.utils={isIPad:B,isIPhone:m,isAndroid:E,isPhone:(m||E),isDesktop:(!m&&!E&&!B),isWindows:D,isMac:j,isLinux:q,isChrome:e,isFirefox:i,isIE:x,isIE9:s,isIE11:n,isSafari:C,retrievalDomClass:function(I,H){var K=null;try{K=I.getAttribute("class")}catch(J){return null}if(K!=null&&K.indexOf(H)>=0){return I}var G=I.parentNode;if(G!=null&&G!==undefined){return y.utils.retrievalDomClass(G,H)}else{return null}},formatDuration:function(L){var K=L/1000;var J=parseInt(K);if(J<60){return"00:"+((J<10)?"0"+J:J)}var H=K/60;var G=parseInt(Math.floor(H));var I=parseInt(J%60);return((G<10)?"0"+G:G)+":"+((I<10)?"0"+I:I)},getUrlParams:function(){var J=[],I;var G=window.location.href.slice(window.location.href.indexOf("?")+1).split("&");for(var H=0;H<G.length;H++){I=G[H].split("=");J.push(I[0]);J[I[0]]=I[1]}return J},getUrlParam:function(H){var G=this.getUrlParams()[H];return(undefined===G)?null:G},getCookieVal:function(H){var G=document.cookie.indexOf(";",H);if(G==-1){G=document.cookie.length}return unescape(document.cookie.substring(H,G))},getCookie:function(J){var H=J+"=";var L=H.length;var G=document.cookie.length;var K=0;while(K<G){var I=K+L;if(document.cookie.substring(K,I)==H){return this.getCookieVal(I)}K=document.cookie.indexOf(" ",K)+1;if(K==0){break}}return null},setCookie:function(H,J,G,L,I,K){document.cookie=H+"="+escape(J)+((G)?"; expires="+G:"")+((L)?"; path="+L:"")+((I)?"; domain="+I:"")+((K)?"; secure":"")},deleteCookie:function(G,I,H){if(this.getCookie(G)){document.cookie=G+"="+((I)?"; path="+I:"")+((H)?"; domain="+H:"")+"; expires=Thu, 01-Jan-1970 00:00:01 GMT"}},getDrawPosition:function(J,I){var K=(I.touches===undefined)?this.getMousePos(I):this.getTouchPos(I);var H=this.getX(J);var G=this.getY(J);return{x:K.x-H,y:K.y-G}},getMousePos:function(H){var J=H||window.event;var K=document.documentElement.scrollLeft||document.body.scrollLeft;var I=document.documentElement.scrollTop||document.body.scrollTop;var G=J.pageX||J.clientX+K;var L=J.pageY||J.clientY+I;return{x:G,y:L}},getTouchPos:function(H){var J=H||window.event;var K=document.documentElement.scrollLeft||document.body.scrollLeft;var I=document.documentElement.scrollTop||document.body.scrollTop;var G=J.touches[0].pageX||J.clientX+K;var L=J.touches[0].pageY||J.clientY+I;return{x:G,y:L}},getX:function(I){var H=I.offsetLeft;var G=I;while((G=G.offsetParent)!=null){H+=G.offsetLeft}return H},getY:function(I){var H=I.offsetTop;var G=I;while((G=G.offsetParent)!=null){H+=G.offsetTop}return H},unselectable:function(H){H.setAttribute("unselectable","on");H.className="unselectable";H.onmousedown=function(){return false};var G=H.style;G.userSelect="none";G.webkitUserSelect="none";G.MozUserSelect="-moz-none"},verifyEmail:function(G){return(o.test(G))},measureBandwidth:function(L,Q,O,P){var I=L?1054738:10561396;var J=0;var M=0;var N=0;var K=new Image();K.onload=function(){M=Date.now();var U=(M-J)/1000;var T=I*8;var R=(T/U).toFixed(2);var V=(R/1024).toFixed(2);var S=(V/1024).toFixed(2);Q.call(null,R,V,S)};K.onerror=function(R,S){O.call(null,R)};J=Date.now();var H="?t="+J;var G="assets/bandwidth/"+(L?"bandwidth-1m.jpg":"bandwidth-10m.jpg")+H;if(P!==undefined){G="http://"+P+"/"+G}K.src=G},requestGet:function(H,J,G){var I=new XMLHttpRequest();I.onreadystatechange=function(){if(I.readyState==4){if(I.status==200){J.call(null,JSON.parse(I.responseText))}else{G.call(null,I.status)}}};I.open("GET",H);I.send(null)}}})(window);(function(e){var b,d=function(){},a=e.document,c={set:d,get:d,remove:d,clear:d,each:d,obj:d,length:0};(function(){if("localStorage" in e){try{b=e.localStorage;return}catch(p){}}var h=a.getElementsByTagName("head")[0],g=e.location.hostname||"localStorage",q=new Date(),s,l;if(!h.addBehavior){try{b=e.localStorage}catch(p){b=null}return}try{l=new ActiveXObject("htmlfile");l.open();l.write('<script>document.w=window;<\/script><iframe src="/favicon.ico"></iframe>');l.close();s=l.w.frames[0].document;h=s.createElement("head");s.appendChild(h)}catch(p){h=a.getElementsByTagName("head")[0]}try{q.setDate(q.getDate()+36500);h.addBehavior("#default#userData");h.expires=q.toUTCString();h.load(g);h.save(g)}catch(p){return}var r,t;try{r=h.XMLDocument.documentElement;t=r.attributes}catch(p){return}var m="p__hack_",j="m-_-c",k=new RegExp("^"+m),i=new RegExp(j,"g"),n=function(o){return encodeURIComponent(m+o).replace(/%/g,j)},f=function(o){return decodeURIComponent(o.replace(i,"%")).replace(k,"")};b={length:t.length,isVirtualObject:true,getItem:function(o){return(t.getNamedItem(n(o))||{nodeValue:null}).nodeValue||r.getAttribute(n(o))},setItem:function(o,u){try{r.setAttribute(n(o),u);h.save(g);this.length=t.length}catch(v){}},removeItem:function(o){try{r.removeAttribute(n(o));h.save(g);this.length=t.length}catch(u){}},clear:function(){while(t.length){this.removeItem(t[0].nodeName)}this.length=0},key:function(o){return t[o]?f(t[o].nodeName):undefined}};if(!("localStorage" in e)){e.localStorage=b}})();e.LS=!b?c:{set:function(f,g){if(this.get(f)!==undefined){this.remove(f)}b.setItem(f,g);this.length=b.length},get:function(g){var f=b.getItem(g);return f===null?undefined:f},remove:function(f){b.removeItem(f);this.length=b.length},clear:function(){b.clear();this.length=0},each:function(i){var h=this.obj(),g=i||function(){},f;for(f in h){if(g.call(this,f,this.get(f))===false){break}}},obj:function(){var h={},g=0,j,f;if(b.isVirtualObject){h=b.key(-1)}else{j=b.length;for(;g<j;g++){f=b.key(g);h[f]=this.get(f)}}return h},length:b.length};if(e.jQuery){e.jQuery.LS=e.LS}})(window);var CubeConst={ActionLogin:"login",ActionLoginAck:"login-ack",ActionLogout:"logout",ActionLogoutAck:"logout-ack",ActionQuery:"query",ActionQueryAck:"query-ack",ActionPush:"push",ActionPull:"pull",ActionPullAck:"pull-ack",ActionNotify:"notify",ActionHistory:"history",ActionHistoryAck:"history-ack",ActionInvite:"invite",ActionInviteAck:"invite-ack",ActionAnswer:"answer",ActionAnswerAck:"answer-ack",ActionCancel:"cancel",ActionCancelAck:"cancel-ack",ActionBye:"bye",ActionByeAck:"bye-ack",ActionCandidate:"candidate",ActionCandidateAck:"candidate-ack",ActionConsult:"consult",ActionConsultAck:"consult-ack",ActionConference:"conference",ActionConferenceAck:"conference-ack",ActionShare:"share",ActionRevoke:"revoke",ActionShareAck:"share-ack",ActionVGCmd:"vg-cmd",ActionVGCmdAck:"vg-cmd-ack",Unknown:""};var CubeRegistrationState={None:"None",Progress:"Progress",Ok:"Ok",Cleared:"Cleared",Failed:"Failed"};var CubeRegistrationListener=Class({ctor:function(){},onRegistrationProgress:function(a){},onRegistrationOk:function(a){},onRegistrationCleared:function(a){},onRegistrationFailed:function(a){}});var CubeCallDirection={Outgoing:"outgoing",Incoming:"incoming"};var CubeCallListener=Class({ctor:function(){},onNewCall:function(c,b,a){},onInProgress:function(a){},onCallRinging:function(a){},onCallConnected:function(a){},onCallEnded:function(a){},onCallFailed:function(b,a){}});var CubeMessageErrorCode={ContentTooLong:300};var CubeMessageListener=Class({ctor:function(){},onSent:function(b,a){},onReceived:function(b,a){},onMessageFailed:function(c,b,a){}});var CubeCallErrorCode={BadRequest:400,Unauthorized:401,PaymentRequired:402,Forbidden:403,NotFound:404,MethodNotAllowed:405,ProxyAuthenticationRequired:407,RequestTimeout:408,UnsupportedMediaType:415,RequestSendFailed:477,TemporarilyUnavailable:480,BusyHere:486,RequestTerminated:487,ServerInternalError:500,BusyEverywhere:600,Declined:603,ConnectionFailed:700,SignalingStartError:701,TransportError:702,ICEConnectionFailed:703,CreateSessionDescriptionFailed:705,SetSessionDescriptionFailed:706,RTCInitializeFailed:707,DuplicationException:801,WorkerStateException:802,CallTimeout:804,NetworkNotReachable:809,CameraOpenFailed:901,Unknown:0};var CubeMediaProbe=Class({ctor:function(){},onLocalVideoReady:function(a){},onRemoteVideoReady:function(a){},onLocalVideoFPS:function(d,e,b,c,a){},onRemoteVideoFPS:function(d,e,b,c,a){},onFrameRateWarning:function(c,b,a,d){},onFrameRateRecovering:function(c,b,a,d){}});var CubeMediaController=Class({worker:null,timerList:[],probes:null,frameWarning:false,remoteMaxFrameRate:-1,remoteMinFrameRate:120,recorderMap:null,ctor:function(b){this.worker=b;var a=this;b.videoCloseHandler=function(){Logger.d("CubeMediaController","Video closed");for(var c=0;c<a.timerList.length;++c){var e=a.timerList[c];clearInterval(e)}a.timerList.splice(0,a.timerList.length);if(null!=a.probes&&a.frameWarning){for(var c=0;c<a.probes.length;++c){var d=a.probes[c];d.onFrameRateRecovering(a,0,0,a.remoteMaxFrameRate)}}a.remoteMaxFrameRate=-1;a.remoteMinFrameRate=120;a.frameWarning=false;if(a.isLocalRecording()){a.stopLocalRecording(null)}};b.localVideoReady=function(c){a._localVideoReady(c)};b.remoteVideoReady=function(c){c.volume=1;a._remoteVideoReady(c)}},addMediaProbe:function(a){if(null==this.probes){this.probes=[a]}else{this.probes.push(a)}},removeMediaProbe:function(a){if(null==this.probes){return false}var b=this.probes.indexOf(a);if(b>=0){this.probes.splice(b,1);return true}return false},getLocalVideoSize:function(){var b=this.worker.localVideo;var a=b.videoWidth;var c=b.videoHeight;return{width:a,height:c}},getRemoteVideoSize:function(){var b=this.worker.remoteVideo;var a=b.videoWidth;var c=b.videoHeight;return{width:a,height:c}},_localVideoReady:function(c){if(null!=this.probes){for(var b=0;b<this.probes.length;++b){var d=this.probes[b];d.onLocalVideoReady(this)}var a=this;this._calculateStats(c,function(e,j,h){for(var f=0;f<a.probes.length;++f){var g=a.probes[f];g.onLocalVideoFPS(a,e.videoWidth,e.videoHeight,j,h)}})}},_remoteVideoReady:function(c){if(null!=this.probes){for(var b=0;b<this.probes.length;++b){var d=this.probes[b];d.onRemoteVideoReady(this)}var a=this;this._calculateStats(c,function(e,j,h){for(var f=0;f<a.probes.length;++f){var g=a.probes[f];g.onRemoteVideoFPS(a,e.videoWidth,e.videoHeight,j,h)}if(a.remoteMaxFrameRate<j){a.remoteMaxFrameRate=j}if(a.remoteMinFrameRate>j){a.remoteMinFrameRate=j}if(j<=a.remoteMaxFrameRate*0.5&&j<=h*0.6){a.frameWarning=true;for(var f=0;f<a.probes.length;++f){var g=a.probes[f];g.onFrameRateWarning(a,j,h,a.remoteMaxFrameRate)}}else{if(a.frameWarning){for(var f=0;f<a.probes.length;++f){var g=a.probes[f];g.onFrameRateRecovering(a,j,h,a.remoteMaxFrameRate)}a.frameWarning=false;if(j>=6){a.remoteMaxFrameRate=-1}}}})}},_calculateStats:function(d,h){var b=new Date().getTime();var f=0,e=0,c=b,a=b;var g=0;g=window.setInterval(function(){if(d.webkitDecodedFrameCount===undefined){if(d.mozPaintedFrames===undefined){console.log("Video FPS calcs not supported");clearInterval(g);return}}var l=new Date().getTime();var i=(l-c)/1000;var k=(l-a)/1000;c=l;var m=0;var j=0;if(d.mozPaintedFrames!==undefined){m=(d.mozPaintedFrames-f)/i;j=d.mozPaintedFrames/k;f=d.mozPaintedFrames}else{m=(d.webkitDecodedFrameCount-f)/i;j=d.webkitDecodedFrameCount/k;f=d.webkitDecodedFrameCount}if(m<0||m>60){m=0}h.call(null,d,m.toFixed(),j.toFixed());if((parseInt(d.width)==0&&j==0)||d.src==null){clearInterval(g)}},1000);this.timerList.push(g)},openVideo:function(){if(null!=this.worker.localStream&&this.worker.localStream.getVideoTracks().length>0){this.worker.localStream.getVideoTracks()[0].enabled=true;this.worker.consult("video","open");return true}return false},closeVideo:function(){if(null!=this.worker.localStream&&this.worker.localStream.getVideoTracks().length>0){this.worker.localStream.getVideoTracks()[0].enabled=false;this.worker.consult("video","close");return true}return false},isVideoEnabled:function(){if(null!=this.worker.localStream&&this.worker.localStream.getVideoTracks().length>0){return this.worker.localStream.getVideoTracks()[0].enabled}return true},openVoice:function(){if(null!=this.worker.localStream&&this.worker.localStream.getAudioTracks().length>0){this.worker.localStream.getAudioTracks()[0].enabled=true;return true}return false},closeVoice:function(){if(null!=this.worker.localStream&&this.worker.localStream.getAudioTracks().length>0){this.worker.localStream.getAudioTracks()[0].enabled=false;return true}return false},isVoiceEnabled:function(){if(null!=this.worker.localStream&&this.worker.localStream.getAudioTracks().length>0){return this.worker.localStream.getAudioTracks()[0].enabled}return true},setVolume:function(a){if(null!=this.worker.remoteVideo){this.worker.remoteVideo.volume=a/100}},getVolume:function(){return parseInt(Math.round(this.worker.remoteVideo.volume*100))},mute:function(){this.closeVoice()},queryRecordArchives:function(b,g,a,f){if("undefined"!==f&&f){var e="p"+Date.now();window._cube_cross.addCallback(e,g,a);var d=window._cube_cross.host+"/archive/list.js?name="+b+"&m=window._cube_cross.queryRecordArchives&sn="+e;var c=document.createElement("script");c.setAttribute("id",e);c.setAttribute("name",b.toString());c.setAttribute("src",d);c.setAttribute("type","text/javascript");c.onerror=function(){if(undefined!==a){a.call(null,b)}document.body.removeChild(c)};document.body.appendChild(c);return}utils.requestGet("archive/list?name="+b,function(h){g.call(null,b,h)},function(h){if(undefined!==a){a.call(null,b)}})},loadArchive:function(b,c,a,e){var d=a;if(typeof a==="string"){d=document.getElementById(a)}if("undefined"!==e&&e){d.src=window._cube_cross.host+"/archive/read?name="+b+"&file="+c}else{d.src="archive/read?name="+b+"&file="+c}},hasLocalRecorded:function(){if(null==this.recorderMap){return false}return this.recorderMap.containsKey("LocalVideo")},isLocalRecording:function(){if(null==this.recorderMap){return false}var a=this.recorderMap.get("LocalVideo");if(a==null){return false}return a.recording},startLocalRecording:function(a){if(null==this.worker.localStream){return false}return this.startRecording("LocalVideo",this.worker.localStream,a)},stopLocalRecording:function(a){return this.stopRecording("LocalVideo",a)},replayLocalRecording:function(a,b){return this.replayRecording("LocalVideo",a,b)},getLocalRecorder:function(){return this.getRecorder("LocalVideo")},hasRemoteRecorded:function(){if(null==this.recorderMap){return false}return this.recorderMap.containsKey("RemoteVideo")},isRemoteRecording:function(){if(null==this.recorderMap){return false}var a=this.recorderMap.get("RemoteVideo");if(a==null){return false}return a.recording},startRemoteRecording:function(a){if(null==this.worker.remoteStream){return false}return this.startRecording("RemoteVideo",this.worker.remoteStream,a)},stopRemoteRecording:function(a){return this.stopRecording("RemoteVideo",a)},getRemoteRecorder:function(){return this.getRecorder("RemoteVideo")},startRecording:function(b,d,c){var e=null;var f=null;if(typeof d==="string"){e=document.getElementById(d)}else{if(d.tagName!==undefined){e=d}else{f=d}}if(null==this.recorderMap){this.recorderMap=new HashMap()}var a=null;if(c!=="undefined"&&null!=c){a=new CubeAdvancedRecorder(e,c)}else{a=new CubeRecorder(e)}this.recorderMap.put(b,a);return a.startRecording(f)},stopRecording:function(c,e){if(null==this.recorderMap){return false}var b=this.recorderMap.get(c);if(null==b){return false}var a=0;var d=b.stopRecording(function(f){if(null==e){return}if(a>0){clearTimeout(a)}a=setTimeout(function(){clearTimeout(a);e.call(null,b)},1000)});return d},replayRecording:function(b,c,f){if(null==this.recorderMap){return false}var a=this.recorderMap.get(b);if(null==a){return false}var e=null;if(typeof c==="string"){e=document.getElementById(c)}else{e=c}var d=null;if(typeof f==="string"){d=document.getElementById(f)}else{d=f}return a.replay(e,d)},getRecorder:function(a){if(null==this.recorderMap){return null}return this.recorderMap.get(a)}});(function(){if(window._cube_cross===undefined){window._cube_cross={host:"http://"+_CUBE_DOMAIN,callbackMap:{},addCallback:function(c,b,a){this.callbackMap[c]=b}}}window._cube_cross.queryRecordArchives=function(e,b){var d=document.getElementById(e);var a=d.getAttribute("name");var c=window._cube_cross.callbackMap[e];c.call(null,a,b);document.body.removeChild(d);d=null;delete window._cube_cross.callbackMap[e]}})();var CubePeer=Class({name:null,displayName:null,ctor:function(a){this.name=a},getName:function(){return this.name},getDisplayName:function(){return this.displayName}});var CubeSession=Class({name:null,displayName:null,regState:CubeRegistrationState.None,callPeer:null,callDirection:null,callState:0,ctor:function(){this.regState=CubeRegistrationState.None},getName:function(){return this.name},getDisplayName:function(){return this.displayName},hasRegistered:function(){return(this.regState==CubeRegistrationState.Ok)},getRegState:function(){return this.regState},setCallPeer:function(a){this.callPeer=a},getCallPeer:function(){return this.callPeer},getCallDirection:function(){return this.callDirection},isCalling:function(){return(this.callState==CubeSignalingState.Invite||this.callState==CubeSignalingState.Incall)},getLatency:function(){var b=-1;if(nucleus.talkService.isCalled(_S_CELLET)){b=nucleus.talkService.getPingPongTime(_S_CELLET)}var a=-1;if(nucleus.talkService.isCalled(_M_CELLET)){a=nucleus.talkService.getPingPongTime(_M_CELLET)}var e=-1;if(nucleus.talkService.isCalled(_WB_CELLET)){e=nucleus.talkService.getPingPongTime(_WB_CELLET)}var f=0;var d=0;if(b>0){d+=b;++f}if(a>0){d+=a;++f}if(e>0){d+=e;++f}return(f>0)?parseInt(Math.round(d/f)):-1}});var _M_CELLET="CubeMessaging";var _S_CELLET="CubeSignaling";var _WB_CELLET="CubeWhiteboard";var _CUBE_DOMAIN="211.103.217.154";var CubeEngine=Class({version:"1.3.19",config:null,hostAddress:null,session:null,registered:false,accName:null,accPassword:null,accDisplayName:null,sipWorker:null,sipMediaController:null,sspWorker:null,sspMediaController:null,msgWorker:null,wbMap:null,wbList:null,regListener:null,callListener:null,messageListener:null,wbListener:null,queryCallback:null,ctor:function(){this.session=new CubeSession()},_debug:function(a){if(a.single){this.sspWorker.iceServersUrls=[{urls:["stun:123.57.251.18:3478"]},{urls:["turn:123.57.251.18:3478"],username:"cube",credential:"cube887"}]}else{this.sspWorker.iceServersUrls=[{urls:["stun:211.103.217.154:3478","stun:123.57.251.18:3478"]},{urls:["turn:211.103.217.154:3478","turn:123.57.251.18:3478"],username:"cube",credential:"cube887"}]}},startup:function(c,f,b){var a=this;if(f===undefined||null==f){f=_CUBE_DOMAIN}else{_CUBE_DOMAIN=f}if(b===undefined){b=7070}a.hostAddress=new InetAddress(f,b);var e=function(){if(window.nucleus.startup()){nucleus.talkService.addListener(new CubeNetworkListener(a));if(undefined!==c){c.call(null,a)}return true}else{return false}};if(window.utils.isIE9){window.WEB_SOCKET_FORCE_FLASH=true;nucleus.activateWSPlugin(_CUBE_DOMAIN.indexOf("192")>=0?"libs/ws":"http://"+_CUBE_DOMAIN+"/libs/ws",function(){e()});return true}else{var d=setTimeout(function(){clearTimeout(d);e()},50);return true}},shutdown:function(){},configure:function(b){this.config=b;if(null!=this.sspWorker){if(b.videoSize!==undefined){this.sspWorker.maxVideoSize=b.videoSize;Logger.d("CubeEngine","Config video size: "+b.videoSize.width+"x"+b.videoSize.height)}if(b.frameRate!==undefined){var a=parseInt(b.frameRate.min);if(a>10){a=10}else{if(a<2){a=2}}var c=parseInt(b.frameRate.max);if(c>30){c=30}else{if(c<6){c=6}}this.sspWorker.minFrameRate=a;this.sspWorker.maxFrameRate=c;Logger.d("CubeEngine","Config frame rate: ["+a+","+c+"]")}if(b.bandwidth){this.sspWorker.setBandwidth(b.bandwidth.audio||60,b.bandwidth.video||256)}}},getSession:function(){return this.session},registerAccount:function(d,c,a){this.accName=d+"";this.accPassword=c+"";if(a===undefined||a.length==0){this.accDisplayName=this.accName}else{this.accDisplayName=a.toString()}this.session.name=this.accName;this.session.displayName=this.accDisplayName;var b=this;if(null!=b.sipWorker){b.sipWorker.registerWith(d,c,this.accDisplayName)}var g=[];if(nucleus.talkService.isCalled(_M_CELLET)){g.push(_M_CELLET)}if(nucleus.talkService.isCalled(_S_CELLET)){g.push(_S_CELLET)}if(nucleus.talkService.isCalled(_WB_CELLET)){g.push(_WB_CELLET)}if(g.length>0){b._fireRegistrationState(CubeRegistrationState.Progress);for(var f=0;f<g.length;++f){var e=new ActionDialect();e.setAction(CubeConst.ActionLogin);e.appendParam("data",{name:b.accName,displayName:b.accDisplayName,password:c,version:b.version,device:{name:navigator.appName,version:navigator.appVersion,platform:navigator.platform,userAgent:navigator.userAgent}});nucleus.talkService.talk(g[f],e)}}g=null;return true},unregisterAccount:function(){if(this.session.isCalling()){this.terminateCall()}this._fireRegistrationState(CubeRegistrationState.Cleared);if(null!=this.sipWorker){this.sipWorker.unregister()}var d=[];if(nucleus.talkService.isCalled(_M_CELLET)){d.push(_M_CELLET)}if(nucleus.talkService.isCalled(_S_CELLET)){d.push(_S_CELLET)}if(nucleus.talkService.isCalled(_WB_CELLET)){d.push(_WB_CELLET)}if(d.length>0){var a=this;for(var c=0;c<d.length;++c){var b=new ActionDialect();b.setAction(CubeConst.ActionLogout);b.appendParam("data",{name:a.accName,password:a.accPassword,version:a.version,device:{name:navigator.appName,version:navigator.appVersion,platform:navigator.platform,userAgent:navigator.userAgent}});nucleus.talkService.talk(d[c],b)}}d=null;this.accName=null;this.accDisplayName=null;this.accPassword=null;this.session.name=null;return true},queryRemoteAccounts:function(a,b){this.queryAccounts(a,b)},queryAccounts:function(b,c){if(null==this.msgWorker){return false}if(!nucleus.talkService.isCalled(_M_CELLET)&&!nucleus.talkService.isCalled(_S_CELLET)){return false}if(undefined!==c){this.queryCallback=c}else{return false}var a=new ActionDialect();a.setAction(CubeConst.ActionQuery);a.appendParam("data",{list:b});if(nucleus.talkService.isCalled(_M_CELLET)){nucleus.talkService.talk(_M_CELLET,a);return true}else{if(nucleus.talkService.isCalled(_S_CELLET)){nucleus.talkService.talk(_S_CELLET,a);return true}else{if(nucleus.talkService.isCalled(_WB_CELLET)){nucleus.talkService.talk(_WB_CELLET,a);return true}else{return false}}}},queryMessageHistory:function(b,a,c){if(null==this.msgWorker){return false}return this.msgWorker.queryHistory(b,a,c)},loadConference:function(a,b,c){if(null!=this.sipWorker){return true}this.sipWorker=new CubeSIPWorker("211.103.217.154");this.sipWorker.start(this,document.getElementById(a),document.getElementById(b),(c!==undefined)?document.getElementById(c):null);this.sipMediaController=new CubeMediaController(this.sipWorker);return true},loadSignaling:function(a,b,c){if(null!=this.sspWorker){return true}this.sspWorker=new CubeSignalingWorker(document.getElementById(a),document.getElementById(b),(c!==undefined)?document.getElementById(c):null);this.sspWorker.setDelegate(new CubeSignalingWorkerDelegate(this));if(null!=this.config){this.sspWorker.maxVideoSize=this.config.videoSize}nucleus.talkService.call([_S_CELLET],this.hostAddress,true);this.sspMediaController=new CubeMediaController(this.sspWorker);if(!nucleus.ts.isWebSocketSupported()){window.console.log("Adapter WebSocket");nucleus.ts.resetHeartbeat(_S_CELLET,2000)}return true},loadMessager:function(){if(null!=this.msgWorker){return true}this.msgWorker=new CubeMessageWorker();this.msgWorker.setDelegate(new CubeMessageWorkerDelegate(this));nucleus.talkService.call([_M_CELLET],this.hostAddress,true);return true},loadWhiteboard:function(b){if(null==this.wbMap){this.wbMap=new HashMap()}if(null==this.wbList){this.wbList=new Array()}nucleus.talkService.call([_WB_CELLET],this.hostAddress,true);var a=new CubeWhiteboard(b,new CubeWhiteboardDelegate(this));a.load();this.wbMap.put(a.getName(),a);this.wbList.push(a);return a},setRegistrationListener:function(a){this.regListener=a},setCallListener:function(a){this.callListener=a},setMessageListener:function(a){this.messageListener=a},setWhiteboardListener:function(a){this.wbListener=a},makeCall:function(b,a){b=b.toString();if(b.length<=4&&null!=this.sipWorker){this.session.setCallPeer(new CubePeer(b));return this.sipWorker.invite(b,a)}if(null!=this.sspWorker){this.session.setCallPeer(new CubePeer(b));return this.sspWorker.invite(b,a)}else{if(null!=this.sipWorker){this.session.setCallPeer(new CubePeer(b));return this.sipWorker.invite(b,a)}else{return false}}},answerCall:function(a){if(this.session.callPeer.name.length<=4&&null!=this.sipWorker){return this.sipWorker.answer(a)}if(null!=this.sspWorker){return this.sspWorker.answer(a)}else{if(null!=this.sipWorker){return this.sipWorker.answer(a)}else{return false}}},terminateCall:function(){if(null!=this.session.callPeer&&this.session.callPeer.name.length<=4&&null!=this.sipWorker){return this.sipWorker.hangup()}var b=false;var a=false;if(null!=this.sspWorker){b=this.sspWorker.hangup()}if(null!=this.sipWorker){a=this.sipWorker.hangup()}return(b||a)},autoAnswer:function(a){if(null!=this.sspWorker){this.sspWorker.setAutoAnswer(a)}},getMediaController:function(){if(null!=this.session.callPeer){if(this.session.callPeer.name.length<=4&&null!=this.sipWorker){return this.sipMediaController}else{return this.sspMediaController}}else{return this.sspMediaController}},mc:function(){return this.getMediaController()},getConferenceUA:function(){if(null==this.sspWorker){return null}return this.sspWorker.cua()},cua:function(){if(null==this.sspWorker){return null}return this.sspWorker.cua()},sendMessage:function(a,b){if(null==this.msgWorker){return false}if(!nucleus.talkService.isCalled(_M_CELLET)){return false}return this.msgWorker.pushMessage(a,b)},getWhiteboard:function(c){if(null==this.wbList){return null}if(c===undefined){return this.wbList[0]}for(var a=0;a<this.wbList.length;++a){var b=this.wbList[a];if(b.domId==c){return b}}return null},warmUp:function(){if(null==this.sspWorker){return}var e=document.body.style.overflow;var n=window.innerWidth;var g=window.innerHeight;document.body.style.overflow="hidden";var m=parseInt((n-480)*0.5);var l=parseInt((g-480)*0.5)-40;var k=parseInt((n-200-200-40)*0.5);var i=parseInt(l+480+10);var o=['<div style="position:absolute;float:left;left:0px;top:0px;opacity:0.7;-moz-opacity:0.7;-webkit-opacity:0.7;background:#000;',"width:",n,"px;height:",g,'px"></div>','<video id="_cube_warmup_video" width="480" height="480" style="position:absolute;float:left;left:',m,"px;top:",l,'px;background:#101010;"></video>','<button id="_cube_warmup_yes" style="width:200px;height:30px;position:absolute;float:left;left:',k,"px;top:",i,'px;">我看到了视频</button>','<button id="_cube_warmup_no" style="width:200px;height:30px;position:absolute;float:left;left:',k+240,"px;top:",i,'px;">我没有看到视频</button>'];var j=document.createElement("div");j.style.position="absolute";j.style.styleFloat="left";j.style.cssFloat="left";j.style.left="0px";j.style.top="0px";j.style.width=n+"px";j.style.height=g+"px";j.style.zIndex=9999;j.innerHTML=o.join("");document.body.appendChild(j);var a=document.getElementById("_cube_warmup_video");var f=null;if(navigator.getUserMedia){navigator.getUserMedia({audio:true,video:true},function(c){f=c;if(window.URL){a.src=window.URL.createObjectURL(f)}else{a.src=f}a.onloadedmetadata=function(h){a.play()}},function(c){alert("发生错误: "+JSON.stringify(c))})}var d=function(){a.src="";if(null!=f){f.stop();f=null}document.body.removeChild(j);document.body.style.overflow=e};var b=document.getElementById("_cube_warmup_yes");b.addEventListener("click",function(c){d()},false);b=document.getElementById("_cube_warmup_no");b.addEventListener("click",function(c){d()},false)},_fireRegistrationState:function(d){if(d!=this.session.regState){this.session.regState=d;if(null!=this.regListener){if(d==CubeRegistrationState.Progress){this.regListener.onRegistrationProgress(this.session)}else{if(d==CubeRegistrationState.Ok){this.regListener.onRegistrationOk(this.session)}else{if(d==CubeRegistrationState.Cleared){this.regListener.onRegistrationCleared(this.session);if(this.session.isCalling()){this.terminateCall()}}else{if(d==CubeRegistrationState.Failed){this.regListener.onRegistrationFailed(this.session)}}}}}}if(null!=this.sspWorker){this.sspWorker.onRegisterStateChanged(this.session)}if(null!=this.msgWorker){this.msgWorker.onRegisterStateChanged(this.session)}if(null!=this.wbList&&this.wbList.length>0){var c=this.wbList;for(var a=0;a<c.length;++a){var b=c[a];b.onRegisterStateChanged(this.session)}}},_processLoginAck:function(a){var b=a.getParam("state");if(b.code==200){this.registered=true;this._fireRegistrationState(CubeRegistrationState.Ok)}else{Logger.w("CubeEngine","login failed");this._fireRegistrationState(CubeRegistrationState.Failed)}},_processQueryAck:function(a){if(null!=this.queryCallback){var b=a.getParam("data");this.queryCallback.call(null,b.list);this.queryCallback=null}}});var CubeNetworkListener=Class(TalkListener,{engine:null,ctor:function(a){TalkListener.prototype.ctor.call(this);this.engine=a},dialogue:function(b,a){if(a.isDialectal()){var d=a.getDialect();if(ActionDialect.DIALECT_NAME==d.getName()){var f=d.getAction();if(f==CubeConst.ActionLoginAck){this.engine._processLoginAck(d);return}else{if(f==CubeConst.ActionQueryAck){this.engine._processQueryAck(d);return}}if(b==_WB_CELLET){if(null!=this.engine.wbList&&this.engine.wbList.length>0){var e=this.engine.wbList;for(var c=0;c<e.length;++c){e[c].onDialogue(f,d)}}}else{if(b==_M_CELLET){if(null!=this.engine.msgWorker){this.engine.msgWorker.onDialogue(f,d)}}else{if(b==_S_CELLET){if(null!=this.engine.sspWorker){this.engine.sspWorker.onDialogue(f,d)}}}}}}},contacted:function(d,j){console.log("*** contacted: "+d);if(!this.engine.registered&&null!=this.engine.accName&&null!=this.engine.accPassword){this.engine._fireRegistrationState(CubeRegistrationState.Progress);var a=this.engine.accName;var g=this.engine.accDisplayName;var h=this.engine.accPassword;var e=this.engine.version;var f=[];if(null!=this.engine.msgWorker){f.push(_M_CELLET)}if(null!=this.engine.sspWorker){f.push(_S_CELLET)}if(null!=this.engine.wbMap){f.push(_WB_CELLET)}for(var c=0;c<f.length;++c){var b=new ActionDialect();b.setAction(CubeConst.ActionLogin);b.appendParam("data",{name:a,displayName:g,password:h,version:e,device:{name:navigator.appName,version:navigator.appVersion,platform:navigator.platform,userAgent:navigator.userAgent}});nucleus.talkService.talk(f[c],b)}f=null}},quitted:function(b,a){console.log("*** quitted: "+b);if(null!=this.engine.sspWorker){if(this.engine.session.isCalling()){this.engine.terminateCall()}}},failed:function(a,b){console.log("*** failed: "+a+" - "+b.getDescription());var c=setTimeout(function(){clearTimeout(c);nucleus.talkService.recall()},10000)}});(function(a){CubeEngine.sharedInstance=new CubeEngine();a.cube=CubeEngine.sharedInstance})(window);