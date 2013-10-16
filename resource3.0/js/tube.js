/**
 * Package：resource.model
 * author : 杨晨辉 chenhui.yang@yahoo.com
 * Dependency:
 * 			 1) jQuery.js
 * 			 2) constant.js
 * 
 * 
 * Description:  			  
 *           光缆束管的对象类
 * 
 *  
 * 
 */


var resource = resource || {};

 (function(){
	if(!resource.model){
		resource.model = {};
	}
	
	var SVGNS = "http://www.w3.org/2000/svg";
	
	/**
	 * Class resource.model.Tube
	 * 
 	 * @param {Object} config 束管的配置信息，是键值对(key,value)的数据格式
 	 * 				   exp: {
 	 * 							cableId:'b0000',			  //所属光缆ID
							    tubeIndex:0,				  //束管索引
 	 * 							tubeColor: '#0000FF',         //束管的颜色
 	 * 							fiberNum ：12,                //束管的纤芯数目前主要使用12纤芯
 	 * 							x : 0,						  //束管左上角x坐标,默认为0
 	 * 							y : 0,						  //束管左上角y坐标,默认为0 		
 	 * 							width : 10,                   //束管截面的宽，默认为10
 	 * 							height: 120					  //束管截面的高，默认为120	
 	 *							lfiberNum : 12                //束管左边进入的纤芯数
 	 *							rfiberNum ：12                //束管右边出的纤芯数
 	 *							subTubes :[
	 *								{
	 * 									tubeColor: '#FFFFFF',         
		 	 * 							fiberNum ：12,  
		 	 *  						tubeIndex:0,               
		 	 * 							x : 0,						  
		 	 * 							y : 0,						  
		 	 * 							width : 10,                   
		 	 * 							height: 120，					  
		 	 *							lfiberNum : 12，               
		 	 *							rfiberNum ：12                
	 * 								},{
	 * 									
	 * 									tubeColor: '#FFFFFF',
	 * 									fiberNum ：6,
	 * 									tubeIndex:0,
	 * 									x : 0,	
	 * 									y : 0,	
	 * 									width : 10,  
	 * 									height: 120	,
	 * 									lfiberNum : 12,
	 * 									rfiberNum ：12
	 * 								}
 	 *							]				
 	 * 						}
 	 * 							
	 */
	resource.model.Tube = function(config){
		
		//与束管左侧相关联的线条
		this._lines_left = new Array();
		this._lines_right = new Array();
		this._default_lines = new Array();
		this.isFirst = false;
		//tube的子节点
		this.subTubeNodes = new Array(); 
		this.subTubeMap   = new HashMap();
		this.hasSubTubeNode = false;		
		this.fibersCoordMap = new HashMap();
		
		//父子束管之间的默认距离
		this.tubeDistance = 200;
		
		this.numequals = 0;
		this.greater   = 0;
		this.smaller   = 0;
		/**
		 * Tube 的默认配置
		 */
		var defaultConfig_ = {
			tubeColor : resource.constant.COLORS[0],
			fiberNum  : 12,
			x : 10,
			y : 10,
			width : 10,
			height: 200,
			lfiberNum : 12,
			rfiberNum : 12,
			isFirst : true
		};
		
		if(config === null){
			config = defaultConfig_;
		}

		this._config = config;
		
		
		var _lfiberNum = this._config.lfiberNum;
		for(var i = 0 ; i < _lfiberNum ; i ++){
			this._lines_left.push({
				"fiberIndex" : i,
				"fiberColor" : resource.constant.COLORS[ i % 12 ]
			});
		}

		var _rfiberNum = this._config.rfiberNum;
		for(var i = 0 ; i < _rfiberNum ; i ++){
			this._lines_right.push({
				"fiberIndex" : i,
				"fiberColor" : resource.constant.COLORS[ i % 12 ]
			});
		}
		
		var _fiberNum  = this._config.fiberNum;
		for(var i = 0 ; i < _fiberNum ; i ++){
			this._default_lines.push({
				"fiberIndex" : i,
				"fiberColor" : resource.constant.COLORS[ i % 12 ]
			});
		}
		
		var subNodes_ = this._config.subTubes;
		
		//构建与本束管相连的束管信息
		if((typeof subNodes_) == "undefined" ){
			this.hasSubTubeNode = false ;
		}else{
			if(subNodes_.length > 0){
				this.hasSubTubeNode = true;			
				for(var i = 0 ; i < subNodes_.length ; i++){
					var subNodes_i = subNodes_[i];
					var subNode_ = new resource.model.Tube(subNodes_i);
					this.subTubeNodes.push(subNode_);
					var key = subNodes_i.cableId + "_" + subNodes_i.tubeIndex;
					this.subTubeMap.put(key,subNode_);		
					this.tubeDistance = subNodes_i.x - this._config.x;
				}
			}
		}
		
		this.printConfig = function(){
			for(var i in this._config){
				console.log(i + ":" + this._config[i]);
			}			
		};
		
		this.getLinesLeft = function(){
			return this._lines_left;
		};
		
		this.getLinesRight = function(){
			return this._lines_right;
		};
		
		this.drawTubeSelf = function(node){
			
			
			//绘制内部的虚线框
			var rect_dosh = document.createElementNS(SVGNS,'rect');
			resource.util.assginAttribute(rect_dosh,{
				id:this._config.cableId+"_" + this._config.tubeIndex ,
				style:"fill:none;stroke:#A9A9A9;stroke-width:1px;stroke-opacity:1;stroke-dasharray:2 2;",	
				"stroke-width":"1px",  	     
		        width:this._config.width - this._config.width / 2,
		        height:this._config.height,
		        x: this._config.x + this._config.width / 4,
		        y: this._config.y,		       
		        "vector-effect":"non-scaling-stroke"											
			});
			node.appendChild(rect_dosh);
				
		    //画tube矩形		
			var rect1 = document.createElementNS(SVGNS,'rect');
			resource.util.assginAttribute(rect1,{
				style:"fill:none;stroke:" + this._config.tubeColor+";stroke-opacity:1",		
				"stroke-width":"1px",
		        width:this._config.width,
		        height:this._config.height,
		        x: this._config.x,
		        y: this._config.y,
		        onmouseover:"mouseOver(evt)",
		        onmouseout: "mouseOut(evt)",
		        "vector-effect":"non-scaling-stroke"
			});
			node.appendChild(rect1);
			
		};
		
		this.drawFiberLines = function(node){
			//根据关系画图
			var relationshipLineProp = this._config.relationshipLineProp;
			var selfCableId = this._config.cableId;
			var selfTubeIndex = this._config.tubeIndex;			
			//var _equals  = new Array();
			//var _smaller = new Array();
			//var _greater = new Array(); 
			if(typeof relationshipLineProp === "undefined"){
				
			}else{
				
				/**
				 * 计算本tube 和子的tube 的fiber的坐标信息
				 */
				this.calculateFiberCoords();
				
				//this.numequals  = _greater.length + _smaller.length ;
				//this.numgreater = _greater.length;
				//this.numsmaller = _smaller.length;
				//console.log(this.numequals + ":" + this.numgreater + ":" + this.numsmaller);
				
				var num_noequals = this.numequals;
				//var num_noequals = 196;
				
				var fiber_line_space   			= (this.tubeDistance - 20 ) / num_noequals ; 
				var fiber_line_space_left_right = 20 / 2;
				var j = 0;
					for(var i = 0 ; i < relationshipLineProp.length ; i++){				   		
				   		var rs = relationshipLineProp[i];
				   		var cableAId    = rs.cableAId;
				   		var tubeAIndex  = rs.tubeAIndex;
				   		var fiberAIndex = rs.fiberAIndex;
						var cableBId    = rs.cableBId;
				   		var tubeBIndex  = rs.tubeBIndex;
				   		var fiberBIndex = rs.fiberBIndex;
				   		if( cableAId === selfCableId){
				   			var subTubeNode = this.subTubeMap.get(cableBId + "_" + tubeBIndex);
				   			if(subTubeNode != null){
				   				var selfCoord = this.fibersCoordMap.get(""+fiberAIndex);
				   				var cableBCoord = subTubeNode.fibersCoordMap.get("" + fiberBIndex);
				   				var path = document.createElementNS(SVGNS,'path');
								
								if(selfCoord.y > cableBCoord.y){
									resource.util.assginAttribute(path,{
										style :" fill:none;stroke:"+ selfCoord.fiberColor +";stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1",				       
								        d : (
								        		" M" + 
								        		selfCoord.x  + "  " + selfCoord.y + " " +
								        		" L" + (selfCoord.x + fiber_line_space_left_right + (i * fiber_line_space) +  20) + "  " + selfCoord.y + " " + 
								        		" L" + (selfCoord.x + fiber_line_space_left_right + (i * fiber_line_space) +  20) + "  " + cableBCoord.y + " " +
								        		" L" + cableBCoord.x + " " + cableBCoord.y
								        	)
									});	
								}else if(selfCoord.y < cableBCoord.y){
									resource.util.assginAttribute(path,{
										style :" fill:none;stroke:"+ selfCoord.fiberColor +";stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1",				       
								        d : (
								        		" M" + 
								        		cableBCoord.x  + "  " + cableBCoord.y + " " +
								        		" L" + (cableBCoord.x - fiber_line_space_left_right - ((j) * fiber_line_space) -  20) + "  " + cableBCoord.y + " " + 
								        		" L" + (cableBCoord.x - fiber_line_space_left_right - ((j) * fiber_line_space) -  20) + "  " + selfCoord.y + " " +
								        		" L" +  selfCoord.x + " " + selfCoord.y
								        	)
									});	
									j ++;
								}else{
									resource.util.assginAttribute(path,{
										style :" fill:none;stroke:"+ selfCoord.fiberColor +";stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1",				       
								        d : (
								        		" M" + 
								        		selfCoord.x  + "  " + selfCoord.y + " " +								        	
								        		" L" + cableBCoord.x + " " + cableBCoord.y
								        	)
									});	
								}
										
								node.appendChild(path);
								
							}
						}
				}		
			}

		};
		
	   /**
		*	
		*
		*
		*
		*/
		this.drawInSvg = function(node,flag){
			
			//画tube 自己的矩形
			this.drawTubeSelf(node);	
			if(flag == true){
				this.drawFiberLines(node);
			}else{
				
			}
/////////////////////////////////////////////////////////////不用去绘制自节点用子cable自己去绘制
			//this.drawSubNodes(node);			
			
		};
		
		/**
		 * Function : addSubTube
		 * @param : subTubeArray         子tube对象配置数组
  		 * @param : releationships       tube和subTubeArray的对应关系 
  		 * @ return :  
		 */
		this.addSubTube = function(subTubeArray,releationships){
			
			//console.log(this._config.relationshipLineProp);
			//	console.log(subTubeArray  + "::::::::::::::::" + releationships );
			
			var subTubes = subTubeArray.subTubes;
			//console.log( " this.addSubTube = function(subTubeArray,releationships)    begin");
			//console.log(subTubeArray.subTubes);
			
			try{
				for(var i = 0 ; i < subTubes.length ; i++){
					//console.log(subTubes[i] + "123333333333333333333333");
					var subTube = new resource.model.Tube(subTubes[i]);		
					//console.log(subTube + "new" + " : " + subTube._config.cableId + ":" + subTube._config.tubeIndex);							
					this.subTubeMap.put(subTube._config.cableId + "_" + subTube._config.tubeIndex,subTube);				
				}	
			}catch(e){
				alert(e);
			}		
			
			if(typeof this._config.relationshipLineProp != "undefined"){
				var temp = releationships.relationshipLineProp;
				for(var i = 0 ; i < temp.length ; i ++){
					this._config.relationshipLineProp.push(temp[i]);
				}
				
			}else{
				$.extend(true,this._config,{
					relationshipLineProp:releationships.relationshipLineProp
				});
			}

			

			return this;		
			
		}

		/**
		 * Function : drawSubNodes 
		 * 画一个节点的子节点
		 * 
		 */
		this.drawSubNodes = function(node){
			if(this.subTubeMap.size() <= 0 ){
				return;
			}			
			
			var subTubNodesV = this.subTubeMap.values();
			for(var i = 0 ; i < subTubNodesV.length ; i ++){
				var subTubeNode = subTubNodesV[i];	
				//console.log(subTubeNode + "00000000000000");	
				if(typeof suTubeNode != "undefined" ){
						subTubeNode.drawInSvg(node);	
				}
			
			}
			
			var keys = this.subTubeMap.keys();
			for(var i = 0 ;  i  <  keys.length ; i ++){
			
				var subTubeNode = this.subTubeMap.get(keys[i]);
				subTubeNode.drawInSvg(node);	
				
			}
			
			/**
			for(var i = 0; i < this.subTubeNodes.length ; i ++){		
				var subTubeNode = this.subTubeNodes[i];					
				subTubeNode.drawInSvg(node);				
			}*/
		};
		
		this.cal = function(){
			
				/**
				 * 计算出自身tube的fiber坐标
				 */			
				var firstLineX = this._config.x + (this._config.width /2) ;
				var firstLineY = this._config.y ;
				//console.log( "(" +  firstLineX + "," + firstLineY +")");
				var lineWidth = 200 ;
				var space =  5 ;
				var lines_visual = this._default_lines;
						
				for(var i = 0 ; i < lines_visual.length ; i++){				
						var element_ = lines_visual[i];		
						var fiberColor_ = element_.fiberColor;
						//console.log(element_);			
						var x = firstLineX ;
						var y = firstLineY ;
						if(i == 0){
							y += space; 
						}else{
							y += ((this._config.height - 2 * space) / (this._config.fiberNum - 1 )) * (i ) + space;
						}	
						
						this.fibersCoordMap.put(""+i,{
							x:x,
							y:y,
							fiberColor:fiberColor_						
						});
				}	
			
		};
	
		
		/**
		 * Function : calcateFiberCoords 
		 * Description : 计算光缆纤芯的坐标
		 */
		this.calculateFiberCoords = function(){
			
					this.cal();
					var keys = this.subTubeMap.keys();
					for(var i = 0 ; i < keys.length ; i ++){
						this.subTubeMap.get(keys[i]).cal();
					}
					
		
					var relationshipLineProp = this._config.relationshipLineProp;
					var selfCableId = this._config.cableId;
					var selfTubeIndex = this._config.tubeIndex;			
					var _equals  = new Array();
					var _smaller = new Array();
					var _greater = new Array(); 
					if(typeof relationshipLineProp === "undefined"){
						  //console.log("this.calculateFiberCoords undefined");						
					}else{
						for(var i = 0 ; i < relationshipLineProp.length ; i++){				   		
						   		var rs = relationshipLineProp[i];
						   		var cableAId    = rs.cableAId;
						   		var tubeAIndex  = rs.tubeAIndex;
						   		var fiberAIndex = rs.fiberAIndex;
								var cableBId    = rs.cableBId;
						   		var tubeBIndex  = rs.tubeBIndex;
						   		var fiberBIndex = rs.fiberBIndex;
						   	
						   								   	
						   		if( cableAId === selfCableId){
						   			var subTubeNode = this.subTubeMap.get(cableBId + "_" + tubeBIndex);
						   			if(subTubeNode != null){
						   				var selfCoord = this.fibersCoordMap.get(""+fiberAIndex);
						   				var cableBCoord = subTubeNode.fibersCoordMap.get("" + fiberBIndex);
						   				
						   				/*
						   				 * 计算比较父tube fiber 和所有子tube fiber坐标关系
						   				 * 得到的结果：
						   				 * 			 父tube的所有 fiber 坐标等于 所有子fiber坐标的数量
						   				 * 			 父tube的所有fiber 坐标大于所有子fiber坐标的数量
						   				 * 			 父tube的所有fiber 坐标小于所有子fibe坐标的数量
						   				 */
						   				
						   				if(selfCoord.y == cableBCoord.y ){				   					
						   					_equals.push({
						   						fiberAIndex:fiberAIndex,
						   						fiberBIndex:fiberBIndex,
						   						xA:selfCoord.x,
						   						yA:selfCoord.y,
						   						xB:cableBCoord.x,
						   						yB:cableBCoord.y
						   					});
						   				}else if(selfCoord.y > cableBCoord.y){				   					
						   					_greater.push({
						   						fiberAIndex:fiberAIndex,
						   						fiberBIndex:fiberBIndex,
						   						xA:selfCoord.x,
						   						yA:selfCoord.y,
						   						xB:cableBCoord.x,
						   						yB:cableBCoord.y
						   					});
						   				}else{				   				
						   					_smaller.push({
						   						fiberAIndex:fiberAIndex,
						   						fiberBIndex:fiberBIndex,
						   						xA:selfCoord.x,
						   						yA:selfCoord.y,
						   						xB:cableBCoord.x,
						   						yB:cableBCoord.y
						   					});
						   				}	
						   			}
						   		}
						}						
						this.numequals = _greater.length + _smaller.length ;
						this.numgreater = _greater.length;
						this.numsmaller = _smaller.length;
				}
		}		
	};
	
	  	
  	/**
  	 * Class : resource.model.Cable  光缆类
  	 * @param config : 光缆的配置信息
  	 * 				   {  	 	
  	 * 					    	cableId:'xxxxxxxxxxxx',				光缆ID
  							    tubeNum:12,							光缆中束管的个数
  			                    fiberNumPerTube:12,					光缆中每根束管中光纤的数量
  			                    x : 200 ,				 			光缆
  								y : 100	,
  								fiberDistance :  10,
  								cableDistance : 300  ，                                            光缆与光缆的间距，
  								subCables[
  									cableId:'xxxxxxxxxxxx',				
	  							    tubeNum:12,							
	  			                    fiberNumPerTube:12,					
	  			                    x : 200 ,				 			
	  								y : 100	,
	  								fiberDistance :  10,
	  								cableDistance : 300                                           
  								]
  	 * 				   } 
  	 *  
  	 */
  	resource.model.Cable = function(config){
  		
  		/**
  		 * 存储束管数据
  		 * key : cableId + "_" + tubeIndex;
  		 */
  		this.tubesMap = new HashMap();
  		
  		/**
  		 * 子光缆信息
  		 */
  		this.subCableMap = new HashMap();
  		
  		/**
  		 * 存放所有的关系
  		 */
  		this.relationShip = new HashMap();

		/**
		 * 存放subTubes定义
		 */  		
  		this.subTubesMap  = new HashMap();  
  		
  		/**
  		 * 存放自身光缆纤芯的业务名称
  		 */		
  		this.transNameMap = new HashMap();
  		
  		
  		var defaultConfig = {
  			cableId:'xxxxxxxxxxxx',
  			tubeNum : 12,
  			fiberNumPerTube : 12,
  			fiberDistance :  10,
  			x : 200 ,
  			y : 100 ,
  			cableDistance : 300
  		};
  		
  		if(!config){
  			config = defaultConfig;
  		}
  		
  		this._config = config;

  		if(typeof this._config.x == "undefined" ){
					this._config.x = 200;
		}

		if(typeof this._config.y == "undefined" ){
				this._config.y = 100;
		}

		if(typeof this._config.fiberDistance == "undefined"){
			this._config.fiberDistance = 15;
		}

		if(typeof this._config.cableDistance == "undefined"){
			this._config.cableDistance = 500;
		}
  		
  		/**
  		 * 初始化子cable信息
  		 */  		
  		var _subCables = this._config.subCables; 		
  		
  		if(typeof _subCables != "undefined"){
  			for(var i = 0 ; i < _subCables.length ; i ++){  		
  				_subCables[i].x = this._config.x + this._config.cableDistance ;
  				_subCables[i].y = this._config.y + ( i == 0 ? 0: _subCables[i-1].fiberDistance) * ( i == 0 ? 0: _subCables[i-1].fiberNumPerTube) * ( i == 0 ? 0: _subCables[i-1].tubeNum)  * i + 10 * i;
  				_subCables[i].fiberDistance = this._config.fiberDistance;
		  		_subCables[i].cableDistance = this._config.cableDistance;	
	  			this.subCableMap.put(_subCables[i].cableId, new resource.model.Cable(_subCables[i]));
	  		}	
  		}
  		  		
  		/*
  		 * 初始话束管信息
  		 */
  		for(var i = 0 ; i < this._config.tubeNum ; i++){
  			var tubeConfig = {
  				cableId:  this._config.cableId,
				tubeIndex : i,
				tubeColor : resource.constant.COLORS[ i % 12 ],
				fiberNum  : this._config.fiberNumPerTube,
				x : this._config.x ,
				y : this._config.y + (this._config.fiberDistance * this._config.fiberNumPerTube) * i ,
				width  : 15,
				height : this._config.fiberDistance * this._config.fiberNumPerTube ,
				lfiberNum : this._config.fiberNumPerTube ,
				rfiberNum : this._config.fiberNumPerTube ,
				isFirst: (i == 0 ? true : false)  				
  			};  			  			
  			var tube = new resource.model.Tube(tubeConfig);  		
  			this.tubesMap.put("" + this._config.cableId + "_" + i , tube);
  		}	

  		/**
  		 * Function : resource.model.Cable.addSubTube  
  		 * @param : tubeIndex            tube索引
  		 * @param : subTubeArray         子tube对象数组
  		 * @param : releationships       tubeIndex对应的tube和subTubeArray的对应关系 
  		 */
  		this.addSubTube = function(tubeIndex,subTubeArray,releationships){
  			var key = this._config.cableId + "_" + tubeIndex;
  			//console.log("给" + this._config.cableId + "的第" + tubeIndex + "跟束管添加subTube ...... ");
  			var tube = this.tubesMap.get(key);
  		//	console.log("this.addSubTube = function(tubeIndex,subTubeArray,releationships)  begin");
  			//console.log(key + "           this.addSubTube = function(tubeIndex,subTubeArray,releationships)");
		//	console.log(tube._config.cableId  + "           this.addSubTube = function(tubeIndex,subTubeArray,releationships)");
		//	console.log(subTubeArray);
		//	console.log(releationships);
		//	console.log("this.addSubTube = function(tubeIndex,subTubeArray,releationships)  end");
  			if(tube === null){
  				return;
  			}else{
  				tube = tube.addSubTube(subTubeArray,releationships);
  				this.tubesMap.put(key,tube);  				
  				//var keys = tube.subTubeMap.keys();  	
  				/* 更改解析数据之后去掉以下的
  				for(var i = 0 ; i < keys.length ; i ++){
  					var key_ = keys[i];
  					var cableId    = key_.substring(0,key_.indexOf("_"));
  					var cable = this.subCableMap.get(cableId);
  					var subTube = tube.subTubeMap.get(key_);  	
  					cable.addTube(subTube);  					
  				}*/ 

  			}
  		};
  		
  		if(typeof this._config.relationshipLineProp != "undefined"){
	  			for(var j = 0 ; j < this._config.relationshipLineProp.length ; j++){
			  			var _realship = this._config.relationshipLineProp[j];
			  			var cableAId    = _realship.cableAId;
			  			var tubeAIndex  = _realship.tubeAIndex;
			  			var fiberAIndex = _realship.fiberAIndex;
			  			var cableBId    = _realship.cableBId;
			  			var tubeBIndex  = _realship.tubeBIndex;
			  			var fiberBIndex = _realship.fiberBIndex;
			  			
			  			if(typeof cableAId != "undefined" &&cableAId != null){
			  				var key = cableBId + "_" + tubeBIndex;
				  			var value = this.relationShip.get(key);
				  			if(value == null){
				  				value = {relationshipLineProp:[]};
				  			}
				  			value.relationshipLineProp.push(_realship);		  			  	 
				  			this.relationShip.put(key,value);				
			  			}else{
			  				var cableId = _realship.cableId;
			  				var tubeIndex = _realship.tubeIndex;
			  				var fiberIndex = _realship.fiberIndex;			  				
			  				this.transNameMap.put(cableId + "_" + tubeIndex + "_" + fiberIndex , _realship);		  							  				
			  			}
			  			
			}
  		}
  		
		
  		
  		
  		/**
  		 * 初始化子tube
  		 */  		 
  		var _subTubes = this._config.subTubes;
  		if(typeof _subTubes != "undefined"){  			
  			  		for(var i = 0 ; i < _subTubes.length ; i++){
				  			var subTube = _subTubes[i];
				  			//console.log("初始化sub" + subTube.cableId);
				  			var cable = this.subCableMap.get(subTube.cableId);
				  			var tube  = cable.tubesMap.get(""+cable._config.cableId + "_" + subTube.tubeIndex);				  		
				  			var cableId = subTube.cableId;
				  			var tubeIndex = subTube.tubeIndex;
				  			var key = cableId + "_" +  tubeIndex ;   
				  			subTube   = tube._config; 			
				  		  	var relationship1 = this.relationShip.get(key);

				  		  	if( relationship1 != null){
				  		  		//console.log(relationship1.relationshipLineProp[0].cableAId + ": "
				  		  		//	+ relationship1.relationshipLineProp[0].tubeAIndex + " : relationship Lenght " + relationship1.relationshipLineProp.length);
				  			  	//console.log(subTube.cableId + ":" + subTube.tubeIndex);  		
				  			  	/**
				  			  	 *	relationshipLineProp[0].tubeAIndex 这块有点问题， 下次修改
				  			  	 *  问题原因relationship1.relationshipLineProp 里面有可能是不同的tubeAIndex ，
				  			  	 *       目前只能够满足一对多的关系
				  			  	 *  即光缆塑管和光缆塑管多对多的关系 。。。
				  			  	 */
				  		  		this.addSubTube(relationship1.relationshipLineProp[0].tubeAIndex,{subTubes:[subTube]},relationship1);
				  		  	}
				    }
  		}
  		
  		
  		
  		/**
  		 * Function  : resource.model.Cable.addTube
  		 * @param tube: tube                tube对象
  		 */
  		this.addTube = function(tube){
  			var tubeIndex = tube._config.tubeIndex;
  			var cableId   = tube._config.cableId;
  			var key = cableId + "_" + tubeIndex;
  			//console.log(key + "/////////////");  		
  			this.tubesMap.put(key,tube);
  		}
  		
  		
  		this.updateSubTube = function(tubeIndex,config){
  			
  		}
  		
  		/**
  		 * 根据配置确定subCable的信息
  		 */
  		this.addSubCable = function(config){
  			var subCables = config.subCables;
  			for(var i = 0 ; i < subCables.length ; i ++){
  				var subCableConfig = subCables[i];
	  			this.subCableMap.put(subCableConfig.cableId, new resource.model.Cable(subCableConfig));
  			}
  		}
  		
  		/**
  		 * Function: search 
  		 * @param  : cableId: 根据光缆ID号搜素
  		 * 
  		 * @return : 
  		 */
  		this.search = function(cableId){
  			if(this._config.cableId == cableId){  				
  				return {
  					parentCable : this
  				};
  			}else{
  				var size = this.subCableMap.size();
  				if(size <= 0 ){
  					console.log("cann't found the cable ! please make sure the cable was added correctly ");
  					return null;
  				}else{
  					var keys = this.subCableMap.keys();
  					for(var i = 0 ;i < keys.length ; i ++){
  						var cable = this.subCableMap.get(keys[i]);
  						if(cable._config.cableId == cableId){
  							return	{
  								parentCable : this,
  								subCable : cable 
  							};
  						}else{
  							var searchCable = cable.search(cableId);
  							if(searchCable == null){
  								continue;
  							}else{
  								return searchCable;
  							};
  						}
  					}	
  				}
  			}
  		};
  		
  		/**
  		 * Function : resource.model.Cable.drawInSvg
  		 * @param :  node 把光缆添加到光缆的界面节点
  		 */
  		this.drawInSvg = function(node){
  			
  			/**
  			 *  首先要计算每根光缆的所有的光纤中纵坐标比较情况
  			 */
  			var values = this.tubesMap.values();
  			var numofnoequals_all = 0 ;
  			var numofgreater_all  = 0 ;
  			var numofsmaller_all  = 0 ;
  			for(var i = 0 ; i < values.length ; i ++){
  				var tube = values[i];
  				tube.calculateFiberCoords();
  				numofnoequals_all  += tube.numequals ;
  				numofgreater_all   += tube.greater ;
  				numofsmaller_all   += tube.smaller ;
  			}
  			
  			/**
  			 * 创建一个group 把所有的tube放在一个组中
  			 * group 的命名规则为 cableId_g
  			 */  			
  			var cableGroups = document.createElementNS(SVGNS,'g');
  			var cableGroup = document.createElementNS(SVGNS,'g');
  			resource.util.assginAttribute(cableGroup,{
  				id:this._config.cableId + "_" + "g"
  			});  		
  			node.appendChild(cableGroup);
  			
  			for(var i = 0 ; i < values.length ; i ++){
  				var tube = values[i];
  				//tube.drawTubeSelf(node);
  			   //tube.drawInSvg(node,false);
  			   tube.drawInSvg(cableGroup,false);
  			}		
  			
  			
  			/**
  			 * 创建一个group 把所有的cable 的subCable 也全部都放到一个组里面
  			 * id 的命名规则为所有subCable 的 x_x_x_x_gs 组合模式
  			 */
  			
  			/*
  			var subCableKeys = this.subCableMap.keys();
  			var cableAllIds = subCableKeys.join("_");
  			console.log(cableAllIds);
  			var subCablesGroup = document.createElementNS(SVGNS,'g');
  			
  			var hasSubCablesFlag = false;
  			if(cableAllIds != "" && subCableKeys.length >0 ){
	  			resource.util.assginAttribute(subCablesGroup,{
		  				id:cableAllIds + "_" + "gs"
		  		});
		  		//node.appendChild(subCablesGroup);
		  		document.getElementById("group1").appendChild(subCablesGroup);
		  		hasSubCablesFlag = true;
		  		for(var i = 0 ; i < subCableKeys.length ; i ++){  				
		  			this.subCableMap.get(subCableKeys[i]).drawInSvg( subCablesGroup);
		  		}		  
  			}		
  			*/
  			
  			var subCableKeys = this.subCableMap.keys();
  			for(var i = 0 ; i < subCableKeys.length ; i ++){  				
		  			this.subCableMap.get(subCableKeys[i]).drawInSvg(node);
		  	}	
  			
  			  			
  			//console.log(" Reource.model.Cable.drawInSvg :" + numofnoequals_all + " ," + numofgreater_all + " ," + numofsmaller_all)
  			
  			var numofnoequals = numofnoequals_all ;
  			//console.log(numofnoequals);
  			
  			//var fiber_line_space = ( numofnoequals == 0  ?  0 : this._config.cableDistance / (numofnoequals)) ;
  			//var fiber_line_space_left_right = (numofnoequals == 0  ?  0 : this._config.cableDistance % (numofnoequals)) / 2;
  		
  			
  			
  			
  			//计算光纤线的纵坐标的	
  			var fiber_line_space = (( numofnoequals == 0  ?  0 : this._config.cableDistance) - 40 ) / (numofnoequals) ;
  			var fiber_line_space_left_right = 40 / 2;  		
  		//	console.log(fiber_line_space + " : " + fiber_line_space_left_right);
  		
  			/**
  			 *  
  			 */  			 
  			var keys = this.tubesMap.keys();
  			var relationshipLinesPropArray = new Array();
			for(var  i = 0 ; i < keys.length ; i ++){
					var tube = this.tubesMap.get(keys[i]);	
					var relationshipLineProp = tube._config.relationshipLineProp ;					
					if(typeof relationshipLineProp != "undefined"){
						 for(var j = 0 ; j < relationshipLineProp.length ; j ++){
						 	relationshipLinesPropArray.push(relationshipLineProp[j]);
						 }
					}				
			}
				
			var selfCableId = this._config.cableId;
			var j = 0;
			for(var i = 0 ; i < relationshipLinesPropArray.length ; i ++){			
			            var rs = relationshipLinesPropArray[i];
				   		var cableAId    = rs.cableAId;
				   		var tubeAIndex  = rs.tubeAIndex;
				   		var fiberAIndex = rs.fiberAIndex;
						var cableBId    = rs.cableBId;
				   		var tubeBIndex  = rs.tubeBIndex;
				   		var fiberBIndex = rs.fiberBIndex;
				   			
				   		var transName   = rs.transName;				   		
				   		//console.log( cableAId + ":" + tubeAIndex + " : " + fiberAIndex + " : " + cableBId+" : " + tubeBIndex  + " : " + fiberBIndex);
				   		if( cableAId === selfCableId){
				   			var tube = this.tubesMap.get(cableAId + "_" + tubeAIndex);				   			
				   			var subTubeNode = tube.subTubeMap.get(cableBId + "_" + tubeBIndex);		
				   			if(subTubeNode == null){
				   				continue;
				   			}	
				   				   			
				   			//console.log(subTubeNode + " :::::: ");
				   			var path = document.createElementNS(SVGNS,'path');
				   			var selfCoord = tube.fibersCoordMap.get("" + fiberAIndex);
				   			var cableBCoord = subTubeNode.fibersCoordMap.get("" + fiberBIndex);		
				   			var text = document.createElementNS(SVGNS,'text');
					   			resource.util.assginAttribute(text,{
					   				id:cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_text",
					   				x:selfCoord.x - 150,
					   				y:selfCoord.y + 5 ,
					   				style:"font-size:8px;"
					   			});
				   			if(typeof transName != "undefined" && transName != null){
					   			console.log(transName + "  处理业务编码信息     ");
					   			
					   			text.appendChild(document.createTextNode(transName));
					   		
					   			document.getElementById("groupText").appendChild(text);  									   			
					   		}else{
					   			
					   		} 
					   			
				   					   		
				   				if(selfCoord.y > cableBCoord.y){
									resource.util.assginAttribute(path,{
										id:cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_" + cableBId + "_" + tubeBIndex + "_" + fiberBIndex,
										style :" fill:none;stroke:"+ selfCoord.fiberColor ,		
										 "stroke-width":"1px",	
										 onmouseover:"mouseOver(evt)",
	        							 onmouseout: "mouseOut(evt)",
	        							 "vector-effect":"non-scaling-stroke",		       
								        d : (
								        		" M" + 
								        		selfCoord.x  + "  " + selfCoord.y + " " +
								        		" L" + (selfCoord.x + fiber_line_space_left_right + (i * fiber_line_space) ) + "  " + selfCoord.y + " " + 
								        		" L" + (selfCoord.x + fiber_line_space_left_right + (i * fiber_line_space) ) + "  " + cableBCoord.y + " " +
								        		" L" + cableBCoord.x + " " + cableBCoord.y
								        	)
									});	
									
									//console.log(" M" + 
								      //  		selfCoord.x  + "  " + selfCoord.y + " " +
								        //		" L" + (selfCoord.x + fiber_line_space_left_right + (i * fiber_line_space) ) + "  " + selfCoord.y + " " + 
								        	//	" L" + (selfCoord.x + fiber_line_space_left_right + (i * fiber_line_space) ) + "  " + cableBCoord.y + " " +
								        		//" L" + cableBCoord.x + " " + cableBCoord.y + "  " + selfCoord.fiberColor);
								}else if(selfCoord.y < cableBCoord.y){
									
									resource.util.assginAttribute(path,{
										 id:cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_" + cableBId + "_" + tubeBIndex + "_" + fiberBIndex,
										 style :" fill:none;stroke:"+ selfCoord.fiberColor,				       
								      	 onmouseover:"mouseOver(evt)",
	        							 onmouseout: "mouseOut(evt)",
	        							 "stroke-width":"1px",	
	        							 "vector-effect":"non-scaling-stroke",
								        d : (
								        		" M" + 
								        		cableBCoord.x  + "  " + cableBCoord.y + " " +
								        		" L" + (cableBCoord.x - fiber_line_space_left_right - ((j) * fiber_line_space)  ) + "  " + cableBCoord.y + " " + 
								        		" L" + (cableBCoord.x - fiber_line_space_left_right - ((j) * fiber_line_space) ) + "  " + selfCoord.y + " " +
								        		" L" +  selfCoord.x + " " + selfCoord.y
								        	)
									});	
									j ++;
								}else{
									resource.util.assginAttribute(path,{
										id:cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_" + cableBId + "_" + tubeBIndex + "_" + fiberBIndex,
										 style :" fill:none;stroke:"+ selfCoord.fiberColor ,
										 onmouseover:"mouseOver(evt)",
	        							 onmouseout: "mouseOut(evt)",	
	        							 "stroke-width":"1px",		    
	        							 "vector-effect":"non-scaling-stroke",   
								         d : (
								        		" M" + 
								        			   selfCoord.x  + "  " + selfCoord.y + " " +								        	
								        		" L" + cableBCoord.x + " " + cableBCoord.y
								        	 )
									});	
								}	
								document.getElementById("group1").appendChild(path);
				   			}
				   				    
				}
				
				
				/**
				 * 画最后一个 cable 的业务信息
				 */
				if(this.transNameMap.size() >=0 ){
					var keys = this.transNameMap.keys();
					for(var i = 0; i < keys.length ; i ++){
						var key = keys[i];
						var cableId = key.substring(0,key.indexOf("_"));
						var restKey = key.substring(key.indexOf("_") + 1,key.length);
						//console.log(cableId + ":" + restKey);
						var tubeIndex = restKey.substring(0,restKey.indexOf("_"));
						restKey = restKey.substring(restKey.indexOf("_") +1 ,restKey.length);
						var fiberIndex = restKey;
						console.log(cableId + ":" + restKey + " // " + tubeIndex + " // " + fiberIndex);
						var value = this.transNameMap.get(key);
						var tube = this.tubesMap.get(cableId + "_" + tubeIndex);
						var selfCoord = tube.fibersCoordMap.get("" + fiberIndex);
						var transName = value.transName;
												
						var text = document.createElementNS(SVGNS,'text');
				   			resource.util.assginAttribute(text,{
				   				id:cableId + "_" + tubeIndex + "_" + fiberIndex + "_text",
				   				x:selfCoord.x + 30,
				   				y:selfCoord.y + 5 ,
				   				style:"font-size:8px;"
				   			});
				   			if(typeof transName != "undefined" && transName != null){					   						   			
					   			text.appendChild(document.createTextNode(transName));					   		
					   			document.getElementById("groupText").appendChild(text);  									   			
					   		}
					}
				}
				
				
  		};
  		
  		/**
  		 *  Function : reDraw 重新绘制
  		 *  要更改自身tube的属性
  		 *  @param : change : {
  		 * 						xChange:123,
  		 * 						yChange:12312
  		 * 					  }
  		 * 			 calccuateFiberCoordsFlag : 是否重新计算坐标的标记	
  		 *  		 translate : 线的tranlate值{
  		 * 								x:200,
  		 * 								y:300
  		 * 							}		
  		 * 			 reDrawSubCable : resource.model.Cable  画图相关的cable
  		 *  
  		 */
  		this.reDraw = function(change,calccuateFiberCoordsFlag,translate,reDrawSubCable){
  			
  			var oldX = this._config.x;
  			if(calccuateFiberCoordsFlag){    //当计算标记为true 时 重新计算坐标
  					this._config.x = change.x ;
		  			this._config.y = change.y ;
		  			//console.log(this._config.y + "                       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!");	

		  			for(var i = 0 ; i < this._config.tubeNum ; i++){
		  				var tube = this.tubesMap.get("" + this._config.cableId + "_" + i );
		  				//console.log("为更改之前的tube xy : " + tube._config.tubeIndex  + " : " + tube._config.y);
		  				tube._config.x = this._config.x;
		  				tube._config.y = this._config.y + (this._config.fiberDistance * this._config.fiberNumPerTube) * (i);
		  				//console.log(tube._config.y +  "/////////////////////////////////////////");  				
		  				//console.log("为更改之后的tube xy : " + tube._config.tubeIndex  + " : " + tube._config.y);  				
		  			};  
  			}
  			
  				
  			/**
  			 *  首先要计算每根光缆的所有的光纤中纵坐标比较情况
  			 */
  			var values = this.tubesMap.values();
  			var numofnoequals_all = 0 ;
  			var numofgreater_all  = 0 ;
  			var numofsmaller_all  = 0 ;
  			for(var i = 0 ; i < values.length ; i ++){
  				var tube = values[i];  				
  				tube.calculateFiberCoords();
  				numofnoequals_all  += tube.numequals;
  				numofgreater_all   += tube.greater;
  				numofsmaller_all   += tube.smaller;
  			}	
  		
  		
  			//console.log(" Reource.model.Cable.drawInSvg :" + numofnoequals_all + " ," + numofgreater_all + " ," + numofsmaller_all)
  			
  			var numofnoequals = numofnoequals_all ;
  			//console.log(numofnoequals);
  			
  			//var fiber_line_space = ( numofnoequals == 0  ?  0 : this._config.cableDistance / (numofnoequals)) ;
  			//var fiber_line_space_left_right = (numofnoequals == 0  ?  0 : this._config.cableDistance % (numofnoequals)) / 2;
  			
  			
  			//计算光纤线的纵坐标
  			var fiber_line_space = (( numofnoequals == 0  ?  0 : (this._config.cableDistance + (oldX - this._config.x))) - 40 ) / (numofnoequals) ;
  			var fiber_line_space_left_right = 40 / 2;  		
  	     	//	console.log(fiber_line_space + " : " + fiber_line_space_left_right);
  		
  			/**
  			 *  
  			 */  			 
  			var keys = this.tubesMap.keys();
  			var relationshipLinesPropArray = new Array();
			for(var  i = 0 ; i < keys.length ; i ++){
					var tube = this.tubesMap.get(keys[i]);	
					var relationshipLineProp = tube._config.relationshipLineProp ;					
					if(typeof relationshipLineProp != "undefined"){
						 for(var j = 0 ; j < relationshipLineProp.length ; j ++){
						 	relationshipLinesPropArray.push(relationshipLineProp[j]);
						 }
					}				
			}
				
			var selfCableId = this._config.cableId;
			var j = 0;
			for(var i = 0 ; i < relationshipLinesPropArray.length ; i ++){			
			            var rs = relationshipLinesPropArray[i];
				   		var cableAId    = rs.cableAId;
				   		var tubeAIndex  = rs.tubeAIndex;
				   		var fiberAIndex = rs.fiberAIndex;
						var cableBId    = rs.cableBId;
				   		var tubeBIndex  = rs.tubeBIndex;
				   		var fiberBIndex = rs.fiberBIndex;
				   		var transName   = rs.transName;
				   		//console.log(tubeAIndex + " : " + fiberAIndex + " " + tubeBIndex  + " " + fiberBIndex);
				   		
				   		if( cableAId === selfCableId){
				   			var tube = this.tubesMap.get(cableAId+"_" + tubeAIndex);
				   			var subTubeNode = tube.subTubeMap.get(cableBId + "_" + tubeBIndex);
				   			if(subTubeNode == null){
				   				continue;
				   			}		   	
				   			var path = document.createElementNS(SVGNS,'path');
				   			var selfCoord = tube.fibersCoordMap.get("" + fiberAIndex);
				   			var cableBCoord = subTubeNode.fibersCoordMap.get("" + fiberBIndex);	
				   			
				   			/////////////////////////////////////////////////////////////// transbusiness
				   			$("#" + cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_text").remove();
				   			var text = document.createElementNS(SVGNS,'text');
				   			resource.util.assginAttribute(text,{
				   				id:cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_text",
				   				x:selfCoord.x - 150,
				   				y:selfCoord.y + 5 ,
				   				style:"font-size:8px;"
				   			});
				   			if(typeof transName != "undefined" && transName != null){
					   			text.appendChild(document.createTextNode(transName));					   		
					   			document.getElementById("groupText").appendChild(text);  									   			
					   		}else{
					   			
					   		} 
				   			/////////////////////////////////////////////////////////////// transbusiness
				   			
				   			//if((typeof reDrawSubCable != "undefined" && reDrawSubCable._config.cableId == cableBId) || reDrawSubCable._config.cableId == cableAId){
				   			if((typeof reDrawSubCable != "undefined") && (reDrawSubCable._config.cableId != cableBId) && (reDrawSubCable._config.cableId != cableAId)){
				   				//移除线条
				   				$("#" + cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_" + cableBId + "_" + tubeBIndex + "_" + fiberBIndex).remove();
				   			}			   		
				   				if(selfCoord.y > cableBCoord.y){
									resource.util.assginAttribute(path,{
										id:cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_" + cableBId + "_" + tubeBIndex + "_" + fiberBIndex,
										style :" fill:none;stroke:"+ selfCoord.fiberColor ,		
										 "stroke-width":"1px",	
										 onmouseover:"mouseOver(evt)",
	        							 onmouseout: "mouseOut(evt)",	
	        							 "vector-effect":"non-scaling-stroke",	        							     
								         d : (
								        		" M" + 
								        		selfCoord.x  + "  " + selfCoord.y + " " +
								        		" L" + (selfCoord.x + fiber_line_space_left_right + (i * fiber_line_space) ) + "  " + selfCoord.y + " " + 
								        		" L" + (selfCoord.x + fiber_line_space_left_right + (i * fiber_line_space) ) + "  " + cableBCoord.y + " " +
								        		" L" + cableBCoord.x + " " + cableBCoord.y
								         )
									});	
								}else if(selfCoord.y < cableBCoord.y){
									
									resource.util.assginAttribute(path,{
										 id:cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_" + cableBId + "_" + tubeBIndex + "_" + fiberBIndex,
										 style :" fill:none;stroke:"+ selfCoord.fiberColor,	
										 "vector-effect":"non-scaling-stroke",			       
								      	 onmouseover:"mouseOver(evt)",
	        							 onmouseout: "mouseOut(evt)",
	        							 "stroke-width":"1px",
	        							
								        d : (
								        		" M" + 
								        		cableBCoord.x  + "  " + cableBCoord.y + " " +
								        		" L" + (cableBCoord.x - fiber_line_space_left_right - ((j) * fiber_line_space) ) + "  " + cableBCoord.y + " " + 
								        		" L" + (cableBCoord.x - fiber_line_space_left_right - ((j) * fiber_line_space) ) + "  " + selfCoord.y + " " +
								        		" L" +  selfCoord.x + " " + selfCoord.y
								        	)
									});	
									j ++;
								}else{
									resource.util.assginAttribute(path,{
										id:cableAId + "_" + tubeAIndex + "_" + fiberAIndex + "_" + cableBId + "_" + tubeBIndex + "_" + fiberBIndex,
										 style :" fill:none;stroke:"+ selfCoord.fiberColor ,
										 onmouseover:"mouseOver(evt)",
	        							 onmouseout: "mouseOut(evt)",	
	        							 "vector-effect":"non-scaling-stroke",
	        							 "stroke-width":"1px",	        							        
								         d : (
								        		" M" + 
								        			   selfCoord.x  + "  " + selfCoord.y + " " +								        	
								        		" L" + cableBCoord.x + " " + cableBCoord.y
								        	)
									});	
								}	
								document.getElementById("group1").appendChild(path);
							//}
				   		}
				   				    
				}
				
				/**
				 * 画最后一个 cable 的业务信息
				 */
				if(this.transNameMap.size() >=0 ){
					var keys = this.transNameMap.keys();
					for(var i = 0; i < keys.length ; i ++){
						var key = keys[i];
						var cableId = key.substring(0,key.indexOf("_"));
						var restKey = key.substring(key.indexOf("_") + 1,key.length);
						//console.log(cableId + ":" + restKey);
						var tubeIndex = restKey.substring(0,restKey.indexOf("_"));
						restKey = restKey.substring(restKey.indexOf("_") +1 ,restKey.length);
						var fiberIndex = restKey;
						console.log(cableId + ":" + restKey + " // " + tubeIndex + " // " + fiberIndex);
						var value = this.transNameMap.get(key);
						var tube = this.tubesMap.get(cableId + "_" + tubeIndex);
						var selfCoord = tube.fibersCoordMap.get("" + fiberIndex);
						var transName = value.transName;
						$("#" + cableId + "_" + tubeIndex + "_" + fiberIndex + "_text").remove();
						var text = document.createElementNS(SVGNS,'text');
				   			resource.util.assginAttribute(text,{
				   				id:cableId + "_" + tubeIndex + "_" + fiberIndex + "_text",
				   				x:selfCoord.x + 30,
				   				y:selfCoord.y + 5 ,
				   				style:"font-size:8px;"
				   			});
				   			if(typeof transName != "undefined" && transName != null){					   						   			
					   			text.appendChild(document.createTextNode(transName));					   		
					   			document.getElementById("groupText").appendChild(text);  									   			
					   		}
					}
				}
				
  		
  			
  		}
  		
  		
  	}; 
  	
  	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

 })();
