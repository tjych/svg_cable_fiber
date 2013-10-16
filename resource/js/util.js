/**
  * Package: resource.util
  * author : 杨晨辉 chenhui.yang@yahoo.com
  * Dependencies:
  *            1) jQuery
  *
  * 
  * 使用本方法要先 调用resouce.util.init() 方法初始化
  * 				 exp: 
  * 					
  * 	<code>	
  * 			resource.util.init({
  *					getDOMDocument: function() { return svgdoc; },        
  *					getDOMContainer: function() { return container; },
  *					getSVGRoot: function() { return svgroot; },					
  *					getSVGContent: function() { return svgcontent; }
  *				});
  *	    </code> 
  *
 */

 var resource = resource || {};

(function(){
	if (!resource.util) {
		resource.util = {};
	};
	


	var SVGNS    = 'http://www.w3.org/2000/svg';
	var XLINKNS  = 'http://www.w3.org/1999/xlink';
    var XMLNS    = "http://www.w3.org/XML/1998/namespace";

    var context_       = null;
    var domdoc_        = null;
    var domcontainer_  = null;
    var domcontainer_  = null;
    var svgroot_       = null;

    /**
     * Function: reource.util.init 
     * 初始化帮助类
     * 
     * Partmeters: 
     * @param {Object} context
     *
     */
    resource.util.init = function(context){
    	context_ = context;
    	domdoc_  = context_.getDOMDocument();
    	domcontainer_ = context_.getDOMContainer();
    	svgroot_      = context_.getSVGRoot();
    };

	
	/**
	 * Function: resource.util.assginAttributes
	 * 给一个元素节点添加属性
	 * 
	 * Partmeters:
     * @param {Object} node					添加属性的元素节点
     * @param {Object} attrs                自定义属性格式为键值对 {key:value}
     * @param {Object} suspendLength        延迟渲染的毫秒数
     * @param {Object} unitCheck            待定
	 */
	resource.util.assginAttribute = function(node, attrs, suspendLength, unitCheck){

		if(!suspendLength) suspendLength = 0;

		var handle = null;
	    svgroot_.suspendRedraw(suspendLength);
		
		for(var i in attrs){
			 
			var ns = (i.substr(0,4) === "xml:" ? XMLNS : 
			i.substr(0,6) === "xlink:" ? XLINKNS : null);
			
			if(ns){
				node.setAttributeNS(ns,i,attrs[i]);
			}else{
				node.setAttribute(i,attrs[i]);
			}

		}

		svgroot_.unsuspendRedraw(handle);
	};
	
	
	/** 
	 * Function: resource.util.cleanupElement
	 * 移除一个元素的所有属性                                      //放法具体的实现待定
	 * 
 	 * @param {Object} element  将要移除属性的元素
	 */
	resource.util.cleanUpElement = function(element){
		var handle = svgroot_.suspendRedraw(60);
		var defaults = {
				'fill-opacity':1,
				'stop-opacity':1,
				'opacity':1,
				'stroke':'none',
				'stroke-dasharray':'none',
				'stroke-linejoin':'miter',
				'stroke-linecap':'butt',
				'stroke-opacity':1,
				'stroke-width':1,
				'rx':0,
				'ry':0
		};
		for(var attr in defaults) {
			var val = defaults[attr];
			if(element.getAttribute(attr) == val) {
				element.removeAttribute(attr);
			}
		}
		svgroot_.unsuspendRedraw(handle);
	};

})();
