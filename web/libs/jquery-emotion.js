// 表情插件
(function($){  
	$.fn.emotion = function(options){
		var defaults = {
			id : 'emotion_box',
			path : 'emotion/',
			assign : 'content',
			tip : 'em_',
			width : 120,
			maxHeight : 180,
		};
		var option = $.extend(defaults, options);
		var assign = $('#'+option.assign);
		var id = option.id;
		var path = option.path;
		var tip = option.tip;
		var maxHeight = option.maxHeight;
		var width = option.width;
		var colNum = parseInt(width / 28);
		
		if(assign.length<=0){
			alert('缺少表情赋值对象。');
			return false;
		}
		
		$(this).click(function(e){
			var strFace;
			var labFace;
			if($('#'+id).length<=0){
				strFace = '<div id="'+id+'" style="position:absolute; display:none; z-index:1000; background: #fff; padding: 2px; border: 1px #dfe6f6 solid; overflow: auto;" class="emotion">' +
							  '<table border="0" cellspacing="0" cellpadding="0"><tr>';
				for(var i=1; i<=75; i++){
					labFace = '['+tip+i+']';
					strFace += '<td><img src="'+path+i+'.gif" onclick="$(\'#'+option.assign+'\').insertAtCaret(\'' + labFace + '\');" /></td>';
					if( i % colNum == 0 ) {
						strFace += '</tr><tr>';
					} 
				}
				strFace += '</tr></table></div>';
			}
			$(this).parent().append(strFace);
			$('#'+id).css('max-height', maxHeight);
			//var offset = $(this).position();
			//var top = offset.top - $(this).outerHeight();
			//$('#'+id).css('top',top);
			//$('#'+id).css('left',offset.left);
			$('#'+id).css('bottom', 34 + 5);
			$('#'+id).css('right', 5);
			$('#'+id).show();
			e.stopPropagation();
		});

		$(document).click(function(){
			$('#'+id).hide();
			$('#'+id).remove();
		});
	};

})(jQuery);

jQuery.fn.extend({ 
	insertAtCaret: function(textFeildValue){ 
		var textObj = $(this).get(0); 
		textObj.value+=textFeildValue; 
		textObj.focus();
	} 
});