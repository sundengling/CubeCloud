var CubeVideoSize={SQCIF:{width:128,height:96},QQVGA:{width:160,height:120},QVGA:{width:320,height:240},CIF:{width:352,height:288},VGA:{width:640,height:480},SVGA:{width:800,height:600},HD:{width:960,height:720},XGA:{width:1024,height:768},SXGA:{width:1280,height:1024},UXGA:{width:1600,height:1200},WQVGA:{width:400,height:240},WCIF:{width:512,height:288},WVGA:{width:800,height:480},WSVGA:{width:1024,height:600},WHD:{width:1280,height:720},WXGA:{width:1280,height:768},WUXGA:{width:1920,height:1200},W432P:{width:768,height:432},W480P:{width:768,height:480}};var CubeSignalingState={None:0,Progress:1,Invite:2,Ringing:3,Incall:4,End:5};var CubeSignalingWorkerDelegate=Class({engine:null,ctor:function(a){this.engine=a},didInvite:function(d,c,a,b){Logger.d("CubeSignalingWorkerDelegate","onNewCall");this.engine.session.callDirection=c;this.engine.session.callState=CubeSignalingState.Invite;if(null==this.engine.session.callPeer||this.engine.session.callPeer.name!=a){this.engine.session.setCallPeer(new CubePeer(a));if(null!=d.targetData){this.engine.session.callPeer.displayName=d.targetData.displayName}}if(null!=this.engine.callListener){this.engine.callListener.onNewCall(c,this.engine.session,b)}d.localVideo.style.visibility="visible"},didRinging:function(b,a){Logger.d("CubeSignalingWorkerDelegate","onCallRinging");this.engine.session.callPeer.displayName=b.targetData.displayName;if(null!=this.engine.callListener){this.engine.callListener.onCallRinging(this.engine.session)}},didIncall:function(d,c,b,a){Logger.d("CubeSignalingWorkerDelegate","onCallConnected");this.engine.session.callState=CubeSignalingState.Incall;if(null!=this.engine.callListener){this.engine.callListener.onCallConnected(this.engine.session)}d.remoteVideo.style.visibility="visible"},didEnd:function(b,a){Logger.d("CubeSignalingWorkerDelegate","onCallEnded");this.engine.session.callState=CubeSignalingState.End;if(null!=b.videoCloseHandler){b.videoCloseHandler.call(null,b)}if(null!=this.engine.callListener){this.engine.callListener.onCallEnded(this.engine.session)}b.localVideo.style.visibility="hidden";b.remoteVideo.style.visibility="hidden"},didProgress:function(b,a){Logger.d("CubeSignalingWorkerDelegate","onInProgress");if(null!=this.engine.callListener){this.engine.callListener.onInProgress(this.engine.session)}},didFailed:function(d,b,c){Logger.d("CubeSignalingWorkerDelegate","onCallFailed");if(null!=this.engine.callListener){this.engine.callListener.onCallFailed(this.engine.session,c)}this.engine.session.callState=CubeSignalingState.None;d.localVideo.style.visibility="hidden";d.remoteVideo.style.visibility="hidden";var a=this;setTimeout(function(){a.engine.terminateCall()},1000);if(null!=d.videoCloseHandler){d.videoCloseHandler.call(null,d)}}});(function(c){var a=window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection;c.RTCPeerConnection=a;var d=window.RTCIceCandidate||window.mozRTCIceCandidate||window.webkitRTCIceCandidate;c.RTCIceCandidate=d;var e=window.RTCSessionDescription||window.mozRTCSessionDescription||window.webkitRTCSessionDescription;c.RTCSessionDescription=e;navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia;if(window.utils.isIE){var b=document.createElement("script");b.setAttribute("src","http://"+_CUBE_DOMAIN+"/libs/adapter-min.js");b.onload=function(f){AdapterJS.webRTCReady(function(g){window.console.log("WebRTC Plugin Ready!")})};document.body.appendChild(b)}})(window);var CubeSignalingWorker=Class({delegate:null,session:null,target:null,targetData:null,direction:null,videoEnabled:true,state:CubeSignalingState.None,sdpCache:null,autoAnswer:false,audioBandwidth:50,videoBandwidth:256,localVideo:null,remoteVideo:null,bellAudio:null,bellAudioPaused:false,isInitiator:false,isStarted:false,isChannelReady:false,localStream:null,remoteStream:null,pc:null,localVideoReady:null,remoteVideoReady:null,videoCloseHandler:null,iceServersUrls:[{urls:["stun:211.103.217.154:3478","stun:123.57.251.18:3478"]},{urls:["turn:211.103.217.154:3478","turn:123.57.251.18:3478"],username:"cube",credential:"cube887"}],pcConstraints:{optional:[{DtlsSrtpKeyAgreement:true}]},sdpConstraints:{},candidateQueue:[],maxVideoSize:null,maxFrameRate:15,minFrameRate:5,iceTimer:null,iceTimeout:10000,confUA:null,ctor:function(a,c,d){this.localVideo=a;this.localVideo.muted=true;this.remoteVideo=c;this.bellAudio=d;var b=this;b.localVideo.addEventListener("loadeddata",function(f){if(null!=b.localVideoReady){b.localVideoReady.call(null,b.localVideo)}},false);b.remoteVideo.addEventListener("loadeddata",function(f){if(null!=b.remoteVideoReady){b.remoteVideoReady.call(null,b.remoteVideo)}},false);if(null!=b.bellAudio){b.bellAudio.addEventListener("loadeddata",function(f){if(b.bellAudioPaused){return}b.bellAudio.play()},false)}},onRegisterStateChanged:function(a){this.session=a;if(a.regState==CubeRegistrationState.Ok){this.isChannelReady=true}else{this.isChannelReady=false}},onDialogue:function(b,a){if(b==CubeConst.ActionInviteAck){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionInviteAck);this._processInviteAck(a)}else{if(b==CubeConst.ActionInvite){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionInvite);this._processInvite(a)}else{if(b==CubeConst.ActionAnswerAck){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionAnswerAck);this._processAnswerAck(a)}else{if(b==CubeConst.ActionAnswer){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionAnswer);this._processAnswer(a)}else{if(b==CubeConst.ActionByeAck){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionByeAck);this._processByeAck(a)}else{if(b==CubeConst.ActionBye){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionBye);this._processBye(a)}else{if(b==CubeConst.ActionCancelAck){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionCancelAck);this._processCancelAck(a)}else{if(b==CubeConst.ActionCancel){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionCancel);this._processCancel(a)}else{if(b==CubeConst.ActionCandidate){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionCandidate);this._processCandidate(a)}else{if(b==CubeConst.ActionCandidateAck){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionCandidateAck);this._processCandidateAck(a)}else{if(b==CubeConst.ActionConsult){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionConsult);this._processConsult(a)}else{if(b==CubeConst.ActionConsultAck){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionConsultAck);this._processConsultAck(a)}else{if(b==CubeConst.ActionConferenceAck){Logger.d("SignalingWorker#onDialogue",CubeConst.ActionConferenceAck);this._processConferenceAck(a)}}}}}}}}}}}}}},cua:function(){if(null==this.confUA){this.confUA=new CubeConferenceUA(this)}return this.confUA},getConferenceUA:function(){return this.cua()},setDelegate:function(a){this.delegate=a},setAutoAnswer:function(a){this.autoAnswer=a},setBandwidth:function(b,a){this.audioBandwidth=b;this.videoBandwidth=a},getLocalVideo:function(){return this.localVideo},getRemoteVideo:function(){return this.remoteVideo},invite:function(d,c){if(!this.isChannelReady){return false}var b=this;b.target=d.toString();b.isInitiator=true;b.direction=CubeCallDirection.Outgoing;b.videoEnabled=c;b.state=CubeSignalingState.Invite;if(null!=b.delegate){b.delegate.didInvite(b,b.direction,b.target,b.videoEnabled)}var e=320;var a=240;if(null!=b.maxVideoSize){if(b.maxVideoSize.width!==undefined){e=b.maxVideoSize.width}if(b.maxVideoSize.height!==undefined){a=b.maxVideoSize.height}}Logger.d("SignalingWorker","Camera resolution: "+e+"x"+a);var f={mandatory:{maxWidth:e,maxHeight:a,minWidth:160,minHeight:120,maxFrameRate:b.maxFrameRate,minFrameRate:b.minFrameRate}};if(window.utils.isFirefox){f={width:{min:160,max:e},height:{min:120,max:a},frameRate:parseInt(b.maxFrameRate),require:["width","height","frameRate"]}}if(window.utils.isIE&&window.getUserMedia){navigator.getUserMedia=window.getUserMedia}navigator.getUserMedia({audio:true,video:c?f:false},function(g){b.handleUserMedia(g);b.checkAndStart()},function(g){b.handleUserMediaError(g)});Logger.d("SignalingWorker","Getting user media with constraints");this._showMask();return true},answer:function(){if(!this.isChannelReady){return false}if(this.isInitiator||null==this.sdpCache){return false}if(this.checkAndStart()){var a=this;this.pc.setRemoteDescription(new RTCSessionDescription({type:"offer",sdp:a.sdpCache}),function(){a.doAnswer()},function(b){a.onSignalingError(b)});return true}else{return false}},hangup:function(){if(this.state==CubeSignalingState.None){return false}if(this.state==CubeSignalingState.Incall){var a=new ActionDialect();a.setAction(CubeConst.ActionBye);a.appendParam("call",this.target);nucleus.talkService.talk(_S_CELLET,a);this._cleanCall()}else{if(this.state==CubeSignalingState.Invite||this.state==CubeSignalingState.Ringing){var a=new ActionDialect();a.setAction(CubeConst.ActionCancel);a.appendParam("call",this.target);nucleus.talkService.talk(_S_CELLET,a);this._cleanCall()}}return true},consult:function(e,a){if(this.state!=CubeSignalingState.Incall){return false}var c=this.session.callPeer.name.toString();var d={ver:1,media:e,operation:a};var b=new ActionDialect();b.setAction(CubeConst.ActionConsult);b.appendParam("peer",c);b.appendParam("payload",d);nucleus.talkService.talk(_S_CELLET,b);return true},checkAndStart:function(){if(!this.isStarted&&this.localStream!=null){if(!this.createPeerConnection()){return false}this.isStarted=true;if(this.isInitiator){this.doCall()}return true}else{return false}},createPeerConnection:function(){var a=this;try{var b={iceServers:a.iceServersUrls};a.pc=new RTCPeerConnection(b,a.pcConstraints);a.pc.addStream(a.localStream);a.pc.onicecandidate=function(d){a.handleIceCandidate(d)}}catch(c){Logger.d("SignalingWorker","Failed to create PeerConnection, exception: "+c.message);if(null!=this.delegate){this.delegate.didFailed(this,this.target,CubeCallErrorCode.RTCInitializeFailed)}this._cleanCall();return false}a.pc.onaddstream=function(d){a.handleRemoteStreamAdded(d)};a.pc.onremovestream=function(d){a.handleRemoteStreamRemoved(d)};return true},doCall:function(){Logger.d("SignalingWorker","Creating Offer...");var a=this;a.pc.createOffer(function(b){b.sdp=a._fixSdp(b.sdp);a.setLocalAndSendInvite(b)},function(b){a.onSignalingError(b)},a.sdpConstraints)},doAnswer:function(){Logger.d("SignalingWorker","Creating Answer...");var a=this;a.pc.createAnswer(function(b){b.sdp=a._fixSdp(b.sdp);a.setLocalAndSendAnswer(b)},function(b){a.onSignalingError(b)},a.sdpConstraints)},setLocalAndSendInvite:function(b){var a=this;this.pc.setLocalDescription(b,function(){var c=new ActionDialect();c.setAction(CubeConst.ActionInvite);c.appendParam("callee",a.target);c.appendParam("sdp",a.pc.localDescription.sdp);nucleus.talkService.talk(_S_CELLET,c);Logger.d("SignalingWorker#setLocalAndSendInvite","Offer:\n"+a.pc.localDescription.sdp)},function(c){Logger.e("SignalingWorker","set local description error: "+c)})},setLocalAndSendAnswer:function(b){var a=this;this.pc.setLocalDescription(b,function(){var c=new ActionDialect();c.setAction(CubeConst.ActionAnswer);c.appendParam("caller",a.target);c.appendParam("sdp",a.pc.localDescription.sdp);nucleus.talkService.talk(_S_CELLET,c);a.drainCandidateQueue();Logger.d("SignalingWorker#setLocalAndSendAnswer","Answer:\n"+a.pc.localDescription.sdp)},function(c){Logger.e("SignalingWorker","set local description error: "+c)})},attachMediaStream:function(a,b){if(window.utils.isIE&&window.attachMediaStream){window.attachMediaStream(a,b);return}if(window.URL){a.src=window.URL.createObjectURL(b)}else{a.src=b}a.onloadedmetadata=function(c){a.play()}},handleUserMedia:function(a){this.localStream=a;this.attachMediaStream(this.localVideo,a);if(utils.isIE&&this.localVideo.tagName.toLowerCase()=="video"){this.localVideo=document.getElementById(this.localVideo.id)}this.localVideo.muted=true;this.localVideo.controls=false;Logger.d("SignalingWorker","Adding local stream.");this._closeMask()},handleUserMediaError:function(a){Logger.e("SignalingWorker","Navigator.getUserMedia error: "+JSON.stringify(a));this._closeMask()},handleIceCandidate:function(b){if(b.candidate){var a=new ActionDialect();a.setAction(CubeConst.ActionCandidate);a.appendParam("peer",this.target);a.appendParam("candidate",{sdpMid:b.candidate.sdpMid,sdpMLineIndex:b.candidate.sdpMLineIndex,sdp:b.candidate.candidate});nucleus.talkService.talk(_S_CELLET,a)}else{Logger.d("SignalingWorker","End of candidates.")}},handleRemoteStreamAdded:function(a){try{if(null!=this.bellAudio){this.bellAudioPaused=true;this.bellAudio.pause()}}catch(b){}if(this.iceTimer>0){clearTimeout(this.iceTimer);this.iceTimer=0}this.remoteStream=a.stream;this.attachMediaStream(this.remoteVideo,a.stream);if(utils.isIE&&this.remoteVideo.tagName.toLowerCase()=="video"){this.remoteVideo=document.getElementById(this.remoteVideo.id)}},handleRemoteStreamRemoved:function(a){Logger.d("SignalingWorker","Remote stream removed. Event: "+a);if(this.iceTimer>0){clearTimeout(this.iceTimer);this.iceTimer=0}},drainCandidateQueue:function(){for(var a=0;a<this.candidateQueue.length;++a){var b=this.candidateQueue[a];this.pc.addIceCandidate(b)}this.candidateQueue.splice(0,this.candidateQueue.length);this.candidateQueue=[]},onSignalingError:function(a){Logger.w("SignalingWorker#onSignalingError","Failed to create signaling message : "+a.name)},_setBandwidth:function(a){a=a.replace(/a=mid:audio\r\n/g,"a=mid:audio\r\nb=AS:"+this.audioBandwidth+"\r\n");a=a.replace(/a=mid:video\r\n/g,"a=mid:video\r\nb=AS:"+this.videoBandwidth+"\r\n");a=a.replace(/a=mid:sdparta_0\r\n/g,"a=mid:sdparta_0\r\nb=AS:"+this.audioBandwidth+"\r\n");a=a.replace(/a=mid:sdparta_1\r\n/g,"a=mid:sdparta_1\r\nb=AS:"+this.videoBandwidth+"\r\n");return a},_fixSdp:function(a){var b=this._setBandwidth(a);return b},_processInviteAck:function(a){var d=a.getParam("state");var c=d.code;if(c!=200){if(null!=this.delegate){this.delegate.didFailed(this,this.target,c)}return}if(this.direction==CubeCallDirection.Outgoing){var b=a.getParam("callee");this.targetData=a.getParam("calleeData");this.state=CubeSignalingState.Ringing;if(null!=this.bellAudio){this.bellAudioPaused=false;this.bellAudio.loop=true;this.bellAudio.src="assets/sounds/ringbacktone.wav"}if(null!=this.delegate){this.delegate.didRinging(this,b)}}},_processInvite:function(f){if(this.state==CubeSignalingState.None){this.isInitiator=false;this.direction=CubeCallDirection.Incoming;this.state=CubeSignalingState.Invite;var c=this;if(null!=this.bellAudio){this.bellAudioPaused=false;this.bellAudio.loop=true;this.bellAudio.src="assets/sounds/ringtone.wav"}var d=f.getParam("caller");var a=f.getParam("sdp");this.sdpCache=a;var e=false;if(a.indexOf("m=video")>=0){e=true}this.videoEnabled=e;this.target=d.toString();this.targetData=f.getParam("callerData");var g=320;var b=240;if(null!=c.maxVideoSize){if(c.maxVideoSize.width!==undefined){g=c.maxVideoSize.width}if(c.maxVideoSize.height!==undefined){b=c.maxVideoSize.height}}var h={mandatory:{maxWidth:g,maxHeight:b,minWidth:160,minHeight:120,maxFrameRate:c.maxFrameRate,minFrameRate:c.minFrameRate}};if(window.utils.isFirefox){h={width:{min:160,max:g},height:{min:120,max:b},frameRate:parseInt(c.maxFrameRate),require:["width","height","frameRate"]}}if(window.utils.isIE&&window.getUserMedia){navigator.getUserMedia=window.getUserMedia}navigator.getUserMedia({audio:true,video:(e?h:false)},function(i){c.handleUserMedia(i);if(c.autoAnswer){setTimeout(function(){c.answer()},60)}},function(i){c.handleUserMediaError(i)});if(null!=this.delegate){this.delegate.didInvite(this,this.direction,this.target,e)}this._showMask()}else{Logger.e("SignalingWorker#_processInvite","Signaling state error: "+this.state)}},_processAnswerAck:function(b){if(null!=this.bellAudio){this.bellAudioPaused=true;this.bellAudio.pause()}var c=b.getParam("state");if(c.code!=200){if(null!=this.delegate){this.delegate.didFailed(this,this.target,code)}return}if(this.direction==CubeCallDirection.Incoming){var a=b.getParam("caller");this.state=CubeSignalingState.Incall;if(null!=this.delegate){this.delegate.didIncall(this,this.direction,a,null)}}},_processAnswer:function(c){if(this.direction==CubeCallDirection.Outgoing){var d=c.getParam("callee");var a=c.getParam("sdp");this.pc.setRemoteDescription(new RTCSessionDescription({type:"answer",sdp:a}));this.drainCandidateQueue();this.state=CubeSignalingState.Incall;if(null!=this.bellAudio){this.bellAudioPaused=true;this.bellAudio.pause()}if(null!=this.delegate){this.delegate.didIncall(this,this.direction,d,a)}if(this.iceTimer>0){clearTimeout(this.iceTimer)}var b=this;this.iceTimer=setTimeout(function(){clearTimeout(b.iceTimer);b.iceTimer=0;if(null!=b.delegate){b.delegate.didFailed(b,b.target,CubeCallErrorCode.ICEConnectionFailed)}b.hangup()},this.iceTimeout)}},_processByeAck:function(a){if(null!=this.delegate){this.delegate.didEnd(this,this.target)}this._cleanCall()},_processCancelAck:function(a){if(null!=this.delegate){this.delegate.didEnd(this,this.target)}this._cleanCall()},_processBye:function(a){if(this.state==CubeSignalingState.None){return}if(null!=this.delegate){this.delegate.didEnd(this,this.target)}this._cleanCall()},_processCancel:function(a){if(this.state==CubeSignalingState.None){return}if(null!=this.delegate){this.delegate.didEnd(this,this.target)}this._cleanCall()},_processCandidate:function(b){var a=b.getParam("candidate");var c=new RTCIceCandidate({sdpMLineIndex:a.sdpMLineIndex,sdpMid:a.sdpMid,candidate:a.sdp});if(null==this.pc){this.candidateQueue.push(c);return}this.pc.addIceCandidate(c)},_processCandidateAck:function(a){},_processConsult:function(a){var b=a.getParam("peer");var d=a.getParam("payload");if(b==this.session.callPeer.name){if(d.ver==1){if(d.media=="video"){if(d.operation=="close"){try{this.localStream.getVideoTracks()[0].enabled=false}catch(c){}}else{if(d.operation=="open"){try{this.localStream.getVideoTracks()[0].enabled=true}catch(c){}}}}}}else{Logger.w("SignalingWorker#_processConsult","Session peer error: "+b)}},_processConsultAck:function(a){},_processConferenceAck:function(a){if(null!=this.confUA){this.confUA.processDialect(a)}},_bodyOverflow:null,_maskDom:null,_maskHeight:1080,_showMask:function(){this._closeMask();this._bodyOverflow=document.body.style.overflow;var a=window.innerWidth;var d=parseInt(window.innerHeight)+70;if(d>this._maskHeight){this._maskHeight=d}document.body.style.overflow="hidden";if(null==this._maskDom){var e=document.createElement("div");e.id="_cube_mask_";e.style.position="absolute";e.style.styleFloat="left";e.style.cssFloat="left";e.style.left="0px";e.style.top="0px";e.style.width=a+"px";e.style.height=this._maskHeight+"px";e.style.zIndex=9999;e.style.opacity=0.6;e.style.mozOpacity=0.6;e.style.webkitOpacity=0.6;e.style.background="#000";var b=this;e.addEventListener("dblclick",function(c){b._closeMask()},false);this._maskDom=e}else{this._maskDom.style.left="0px";this._maskDom.style.top="0px";this._maskDom.style.width=a+"px";this._maskDom.style.height=this._maskHeight+"px"}document.body.appendChild(this._maskDom)},_closeMask:function(){if(null!=this._bodyOverflow){document.body.removeChild(this._maskDom);document.body.style.overflow=this._bodyOverflow;this._bodyOverflow=null}},_cleanCall:function(){if(this.iceTimer>0){clearTimeout(this.iceTimer);this.iceTimer=0}if(null!=this.videoCloseHandler){this.videoCloseHandler.call(null,this)}if(null!=this.bellAudio){this.bellAudioPaused=true;this.bellAudio.pause()}try{if(utils.isIE){this.localVideo=document.getElementById(this.localVideo.id);window.attachMediaStream(this.localVideo,null)}else{this.localVideo.src=""}}catch(a){Logger.w("SignalingWorker#clean",a.message)}try{if(utils.isIE){this.remoteVideo=document.getElementById(this.remoteVideo.id);window.attachMediaStream(this.remoteVideo,null)}else{this.remoteVideo.src=""}}catch(a){Logger.w("SignalingWorker#clean",a.message)}if(null!=this.localStream){this.localStream.stop();this.localStream=null}if(null!=this.remoteStream){try{this.remoteStream.getAudioTracks()[0].stop();this.remoteStream.getVideoTracks()[0].stop()}catch(a){Logger.w("SignalingWorker#clean",a.message)}this.remoteStream=null}if(null!=this.pc){this.pc.close();this.pc=null}this.direction=null;this.target=null;this.targetData=null;this.state=CubeSignalingState.None;this.isInitiator=false;this.isStarted=false;this.sdpCache=null}});var CubeConferenceUA=Class({callbackMap:null,ctor:function(){this.callbackMap=new HashMap()},listConferences:function(d){var a=new String(Date.now());this.callbackMap.put(a,d);var c={cmd:"list",task:a};var b=new ActionDialect();b.setAction(CubeConst.ActionConference);b.appendParam("request",c);if(!nucleus.talkService.talk(_S_CELLET,b)){this.callbackMap.remove(a);return false}return true},getConference:function(e,d){var a=new String(Date.now());this.callbackMap.put(a,d);var c={cmd:"get",task:a,id:e.toString()};var b=new ActionDialect();b.setAction(CubeConst.ActionConference);b.appendParam("request",c);if(!nucleus.talkService.talk(_S_CELLET,b)){this.callbackMap.remove(a);return false}return true},changeFloor:function(c,b,f){var a=new String(Date.now());this.callbackMap.put(a,f);var e={cmd:"floor",task:a,conf:c.toString(),caller:b.toString()};var d=new ActionDialect();d.setAction(CubeConst.ActionConference);d.appendParam("request",e);if(!nucleus.talkService.talk(_S_CELLET,d)){this.callbackMap.remove(a);return false}return true},setMemberDeaf:function(d,c,b,g){var a=new String(Date.now());this.callbackMap.put(a,g);var f={cmd:"deaf",task:a,conf:d.toString(),caller:c.toString(),deaf:b};var e=new ActionDialect();e.setAction(CubeConst.ActionConference);e.appendParam("request",f);if(!nucleus.talkService.talk(_S_CELLET,e)){this.callbackMap.remove(a);return false}return true},setMemberMute:function(c,b,f,g){var a=new String(Date.now());this.callbackMap.put(a,g);var e={cmd:"mute",task:a,conf:c.toString(),caller:b.toString(),mute:f};var d=new ActionDialect();d.setAction(CubeConst.ActionConference);d.appendParam("request",e);if(!nucleus.talkService.talk(_S_CELLET,d)){this.callbackMap.remove(a);return false}return true},notifyJoin:function(c,b){var a=new String(Date.now());var e={cmd:"join",task:a,conf:c.toString(),caller:b.toString()};var d=new ActionDialect();d.setAction(CubeConst.ActionConference);d.appendParam("request",e);return nucleus.talkService.talk(_S_CELLET,d)},processDialect:function(d){var e=d.getParam("state");if(e.code==200){var c=d.getParam("response");var b=c.task;if(c.cmd=="floor"||c.cmd=="deaf"||c.cmd=="mute"||c.cmd=="get"){var a=this.callbackMap.get(b);if(null!=a){a.call(null,c.conference);this.callbackMap.remove(b)}}else{if(c.cmd=="list"){var a=this.callbackMap.get(b);if(null!=a){a.call(null,c);this.callbackMap.remove(b)}}}}else{Logger.w("CubeConferenceUA","Ack state: "+e.code);var b=d.getParam("task");var a=this.callbackMap.remove(b);if(null!=a){a.call(null)}}}});