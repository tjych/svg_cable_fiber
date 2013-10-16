/**
 * Package : resource.select 
 * author : 杨晨辉 chenhui.yang@yahoo.com
 * Dependency:
 * 
 * 
 * Description:  
 * 		       	  
 *     
 * 
 * 
 * 
 * 
 * 
 */

  var resource = resource || {};

  (function(){
  	
  	if(!resource.select){
  		resource.select = {};
  	}
  	
  	var ox = 0;
  	var oy = 0;
  	var dragging = false;
  	var cableFirst = null;
  	var dragCable = null;
  	var relatePaths = null;
  	var test = null;
  	
  	var TrueCoords = null;
  	var GrabPoint = null;
  	var BackDrop  = null;
  	var DragTarget = null;
  	var SVGRoot = null;
  	var reDrawCables = null;
  	resource.select.init = function(container,cable){
 		//console.log(container);
  		$(container).mousedown(resource.select.mousedown).
  					 mouseup(resource.select.mouseup).
  					 mousemove(resource.select.mousemove);  
  					 cableFirst = cable;  	
  		SVGRoot = document.getElementById("svgroot");
  		TrueCoords = SVGRoot.createSVGPoint();	
  		GrabPoint  = SVGRoot.createSVGPoint();  		
  				
  	};

    resource.select.updateSvgWidthAndHeight = function(){
        
    };

	
    resource.select.mousedown = function(evt){
		var evt_target = evt.target;
     if(evt_target.id == "svgroot"){
        return;
     }
    	var parentNode = evt_target.parentNode;


    	var parentNodeId = parentNode.id;
    	var parentNodeId_suffix = parentNodeId.substring(parentNodeId.indexOf("_") + 1,parentNodeId.length);
    	while(parentNodeId_suffix != "g"){
    		parentNode = parentNode.parentNode;
    		parentNodeId = parentNode.id;
    	    parentNodeId_suffix = parentNodeId.substring(parentNodeId.indexOf("_") + 1,parentNodeId.length);
    	}
    	
    	DragTarget = parentNode;
    	
    	
    	//DragTraget.setAttribute(null,"pointer-events","none");
    	
    	resource.select.getTrueCoords(evt);
    	var matrix = DragTarget.getCTM();
    	GrabPoint.x = TrueCoords.x - Number(matrix.e);
    	GrabPoint.y = TrueCoords.y - Number(matrix.f);
    	
    	
    	ox = evt.pageX;
	    oy = evt.pageY;	    
	    
	    dragging = true;	    
	    
	    var groupId = DragTarget.getAttribute("id");
      	var cableId = groupId.substring(0,groupId.indexOf("_"));
      	if(cableId != null || cableId != ""){
      		var cable_ = cableFirst.search(cableId);
      		reDrawCables = cable_;
      		//dragCable = cable_;
      		if(typeof reDrawCables.subCable == "undefined" ){
      			dragCable = cable_.parentCable;
      		}else{
      			dragCable = cable_.subCable;
      		}      		
      	}
    };
    
    /**
     * Function : getTrueCoords
     *  
     */
    resource.select.getTrueCoords = function(evt){
    	var newscale = SVGRoot.currentScale;
    	var translation = SVGRoot.currentTranslate;
    	TrueCoords.x = (evt.clientX - translation.x) / newscale;
    	TrueCoords.y = (evt.clientY - translation.y) / newscale;
    };    

    resource.select.mousemove = function(evt){    	    	
      	if(dragging){
      		var xChange = evt.clientX - ox;
      		var yChange = evt.clientY - oy;   
      		resource.select.getTrueCoords(evt);   		
      		//console.log(xChange + ": " + yChange + ": " + evt.pageX + ": " + evt.pageY   + " : " + ox + " : " + oy );   		
      		
      		//删除所有的与拖到的cable 相关的fiberLine
      		$("path[id*='" + dragCable._config.cableId + "']").not( $("#" + dragCable._config.cableId)[0]).remove();
    		ox = evt.clientX;
    		oy = evt.clientY;
    		var newX = TrueCoords.x - GrabPoint.x;
    		var newY = TrueCoords.y - GrabPoint.y;
    		//console.log(xChange + "//////" + yChange);
    		var translate = {
    			x : newX ,
    			y : newY 
    		}
    		

          //绘制拖动的cable的tube的坐标
      		dragCable.reDraw({
      			x:dragCable._config.x + xChange,
      			y:dragCable._config.y + yChange
      		},true,translate,dragCable);	
      		
      		if(dragCable != reDrawCables.parentCable){
      				reDrawCables.parentCable.reDraw({
	      				x:reDrawCables.parentCable._config.x,
	      				y:reDrawCables.parentCable._config.y
      				},false,translate,reDrawCables.subCable);  
      		}
      		
      	  	
      		
      		DragTarget.setAttribute('transform','translate(' + newX + ',' +  newY + ')');
      	}      	
    };

    resource.select.mouseup = function(evt){
    
		dragging = false;	
	//	console.log("container mouseup");		
    }
    
    


  })();
