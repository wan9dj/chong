function animateWords(strarr,delay,sbox){
	function cloneArr(arr){
		var tmpArr = [];
		for(var i in arr){
			tmpArr.push(arr[i]);
		}
		return tmpArr;
	}
	function showToggle(ele){
		ele.style.visibility = ele.style.visibility == 'visible'?'hidden':'visible';
	}
	
	var strbox = document.createElement('span');
	//strbox.id = "strbox";
	var biao = document.createElement("span");
	biao.style.borderRight="2px solid #333";
	biao.style.marginLeft="5px";
	//biao.id="i";
	sbox.appendChild(strbox);
	sbox.appendChild(biao);
	var strArr = strarr;
	var playIndex=0;
	var tmpStr="";
	var delay = delay;
	var playFunc = function playFunc(visible){
		setTimeout(function(){
			var playDelay = 0;

			switch(visible){
				case "show":
					var newStr = strArr[playIndex].substr(0,tmpStr.length + 1);
					tmpStr = newStr;
				break;
				case "hide":
					var newStr = tmpStr.substr(0,tmpStr.length - 1);
					tmpStr = newStr;
				break;
			}

			strbox.innerHTML = tmpStr;
			if(tmpStr.length == strArr[playIndex].length){
				//console.log("tmp: "+tmpStr,"str: "+strArr[playIndex]);
				visible = visible=="show"?"hide":"show";
			}
			if(tmpStr.length == 0 && visible == "hide"){
				//console.log("goto next");
				visible = "show";
				playIndex ++;
			}
			if(playIndex == strArr.length){
				tmpStr = "";
				playIndex = 0;
				playDelay = delay;
			}
			setTimeout(function(){
				playFunc(visible);
			},playDelay);
		},delay);
	}("show");
	!function playBiao(){
		setTimeout(function(){ showToggle(biao); playBiao();},150);
	}();
}