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
    var GroupRoot = null;
  	var reDrawCables = null;



var intervalId ;
var intervalFlag = false;
var currentPectange = 1;



  	resource.select.init = function(container,cable){
 		//console.log(container);
  		$(container).mousedown(resource.select.mousedown).
  					 mouseup(resource.select.mouseup).
  					 mousemove(resource.select.mousemove);  
  					 cableFirst = cable;  	
  		SVGRoot = document.getElementById("svgroot");
  		TrueCoords = SVGRoot.createSVGPoint();	
  		GrabPoint  = SVGRoot.createSVGPoint();  		

      GroupRoot =  document.getElementById("rootGroup");  

      //启动优化程序
      intervalId = setInterval(resource.select.startInterval, 100) ;  				
  	};

    resource.select.startInterval = function(){
        if(intervalFlag){
          intervalFlag = false;
        }else{
          intervalFlag = true;
        }

       //console.log("更改可拖动标记： "   + intervalFlag); 
    }

    resource.select.updateSvgWidthAndHeight = function(){
        
    };



	
    resource.select.mousedown = function(evt){
      if(currentScale != 1){
        return;
      }
		 var evt_target = evt.target;
     //console.log(evt_target);
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
    	
    	
    	ox = evt.clientY;
	    oy = evt.clientY;	    
	    
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
    	//TrueCoords.x = (evt.pageX - translation.x) / currentScale;
    	//TrueCoords.y = (evt.pageY - translation.y) / currentScale;     
      //console.log(GroupRoot);

      TrueCoords.x = (evt.clientY - currentMatrix[4]) / currentScale;
      TrueCoords.y = (evt.clientY - currentMatrix[5]) / currentScale;     
    };    


    resource.select.mousemove = function(evt){    	
      if(currentScale != 1){
        return;
      }    	
      	if(dragging && intervalFlag ){
          		var xChange = evt.clientX - ox;
          		var yChange = evt.clientY - oy;   
          		resource.select.getTrueCoords(evt);   		
          		//console.log(xChange + ": " + yChange + ": " + evt.pageX + ": " + evt.pageY   + " : " + ox + " : " + oy );   		
          		
          		//删除所有的与拖到的cable 相关的fiberLine
          		$("path[id*='" + dragCable._config.cableId + "']").not( $("#" + dragCable._config.cableId)[0]).remove();
        		ox = evt.clientX;
        		oy = evt.clientY;
        		var newX = (TrueCoords.x - GrabPoint.x) ;
        		var newY = (TrueCoords.y - GrabPoint.y) ;
        		//console.log(xChange + "//////" + yChange);

            /*此代码可以移动x,y
        		var translate = {
        			x : newX ,
        			y : newY 
        		};
        		

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
            */

            var translate = {
              x : 0 ,
              y : newY 
            };            

              //绘制拖动的cable的tube的坐标
              dragCable.reDraw({
                x:dragCable._config.x,
                y:dragCable._config.y + yChange 
              },true,translate,dragCable);  
              
              if(dragCable != reDrawCables.parentCable){
                  reDrawCables.parentCable.reDraw({
                    x:reDrawCables.parentCable._config.x,
                    y:reDrawCables.parentCable._config.y 
                  },false,translate,reDrawCables.subCable);  
              }

          DragTarget.setAttribute('transform','translate(' + 0 + ',' +  (newY * currentScale )+ ') ');
         // currentMatrix[5] = newY;
          //var newMatrix = "matrix(" +  currentMatrix.join(' ') + ")";
         // DragTarget.setAttributeNS(null, "transform", newMatrix); //

      	}      	
    };

    resource.select.mouseup = function(evt){
    
	    	dragging = false;	
	//	console.log("container mouseup");		
    } 


      var transMatrix = [1,0,0,1,0,0];
      var width = 4000;
      var height = 5000;
      var currentMatrix = transMatrix;
      var currentScale = 1;
      resource.select.pan = function(dx, dy){
          
          transMatrix[4] += dx;
          transMatrix[5] += dy;
          currentMatrix = transMatrix; 
          var newMatrix = "matrix(" +  transMatrix.join(' ') + ")";
         
          group = document.getElementById("rootGroup");   
          group.setAttributeNS(null, "transform", newMatrix);
    }
        
   resource.select.zoom =  function(scale){
  
          for (var i=0; i<transMatrix.length; i++)
          {
            transMatrix[i] *= scale;
          }
         
          // transMatrix[4] += (1-scale)*width  / 5;
          // transMatrix[5] += (1-scale)*height / 5;
          currentMatrix = transMatrix; 
          var newMatrix = "matrix(" +  transMatrix.join(' ') + ")";
       
          currentScale =  transMatrix[3];
          //currentScale = scale;
          console.log(currentScale);
          group = document.getElementById("rootGroup");   
          group.setAttributeNS(null, "transform", newMatrix);
    }

  })();
