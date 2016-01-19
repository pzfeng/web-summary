/*!
 * jQuery JavaScript Library v1.6
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon May 2 13:50:00 2011 -0400
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
    // 快速验证HTML字符串或ID
    // e.g 'span','#demo'
	// (both of which we optimize for)
	quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Check for digits
	rdigit = /\d/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
    // 页面加载完成时事件处理
    // 页面文档完全加载并解析完毕之后,会触发DOMContentLoaded事件，HTML文档不会等待样式文件,图片文件,子框架页面的加载(load事件可以用来检测HTML页面是否完全加载完毕(fully-loaded))。IE9+支持
    // 在IE8中,可以使用readystatechange事件来检测DOM文档是否加载完毕。
    // 在更早的IE版本中,可以通过每隔一段时间执行一次document.documentElement.doScroll('left')来检测加载状态，因为在DOM加载完毕之前时会抛出错误，
    // 只要不断通过setTimeout检测它，直到不报错误为止，即DOM加载完成
    
	DOMContentLoaded,

	// Save a reference to some core methods
    // 保留一些常用的方法
	toString = Object.prototype.toString, // 以字符输入
	hasOwn = Object.prototype.hasOwnProperty, // 判断是否为对象本身属性【使用此属性不会去检测对象原生链（prototype）】
	push = Array.prototype.push, // 数组中追加数据
	slice = Array.prototype.slice, // 截取数组元素，e.g [1,2,3].slice(1) => 2,3;[1,2,3].slice(1,2) => 2
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf, // 字符位置查找

	// [[Class]] -> type pairs
    /** 用来保存类型复数，即class2type.'Object Array' = Array； 
      * 对应代码：
      * jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
      *     class2type[ "[object " + name + "]" ] = name.toLowerCase();
      * });
      *
      *
      *
      * 通过Object.prototype.toString.call(obj)，返回的数据类型字符串为[Object typeName]
      * e.g Object.prototype.toString.call([]) ==> [Object Array]   
      */
    
	class2type = {};

    // 为jq prototype取别名jq.fn，方便进行扩展
jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;
        
        /*
        * @关于选择器，主要有以下几种
        * 1、选择器是DOM元素，即：$(DEMOElement)
        * 2、选择器是字符串且是BODY，即：$('body')
        * 3、选择器是class或ID，即：$('.class'),$('#id')
        * 4、选择器是HTML字符串，即：$('<span>'),$('div')
        */

		// Handle $(""), $(null), or $(undefined)
        // 初始化时，先判断selector是否存在
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
        // 选择器为DOM元素
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
        // 选择器为字符串处理方式：body元素只出现一次，优先查找，即$('body')
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
        // 选择器为HTML字符串，e.g $('<div>')
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
                // $('#div')
				match = quickExpr.exec( selector );
			}

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = (context ? context.ownerDocument || context : document); 

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector ); // 判断是否是一个完整的<div></div>DOM字符串

                    // 如果是，则是创建一个新DOM元素
					if ( ret ) {
                        // context为空时，直接在document创建
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
                        // 选择器也有可能是js脚本，e.g $('<script></script>')
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return (context || rootjQuery).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if (selector.selector !== undefined) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.6",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
    // 将elements插入到一个数组中，返回一个新匹配的element集
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
        // 创建一个新的jQuery对象
        // jquery.constructor 指向的是构造函数。因为没有传入任何参数，所以返回一个空jquery对象
		var ret = this.constructor();
        
        
        // 如果elems是数组，那么直接追加到ret中
		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
            // 那么执行合并到ret
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
        // 保存状态（上一步），在$.fn.end方法中有使用，主要用来返回当前操作的前一个状态
		ret.prevObject = this;

        // 将ret中的context指向当前context
		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + (this.selector ? " " : "") + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

        console.log(ret)
		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
    // 遍历
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

    // 读取
	ready: function( fn ) {
		// Attach the listeners
        // 绑定DOM加载事件
		jQuery.bindReady();

		// Add the callback
        // 向readyList队列中添加回调
		readyList.done( fn );

		return this;
	},

    // 查询第i个元素
    // this指向JQ selecter 匹配数组，实际是对匹配数组元素进行截取
	eq: function( i ) {
		return i === -1 ?
			this.slice( i ) :
            // 这里小技巧，注意+i前面的+，因为i可能传的是字符串，这里通过+进行转义，将其转换成数字
			this.slice( i, +i + 1 );
	},

    // 返回第一个元素
	first: function() {
		return this.eq( 0 );
	},

    // 返回最后一个元素
	last: function() {
		return this.eq( -1 );
	},
    
    // 自定义截取
    // $("div").slice(0, 5) => 查找页面所有div之后，返回所有div中的前5个
	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

    // 将一组元素转换成其他数组（不论是否是元素数组）
	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

    // 回到最近的一个"破坏性"操作之前。即，将匹配的元素列表变为前一次的状态。
	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
    // 仅内部使用
	// Behaves like an Array's method, not like a jQuery method.
    // 像一个数组方法，而不像JQ方法
    
	push: push,
    // 简单的数组排序
	sort: [].sort,
    // 数组删除或新增方法splice
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
// 修正jq对象的prototype指向
// 因为jq是通过fn.init为构造函数进行对象创建的，创建之后fn.init.prototype默认继续是object，现在将它指回
jQuery.fn.init.prototype = jQuery.fn;

/*
* 创建扩展（包括JQ本身扩展和新增匹配元素集扩展）
*/
jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {}, // 扩展所需要的附主对象，它可能是jq本身，也有可能是一个对象直接量
		i = 1,  // 用来定位，正如arguments的下标
		length = arguments.length,
		deep = false; // 是否深度扩展
    
    /**
     *  相关词义
     * 深度扩展：
     * 深度扩展是指待扩展的对象进行深度遍历，待扩展对象与附主对象相同属性直接替，存在子属性则相同子属性替换，增加不存在属性
     */

	// Handle a deep copy situation
    // 处理深度copy情况（target布尔值时）
    // $.extend(false, {name: 'pz', age: 10, work: {age: 20, type: 'jkl'}}, {address: 'afdase', work: {city: 'bg', type: 'sw'}}) => {name: 'pz', age: 10, work: {city:'bg', type:'sw'}}
    // 当target为false时，则直接替换相同属性，增加不存在属性
    
    // $.extend(true, {name: 'pz', age: 10, work: {age: 20, type: 'jkl'}}, {address: 'afdase', work: {city: 'bg', type: 'sw'}}) => {name: 'pz', age: 10, work: {city:'bg', type:'sw', age: 20}}
    // 当target为true时，则相同属性直接替，存在子属性则相同子属性替换，增加不存在属性
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
        // 用来保存下一步从哪个位置开始，目前已经执行了二步，修改了deep状态，target也指向了该指向的附主对象
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
    // 处理当target是一个字符串或其他即不是对象又不函数参数（有可能是一个深度copy）
    // 为什么说这个还有可能是深度copy，原因是传入的值 不是true/false，而是1/0，所以上面IF条件不成立，固在这里再次处理
    // 深度copy => target = true/false => typeof target => 'boolean' => 'boolean' !== 'object' => true  
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
    // 是不是对jq本身进行扩展 
    // $.extend({addNum: function(){alert(10)}}) => $.addNum() => 10
    // i的作用开始体现出来
	if ( length === i ) {
		target = this;
		--i;
	}

    /**
     * 从参数中拿数据
     */
	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
        // 只有参数值不为空的时候进行处理
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
            // 遍历 options对象
			for ( name in options ) {
				src = target[ name ]; // 附主对象
				copy = options[ name ]; // 保存options参数值

				// Prevent never-ending loop
                // 判断二个对象所对应的属性名是存在且值相同，如果是则路过，即只增加不存在或值不相等的属性
				if ( target === copy ) {
					continue; 
				}

				// Recurse if we're merging plain objects or arrays
                // deep = true, copy存在，copyj是一个对象或者是一个数组
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
                        // 是数组，则先修改copyIsArray状态
						copyIsArray = false;
                        // 数组
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
                        // 对象
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
                    // 如果是copy是一个数组或对象需要再将遍历执行
                    // 咱不移除，只克隆
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
                    // 否则只要copy参数值不为undefined，就直接添加到target附主对象中
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
    // 返回附主对象，即最终增加或替换属性后的对象
	return target;
};

jQuery.extend({
    // 释放$变量的控制权，给其他JS库使用
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
    // 用于记录DOM ready状态
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
    // 当DOM加载完成时，处理
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            // 确认body已经存在
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
            // 设置DOM状态，已经ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );

			// Trigger any bound ready events
            // 触发 所有的ready事件
			if ( jQuery.fn.trigger ) {
                // ready触发后，将其删除
				jQuery( document ).trigger( "ready" ).unbind( "ready" );
			}
		}
	},

    /**
     * 绑定页面加载事件，相关知识点
     * DOMContentLoaded
     * DOM已经加载，但样式或图片或iframe没加载
     * onreadystatechange
     * 通过readyState来读取页面执行状态
     * onload
     * 页面已经完全加载完毕，即图片、样式和iframe等
     */
	bindReady: function() {
        // readyList不存在，即没有任何ready处理
		if ( readyList ) {
			return;
		}

        // 创建一个延时回调，DOM加载完后，即触发延时回调中的所有回调函数
		readyList = jQuery._Deferred();

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
        
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
            // 如果DOM已经加载完成，则立即触发ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
            // 当DOM加载完成后，触发ready
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
            // 在页面全部加载完成后，再执行一次，确保ready事件都触发完毕
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
            // 因为在IE8以下的版本中，不支持onreadystatechange事件，为了能达到onreadystatechange效果，需要使用IE特有的document.documentElement.doScroll
            // 进行不断测试，因为document.documentElement.doScroll当DOM没加载好之前会一直报错，当它不报错了，即表示DOM已经加载完成
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}
            
			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

    /**
      * 判断是否为数组
      * Array.isArray ES5.1中新增数组方法，用来判断是否为数组，IE9以下版本不支持
      * 语法：Array.isArray(变量名、对象、表达式)
      * 参考：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
      * $.isArray
      * @parm   {AllType} obj 需要进行判断参数名 
      * @return {Boolean}  true/false
      */
	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNaN: function( obj ) {
		return obj == null || !rdigit.test( obj ) || isNaN( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

    // obj是不是一个纯粹的对象，即是否是用对象直接量{}或new Object()创建的对象
	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
        // 必须是一个对象！如果obj不存在或不是对象或是一个DOM 节点或是window对象，则返回
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		// Not own constructor property must be Object
        // obj.constructor 是个对象就会有它所对应的constructor(构造函数)
        //constructor是否是继承原型链  
        //原型链是否有isPrototypeOf 
		if ( obj.constructor &&
			!hasOwn.call(obj, "constructor") &&
			!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

    // 是否为空对象
	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

    // 输出错误
	error: function( msg ) {
		throw msg;
	},

    /**
      * 解析JSON
      * @parm   {JSONString}     data为JSON字符串，必须是规范的JSON语法结构，否则会将无法解析
      * @return {Object}         解析后的JSON对象 
      *
      ***************************
      * JSON格式：
      *（1）对象是一个无序的“‘名称/值’对”集合。一个对象以“{”（左括号）开始，“}”（右括号）结束。每个“名称”后跟一个“:”（冒号）；“‘名称/值’ 对”之间使用“,”（逗号）分隔。
      *（2）数组是值（value）的有序集合。一个数组以“[”（左中括号）开始，“]”（右中括号）结束。值之间使用“,”（逗号）分隔。
      *    值（value）可以是双引号括起来的字符串（string）、数值(number)、true、false、 null、对象（object）或者数组（array）。这些结构可以嵌套。
      *（3）字符串（string）是由双引号包围的任意数量Unicode字符的集合，使用反斜线转义。一个字符（character）即一个单独的字符串（character string）。
      *    字符串（string）与C或者Java的字符串非常相似。
      *（4）数值（number）也与C或者Java的数值非常相似。除去未曾使用的八进制与十六进制格式。除去一些编码细节。
      *
      */
	parseJSON: function( data ) {
        // data必须是字符串
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
        // 去除前后空格，因为IE不能处理
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
        // 如果浏览器支持JSON，并且支持JSON.parse方法，则直接解析
        // IE8以下不支持
        // JSON包含两种方法：parse和stringify
        // JSON.parse     解析JSON字符串, 可以选择改变前面解析后的值及其属性，然后返回解析的值。
        // JSON.stringify 返回指定值的 JSON 字符串，可以自定义只包含某些特定的属性或替换属性值。
        // 参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON
        
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

            /**
              * new Function ([arg1[, arg2[, ...argN]],] functionBody)
              * [arg1[, arg2[, ...argN]]：被函数使用的参数的名称必须是合法命名的。参数名称是一个有效的JavaScript标识符的字符串，或者一个用逗号分隔的有效字符串的列表;
              * functionBody：一个含有包括函数定义的JavaScript语句的字符串
              * 注：使用Function构造器生成的Function对象是在函数创建时被解析的。这比你使用函数声明(function)并在你的代码中调用低效，因为使用函数语句声明的function是跟其他语句一起解析的。
              * 参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function
              *
              * JS解析JSON字符串一般有两种方式：（1）使用eval()函数（2）使用Function对象来进行返回解析。即(Function())()
              * 用法：eval("("+data+")")
              * 说明：
              * 由于json是以”{}”的方式来开始以及结束的，在JS中，它会被当成一个语句块来处理，所以必须强制性的将它转换成一种表达式。
              * 加上圆括号的目的是迫使eval函数在处理JavaScript代码的时候强制将括号内的表达式（expression）转化为对象，
              * 而不是作为语 句（statement）来执行。举一个例子，例如对象字面量{}，
              * 如若不加外层的括号，那么eval会将大括号识别为JavaScript代码块的开始 和结束标记，那么{}将会被认为是执行了一句空语句。
              *
              *
              */
			return (new Function( "return " + data ))();

		}
        
        // 无法解析就直接输出错误
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	// (xml & tmp used internally)
    /**
      * 解析XML
      * @parm{data}
      * @parm{xml}
      * @parm{tmp}
      *
      */
	parseXML: function( data , xml , tmp ) {
        // 标准
        // 参考：https://developer.mozilla.org/zh-CN/docs/Web/API/DOMParser
        // DOMParser 可以将字符串形式的XML或HTML源代码解析成为一个 DOM文档. DOMParser的HTML5规范在 DOM解析和序列化.
        
        // var parser = new DOMParser();
        // var doc = parser.parseFromString(stringContainingXMLSource, "application/xml");
        // 返回一个Document对象,但不是SVGDocument也不是HTMLDocument对象

        // parser = new DOMParser();
        // doc = parser.parseFromString(stringContainingXMLSource, "image/svg+xml");
        // 返回一个SVGDocument对象,同时也是一个Document对象.

        // parser = new DOMParser();
        // doc = parser.parseFromString(stringContainingHTMLSource, "text/html")        
        // 返回一个HTMLDocument对象,同时也是一个Document对象.
        
		if ( window.DOMParser ) { // Standard
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		} else { // IE
            // 第一行创建空的微软 XML 文档对象
            // 第二行关闭异步加载，这样可确保在文档完整加载之前，解析器不会继续执行脚本
            // 第三行告知解析器加载名为 "books.xml" 的文档
            // xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            // xmlDoc.async="false";
            // xmlDoc.load("books.xml");
            // loadXML() 方法用于加载字符串（文本），而 load() 用于加载文件。
			xml = new ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}

		tmp = xml.documentElement;

        // 不能正常解析，则输入错误！
		if ( ! tmp || ! tmp.nodeName || tmp.nodeName === "parsererror" ) {
			jQuery.error( "Invalid XML: " + data );
		}

		return xml;
	},

    // 空函数
	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
    // 全局eval
	globalEval: function( data ) {
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
            
            // window.execScript：方法执行一段脚本代码字符串（IE9以下版本和部分低版本chrome支持）,功能与eval差不多
            // 语法：window.execScript(code, language);
            // code：[字符串]指定要执行的代码。
            // language: 指定的语言代码执行。默认为JScript语言。
            // 参考：http://ued.sina.com.cn/?p=789
            
            // 当不支持window.execScript不支持时，使用eval
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

    /**
     * 判断是否为指定的节点名称
     * @parm {DOM}      elem 元素
     * @parm {String}   name 名称
     * @return {Boolen} true（是为指定名称节点）/false
     * e.g $.nodeName(document.body, body);
     */
	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
    /** 遍历
      * @parm{Object}    object   需要进行遍历的对象，可以是数组\对象\字符串
      * @parm{function}  callback 遍历时，回调函数
      * @parm{args}      args     参数数组
      * @return{Object}  object
      */
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length, 
            // 是对象或者是函数，刚isObj为true
            // 对象.length没有length属性，所以为undefined，其他数组、字符串、函数都会有返回值
			isObj = length === undefined || jQuery.isFunction( object ); 
            
		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
                // 如果是对象，则遍历它。
				for ( name in object ) {
                    // 给回调函数传入2个参数，对象属性名（name）和属性值（object[ name ]）
                    // $.each({'a':1, 'b': 2}, function(index, el){console.log(index);console.log(el)})  ==> a,b 和 1,2
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
                // 普通数组或字符串
                // 如果是字符串，则将它们骤一取出
                // $.each("abcd", function(index, el){console.log(index);console.log(el)}) ==> 0,1,2,3 和 a,b,c,d
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
    // 处理字符串前后空格
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
    /**
      * 将一个类数组对象转换为真正的数组对象
      * @parm{allType}  array   可以传任意类型数据
      * @parm{Array}    results 最终处理后结果存放数组
      * @return{Array}  ret     最终处理后结果
      */
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// The extra typeof function check is to prevent crashes
			// in Safari 2 (See: #3039)
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array ); // 获取array类型
            
            // 只要不是数组，则将array原样插入到ret中
			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
                // 如果是数组则将array合并到ret中
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

    /**
      * 判断指定元素是否在数组中
      * @parm{string}  elem   元素名称
      * @parm{Array}   array  目标查找数组      
      * @return{number}       如果找到返回具体位置，如果没找到则返回-1
      */
	inArray: function( elem, array ) {

        // indexOf，是从Array.prototype.indexOf扩展而来，IE9以下版本是不支持的，所以这个需要进行判断
        // 如果是支持，则直接通过浏览器默认提供的indexOf方法处理
		if ( indexOf ) {
			return indexOf.call( array, elem );
		}
        // 否则，则对数组进行遍历，找到与匹配的元素，然后返回其下标
		for ( var i = 0, length = array.length; i < length; i++ ) {
			if ( array[ i ] === elem ) {
				return i;
			}
		}

        // 以上都能不时，则返回-1
		return -1;
	},

    /**
      * 合并数组
      * @parm{Array}  first   目标数组
      * @parm{Array}  second  参与合并数组       
      * @return{Array}        返回合并后的数组，即first
      */
	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i; // 对数组长度进行修正

		return first;
	},

    /**
      * 数组过滤筛选
      * @parm{Array}     elems     待过滤数组
      * @parm{function}  callback  回调函数       
      * @parm{boolean}   inv       布尔型可选项，默认值false，值为true或false， 如果为false，则函数返回数组中由过滤函数返回 true 的元素，当为 true，则返回过滤函数中返回 false 的元素集。       
      * @return{Array}             返回过滤后的数组
      * e.g var arr=$.grep([0,1,2,3,4,5,6],function(n,i){
                    return n>2;
                }[true]);
         ==> 3,4,5,6
         如果第三个参数为true则返回：0,1,2
      */
	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
        
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
    /**
     * 对数组每个元素进行处理
     * @parm{Array}     elems     待处理元素（数组，或伪数组）
     * @parm{function}  callback  回调函数       
     * @parm{Array}     arg       参数集
     * @return{Array}             处理后的数组 
     */
	map: function( elems, callback, arg ) {
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
    /**
     * 修正context指向
     * @parm{function}     fn       待处理元素（数组，或伪数组）
     * @parm{context}      context  回调函数    
     * @return{Array}             处理后的数组 
     */
	proxy: function( fn, context ) {
		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can be optionally by executed if its a function
    /* 
     * 逐一处理属性
     * 即$(elem).attr('name': 'test')
     * 即$(elem).attr({name:'test', age: 10, id: 1321})
     * @param elems 属性
     * @param key 属性
     * @param value 值
     * @param exec 值
     * @param fn 函数
     * @param pass 值
    */
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
        // $(elems).attr({name:'test', age: 10, id: 1321})
		if ( typeof key === "object" ) {
			for ( var k in key ) {
                // 取出每一个KEY值
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
        // 设置单个属性
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
        // 获取一个属性
		return length ? fn( elems[0], key ) : undefined;
	},

    /**
     * 返回当前时间戳
     * @return{String}  时间戳
     */
	now: function() {
		return (new Date()).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
    /**
     * 浏览器信息匹配，分别出浏览器类型以及版本
     * @parm{string}    ua      浏览器userAgent信息
     * @return{Object}  {borwser[浏览器], version[版本号]}
     */
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
/**
 * 处理javascript 类型名称
 * class2type 为类型对象（[object String] => string）
 * 主要是用于处理通过Object.prototype.toString获取到的类型进行数据类型判断
 * e.g Object.prototype.toString.call('fdafda') => [object String];Object.prototype.toString.call([]) => [object Array]
 */
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// 获取浏览器信息结果
browserMatch = jQuery.uaMatch( userAgent );

if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true; // 设置指定浏览器名称为true，用于判断和区分浏览器；例：if($.browser.MSIE) {alert('是IE浏览器')}
	jQuery.browser.version = browserMatch.version; // $.broser.version 保存浏览器对应版本号
}

// Deprecated, use jQuery.browser.webkit instead
// 如果浏览器是webkit内核，则不推荐使用$.browser.webkit来判断浏，而是使用$.browser.safari
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
// 处理IE不能匹配不间断[non-breaking]空格
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
// 将rootjQuery 指向document
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
// 移除之前绑定到document的ready方法
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
// 在IE下验证DOM是否加载完成
// 关于doScroll：当页面 DOM 未加载完成时，调用 doScroll 方法时，会产生异常。如果不异常，那么就是页面DOM加载完毕了！
function doScrollCheck() {
    // 已经加载完成
	if ( jQuery.isReady ) {
		return;
	}
    // 原理是对于 IE 在非 iframe 内时，只有不断地通过能否执行 doScroll 判断 DOM 是否加载完毕。在本例中每间隔 50 毫秒尝试去执行 doScroll，注意，由于页面没有加载完成的时候，调用 doScroll 会导致异常，所以使用了 try -catch 来捕获异常。
	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 ); // 每个时钟周期来重新检测DOM加载情况
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

// Expose jQuery to the global object
return jQuery;

})();


var // Promise methods
    // 延迟方法集
	promiseMethods = "done fail isResolved isRejected promise then always pipe".split( " " ),
	// Static reference to slice
	sliceDeferred = [].slice;

jQuery.extend({
	// Create a simple deferred (one callbacks list)
    // 创建一个简单的延迟方法，用于解决jQuery的回调函数解决方案
    // 例：
    /* $.ajax("test.html")
       .done(function(){ alert("哈哈，成功了！"); })
       .fail(function(){ alert("出错啦！"); });
      */
	_Deferred: function() {
		var // callbacks list
            // 回调队列
			callbacks = [], 
			// stored [ context , args ]
            // 保存回调函数执行的上下文(this)和参数
			fired,
			// to avoid firing when already doing so
            // 避免函数提前触发
			firing,
			// flag to know if the deferred has been cancelled
            // 延迟取消标示
			cancelled,
			// the deferred itself
			deferred  = {

				// done( f1, f2, ...)
                // 指定操作成功时的回调函数
                // 当延迟成功时调用一个函数或者数组函数
				done: function() {
					if ( !cancelled ) {
						var args = arguments,
							i,
							length,
							elem,
							type,
							_fired;
                        // 如果这个延迟对象已经触发，用 _fired保存[context , args ]
						if ( fired ) {
							_fired = fired;
							fired = 0; // 修改fired=0,以便以后继续调用done()函数
						}
                        // 处理多个参数
						for ( i = 0, length = args.length; i < length; i++ ) {
							elem = args[ i ];
							type = jQuery.type( elem ); // 类型判断
							if ( type === "array" ) { // 如果是数组，表示是一个数组函数，则需要将数组函数中的回调函数逐一取出
								deferred.done.apply( deferred, elem ); // 取出后重新回调
							} else if ( type === "function" ) { // 如果是函数，则将它存入callbacks数组中，等待执行
								callbacks.push( elem );
							}
						}
                        
                        // 如果这个延迟对象已触发，则立即执行resolveWith
						if ( _fired ) {
							deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
						}
					}
					return this;
				},

				// resolve with given context and args
                // 在给定的上下文(context默认为deferred=this对象)中执行队列,清除队列 resolve 执行队列,返回 deferred 对象
				resolveWith: function( context, args ) {
                    // 没有被取消&&没有被已经触发&&避免提前触发
					if ( !cancelled && !fired && !firing ) {
						// make sure args are available (#8421)
						args = args || [];
						firing = 1; // 修改状态，避免callbacks提前触发
						try {
                            // 触发callbacks中所有回调
							while( callbacks[ 0 ] ) { 
								callbacks.shift().apply( context, args );
							}
						}
                        // 修改deferred里的变量状态,firing=0 阻止回调函数触发,fired store[context,args]
                        // 其实这里的fired firing相当于deferred对象的私有变量，通过改变他的值判断函数队列的执行。
						finally {
							fired = [ context, args ];
							firing = 0;
						}
					}
					return this;
				},

				// resolve with this as context and given arguments
                // 手动改变deferred对象的运行状态为"已完成"，从而立即触发done()方法。
                //当resolve后，以后done（）进来的函数都会立即执行，这个在$(function(){});运用的非常好！这里$(function(){})=$(document).ready(function(){})原因可以在init实例化的函数中看到
				resolve: function() {
					deferred.resolveWith( this, arguments );
					return this;
				},

				// Has this deferred been resolved?
                // 确定延迟对象是否已被拒绝
				isResolved: function() {
					return !!( firing || fired ); // 为什么要用!!了,这样才能返回true或者false,比如!!1 !!0 通过deferred对象私有变量判断是否已被
				},

				// Cancel
                // 取消延迟
				cancel: function() {
					cancelled = 1; 
					callbacks = [];
					return this;
				}
			};

		return deferred;
	},

	// Full fledged deferred (two callbacks list)
    /** 
     * 这个$.Deferred()才是给我们使用的，然后根据私有的_Deferred对象扩展出fail，reject等等，这个其实跟done,resolve是同理的，
     * 所作者这里进行了代码公用，只是取了个不同的名字102   
     */
	Deferred: function( func ) {
        // 建立两个私有的延迟对象,扩展deferred，用failDeferred去代替fail ,rejectWith ,reject
		var deferred = jQuery._Deferred(),
			failDeferred = jQuery._Deferred(),
			promise;
		// Add errorDeferred methods, then and promise
        // 增加错误的deferred methods,and promise
		jQuery.extend( deferred, {
            // 两个参数，一个成功回调函数队列，一个失败回调函数队列
            // 有时为了省事，可以把done()和fail()合在一起写
			then: function( doneCallbacks, failCallbacks ) {
				deferred.done( doneCallbacks ).fail( failCallbacks );
				return this;
			},
          
            // 这个方法也是用来指定回调函数的，它的作用是，不管调用的是deferred.resolve()还是deferred.reject()，最后总是执行。
			always: function() {
                // done的上下文设置为deferred，fail的上下文设置为this
                // done和fail的上下文不一致吗？一致！在这里this等于deferred
                // 这行代码同 deferred.done(arguments).fail(arguments);这里感觉有点怪，为了让这个函数队列arguments执行，不得不在done和fail队列同时添加一种回调函数队列然后 return this;但是后面后删除done队列或者fail队列，看那个函数被执行了 答案在这deferred.done(failDeferred.cancel).fail(deferred.cancel);
				return deferred.done.apply( deferred, arguments ).fail.apply( this, arguments );
			},
            // 这几个方法跟上面done,resolveWith,resolve,isResolve的同理
            // 指定操作失败时的回调函数
			fail: failDeferred.done,
			rejectWith: failDeferred.resolveWith,
            // 这个方法与deferred.resolve()正好相反，调用后将deferred对象的运行状态变为"已失败"，从而立即触发fail()方法
			reject: failDeferred.resolve,
			isRejected: failDeferred.isResolved,            
			pipe: function( fnDone, fnFail ) {
                // 返回一个新的promise 对象
				return jQuery.Deferred(function( newDefer ) {
					jQuery.each( {
						done: [ fnDone, "resolve" ],
						fail: [ fnFail, "reject" ]
					}, function( handler, data ) {
						var fn = data[ 0 ],
							action = data[ 1 ],
							returned;
						if ( jQuery.isFunction( fn ) ) {
                            // 
							deferred[ handler ](function() {
								returned = fn.apply( this, arguments );
								if ( jQuery.isFunction( returned.promise ) ) {
									returned.promise().then( newDefer.resolve, newDefer.reject );
								} else {
									newDefer[ action ]( returned );
								}
							});
						} else {
							deferred[ handler ]( newDefer[ action ] );
						}
					});
				}).promise();
			},
			// Get a promise for this deferred
			// If obj is provided, the promise aspect is added to the object
            // 没有参数时，返回一个新的deferred对象，该对象的运行状态无法被改变；接受参数时，作用为在参数对象上部署deferred接口。
            // 返回一个包含 done fail isResolved isRejected promise then always pipe的deferred对象，不让外部修改状态，只能读状态
			promise: function( obj ) {
				if ( obj == null ) {
					if ( promise ) {
						return promise;
					}
					promise = obj = {};
				}
				var i = promiseMethods.length;
                
				while( i-- ) {
					obj[ promiseMethods[i] ] = deferred[ promiseMethods[i] ];
				}
				return obj;
			}
		});
		// Make sure only one callback list will be used
        // 成功队列执行完成后，会执行失败带列的取消方法
        // 失败队列执行完成后，会执行成功队列的取消方法
        // 确保只有一个函数队列会被执行，即要么执行成功队列，要么执行失败队列；
        // 即状态只能是或成功、或失败，无交叉调用
		deferred.done( failDeferred.cancel ).fail( deferred.cancel );
		// Unexpose cancel
		delete deferred.cancel;
		// Call given func if any
        // 如果有函数传进来则立即执行 传入deferred对象,调用回调函数,如def=$.Deferred(funciton(defer){ defer.resolve;.. })
		if ( func ) {
			func.call( deferred, deferred );
		}
		return deferred;
	},

	// Deferred helper
    // 为多个操作指定回调函数
    // firstParam：一个或多个Deferred对象或JavaScript普通对象
	when: function( firstParam ) {
		var args = arguments,
			i = 0,
			length = args.length,
			count = length,
            // 如果参数的长度等于1，并且存在promise函数，表示是一个deferred对象，它这样判断传入的参数是个deferred对象。如果都不满足则新建一个$.Deferred()对象
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred();
        // 构造成功（resolve）回调函数
		function resolveFunc( i ) {
			return function( value ) {
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					// Strange bug in FF4:
					// Values changed onto the arguments object sometimes end up as undefined values
					// outside the $.when method. Cloning the object into a fresh array solves the issue
					deferred.resolveWith( deferred, sliceDeferred.call( args, 0 ) );
				}
			};
		}
		if ( length > 1 ) {
			for( ; i < length; i++ ) {
				if ( args[ i ] && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
		}
		return deferred.promise();
	}
});


/*
* 检查浏览器对各项特性的支持
* 通过检测浏览器特性，可以分辨出浏览器版本（IE）
*/ 
jQuery.support = (function() {

	var div = document.createElement( "div" ),
		all,
		a, // a标签
		select, // select标签
		opt, // select option
		input, 
		marginDiv,
		support,
		fragment,
		body,
		bodyStyle,
		tds,
		events,
		eventName,
		i,
		isSupported;

	// Preliminary tests
    // 初步测试
    // 原理： 通过创建一个DIV向HTML插入需要检测特性的HTML标签和属性，然后通过获取对应标签和属性来进行判断
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName( "*" ); // 获取所有HTML元素
	a = div.getElementsByTagName( "a" )[ 0 ]; // 获取DIV中的第一个A标签

	// Can't get basic test support
    // 不能得到最基本的支持，表示浏览器不支持DOM查找，故返回空对象
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
    // 第一批测试
    // 创建select，然后插入option
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

    /* nodeType常用类型如下：
    *元素element ==> 1
    *属性attr ==> 2
    *文本text ==> 3
    *注释comments ==> 8
    *文档document ==> 9
    */
	support = {
		// IE strips leading whitespace when .innerHTML is used
        // 测试通过innerHTML插入的前导空格在IE是否生效
        // 在IE9以下的版本中通过innerHTML插入的带有前导空格字符串时，会忽略它，通过div.firstChild.nodeType测试时，返回的状态码为1
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
        // 确保tbody元素不会在IE中自动插入到空表中
        // 在IE7、IE6中tbody会自动插入到空表中
		tbody: !div.getElementsByTagName( "tbody" ).length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
        // 确保链接元素被innerHTML序列化的正确
        // 在IE8及以下版本中通过innerHTML序列化后的Link不被生效，length=0;
		htmlSerialize: !!div.getElementsByTagName( "link" ).length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
        // 通过属性获取style信息
        // IE8及以下版本不支持通过getAttribute来获取style属性中的字符串，但可以使用.cssText来获取，即：a.style.cssText，只是IE下通过cssText获取的字符串都是大写字母
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
        // 确认URLS不可被操作
        // IE7及以下 默认会将不可被操作URIS规范化，即会自动加上域名
		hrefNormalized: ( a.getAttribute( "href" ) === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
        // 确定元素存在opactiy属性
        // IE9及以下只支持fliter，通过fliter滤镜，即fliter:alpha(opacity=)
        // 使用一个正则表达式来解决一个WebKit的问题
		opacity: /^0.55$/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
        // float样式验证，在IE9以下版本中使用的是styleFloat而不是cssFloat
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
        // 确保一个checkbox没有值时，默认值为on
        // webkit默认为''，而不是on，但在新版本中已经对这个问题进行了修复，将默认值变成了on
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
        // 确保一个默认选中选项有一个工作选择属性。
        // 在一个select组中，webkit和IE默认为false而不为true
        // 在IE8及以下版本中，动态生成的select中的option默认返回false（未被选中），而在其他浏览器新版中则默认是选中的
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
        // 对于使用DOM属性获取(set)/设置(get)：
        // <input type="text" id="textIpt" value="111" class="test">
        // input.setAttribute('value', 'a121') => input的值会变成a121
        // 非camelCase方式，在各浏览器中通过get/setAttribute，都是能够获取/设置属性
        // input.setAttribute('class', 'test2') => 在IE6/7是设置不成功，但在主流浏览器中是可以设置成功的。（getAttribute同样）
        // 在IE6/7只能使用驼峰的方式来设置/获取属性，即input.setAttribute('className', 'test2') 这样就可以将input的样式设置成test2，但这种方式在其他主流浏览器中是不能的
        // 为了保存其兼容性，所以jQuery提供了一个attrFixes属性池，用来保存需要使用camelCase方式来访问的属性名
        
        // 对于使用HTML属性直接用.或[]来获取(set)/设置(get)：
        // IE6/7可以使用驼峰方式来获取属性参数
        // 但其他浏览器则除自定义属性只能使用标准方法：get/setAttribute外，其他使用HTML属性直接获取/设置是可以的
		getSetAttribute: div.className !== "t",

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
    // 确保checked状态能被克隆
    // 在IE8及以下版本中，即便是深度克隆也无法保存input checked状态
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
    // 确保options中被disabled而select不会被disabled
    // 所有浏览器中select被禁用后，其他子节点option不会被禁用
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
    // 删除一个从元素扩展的属性时，如果已对属性设置有值，那么在IE8及以上版本中不会出现，而在IE8以下中不管设没设置值都会报错
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

    // 针对IE事件绑定支持
	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function click() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
            // 克隆一个节点不应该复制任何绑定事件处理程序(IE是这样做的)
			support.noCloneEvent = false;
			div.detachEvent( "onclick", click );
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains it's value
	// after being appended to the DOM
    
    // 验证radio先动态创建然后为其添加value，然后将它插入到DOM中，然后获取其值，看是否为设置时的值
    // 通过测试ie系列都不支持
    // 通过动态设置radio值会不生效，获取到的值为on（即默认）
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.firstChild );

	// WebKit doesn't clone checked state correctly in fragments
    // webkit下的这个问题，应该属于早期版本，具体无法查出，但测试版本43.0是可以支持状态clone的
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	div.innerHTML = "";

	// Figure out if the W3C box model works as expected
	div.style.width = div.style.paddingLeft = "1px";

	// We use our own, invisible, body
	body = document.createElement( "body" );
	bodyStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		// Set background to avoid IE crashes when removing (#9028)
		background: "none"
	};
	for ( i in bodyStyle ) {
		body.style[ i ] = bodyStyle[ i ];
	}
	body.appendChild( div );
	document.documentElement.appendChild( body );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	support.boxModel = div.offsetWidth === 2;

	if ( "zoom" in div.style ) {
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		// (IE < 8 does this)
		div.style.display = "inline";
		div.style.zoom = 1;
		support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

		// Check if elements with layout shrink-wrap their children
		// (IE 6 does this)
		div.style.display = "";
		div.innerHTML = "<div style='width:4px;'></div>";
		support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
	}

	div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
	tds = div.getElementsByTagName( "td" );

	// Check if table cells still have offsetWidth/Height when they are set
	// to display:none and there are still other visible table cells in a
	// table row; if so, offsetWidth/Height are not reliable for use when
	// determining if an element has been hidden directly using
	// display:none (it is still safe to use offsets if a parent element is
	// hidden; don safety goggles and see bug #4512 for more information).
	// (only IE 8 fails this test)
	isSupported = ( tds[ 0 ].offsetHeight === 0 );

	tds[ 0 ].style.display = "";
	tds[ 1 ].style.display = "none";

	// Check if empty table cells still have offsetWidth/Height
	// (IE < 8 fail this test)
    // 通过实测，都是可以测试通过啊，为什么说在IE8下就测试失败？
	support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
    // document.defaultView在浏览器中，该属性返回当前 document 对象所关联的 window 对象，如果没有，会返回 null。
    // document.defaultView.getComputedStyle在浏览器中，该属性返回当前 document 对象所关联的 window 对象，如果没有，会返回 null。IE 9 以下版本不支持 defaultView。
    // getComputedStyle是一个可以获取当前元素所有最终使用的CSS属性值。返回的是一个CSS样式声明对象([object CSSStyleDeclaration])，只读。
    // 语法：var style = window.getComputedStyle("元素", "伪类");
    // getComputedStyle与style的区别
    /* 来源：http://www.zhangxinxu.com/wordpress/2012/05/getcomputedstyle-js-getpropertyvalue-currentstyle/
    * 1、只读与可写
    * 正如上面提到的getComputedStyle方法是只读的，只能获取样式，不能设置；而element.style能读能写，能屈能伸。
    * 2、获取的对象范围
    * getComputedStyle方法获取的是最终应用在元素上的所有CSS属性对象（即使没有CSS代码，也会把默认的祖宗八代都显示出来）；而element.style只能获取元素style属性中的CSS样式。因此对于一个光秃秃的元素<p>，getComputedStyle方法返回对象中length属性值（如果有）就是190+(据我测试FF:192, IE9:195, Chrome:253, 不同环境结果可能有差异), 而element.style就是0。
    *
    *
    *
    */
	if ( document.defaultView && document.defaultView.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( document.defaultView.getComputedStyle( marginDiv, null ).marginRight, 10 ) || 0 ) === 0; // webkit浏览将返回错误的值而不是获取后的值
	}

	// Remove the body element we added
	body.innerHTML = "";
	document.documentElement.removeChild( body );

	// Technique from Juriy Zaytsev
	// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
    /**
     * CSP(Content Security Policy)：浏览器内容安全策略
     * 关于CSP详情：http://drops.wooyun.org/tips/1439
     *
     */
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		} ) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	return support;
})();

// Keep track of boxModel
jQuery.boxModel = jQuery.support.boxModel;



/**
 * ===================================================
 * JQ数据缓存系统
 * 主要的作用是让一组自定义的数据可以DOM元素相关联——浅显的说：就是让一个对象和一组数据一对一的关联。
 * 参考：http://www.cnblogs.com/silin6/p/jQuery_data.html
 * 包括：
 * 1、数据缓存
 * 2、事件缓存
 *
 * ===================================================
 */

var rbrace = /^(?:\{.*\}|\[.*\])$/,
	rmultiDash = /([a-z])([A-Z])/g;

jQuery.extend({
    // jQuery.cache对象，仓库
	cache: {},

	// Please use with caution
    // 唯一ID
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
    // jQuery.fn.jquery ==> 1.8.0
    // 为当前页面中绑定了数据的元素生成唯一Key，使用这个元素中的这个Key来关联uuid
    // expando组成：jQuery + 版本号 + 随机数，因为版本号和随机数存在小数点，这里使用正则表达式/\D/将非数字字符替换''，以得到纯数字
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
    // applet和embed：这两个标签都是加载外部资源的，这两个标签在js里可以操作的权限简直就是缩卵了——根本行不通，所以jQuery直接给干掉了，直接让他们不能放标签。
    // flash：早期的jQuery将所有的Object标签纳入雷区，后来发现IE下的flash还是可以自定义属性的，于是针对IE的flash还是网开一面，放过了IE的flash，IE下加载flash的时候，需要对object指定一个叫做classId的属性，它的值为：clsid:D27CDB6E-AE6D-11cf-96B8-444553540000。
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

    // 查询elem是否缓存有数据
	hasData: function( elem ) {
        // 如果是elem是元素，则通过elem[key]找到ID，然后在cache找到对应ID的数据
        // 否则，elem就是elem[key]对象，也就是JQ内部缓存
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];

        //!!进行类型转换，将其显示转换成true/false
        // 即然是判断是否有缓存数据，当然只找到对应KEY还不行，还得对它进行内容判断，so isEmptyDataObject
		return !!elem && !isEmptyDataObject( elem );
	},
    
    // 挂载/读取数据
    /**
     * @param{String}             elem      元素对象或jq
     * @param{String}             name      属性名称
     * @param{String|Object}      data      缓存的数据
     * @param{Boolnea}            pvt       是否仅JQ内部使用
     *
     */
	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
        // pvt：标识是否是内部数据
 
        // 第一步： 判定对象是否可以存数据，不能直接返回
        // 数据缓存宿主，第一个是DOM元素，第二是jquery本身，所以需要后续 还需要 对elem进行判断
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

        // 第二步：既然是可以缓存数据的DOM元素或jquery对象，则需要判断传入过来的参数是否合法
        
		var internalKey = jQuery.expando,  // 生成一个KEY
            getByName = typeof name === "string", // 判断name是否为string
            thisCache,

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
            /**
             *  如果是DOM元素，
             *  为了避免javascript和DOM元素之间循环引用导致的浏览器(IE6/7)垃圾回收机制不起作用，
             *  要把数据存储在全局缓存对象jQuery.cache中
             */
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
            // 只有DOM节点才需要全局缓存，js对象是直接连接到对象的
            // 如果是DOM，则cache连接到jQuery.cache
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
            // 如果是DOM，则通过Key获取id，如果是第一次获取，则读取不到key，所以无法找到id，0
            
			id = isNode ? elem[ jQuery.expando ] : elem[ jQuery.expando ] && jQuery.expando;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
        // 排除不合法情况
        // id不存在，则表示没有找到缓存数据
        // 或是内部数据
        // 或name和data为空
		if ( (!id || (pvt && id && !cache[ id ][ internalKey ])) && getByName && data === undefined ) {
			return;
		}

        // 第三步： 判断id是否存在
        // 1、有可能是第一次读取没有数据，所以新增一个
		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
            // 只有DOM节点才需要一个新的ID
			if ( isNode ) {
                // elem['jQuery1800728827903047204'] = 1
                // elem['jQuery1800728827903047205'] = 2
                // elem['jQuery1800728827903047206'] = 3
                // ……
				elem[ jQuery.expando ] = id = ++jQuery.uuid;                 
			} else {
                // 否则就是JQ对象了，id=key
				id = jQuery.expando;
			}
		}

        // 2、id存在，则需要判断对应id在cache是否存在数据
        // cache = elem或cache = jQuery.cache
        // 是节点：cache[id] => cache[jQuery.uuid]
        // 是jQuery：cache[id] => cache[jQuery.expando]
		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
            // 非节点时
			if ( !isNode ) {
            /*
              对于javascript对象，设置方法toJSON为空函数，
              以避免在执行JSON.stringify()时暴露缓存数据。
              如果一个对象定义了方法toJSON()
              JSON.stringify()在序列化该对象时会调用这个方法来生成该对象的JSON元素
            */
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
        // 第四步，cache[id]已存在，只是可能有数据可能没有
        // 然后先判断name是否为对象或函数
        /*
          先把Object/Function的类型的数据挂上。调用方式 :
          $(Element).data({'name':'linkFly'});
        */
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
                // 如果是jquery 内部使用，如果cache[jQuery1800728827903047204]['jQuery1800728827903047204']存在，则将name extend到其中，如果不存在，则返回name，然后将其赋值给cache[jQuery1800728827903047204]['jQuery1800728827903047204']
                // $.extend('', {a: 10}) => {a: 10}
                // $.extend('', function(){}) => {}
                // $.extend({}, function(){}) => {} 
                // 这种写法，不但可以替换已经存在的属性，还可以增加不存在的属性
				cache[ id ][ internalKey ] = jQuery.extend(cache[ id ][ internalKey ], name);
			} else {
                // 如果cache[id]存在，则替换或新增name
                // 给力的写法jQuery.extend(cache[ id ], name)
                // jQuery.extend(null, name) ==> name 
                // 实际数据存入到：jQuery.cache[1],jQuery.cache[2] ……
				cache[ id ] = jQuery.extend(cache[ id ], name);
			}
		}
        
        // thisCache缓存的引用，既可以设置又可以读取数据
		thisCache = cache[ id ];
        

		// Internal jQuery data is stored in a separate object inside the object's data
		// cache in order to avoid key collisions between internal data and user-defined
		// data
        
        // 读取
		if ( pvt ) {
            // 内部cache
            // 第一次可能没有数据
			if ( !thisCache[ internalKey ] ) {                
				thisCache[ internalKey ] = {};
			}

            // 更新thisCache
			thisCache = thisCache[ internalKey ];
		}
        
        // 给name缓存data
		if ( data !== undefined ) {
            // 给缓存的name添加data
			thisCache[ name ] = data;
		}

		// TODO: This is a hack for 1.5 ONLY. It will be removed in 1.6. Users should
		// not attempt to inspect the internal events object using jQuery.data, as this
		// internal data object is undocumented and subject to change.
        // 因为jquery cache与jquery event直接关联，所以需要对其做特殊处理
		if ( name === "events" && !thisCache[name] ) {
            // 因为events仅在内部使用，所以缓存的数据会存到jQuery本身，
            // 如果对应events存在，则返回它
			return thisCache[ internalKey ] && thisCache[ internalKey ].events;
		}

        // 返回读取的数据
        // 如果只是创建，则返回{}
        // 否则返回存在的name数据
		return getByName ? thisCache[ name ] : thisCache;
	},

    // 移除cache数据
    // 分二种情况：
    // 1、删除elem所有cache数据
    // 2、删除name数据
    //
    /**
     * @param{String}             elem      元素或jq
     * @param{String}             name      属性名称
     * @param{Boolnea}            pvt       是否仅JQ内部使用
     *
     */
	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var internalKey = jQuery.expando, isNode = elem.nodeType,

			// See jQuery.data for more information
            // 统一调用入口
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
            // 拿到id，以便从cache中找id对应数据
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
        // 没找到返回 
		if ( !cache[ id ] ) {
			return;
		}

        // 对应情况二，删除指定name数据
        // 移除对应name数据
		if ( name ) {
			var thisCache = pvt ? cache[ id ][ internalKey ] : cache[ id ]; // 数据缓存位置 

			if ( thisCache ) {
                // 删除cache中对应的属性
				delete thisCache[ name ]; // 删除

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
                // 判断thisCache是否还有缓存数据，如果有则继续其他操作，否则返回
				if ( !isEmptyDataObject(thisCache) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
        // 是内部cache
		if ( pvt ) {
			delete cache[ id ][ internalKey ];

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

      
        // 接着删除情况1，即elem对应的所有cache数据
      
        // cache[ id ][ internalKey ]太长，简化调用
		var internalCache = cache[ id ][ internalKey ];

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
        // 不为window的情况下，或者可以浏览器检测可以删除window.属性，再次尝试删除
		if ( jQuery.support.deleteExpando || cache != window ) {
			delete cache[ id ];
		} else {
            // 否则，直接粗暴的null
			cache[ id ] = null;
		}

		// We destroyed the entire user cache at once because it's faster than
		// iterating through each key, but we need to continue to persist internal
		// data if it existed
		if ( internalCache ) {
            // 快速清除子属性方法，直接给父属性{}
			cache[ id ] = {};
			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
			if ( !isNode ) {
                // 修正
				cache[ id ].toJSON = jQuery.noop;
			}
          
			cache[ id ][ internalKey ] = internalCache;

		// Otherwise, we need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		} else if ( isNode ) {
            // 删除对应elem(DOM节点)上所有cache数据
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
            // 特性判断，因为在IE中，删除DOM节点属性会报错
			if ( jQuery.support.deleteExpando ) {
				delete elem[ jQuery.expando ];
            // 尝试使用removeAttribute方法
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( jQuery.expando );
			} else {
            // 都没用就强制设置null
				elem[ jQuery.expando ] = null;
			}
		}
	},

	// For internal use only.
    // _data仅在jQuery内部使用
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
    // 用于浏览器兼容性
    // 配合jQuery.noData做过滤，过滤掉，flash插件之类的
    // 返回true表示元素是可以允许设置data的，否则不能；正常情况因为都是返回true
	acceptData: function( elem ) {
		if ( elem.nodeName ) {            
            //确定一个对象是否允许设置Data
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
                //如果节点是object，则判定是否是IE flash的classid
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

// 为元素添加cache Data 方法和删除cache data方法，使用html5 data-xx属性方式
jQuery.fn.extend({
    // 添加或获取指定KEY
    // <input type='text' data-id="20" data-name="test">
    // $('input').data('id') ==> 20
    // $('input').data('id', 10);
    // $('input').data('id') ==> 10
    // $('input').data() ==> {id: 20, name: 'test'}
    /**
     * @param{String|Object}       key     属性名或JSON；【可省略】
     * @param{String}              value   属性值；【可省略】
     * 1、当省略KEY时，则获取的是元素或对象上所有cache data 数据，
     * 2、当省略VALUE时，则获取坐cache data中获取key属性值
     */
	data: function( key, value ) {
		var data = null;

        // 情况一：当key不存在的时候，正常情况下，则返回当前元素中所有自定义data值
		if ( typeof key === "undefined" ) {
            // selector存在
			if ( this.length ) {
                // 将数据挂载到jquery.cache中
				data = jQuery.data( this[0] );

                // 是元素，则通过获取元素中的data-xx来获取属性值
				if ( this[0].nodeType === 1 ) {
                    // attr 获取元素上所有属性
			    var attr = this[0].attributes, name;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) ); // 获取元素data对应的name，data-type => type
                            // 获取data属性值，并缓存到jquery.cache中
							dataAttr( this[0], name, data[ name ] );
						}
					}
				}
			}

			return data;

        // 情况二：key是一个JSON
		} else if ( typeof key === "object" ) {
            // 如果key是一个对象，则遍历它，将其值缓存到jquery.cache中
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

        // 属性名命名空间处理，即key = 'abd.sdsf'
		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

        // 当value不存在时，应该是获取key的值
		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
            // 
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key ); // 先从jquery.cache中获取key值
				data = dataAttr( this[0], key, data ); // 不行就则通过html5 data-xx从元素本身获取
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
            // 否则，将value设置成key的值
			return this.each(function() {
				var $this = jQuery( this ),
					args = [ parts[0], value ];

				$this.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				$this.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

    // 删除data，这个删除把jquery.cache中的删除，不影响元素本身设置的data-xx
    // $('input').removeData() => 删除jquery.cache对应元素所有缓存的data数据
    // $('input').removeData('id') => 删除jquery.cache对应元素对应key的data数据
	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});


/**
 * H5 自定义属性
 * 通过读取HTML中data-attribute来获取属性值，并将获得的属性绑定到元素对应的cache中
 * @param{DOM}              el        DOM元素
 * @param{String}           key       属性名称
 * @param{JSON|String}      data      属性值
 */
function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
    // 属性值没传并且是一个元素
	if ( data === undefined && elem.nodeType === 1 ) {
        // 属性名格式化
        // 对驼峰名称格式化，如：key = nameTest ->  data-name-test
		name = "data-" + key.replace( rmultiDash, "$1-$2" ).toLowerCase();
        
        // 从元素中获取属性data-key
		data = elem.getAttribute( name ); 
        
        // data存在
		if ( typeof data === "string" ) {
            // 需要分情况，因为data值可能是一个纯字符串，也可能是一个json字符串
            // 如果字符串是数字，则将数字字符串转换成纯数值类型
            // 如果不是数字，那么
            // 如果是json字符串，则通过parseJSON序列化它，返回一个json对象
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				!jQuery.isNaN( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
            // 最后将获得到的数据，依据对应元素对应key来绑定数据到，jquery cache中
			jQuery.data( elem, key, data );

		} else {
            // 返回data不存在
			data = undefined;
		}
	}

    // 返回
	return data;
}

// TODO: This is a hack for 1.5 ONLY to allow objects with a single toJSON
// property to be considered empty objects; this property always exists in
// order to make sure JSON.stringify does not expose internal metadata
// 判断obj是否是一个空的数据对象
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

/**
 * ===================================================
 * JQ队列系统
 * 主要用于动画系统
 * 队列是一种特殊的线性表，只允许在表的前端（队头）进行删除操作（出队），在表的后端（队尾）进行插入操作（入队）。队列的特点是先进先出（FIFO-first in first out），即最先插入的元素最先被删除。
 * jQuery提供了jQuery.queue/dequeue和jQuery.fn.queue/dequeue，实现对队列的入队、出队操作。不同于队列定义的是，jQuery.queue和jQuery.fn.queue不仅执行出队操作，返回队头元素，还会自动执行返回的队头元素。
 *
 * ===================================================
 */
  
/**
 * 处理队列延迟标示
 * @param{String}           elem      元素
 * @param{String}           type      元素
 * @param{String}           src      元素
 *
 */
function handleQueueMarkDefer( elem, type, src ) {
	var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = jQuery.data( elem, deferDataKey, undefined, true );
	if ( defer &&
		( src === "queue" || !jQuery.data( elem, queueDataKey, undefined, true ) ) &&
		( src === "mark" || !jQuery.data( elem, markDataKey, undefined, true ) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() {
			if ( !jQuery.data( elem, queueDataKey, undefined, true ) &&
				!jQuery.data( elem, markDataKey, undefined, true ) ) {
				jQuery.removeData( elem, deferDataKey, true );
				defer.resolve();
			}
		}, 0 );
	}
}

jQuery.extend({

    // 添加标记
	_mark: function( elem, type ) {
		if ( elem ) {
			type = (type || "fx") + "mark";
			jQuery.data( elem, type, (jQuery.data(elem,type,undefined,true) || 0) + 1, true );
		}
	},

    // 移除标记
	_unmark: function( force, elem, type ) {
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (jQuery.data( elem, key, undefined, true) || 1 ) - 1 );
			if ( count ) {
				jQuery.data( elem, key, count, true );
			} else {
				jQuery.removeData( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	},

    /**
     * 添加到队列
     * @param{DOM}       elem
     * @param{DOM}       type
     * @param{DOM}       data
     *
     */
	queue: function( elem, type, data ) {
		if ( elem ) {
			type = (type || "fx") + "queue";
			var q = jQuery.data( elem, type, undefined, true );
			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || jQuery.isArray(data) ) {
					q = jQuery.data( elem, type, jQuery.makeArray(data), true );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

    /**
     * 出列
     * @param{DOM}       elem
     * @param{DOM}       type
     *
     */
	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift(),
			defer;

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift("inprogress");
			}

			fn.call(elem, function() {
				jQuery.dequeue(elem, type);
			});
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function() {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue( type, function() {
			var elem = this;
			setTimeout(function() {
				jQuery.dequeue( elem, type );
			}, time );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {
		if ( typeof type !== "string" ) {
			object = type;
			type = undefined;
		}
		type = type || "fx";
		var defer = jQuery.Deferred(),
			elements = this,
			i = elements.length,
			count = 1,
			deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark";
		function resolve() {
			if ( !( --count ) ) {
				defer.resolveWith( elements, [ elements ] );
			}
		}
		while( i-- ) {
			if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
					( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
						jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
					jQuery.data( elements[ i ], deferDataKey, jQuery._Deferred(), true ) )) {
				count++;
				tmp.done( resolve );
			}
		}
		resolve();
		return defer.promise();
	}
});



/**
 * ===================================================
 * 属性操作
 * 关于属性操作主要从二个方面，第一个是直接通过HTML属性，第二个是通过DOM属性
 * attr：是通过DOM属性，setAttibute，removeAttribute；
 * prop：是通过elem[name]来直接设置或获取；
 * 区别：
 * attr: 获取的是显示在HTML标签上的属性值，如果获取的属性不是显示在HTML标签上，则获取的值将为Null或''
 * prop：则可以获取到元素的默认属性值
 * ===================================================
 */
var rclass = /[\n\t\r]/g, // 换行，回车正则
	rspace = /\s+/,        // 空格
	rreturn = /\r/g,       // 换行
	rtype = /^(?:button|input)$/i, // 用于区分button二种方式：<button><input type="button">
	rfocusable = /^(?:button|input|object|select|textarea)$/i,  // 
	rclickable = /^a(?:rea)?$/i, // a标签或锚
	rspecial = /^(?:data-|aria-)/, //
	rinvalidChar = /\:/,   // 匹配:
	formHook;

//console.info( $('#a').attr('href') ); // abc.html
//console.info( $('#a').prop('href') ); // file:///H:/open/ws-nuysoft/com.jquery/jquery/abc.html
// 
//console.info( $('#a').attr('class') ); // csstest
//console.info( $('#a').prop('class') ); // csstest
// 
//console.info( document.getElementById('a').getAttribute('class') ); // csstest
//console.info( document.getElementById('a').className ); // csstest
// 
//console.info( $('#a').attr('style') ); // font-size: 30px;
//console.info( $('#a').prop('style') ); // CSSStyleDeclaration { 0="font-size", fontSize="30px", ...}
//console.info( document.getElementById('a').getAttribute('style') ); // font-size: 30px;
//console.info( document.getElementById('a').style ); // CSSStyleDeclaration { 0="font-size", fontSize="30px", ...}
// 
//console.info( $('#text').attr('value') ); // 123
//console.info( $('#text').prop('value') ); // 123
// 
//console.info( $('#checkbox').attr('checked') ); // checked
//console.info( $('#checkbox').prop('checked') ); // true
//    
//不同之处总结如下：
//	属性名可能不同，尽管大部分的属性名还是相似或一致的
//	HTML属性值总是返回字符串，DOM属性值则可能是整型、字符串、对象，可以获取更多的内容
//	DOM属性总是返回当前的状态（值），而HTML属性（在大多数浏览）返回的初始化时的状态（值）
//	DOM属性只能返回固定属性名的值，而HTML属性则可以返回在HTML代码中自定义的属性名的值
//	相对于HTML属性的浏览器兼容问题，DOM属性名和属性值在浏览器之间的差异更小，并且DOM属性也有标准可依
//	在IE9以下版本中自定义属性通过HTML属性来设置和获取都是没有问题的，但在主流浏览器中，自定义属性只能通过DOM属性来进行获取和设置
    
jQuery.fn.extend({
    // 设置属性
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},
    
    // 移除属性
	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},
	
    // 使用HTML属性的方式来设置或获取属性
	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},
	
    // 移除prop
	removeProp: function( name ) {
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

    // 添加样式 
    // 添加样式的方式有两种
    // 1、直接传字符串className，多个用空格分开
    // $(elem).addClass('text')
    // $(elem).addClass('text text1 ……')
    // 2、传入一个函数，如果需要对一个ul li列表中的每个li设置不同的样式，就可以使用函数的方式
    // 对于传的函数是有要求：此函数必须返回一个或多个空格分隔的class名。接受两个参数，index参数为对象在这个集合中的索引值，class参数为这个对象原先的class属性值。
    // $('ul li').addClass(function(){return 'item-' + $(this).index()});
	addClass: function( value ) {
        // 如果value是一个函数，表示需要遍历
		if ( jQuery.isFunction( value ) ) {
            // 通过递归
			return this.each(function(i) {
				var self = jQuery(this);
                // 调用时，传入index索引值和获取元素当前已经存在的className，如果className不存在，则为空
				self.addClass( value.call(this, i, self.attr("class") || "") );
			});
		}

        // value是一个字符串
		if ( value && typeof value === "string" ) {
            // 已存在的className数组
			var classNames = (value || "").split( rspace );
            
            // 需要添加class的元素可能不止一个 
			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];

                // 必须是元素节点才能添加
				if ( elem.nodeType === 1 ) {
                    // 第一次添加class时
					if ( !elem.className ) {
						elem.className = value;

					} else {
                        // 对已有class时，如果重复的替换，没有的追加
                        // class='test test1'                        
						var className = " " + elem.className + " ",
							setClass = elem.className; // 保存对className属性的引用 

                        // 遍历已存在的class
						for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
                            // 判断是否已经存在，已经添加的就不需要重复添加
							if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
								setClass += " " + classNames[c];
							}
						}
                        // 将最后的清除class字符串前后空格，再添加到元素上
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

    // 移除样式
    // 移除情况二种
    // 1、移除指定的
    // $(elem).removeClass('test')
    // 2、移除所有
    // $(elem).removeClass()
	removeClass: function( value ) {
		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				self.removeClass( value.call(this, i, self.attr("class")) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			var classNames = (value || "").split( rspace );

			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];

				if ( elem.nodeType === 1 && elem.className ) {
                    // 区别与addClass地方
					if ( value ) {
                        // 去除一些特殊字符，比如回车符
						var className = (" " + elem.className + " ").replace(rclass, " ");
						for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
                            // 将匹配的className替换成空
							className = className.replace(" " + classNames[c] + " ", " ");
						}
                        // 重置元素class
						elem.className = jQuery.trim( className );

					} else {
                        // value为undefined时，清除所有元素class
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

    // 样式切换
	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				self.toggleClass( value.call(this, i, self.attr("class"), stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

    // 判断是否存在某个样式 
	hasClass: function( selector ) {
		var className = " " + selector + " ";
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

    // 设置值
	val: function( value ) {
		var hooks, ret,
			elem = this[0];
		
		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				return (elem.value || "").replace(rreturn, "");
			}

			return undefined;
		}

		var isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var self = jQuery(this), val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || ("set" in hooks && hooks.set( this, val, "value" ) === undefined) ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
    
    // value钩子，用于收集需要特殊处理的元素值，解决浏览器间的兼容性问题
	valHooks: {
        // option 取值
		option: {
            // 获取值
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
                // attributes.value 在主流浏览器中测试，都是为undefined，包括ie6
				var val = elem.attributes.value;
                
				return !val || val.specified ? elem.value : elem.text;
			}
		},
      
        // 获取select值
		select: {
			get: function( elem ) {
                // <select><option value="1">1111</option><option value="2">2222</option></select>
                // console.log(select.selectedIndex)  => 0
                // console.log(select.selectedIndex = 1) => 1 
                
				var index = elem.selectedIndex, // 记录select列表中被选选项的索引号，同时也可以设置索引，设置后select option对应索引号会被选中
					values = [],
					options = elem.options,    // 获取select option集
					one = elem.type === "select-one";  // select 类型，有二种：一种单选（type: select-one），一种多选择（type: select-multiple），设置select multiple属性即可！

				// Nothing was selected
                // select没有option
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
                // 遍历找到全部selected的option
				for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
					var option = options[ i ]; // 单个option节点

					// Don't return options that are disabled or in a disabled optgroup
                    // option被选择并且没有被禁用（包括select是否禁用、option是否被禁用，还包括optgroup是否被禁用）
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
                        // 获取其值
                        // 直接option.value不也一样？
						value = jQuery( option ).val();

						// We don't need an array for one selects
                        // 如果是单选，则返回选中的值
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
                        // 如果是多选，则返回一个数组
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
                // 测试案例：http://test.getify.com/test-ie-form-reset-select.html
                // 表单重置后，IE6\7下会出现BUG，虽然表现形式没有问题，依然选中的是第一个option，但是selected属性并不为true，而是为false，重置之后，所有的option selected属性都会重置为false
                // 所以需要做下面的特殊处理，以保证能正确返回选中的option值
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

            // 设置选中值
			set: function( elem, value ) {
                // 将传过来个多个value转换成数组，以便查询
				var values = jQuery.makeArray( value );

                // 遍历option
				jQuery(elem).find("option").each(function() {
                    // 判断option值是否出现在values集中
                    // inArray判断一个值在数组的位置，存在则返回数组下标，否则返回-1，与indexOf效果一样
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

                // 如果value不存在
				if ( !values.length ) {
                    // 则将selectedIndex设置成-1
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},
	
    // 属性名修正
	attrFix: {
		// Always normalize to ensure hook usage
		tabindex: "tabIndex",
		readonly: "readOnly"
	},
	
    /**
     * 设置属性
     * @param{DOM}      elem        元素
     * @param{String}      name     属性名
     * @param{String}      value    属性值
     * @param{Boolean}      pass    属性值
     *
     *
     */
	attr: function( elem, name, value, pass ) {
		var nType = elem.nodeType;
		
		// don't get/set attributes on text, comment and attribute nodes
        // 只有元素才能设置属性
        // 元素element	  1
        // 属性attr	      2
        // 文本text	      3
        // 注释comments	  8
        // 文档document	  9
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return undefined;
		}

        // 遇到与方法同名的属性，则执行方法
        // 如果遇到的是扩展或需要修正的属性，则执行相应的方法
		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}
		
		var ret, hooks,
            // 判断是否为XML
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
		
		// Normalize the name if needed
        // 将name标准化
        // 修正：tabindex => tabIndex
		name = notxml && jQuery.attrFix[ name ] || name;

		// Get the appropriate hook, or the formHook
		// if getSetAttribute is not supported and we have form objects in IE6/7
        // 先看是否是属性钩子中的属性
		hooks = jQuery.attrHooks[ name ] ||
			( formHook && (jQuery.nodeName( elem, "form" ) || rinvalidChar.test( name )) ?
				formHook :
				undefined );

        // 注意这是非全等，所以除非value=undefined，否则其他情况都会为true
		if ( value !== undefined ) {

            // 如果value=null或value=false且name不是自定义属性，则直接移除name属性
			if ( value === null || (value === false && !rspecial.test( name )) ) {
				jQuery.removeAttr( elem, name );
				return undefined;

                // 通过属性钩子来判断当前的属性是否需要进行特殊处理，如果需要，则调取钩子中定义 的set方法来对特殊属性进行属性值设置
			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {

				// Set boolean attributes to the same name
                // 如果是布尔属性，则他们的值和名称是一样
				if ( value === true && !rspecial.test( name ) ) {
					value = name;
				}
                
                // 而后直接通过setAttribute来设置属性值
                // ""+value，将value转成字符串
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else {

            // value没有设置，表示为获取属性
            
            // 看属性钩子是否存在，且get在其中（则表示这个属性是需要特殊处理的），则调用钩子中的方法
			if ( hooks && "get" in hooks && notxml ) {
                // 返回获取的属性值
				return hooks.get( elem, name );

			} else {
                // 即不关系于任何钩子，表示为正常属性，那么直接使用getAttribute来获取即可
				ret = elem.getAttribute( name );

				// Non-existent attributes return null, we normalize to undefined
                // 如果不为空则返回获取的值，否则返回undefined
				return ret === null ?
					undefined :
					ret;
			}
		}
	},
	
    // 移除属性
	removeAttr: function( elem, name ) {
        // 必须是元素
		if ( elem.nodeType === 1 ) {
			name = jQuery.attrFix[ name ] || name;
		
            // 通过检测浏览器特性来判断浏览器是否支持attribute来设置属性
			if ( jQuery.support.getSetAttribute ) {
				// Use removeAttribute in browsers that support it
				elem.removeAttribute( name );   // 使用removeAttribute移除属性
			} else {
                // 否则将属性设置为空
				jQuery.attr( elem, name, "" );
                // 然后再通过removeAttributeNode来移除name，确保将属性移除
				elem.removeAttributeNode( elem.getAttributeNode( name ) );
			}
		}
	},

    // 属性钩子，对于一些特殊属性做过滤处理
	attrHooks: {
        // type属性
		type: {
            /**
             * 解决IE6-9下，动态设置radio值时，不能正确获取值的问题，进行修正。在IE6-9中，动态设置表单type='radio'，那么表单原始值或已设置的值将不再生效，取而代之的是默认值On
             * elem     元素
             * value    属性值
             */
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
                // 不允许修改button或input属性，因为在IE下会出现问题
                // 在IE中，如果去修改表单type属性，会报错，提示不支持该方法
                // <input type='submit' id='J-re' value='提交'>
                // document.getElementById('J-re').setAttribute('type', 'button')
                // document.getElementById('J-re').type = 'button'
                
                // 首先过滤掉，已经存在DOM中的表单（input|button）
                // 对于判断elem是否已经存在DOM中，是通过elem.parentNode
                // elem在DOM中一定是会有父节点（parentNode），只有动态新建，且还没有插入到DOM中的才会为null
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
                    // 处理IE（6-9）下radio
                    // 先获取radio值
                    // 然后重置属性（重置属性如果与原属性相同的话，IE是不会报错的）
                    // 然后再将获取到的值，重新设置到radio中
                    // 最后返回value
					var val = elem.getAttribute("value");
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
        // tabIndex属性（规定元素的 tab 键控制次序（当 tab 键用于导航时））
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                // 显式：即将属性直接写在了HTML标签上，可以直接看到
                // 当tabIndex没有显式的设置时，不同浏览器，返回结果不一定是正确的
                // 在IE8以下浏览器中，没有显式设置时，返回0，而其他则返回null
              
                // 另外，关于getAttribute与getAttributeNode
                // getAttribute是直接返回属性值
                // getAttributeNode则返回的是属性节点，它本身自带的属性可以获取属性名称（name）、属性值（value）、是否规定某个属性（specified）
                // getAttribute应该是getAttributeNode的简化版，所以用来获取属性值要比使用getAttributeNode更快
                
                // 这里不用getAttribute而用getAttributeNode的原因：
                // 1、getAttribute只是一个只读属性，返回只是属性值而不能做更多的支持，另外在ie6-7中可能出现获取不到正确值的情况
                // 2、由于浏览器的兼容性问题，虽然通过getAttribute和通过getAttributeNode都能获取到相同值，但对于IE6-7，元素属性显式与不显式在元素上是有区别的。
                // ie6-7：elem.getAttributeNode("tabIndex") => 1
                // ie7+或其他主流浏览器获取的却是null
                // 为了使之有达到兼容性的目的，则需要更多的属性来区别显式与不显式区域，这时getAttributeNode的优势就出现，因为它自身的属性specified就能做到这一点。
                // 所以这个地方没有使用getAttribute而是使用getAttributeNode
				var attributeNode = elem.getAttributeNode("tabIndex");

                // attributeNode.specified 用来判断元素是否显式出这个属性，即这属性是否直接写在HTML标签上，有则返回true，否则返回false
                // attributeNode && attributeNode.specified 返回true的话，表示tabIndex已经设置了具体值，所以直接将它格式化成整数后返回；
                // 否则判断elem是否为可focus元素或可点击元素，是则返回0，否则返回undefined
				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	},
	
    // 待修正属性名集合
	propFix: {},
	
    // 通过HTML属性来获取值
	prop: function( elem, name, value ) {
		var nType = elem.nodeType;
		
		// don't get/set properties on text, comment and attribute nodes
        // 过滤掉元素之外的类型
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return undefined;
		}
		
		var ret, hooks,
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
		
		// Try to normalize/fix the name
		name = notxml && jQuery.propFix[ name ] || name;
		
        // 看是否是需要特殊处理的属性
		hooks = jQuery.propHooks[ name ];
		
        // 设置值 
		if ( value !== undefined ) {
            // 是特殊处理属性，并且可以设置属性值
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;
			
			} else {
                // 否则直接设置值
				return (elem[ name ] = value);
			}
		
        // 获取值
		} else {
            // 处理方式与设置一样
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== undefined ) {
				return ret;
				
			} else {
				return elem[ name ];
			}
		}
	},
	
    // 属性钩子
	propHooks: {}
});

// IE6/7 do not support getting/setting some attributes with get/setAttribute
// 解决IE6/7不支持getting/setting一些属性，因为它们需要进行一些特殊处理，才能使用get/setAttribute
if ( !jQuery.support.getSetAttribute ) {
    // 修改属性名称，用于JS中
	jQuery.attrFix = jQuery.extend( jQuery.attrFix, {
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder"
	});
	
	// Use this for any attribute on a form in IE6/7
    // form钩子，主要是处理IE6/7下的问题
	formHook = jQuery.attrHooks.name = jQuery.attrHooks.value = jQuery.valHooks.button = {
        // 获取值
		get: function( elem, name ) {
			var ret;
            // 表单按钮有2种显示方式
            // 1、<input type="button" value="111">
            // 2、<button type="button">1111</button>
            
            // 这里处理排除第2种情况
			if ( name === "value" && !jQuery.nodeName( elem, "button" ) ) {
				return elem.getAttribute( name );
			}
            
            // 否则判断name是否显示在标签上，如果是则获取值，否则undefined
			ret = elem.getAttributeNode( name );
			// Return undefined if not specified instead of empty string
			return ret && ret.specified ?
				ret.nodeValue :
				undefined;
		},
        // 设置值
		set: function( elem, value, name ) {
			// Check form objects in IE (multiple bugs related)
			// Only use nodeValue if the attribute node exists on the form
			var ret = elem.getAttributeNode( name );
			if ( ret ) {
				ret.nodeValue = value;
				return value;
			}
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
    // 处理宽度和高度值为空的情况
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
                    // 当值为空时，将值设置成auto
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}

// Some attributes require a special call on IE
// 解决IE下部分属性会被自动修正不能获取到设置值的属性，比如href，href在IE6-7下会自动加入域名补全URL，而不是为其设置的值
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
                // getAttribute第二个参数为IE特有属性
                // 0：默认值。搜索属性时大小写不敏感
                // 1：搜索属性时大小写敏感，大小和小写字母必须完全匹配。
                // 2：返回BSTR形式的属性值？此标识对事件属性无效。
                // 4：返回完整路径URL地址。只对URL属性有效。
                
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

// IE8以下不支持通过getAttribute来获取style属性，所以需要进行兼容处理
if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
        // 获取属性，通过cssText来获取，不过，得到的属性全都是大写
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
            // 返回获取的属性字符串
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return (elem.style.cssText = "" + value);
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
// IE8以下通过动态生成的select中的option默认返回false（未被选中），而在其他浏览器新版中则默认是选中的，需要做兼容处理
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	});
}

// Radios and checkboxes getter/setter
// 修正在某些浏览器radio和checkbox没有设置值时的默认值问题
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                // 如果获取的值为null，则返回On
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}

// 处理特殊情况，即value为一个数组时
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return (elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0);
			}
		}
	});
});



/**
 * ===================================================
 * 事件操作
 * ===================================================
 */
var hasOwn = Object.prototype.hasOwnProperty, 
	rnamespaces = /\.(.*)$/,
	rformElems = /^(?:textarea|input|select)$/i,
	rperiod = /\./g,
	rspaces = / /g,
	rescape = /[^\w\s.|`]/g,
	fcleanup = function( nm ) {
		return nm.replace(rescape, "\\$&");
	};

/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code originated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

	// Bind an event to an element
	// Original by Dean Edwards
    // 绑定一个事件到元素
    // elem: 元素节点
    // types: 事件类型，可能有多个
    // handler: 事件回调函数
    // data: 附加参数
    
//    jQuery.event.add( this,
//    liveConvert( handleObj.origType, handleObj.selector ),
//    jQuery.extend({}, handleObj, {handler: liveHandler, guid: handleObj.handler.guid}) );//
//
//    jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
//
//
//    jQuery.event.add(this, "click.specialSubmit", function( e ) {
//            var elem = e.target,
//                type = elem.type;
//
//            if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
//                trigger( "submit", this, arguments );
//            }
//    });
//
//    jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
//        var elem = e.target,
//            type = elem.type;
//
//        if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
//            trigger( "submit", this, arguments );
//        }
//    });
//    jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
//    jQuery.event.add( this[i], type, handler, data );
//
//    jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
    
    
	add: function( elem, types, handler, data ) {
        // 过渡文本和注释节点
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

        // handler === false
        // 取消默认事件，同时修正handler = returnFalse;
		if ( handler === false ) {
            // 表示取消绑定事件的默认事件
			handler = returnFalse;
		} else if ( !handler ) {
			// Fixes bug #7229. Fix recommended by jdalton
            // 否则不能进行事件绑定
			return;
		}
        

		var handleObjIn, handleObj;

        // 如果已经是封装过的jQuery事件对象（JS真是愁人啊，弱类型，只能通过特性、属性判断对象的类型）
        // 主要是handler它传过来的时候不一定只是函数，还有可能是一个对象
        // 比如使用live事件的时候
        /* handler = { 
            data: data, // 数据
            selector: selector,     // 选择器字符串，$('#id') => #id 
            handler: fn,            // 事件回调函数
            origType: type,         // 事件类型
            origHandler: fn, 
            preType: preType } 
        */
		if ( handler.handler ) {
            // handleObj是DOM事件句柄对象（丰富后的jQuery.event.handle）  
			handleObjIn = handler;
            // handler始终是个事件处理函数
			handler = handleObjIn.handler;
		}

		// Make sure that the function being executed has a unique ID
        // 为每个事件处理函数创建唯一ID 
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}
        
		// Init the element's event structure
        // 内部数据存储在内部对象上，因此elemData不应该为空，除非elem不支持jQuery缓存（embed、object、applet）
		var elemData = jQuery._data( elem );
        
		// If no elemData is found then we must be trying to bind to one of the
		// banned noData elements
        // 如果elemData不存在，说明是一个不支持缓存的元素上绑定事件，直接返回 
		if ( !elemData ) {
			return;
		}

		var events = elemData.events, // 用于存储事件类型和事件句柄
			eventHandle = elemData.handle;   // 用于存储事件处理函数

		if ( !events ) {
            // 还没有存储任何事件句柄时，初始化，事件名为Key，事件函数为value
			elemData.events = events = {};
		}

		if ( !eventHandle ) {
            // 事件处理函数初始化
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.handle.apply( eventHandle.elem, arguments ) :
					undefined;
			};
		}

		// Add elem as a property of the handle function
		// This is to prevent a memory leak with non-native events in IE.
        // 内存泄漏？  
        // 将elem作为eventHandle的属性存储，用来避免IE中非本地事件的内存泄漏  
		eventHandle.elem = elem;

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
        // 对同时绑定的多个事件类型名独立出来
		types = types.split(" ");

		var type, i = 0, namespaces;

		while ( (type = types[ i++ ]) ) { // 遍历，秀技啊！！！
			handleObj = handleObjIn ?
				jQuery.extend({}, handleObjIn) :
				{ handler: handler, data: data }; // 创建事件句柄对象

			// Namespaced event handlers
            // 事件命名空间，针对类似下面的事件绑定
            // $(element).bind('click.my_event', fn);
            // 如果事件字符串中有句号.，则说明有命名空间 
			if ( type.indexOf(".") > -1 ) {
                // 存在命名空间，那么需要从中分离出具体的事件类型名称
				namespaces = type.split(".");
                // 取出namespaces中的第一个元素，正常为事件的类型名称
				type = namespaces.shift();
                // 将于下部分作为命名空间，存储到属性namespace中  
                // 这里为什么还需要slice(0)，还要进行sort()？
                // 使用slice的原因是保证在使用sort()之前，是一个新数组，而不是一个数组的引用！
                // 使用sort的原因在于，使用命名空间时，可能会出现下面情况：
                // $(elem).bind('click.a.b.c', fn),$(elem).bind('click.b.a.c', fn)，对于jquery来讲，这两个绑定方式是没有区别的，
                // 也就是命名空间'click.a.b.c' == 'click.b.a.c'
                // 使用sort()，就是使它们保持一致
				handleObj.namespace = namespaces.slice(0).sort().join(".");

			} else {
                // 否则不存在命名空间
				namespaces = [];
				handleObj.namespace = "";
			}

            // 将事件类型存到type属性中
			handleObj.type = type;
            
            // 看guid是否存在，没有则给一个
			if ( !handleObj.guid ) {
				handleObj.guid = handler.guid;
			}

			// Get the current list of functions bound to this event
			var handlers = events[ type ],   // 事件句柄队列，取出已经存在的函数数组
				special = jQuery.event.special[ type ] || {};   // 特殊处理的事件

			// Init the event handler queue
            // 初始化事件句柄队列
			if ( !handlers ) {
                // 如果没有绑定事件，则初始化为一个空数组
				handlers = events[ type ] = [];

				// Check for a special event handler
				// Only use addEventListener/attachEvent if the special
				// events handler returns false
                // 如果特殊事件没有setup属性 或 setup返回false，则用浏览器原生的绑定事件接口addEventListener/addEventListener，例如live事件 
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
                        // jQuery绑定的事件默认都是起泡阶段捕获与IE保持一致  
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
                        // IE事件模型中没有2级DOM事件模型具有的事件捕捉的概念，只有起泡阶段  
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
                // 如果有add方法，就调用
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
                    // 始终保证事件句柄有唯一的id 
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add the function to the element's handler list
            // 将句柄对象handleObj，加入到句柄数组handler中，  
            // handleObj包含以下属性：{data:, guid:, namespace:,type:, handler:} 
			handlers.push( handleObj );

			// Keep track of which events have been used, for event optimization
            // 记录已经使用绑定成功的type，这个主要用于后面的trigger事件中起判断作用，用来处理trigger传入的type是否是已经进行过绑定 
            // 
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
        // 将elem置为null，避免IE中的内存泄漏（这行代码真是坑爹啊，没有无数次的测试确认，怎么可能想到这行代码呢） 
		elem = null;
        
	},

    // 存储已经绑定的事件类型状态
    // $(element).bind('click', fn);
    // $.event.global.click = true;
	global: {},

	// Detach an event or set of events from an element
    // 移除添加的事件句柄
    // 通过jQuery.event.remove实现，其执行过程大致如下：  
    // 1. 现调用jQuery._data从缓存$.cache中取出elem对应的所有数组（内部数据，与调用jQuery.data存储的数据稍有不同   
    // 2. 如果未传入types则移除所有事件句柄，如果types是命名空间，则移除所有与命名空间匹配的事件句柄  
    // 3. 如果是多个事件，则分割后遍历  
    // 4. 如果未指定删除哪个事件句柄，则删除事件类型对应的全部句柄，或者与命名空间匹配的全部句柄   
    // 5. 如果指定了删除某个事件句柄，则删除指定的事件句柄      
    // 6. 所有的事件句柄删除，都直接在事件句柄数组jQuery._data( elem ).events[ type ]上调用splice操作   
    // 7. 最后检查事件句柄数组的长度，如果为0，或为1但要删除，则移除绑定在elem上DOM事件   
    // 8. 最后的最后，如果elem对应的所有事件句柄events都已删除，则从缓存中移走elem的内部数据  
    // 9. 在以上的各个过程，都要检查是否有特例需要处理   
    
    // 
	remove: function( elem, types, handler, pos ) {
		// don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

        // 替换布尔型handler为函数，保证handler始终是一个函数，使得remove接口的使用更加便捷 
        // $(elem).unbind('click', false)
        // 取消默认事件
		if ( handler === false ) {
			handler = returnFalse;
		}

		var ret, type, fn, j, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem ), 
			events = elemData && elemData.events;

        // 因为jQuery是将添加的事件句柄都存入到jQuery.data中，所以删除事件句柄时，需要先从Data中获取
        // data有一个events对象，是专门用来存在事件的
        // 所以如果没有找到events这个对象，或对象为空时，应该返回
        /*
            events = {
                click: [{data:, guid:,handler:,namespace:,type:;}]
            }
        */
		if ( !elemData || !events ) {
			return;
		}

		// types is actually an event object here
        // types在这里通常会是一个事件对象，但还是需要进行判断，因为有可能只是单纯的事件类型
		if ( types && types.type ) {
            // 分离数据，对应的变量保存对应的数据，使handler指向事件处理函数，types就存入事件类型
			handler = types.handler;
			types = types.type;
		}

		// Unbind all events for the element
        // 移除元素上的所有事件
        // 需要分情况
        // 1、types为空，即$(elem).unbind();!types为强制类型转换，将它转换成true/false，表示删除元素上所有事件。
        // 2、如果types是字符串，并且以.开头，则移除types命名空间下的指定事件（type+types），即$(elem).bind('click.my_event', fn)，so $(elem).unbind('.my_event')移除
		if ( !types || typeof types === "string" && types.charAt(0) === "." ) {
			types = types || "";

            // 遍历events，获取type
			for ( type in events ) {
				jQuery.event.remove( elem, type + types );
			}

			return;
		}

		// Handle multiple events separated by a space
		// 普通多个事件名称：jQuery(...).unbind("mouseover mouseout", fn);
		// 多个命名空间名称：jQuery(...).unbind(".my_event .my_out", fn);
        
        // 多事件类型，用空格分隔
		types = types.split(" ");

        // 遍历types，逐个处理
		while ( (type = types[ i++ ]) ) {
			origType = type;
			handleObj = null;
            // all在这里表示是否移除的是命名空间下的所有事件，判断type是否存在.，如果存在表示是命名空间，否则只是简单的事件名称
            // all为true表示是事件，false表示命名空间 
            // 是不是可以直接使用type.indexOf('.') != -1来判断？
            
			all = type.indexOf(".") < 0;
			namespaces = [];

            // 存在命名空间
			if ( !all ) {
				// Namespaced event handlers
                // 事件类型与命名空间分离
				namespaces = type.split(".");
                // 获取事件类型
				type = namespaces.shift();
                
                // 动态生成命名空间正则表达式，主要用于将命名空间中的一些特殊字符进行转义
                // $(elem).unbind('click.*a.[b]')
                // namespace = /(^|\.)\*a\.(?:.*\.)?\[b\](\.|$)/
                // namespace.test('*a.[b]')  => true
                
				namespace = new RegExp("(^|\\.)" +
					jQuery.map( namespaces.slice(0).sort(), fcleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)");
                
			}

            // 取出对应type对应的事件对象数组
            /**
             * events = {
                    'click': [
                        {
                            data: '',   // 数据
                            guid: 1,    // key
                            handler: function(){},  // 回调函数 
                            namespace: '',      // 命名空间
                            type: ''            // 事件类型名称
                        },
                        {},
                        {},
                        {},
                    ]
                }
             */
			eventType = events[ type ];

            // 没有对应的type，则继续下一个type
			if ( !eventType ) {
				continue;
			}

            // handler（事件句柄）不存在，则表示删除type对应的所有handler
            // 或者删除与命名空间一致的全部事件句柄 
			if ( !handler ) {
				for ( j = 0; j < eventType.length; j++ ) {
                    // eventType是一个事件数组
                    // 以上列：
                    /*handlerObj = {
                        data: '',   // 数据
                        guid: 1,    // key
                        handler: function(){},  // 回调函数 
                        namespace: '',      // 命名空间
                        type: ''            // 事件类型名称
                    }*/
                    
					handleObj = eventType[ j ];

                    // namespace转义后，用处在此，用来判断接收的命名空间与绑定时的是否一致
					if ( all || namespace.test( handleObj.namespace ) ) {
                        // elem
                        // origType             实际的事件类型
                        // handleObj.handler    事件处理函数
                        // j                    对应pos参数，用以记录已进行处理事件的位置
						jQuery.event.remove( elem, origType, handleObj.handler, j );
                        
                        // 如果循环遍历的是一个变化的数组，则可以用这种方式：j++之前先执行j--，保证不会因为数组下标的错误导致某些数组元素遍历不到！
                        // splice数组方法：向/从数组中添加/删除/替换元素，共3个参数，且返回当前操作的元素。这个方法会修改原始数组
                        // 第一个参数必需。整数，规定添加/删除元素的位置，使用负数可从数组结尾处规定位置。
                        // 第二个参数必需。要删除的元素数量。如果设置为 0，则不会删除元素。不可为负数
                        // 第三个参数可选。向数组添加的新元素。
                        // 当第二个参数为0，且第三个参数存在时，则向数组添加元素
                        // 当第二个参数不为0，且第三个参数存在时，则表示替换元素
                        
                        // var b = [1,2,3,4,5]
                        // b.splice(1,1) == > 2 ; b ==> [1,3,4,5]
						eventType.splice( j--, 1 );
					}
				}
                
                // 这里对$.cache的操作，是通过对 eventType = jQuery._data( elem ).events[ type ]的直接操作进行维护，直接操作事件句柄数组  

				continue;
			}

            // 当执行到此处，表示需要删除的方式都已经得到确认，下面要做的就是实行具体删除操作
            
            // 看看type是否为特例，比如live事件
			special = jQuery.event.special[ type ] || {};

            // pos用处在此，如果没有指定pos，则默认从0开始遍历，这里的pos可以减少遍历次数，提高性能，很精致的代码
            // 
			for ( j = pos || 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];
                
                // 比较事件函数的guid和存储对象的guid，如果guid一致，则匹配成功，进行删除操作
                // 这也是为什么一开始在进行事件绑定时，add添加句柄时，需要guid的原因，因为通过guid可以快速进行事件比较，而不需要再进行回调函数之间进行比较
				if ( handler.guid === handleObj.guid ) {
					// remove the given handler for the given type
					if ( all || namespace.test( handleObj.namespace ) ) {
                        // pos为null的情况，表示绑定的事件是单一的，不需要进行全部或多个删除操作                        
						if ( pos == null ) {
							eventType.splice( j--, 1 );
						}

                        // 通过属性来判断是否为live事件，因为目前只有live事件，才有remove方法
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
                    
                    // 因为guid是全局唯一的，所以匹配到guid对应的事件就可以退出了 
                    // 如果pos不为null，说明是要删除指定的事件对象，任务完成，退出  
					if ( pos != null ) {
						break;
					}
				}
			}

			// remove generic event handler if no more handlers exist
            // 如果type对应的事件对象数组为空，或者发现只剩一个，则移除绑定在elem上浏览器原生事件
			if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
                // 检查special是否有自定义的teardown，优先调用  
                // 这一行的巧妙支出在于：  
                // 1. special不会为null或undefined，如果没有找到会被赋值为{}，是空设置模式的应用  
                // 2. 首先巧妙的判断special.teardown是否存在，如果不存在则认为是普通事件，如果存在则可以调用teardown  
                // 3. 在jQuery源码中你看到过没有返回值的函数码？似乎没有，teardown返回false表示失败，还得用普通方式删除  
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

                // 这个是多余的变量，压根没有用过
				ret = null;
                // 从events中删除对应的type，直接更新jQuery._data( elem ).events
				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
        // 从jQuery.cache中移除elem的数据，最后检查elemData.events
		if ( jQuery.isEmptyObject( events ) ) {
			var handle = elemData.handle;
			if ( handle ) {
                // 置空，删除对HTML元素的引用，避免因垃圾回收机制不起作用导致的浏览器内存泄漏  
				handle.elem = null;
			}
            // 删除存储事件句柄的对象 
			delete elemData.events;
            // 删除DOM事件句柄 
			delete elemData.handle;

            // 检查elemData是不是为{}
            // 这个地方应该直接执行下面语句，总感觉没必要再进行检查
			if ( jQuery.isEmptyObject( elemData ) ) {
                // 将elem彻底从jquery.data中删除 
				jQuery.removeData( elem, undefined, true );
			}
		}
	},
	
	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
    // 自定义事件
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

    // 立即触发事件
    // 这个函数也会导致浏览器同名的默认行为的执行
    /**
     * @param{}     event           // 事件   
     * @param{}     data            // 附加参数   
     * @param{}     elem            // 元素
     * @param{}     onlyHandlers    
     *  
     * 作用：
     * 1、触发form默认事件
     * 2、触发元素上绑定的事件，并传递参数
     * 3、触发自定义事件
     *  
     * 触发过程：
     * 1、首先判断传入的事件类型是否绑定在元素上
     * 2、判断是通过jquery.cache中查找event对象，如果存在则继续下一步，否则return
     * 3、在event对象中查找传入的type，如果查找到对应的type，则执行对应type的回调函数，并传入data参数
     * 4、回调函数执行回成后，即表示已经触发该事件，如果没有阻止冒泡，那么，将继续冒泡到当前元素的上一层node，直到window，这一路只要碰到任何一个node有事件，就会触发
     * 5、触发所有事件后，返回触发后的状态，返回true则触发已经完成，为false表示触发有异常
     
     
     * 仅触发事件处理函数（onlyHandlers）
     * 第一，他不会触发浏览器默认事件。
     * 第二，只触发jQuery对象集合中第一个元素的事件处理函数。
     * 第三，这个方法的返回的是事件处理函数的返回值，而不是据有可链性的jQuery对象。此外，如果最开始的jQuery对象集合为空，则这个方法返回 undefined 。
     * 
     
     
     * 区别：
     * trigger在触发像focus这类事件时，光标会定位到相对应的元素上
     * triggerHandler不管绑定的事件类型如果，它只是会触发事件回调，而不会有其他浏览器默认操作，比如focus光标定位等
     *
     
     
     * 使用方法：
     * 1、$(elem).trigger('submit')          // 执行form默认事件
     * 2、$(elem).click(function(event, a, b){}).trigger('click', ['aaa', 'bbbb']);  // 触发元素上绑定的事件，并传递参数
     * 3、$(elem).bind('myEvent', function(event, a, b){})      $(elem).trigger('myEvent', ['aaa', 'bbb'])  // 给元素绑定自定义事件，通过trigger来触发自定义事件
     * 4、$("body").trigger({
            //      type:"logged",
            //      user:"foo",
            //      pass:"bar"
            // });      通过 event 对象传入数据的方法
     *
     */
	trigger: function( event, data, elem, onlyHandlers ) {
		// Event object or event type
        // event.type表示event是从事件处理函数中引用的
        // event则表示传入的是一个type字符串
		var type = event.type || event,
			namespaces = [],
			exclusive;

        // 事件类型确定，因为会有二种情况，第一种为独立的事件名称，第二种为命名空间（事件名称+.+命名空间）
        
        // 判断是否是事件名称而非命名空间
		if ( type.indexOf("!") >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}
        
        // 判断是否是命名空间
		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
            // 分离事件名和命名空间
			namespaces = type.split(".");
            // 取出事件名称
			type = namespaces.shift();
            // 对剩下的命名空间进行排序，因为命名空间a.b.c与a.c.b是不区分的
            // 另外，这个地方为什么不使用slice，然后再进行排序，这是因为不需要将namespaces赋值给其他变量，不存在引用问题，所以这个地方只需要排序处理即可！
			namespaces.sort();
		}

        // elem不存在或不是jquery自定义事件，且type没有绑定成功！
        // 因为jquery.event.global中保存的就是对应type绑定状态
		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
        // 通过 event 对象，向事件中传入任意的数据，在这个地方都将生成一个jquery event对象
        // var event = jQuery.Event("logged");
        // event.user = "foo";
        // event.pass = "bar";
        // $("body").trigger(event);
        
        // 通过 event 对象传入数据的方法
        // $("body").trigger({
        //      type:"logged",
        //      user:"foo",
        //      pass:"bar"
        // });
        
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;    // 类型
		event.exclusive = exclusive;  // 是否是独立的事件，也就是只触发当前事件，而不会向上冒泡到父节点
		event.namespace = namespaces.join(".");   //命名空间
        // 将namespace中的特殊字符进行转义
		event.namespace_re = new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)");
		
		// triggerHandler() and global events don't bubble or run the default action
        // 如果仅仅是执行handler（事件回调函数）那么需要取消默认事件和阻止事件冒泡
        // $(elem).triggerHandler(type);
		if ( onlyHandlers || !elem ) {
			event.preventDefault();
			event.stopPropagation();
		}

		// Handle a global trigger
        // 如果handle是全局的，即trigger后页面上面所有trigger对应的handle都会被执行
		if ( !elem ) {
			// TODO: Stop taunting the data cache; remove global events and always attach to document
            // 因为事件的绑定都会直接缓存到jquery.cache中，所以需要对它进行遍历，这也就为什么jquery需要将事件或其他DOM对象操作都会缓存到cache的原因。更便于查询和管理
			jQuery.each( jQuery.cache, function() {
				// internalKey variable is just used to make it easier to find
				// and potentially change this stuff later; currently it just
				// points to jQuery.expando
                // 获取key
				var internalKey = jQuery.expando,
                    // 通过key找cache
					internalCache = this[ internalKey ]; 
                
                // 如果有缓存且缓存中有events对象且对象中有type事件
				if ( internalCache && internalCache.events && internalCache.events[ type ] ) {
                    // 确定type存在了，回调trigger
                    // internalCache.handle是一个回调函数，在创建event的时候，给它定义了属性elem
                    // 关于函数定义属性：http://www.cnblogs.com/see7di/archive/2011/06/18/2239716.html
					jQuery.event.trigger( event, data, internalCache.handle.elem );
				}
			});
            
            // 如果啥也没有，就没必须继续下行，退出
			return;
		}

		// Don't do events on text and comment nodes
        // 事件不会出现在文本和注释节点，所以先除非它们
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// Clean up the event in case it is being reused
        // 初始化trigger结果，默认为undefined
		event.result = undefined;
		event.target = elem;

		// Clone any incoming data and prepend the event, creating the handler arg list
        // 备份任何输入和预定事件，创建参数列表
        // 这里不管data是否为数组，都会统一转换成数组来保存
		data = data ? jQuery.makeArray( data ) : []; 
            
        // 并在数组的前端插入event对象
        // 数组unshift方法：向数组的开头添加一个或更多元素，并返回新的长度，此方法会修改原始数组
        // 这种方式就与call参数类似，第一个参数为context，第二个参数起，为实参，赞！！
		data.unshift( event );

		var cur = elem,
			// IE doesn't like method names with a colon (#3533, #8272)
            // 处理type为对象时，即$(elem).trigger({'a':,'b':})
            // ontype主要用来判断，type是否是DOM 0级事件，即document.body.onclick
			ontype = type.indexOf(":") < 0 ? "on" + type : "";

		// Fire event on the current element, then bubble up the DOM tree
        // 触发当前元素事件，并冒泡到DOM树
		do {
            // 获取事件处理函数 
			var handle = jQuery._data( cur, "handle" );
            
			event.currentTarget = cur;
            
            // 如果handle存在，执行它，并给它转入data参数
			if ( handle ) {
                // 这个地方就是触发事件回调函数
				handle.apply( cur, data );
			}
            
			// Trigger an inline bound script
            // 触发一个内联脚本，也就是DOM 0级事件，on + type
            // on + type绑定的是一个元素而非多媒体元素（flash等），并且有事件处理函数，则执行它，给它传入cur,data，如果事件处理函数返回的是false，则表示取消默认事件
			if ( ontype && jQuery.acceptData( cur ) && cur[ ontype ] && cur[ ontype ].apply( cur, data ) === false ) {
				event.result = false;
				event.preventDefault();
			}

			// Bubble up to document, then to window
            // 冒泡到document然后到window
            // 关于事件冒泡是到document还是window在IE下是有区别的
            // 在IE9以下版本中，冒泡最高只能到document，IE9及以上则与其他非IE浏览器机制一样，会冒泡到window
            // Jquery这里将它们进行了统一化，使其都冒泡到window
            
            // elem.parentNode      元素存在父节点
            // cur.ownerDocument    返回当前元素所在的document
            
            // 元素有父节点，则返回父节点，没有就返回document（cur.ownerDocument），如果元素owerDocument不存在，则表示cur就是document，如果是document则还需要
            // 与事件处理的目标是否获取正确获取到doucment，如果是一致则返回window，否则返回false，则表示当前cur是document同时事件操作目标对象也是document
            
			cur = cur.parentNode || cur.ownerDocument || cur === event.target.ownerDocument && window;
		} while ( cur && !event.isPropagationStopped() );

		// If nobody prevented the default action, do it now
        // 如果没有阻止默认动作，则立刻阻止
		if ( !event.isDefaultPrevented() ) {
			var old,
                // 特殊事件（live，ready等）
				special = jQuery.event.special[ type ] || {};

            // 排除
            // 如果type不是'click'也不a，但是是无法缓存数据的元素，则不需要阻止默认动作
			if ( (!special._default || special._default.call( elem.ownerDocument, event ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
                // 调用本地DOM方法在目标具有相同名称的名称的事件
				// Can't use an .isFunction)() check here because IE6/7 fails that test.
                // 不用使用isFunction()来检查，因为IE6/7下测试失败
				// IE<9 dies on focus to hidden element (#1486), may want to revisit a try/catch.
				try 
                {   
                    // ontype存在并且elem[type]也存在，则表示元素绑定了同一type，两种不同的type绑定方式，即body.onclick = function(){}, $('body').bind('click', function(){});
                    // 出现了这个问题之后 ，就会有一个事件执行顺序的问题，到底是onclick先执行还是bind的先执行？
                    // jquery的做法是先执行jquery bind的，然后再执行DOM 0级事件，即on + type 方式绑定的事件
					if ( ontype && elem[ type ] ) {
						// Don't re-trigger an onFOO event when we call its FOO() method
                        // 先将ontype保存
						old = elem[ ontype ];

                        // 保存成功，则先消除elem[ ontype ]，以免发生冲突
						if ( old ) {
							elem[ ontype ] = null;
						}

						jQuery.event.triggered = type;
                        // 立即执行elem[type]
						elem[ type ]();
					}
				} catch ( ieError ) {}

                // 执行完成后，再将ontype还原
				if ( old ) {
					elem[ ontype ] = old;
				}

				jQuery.event.triggered = undefined;
			}
		}
		
        // 返回trigger后的结果，true或false
		return event.result;
	},

    /**
     * 事件回调函数（jquery所有事件绑定的事件处理函数都会在此执行）
     * @param{Event}        event           事件触发时event对象
     *
     *
     */
	handle: function( event ) {
        // 修改event对象，变成jQuery内部对象
		event = jQuery.event.fix( event || window.event );
		// Snapshot the handlers list since a called handler may add/remove events.
        // 先从缓存中读取events对象，因为所有事件绑定都会同步保存到data缓存中。
        // events对象主要保存的是以事件类型名称为属性的对象集合
        // 比如：$(elem).bind('click', function(){})
        // 那么events：events = {'click': []}
        // handlers存入的就是事件回调函数集合
		var handlers = ((jQuery._data( this, "events" ) || {})[ event.type ] || []).slice(0),
            // 这里是进行判断，是否是执行所有回调，还是说只执行其中的某几个，event.exclusive表示事件是否独立执行，
            // 也就是不会向上冒泡，而namespace，则表示命名空间
            // 如果即不是独立事件，也没有命名空间，那么返回true，表示执行所有事件回调函数
			run_all = !event.exclusive && !event.namespace,  
            // 参数
			args = Array.prototype.slice.call( arguments, 0 );
        
		// Use the fix-ed Event rather than the (read-only) native event
        // 修正参数args[0]即传入的第一个参数event，因为传入的event不是jquery对象，而是DOM 对象，所以这个地方将修正后的event对象替换传入的event对象
		args[0] = event;
        
        // currentTarget指向当前操作元素
		event.currentTarget = this;

        // 逐个执行回调
		for ( var j = 0, l = handlers.length; j < l; j++ ) {
            // 事件对象，
            // {    data: 
            //      guid: 1
            //      handler: function (e){
            //      namespace: "test"
            //      type: "click"
            // }
			var handleObj = handlers[ j ];

			// Triggered event must 1) be non-exclusive and have no namespace, or
			// 2) have namespace(s) a subset or equal to those in the bound event.
            // 全局执行(run_all === true)还是指定的命名空间
			if ( run_all || event.namespace_re.test( handleObj.namespace ) ) {
				// Pass in a reference to the handler function itself
				// So that we can later remove it
                // 保存处理函数的引用，后面可以将它删除
                // 
				event.handler = handleObj.handler;
				event.data = handleObj.data;
				event.handleObj = handleObj;

                // 执行回调
                // 传入的是args参数，也就是外部绑定是回调函数参数e的内容
                // $(elem).bind('click', function(e){ // 这个参数e就是args})
				var ret = handleObj.handler.apply( this, args );
                
                // 如果ret不为undefined，则ret有返回值
				if ( ret !== undefined ) {
					event.result = ret;
                    // 当ret 等于false表示阻止默认事件和阻止冒泡
					if ( ret === false ) {
						event.preventDefault();
						event.stopPropagation();
					}
				}

                // 如果设置了stopImmediatePropagation属性，下面的条件才会为true，
                // 则表示一个元素中的同一事件类型事件，不管绑定了多少回调函数，只会执行到设置了stopImmediatePropagation中那个回调结束，不再向后执行，也不向上冒泡
				if ( event.isImmediatePropagationStopped() ) {
					break;
				}
			}
		}
        
		return event.result;
	},

    // 事件对象中的属性名称集
    // 用于将DOM event对象转换成jQuery.Event对象时，使jQuery.Event对象属性与DOM event中的保持一致
	props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

    // 修正当前活动的事件对象
    // 用于处理由于不同浏览器之间的兼容性问题
    // 比如获取当前点击元素
    // 在IE中使用event.srcElement 获取
    // 而在非IE中是使用event.target 获取
    // @param{Event}    event       指向当前活动的事件对象
	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
        
        // 将当前event转换成jQuery.Event，并保存到event变量中
		event = jQuery.Event( originalEvent );
        
        // 为了保持与DOM event已存在的属性保持一致，所以需要将上面的props属性添加到当前event中
		for ( var i = this.props.length, prop; i; ) {
			prop = this.props[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary
        // 修正target属性
        // 在IE中不支持target，只支持srcElement
		if ( !event.target ) {
			// Fixes #1925 where srcElement might not be defined either
			event.target = event.srcElement || document;
		}

		// check if target is a textnode (safari)
        // 检查是否为文本节点
		if ( event.target.nodeType === 3 ) {
            // 如果是文本节点，则需要返回的是它的父节点
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
        // 添加relatedTarget属性，它本身是与mouseout有关，只有使用在这个事件上时，relatedTarget属性才能获取到值
        // 用于获取从绑定的元素移出到另一个元素时，获取目标元素，也就移出到的另一个元素
        // 因为IE与其他浏览器的访问有区别，所以需要进行修正
        // IE9以下支持toElement和fromElement，IE9及以上二者都支持
        // 其他浏览器支持relatedTarget，toElement FF不支持
		if ( !event.relatedTarget && event.fromElement ) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
        // 计算页面X和Y轴，针对于IE8及以下
        // page与client区别
        // page获取的是document内容的坐标
        // client获取的是浏览器可视区域坐标，与document内容高度无关
        // 所以这里为了保存与page一致则需要进行计算
        // IE9以下不支持pageX和pageY，只支持clientX和clientY
        // IE9及以上和其他浏览器支持pageX和pageY，clientX和clientY
        // scrollLeft: 设置或获取位于对象左边界和窗口中目前可见内容的最左端之间的距离 
        // scrollLeft属性与scrollTop属性的作用相同,
        // 两者的区别在于 scrollTop是获取滚动条向下拉动的值，而scrollLeft是获取滚动向右拉动的值．．
        // 都是用来获取网页或网页内某个元素滚动条被拉动的值，也就是说滚动条被拉动了移动的数值．
        // scrollTop:设置或获取位于对象最顶端和窗口中可见内容的最顶端之间的距离 
        // client 获取浏览器边距
		if ( event.pageX == null && event.clientX != null ) {
            // ownerDocument指向的是当前文档的
			var eventDocument = event.target.ownerDocument || document,
				doc = eventDocument.documentElement,
				body = eventDocument.body;

			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
        // which 是Firefox引入的，IE不支持。which的本意是获取键盘的键值(keyCode)。 
        
		if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {
            // which在IE9及以上和其他非IE浏览器获取到的值与keyCode一样，为键值
            // charCode：按下按键的Unicode字符。
            // IE9以下只支持keyCode
			event.which = event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
        // 操作键就是Shift、Ctrl、Alt和Meta（在Windows键盘中是Windows键，在苹果机中是Cmd键），它们将常被用来修改鼠标事件的行为。
        // Firefox、Safari、Chrome和Opera都支持这4个键。IE不支持metaKey属性
        // 修正操作键metaKey
		if ( !event.metaKey && event.ctrlKey ) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
        // event.button 获取鼠标上的铵钮。
        // IE9及以上和其他非IE浏览器event.button顺序，左键为0，中间滚轮为1，右键为2
        // IE9以下则都返回0;
        // 修正鼠标键值
		if ( !event.which && event.button !== undefined ) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}

		return event;
	},

	// Deprecated, use jQuery.guid instead
    // 唯一id
	guid: 1E8,

	// Deprecated, use jQuery.proxy instead
    // 修正context指向
	proxy: jQuery.proxy,

    // 特殊事件处理
	special: {
        // 页面加载时
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady,
			teardown: jQuery.noop
		},

        // live事件
		live: {
			add: function( handleObj ) {
				jQuery.event.add( this,
					liveConvert( handleObj.origType, handleObj.selector ),
					jQuery.extend({}, handleObj, {handler: liveHandler, guid: handleObj.handler.guid}) );
			},

			remove: function( handleObj ) {
				jQuery.event.remove( this, liveConvert( handleObj.origType, handleObj.selector ), handleObj );
			}
		},

        // 页面关闭之前事件
		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	}
};

// 移除绑定事件
jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

/**
 * jquery 事件处理构造函数Event
 * @param       src             当前活动的事件对象
 * @param       props           支持的一些事件名称（代码 3615）
 */
jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !this.preventDefault ) {
		return new jQuery.Event( src, props );
	}

	// Event object
    // 将event对象转换成Jquery Event对象
    /* jQuery.Event = {
            originalEvent: ,        // 将传进来的event对象保存
            type: ,                 // 事件类型
            isDefaultPrevented： ,  // 是否阻止默认事件
            timeStamp: ,            // 当前时间戳
            jQuery.expando:         // 对应的是jQuery生成的唯一key，用于jQuery.data中
        }
    */
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
        // 将需要的一些DOM event对象的属性，扩展到jQuery.Event上，这样看起来，使用jQuery.Event就与使用DOM event直接访问保持一致
		jQuery.extend( this, props );
	}

	// timeStamp is buggy for some events on Firefox(#3843)
	// So we won't rely on the native value
    // 创建一个本地时间戳
	this.timeStamp = jQuery.now();

	// Mark it as fixed
    // 固定标示，用于
	this[ jQuery.expando ] = true;
};

// 两个在事件处理过程中需要的状态返回函数
// 诸如取消默认事件之类的
function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
    // Event.preventDefault()
    // 取消浏览器默认事件动作
    // 在浏览器中IE和W3C标准不一样
    // IE不支持标准中的preventDefault()方法，只能使用独有属性returnValue，取值为true/false，为false时则表示取消默认事件，否则与之相反
    
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
        // 非IE
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
    
    // 事件冒泡处理
    //（1）冒泡型事件：事件按照从最特定的事件目标到最不特定的事件目标(document对象)的顺序触发。
    //（2）捕获型事件(event capturing)：事件从最不精确的对象(document 对象)开始触发，然后到最精确(也可以在窗口级别捕获事件，不过必须由开发人员特别指定)。
    //（3）DOM事件流：同时支持两种事件模型：捕获型事件和冒泡型事件，但是，捕获型事件先发生。两种事件流会触及DOM中的所有对象，从document对象开始，也在document对象结束。
    // DOM事件模型最独特的性质是，文本节点也触发事件(在IE中不会)。
    // 支持W3C标准的浏览器在添加事件时用addEventListener(event,fn,useCapture)方法，基中第3个参数useCapture是一个Boolean值，用来设置事件是在事件捕获时执行，还是事件冒泡时执行。而不兼容W3C的浏览器(IE)用attachEvent()方法，此方法没有相关设置，不过IE的事件模型默认是在事件冒泡时执行的，也就是在useCapture等于false的时候执行，所以把在处理事件时把useCapture设置为false是比较安全，也实现兼容浏览器的效果。
    // 参考：http://blog.csdn.net/Tender001/article/details/44589501
    // 在浏览器中IE和W3C标准不一样
    // IE不支持标准中的stopPropagation()方法，只能使用独有属性cancelBubble，取值为true/false，为true则表示阻止事件冒泡，否则与之相反
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
    // 阻止当前事件的冒泡行为并且阻止当前事件所在元素上的所有相同类型事件的事件处理函数的继续执行。
    // 和stopPropagation的区别：
    // stopPropagation 阻止事件冒泡行为，并执行当前元素中的所有事件
    // stopImmediatePropagation 阻止事件冒泡行为，并阻止当前事件所在元素上的所有相同类型事件的事件处理函数的继续执行
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
// mouseover和mouseout处理
// 用在mouseeenter和mouseleave事件上
// 在发生mouseover和mouseout事件时，还会涉及更多的元素。这两个事件都会涉及把鼠标指针从一个元素的边界之内移到另一个元素边界之内。
// 对mouseover事件而言，事件的主目标是获得光标的元素，而相关元素就是那个失去光标的元素。类似地，对mouseout事件而言，事件的主目标是失去光标的元素，而相关元素则是获得光标的元素。

// DOM通过event对象的relatedTarget属性提供了相关元素的信息。这个属性只对于mouseover和mouseout事件才包含值；对于其他事件，这个属性的值是null。
// IE不支持realtedTarget属性，但提供了保存着同样信息的不同属性。在mouseover事件触发时，IE的fromElement属性中保存了相关元素；在mouseout事件出发时，IE的toElement属性中保存着相关元素。
var withinElement = function( event ) {
	// Check if mouse(over|out) are still within the same parent element
    // event.relatedTarget 只有元素绑定了mouseout事件才能获取值，mouseout事件获取到的是不的，为null
	var parent = event.relatedTarget;

	// Firefox sometimes assigns relatedTarget a XUL element
	// which we cannot access the parentNode property of
	try {

		// Chrome does something similar, the parentNode property
		// can be accessed but is null.
		if ( parent && parent !== document && !parent.parentNode ) {
			return;
		}
		// Traverse up the tree
		while ( parent && parent !== this ) {
			parent = parent.parentNode;
		}

		if ( parent !== this ) {
			// set the correct event type
			event.type = event.data;

			// handle event if we actually just moused on to a non sub-element
            // 立即执行事件处理函数
			jQuery.event.handle.apply( this, arguments );
		}

	// assuming we've left the element since we most likely mousedover a xul element
	} catch(e) { }
},

// In case of event delegation, we only need to rename the event.type,
// liveHandler will take care of the rest.
delegate = function( event ) {
	event.type = event.data;
	jQuery.event.handle.apply( this, arguments );
};

// Create mouseenter and mouseleave events
// 创建mouseenter和mouseleave事件
// 在event.specical添加mouseover和mouseout对象
// 这个对象包括二个方法，一个是setup表示添加事件句柄，一个是teardown表示删除事件句柄
    
/* jQuery.event.special = {
    mouseenter: {},
    mouseleave: {}
}
*/
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
        // 添加事件句柄
		setup: function( data ) {
            // elem: this
            // types：即mouseover或mouseout
            // fn：delegate || withinElement
            // data: 即mouseenter或mouseleave
			jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
		},
        // 移除事件句柄
		teardown: function( data ) {
			jQuery.event.remove( this, fix, data && data.selector ? delegate : withinElement );
		}
	};
});

 
// submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function( data, namespaces ) {
			if ( !jQuery.nodeName( this, "form" ) ) {
				jQuery.event.add(this, "click.specialSubmit", function( e ) {
					var elem = e.target,
						type = elem.type;

					if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
						trigger( "submit", this, arguments );
					}
				});

				jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
					var elem = e.target,
						type = elem.type;

					if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
						trigger( "submit", this, arguments );
					}
				});

			} else {
				return false;
			}
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialSubmit" );
		}
	};

}

// change delegation, happens here so we have bind.
if ( !jQuery.support.changeBubbles ) {

	var changeFilters,

	getVal = function( elem ) {
		var type = elem.type, val = elem.value;

		if ( type === "radio" || type === "checkbox" ) {
			val = elem.checked;

		} else if ( type === "select-multiple" ) {
			val = elem.selectedIndex > -1 ?
				jQuery.map( elem.options, function( elem ) {
					return elem.selected;
				}).join("-") :
				"";

		} else if ( jQuery.nodeName( elem, "select" ) ) {
			val = elem.selectedIndex;
		}

		return val;
	},

	testChange = function testChange( e ) {
		var elem = e.target, data, val;

		if ( !rformElems.test( elem.nodeName ) || elem.readOnly ) {
			return;
		}

		data = jQuery._data( elem, "_change_data" );
		val = getVal(elem);

		// the current data will be also retrieved by beforeactivate
		if ( e.type !== "focusout" || elem.type !== "radio" ) {
			jQuery._data( elem, "_change_data", val );
		}

		if ( data === undefined || val === data ) {
			return;
		}

		if ( data != null || val ) {
			e.type = "change";
			e.liveFired = undefined;
			jQuery.event.trigger( e, arguments[1], elem );
		}
	};

	jQuery.event.special.change = {
		filters: {
			focusout: testChange,

			beforedeactivate: testChange,

			click: function( e ) {
				var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

				if ( type === "radio" || type === "checkbox" || jQuery.nodeName( elem, "select" ) ) {
					testChange.call( this, e );
				}
			},

			// Change has to be called before submit
			// Keydown will be called before keypress, which is used in submit-event delegation
			keydown: function( e ) {
				var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

				if ( (e.keyCode === 13 && !jQuery.nodeName( elem, "textarea" ) ) ||
					(e.keyCode === 32 && (type === "checkbox" || type === "radio")) ||
					type === "select-multiple" ) {
					testChange.call( this, e );
				}
			},

			// Beforeactivate happens also before the previous element is blurred
			// with this event you can't trigger a change event, but you can store
			// information
			beforeactivate: function( e ) {
				var elem = e.target;
				jQuery._data( elem, "_change_data", getVal(elem) );
			}
		},

		setup: function( data, namespaces ) {
			if ( this.type === "file" ) {
				return false;
			}

			for ( var type in changeFilters ) {
				jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
			}

			return rformElems.test( this.nodeName );
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialChange" );

			return rformElems.test( this.nodeName );
		}
	};

	changeFilters = jQuery.event.special.change.filters;

	// Handle when the input is .focus()'d
	changeFilters.focus = changeFilters.beforeactivate;
}

function trigger( type, elem, args ) {
	// Piggyback on a donor event to simulate a different one.
	// Fake originalEvent to avoid donor's stopPropagation, but if the
	// simulated event prevents default then we do the same on the donor.
	// Don't pass args or remember liveFired; they apply to the donor event.
	var event = jQuery.extend( {}, args[ 0 ] );
	event.type = type;
	event.originalEvent = {};
	event.liveFired = undefined;
	jQuery.event.handle.call( elem, event );
	if ( event.isDefaultPrevented() ) {
		args[ 0 ].preventDefault();
	}
}

// Create "bubbling" focus and blur events
// 创建一个能冒泡的focus和blur事件，即foucsin/focusout
// 在元素中使用0级DOM来绑定foucsin在webkit内核浏览器中是不支持的，即document.getElementById('xx').onfocusin = function(){}
// 只支持使用HTML事件和2级DOM事件
// 与focus/blur的区别：
// focusin/focusout 支持事件冒泡，因此可为其实现事件代理。
// 另外，FF浏览器是不支持focusin/focusout的，除此之外的浏览器都支持
    
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0;

        /* jQuery.event.special = {
            mouseenter: {},
            mouseleave: {},
            focusin: {},
            focusout: {}
        }
        */ 
        // 通过addEventListener来绑定事件，并且是在事件捕获阶段，这是不支持IE的节奏？
		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};

		function handler( donor ) {
			// Donor event is always a native one; fix it and switch its type.
			// Let focusin/out handler cancel the donor focus/blur event.
			var e = jQuery.event.fix( donor );
			e.type = fix;
			e.originalEvent = {};
			jQuery.event.trigger( e, null, e.target );
			if ( e.isDefaultPrevented() ) {
				donor.preventDefault();
			}
		}
	});
}

// 添加bind和one方法
// 一个用于普通绑定
// 一个为一次性绑定
jQuery.each(["bind", "one"], function( i, name ) {
    // 每个方法可传三个参数
    // @param{String}       type        事件类型名称
    // @param{String}       data        为事件处理函数提供外带data
    // @param{Function}       fn        事件处理函数
    
    // bind:
    // $(elem).bind('click', function(){})
    // $(elem).bind('click keyup', function(){})
    // $(elem).bind({'click': function(){}, 'keyup': function(){}})
    // $(elem).bind('click', data, function(){})
    
	jQuery.fn[ name ] = function( type, data, fn ) {
		var handler;

		// Handle object literals
        // 第一个方式，处理type为对象时，即$(elem).bind({'click': function(){}, 'keyup': function(){}})
		if ( typeof type === "object" ) {
			for ( var key in type ) {
				this[ name ](key, data, type[key], fn);
			}
			return this;
		}

        // 第二种方式：$(elem).bind('click', function(){})
        // 当传进的参数只有二个时，即表示一个为type，一个为fn，但实际接收fn参数的是data，所以这个需要 将它进行位置交换
		if ( arguments.length === 2 || data === false ) {
            // 交换位置 
			fn = data;
            // 没有data，所以设置为undefined
			data = undefined;
		}

        // 判断是普通bind还是一次性事件one
        // 如果是one
		if ( name === "one" ) {
            // 创建一个新的事件处理函数句柄
			handler = function( event ) {
				jQuery( this ).unbind( event, handler ); // 先删除事件
				return fn.apply( this, arguments );      // 再执行传入的事件处理函数fn，这里this是DOM元素
			};
            // 同步guid，重新包装后的函数与原始函数的guid统一
			handler.guid = fn.guid || jQuery.guid++;
		} else {
            // 普通绑定，则直接将fn给handler即可
			handler = fn;
		}

        // 如果事件类型为unload（即页面退出）并且name不为one时
		if ( type === "unload" && name !== "one" ) {
            // 为其绑定one事件
			this.one( type, data, fn );

		} else {
            // 否则有多少匹配元素就添加多少次事件句柄
			for ( var i = 0, l = this.length; i < l; i++ ) {
                // 添加事件句柄 
				jQuery.event.add( this[i], type, handler, data );
			}
		}

		return this;
	};
});

// 
jQuery.fn.extend({
    // 取消事件bind
	unbind: function( type, fn ) {
		// Handle object literals
        // 一次删除多个事件句柄，key是事件类型，type[key]是事件句柄（这里是迭代复用）  
        // !type.preventDefault 表明这不是一个jQuery事件对象  
		if ( typeof type === "object" && !type.preventDefault ) {
			for ( var key in type ) {
				this.unbind(key, type[key]);
			}

		} else {// 到这里，type可能是字符串，也可能是jQuery事件对象  
			for ( var i = 0, l = this.length; i < l; i++ ) {
                // 调用remove删除句柄
				jQuery.event.remove( this[i], type, fn );
			}
		}

		return this;
	},

    // 事件委托绑定
	delegate: function( selector, types, data, fn ) {
		return this.live( types, data, fn, selector );
	},

    // 取消事件委托
	undelegate: function( selector, types, fn ) {
		if ( arguments.length === 0 ) {
			return this.unbind( "live" );

		} else {
			return this.die( types, null, fn, selector );
		}
	},

    // 立即触发事件，包括自定义事件
	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
    
    // 立即触发事件处理函数    
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},
    
    // 轮流响应事件
	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery.data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery.data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

    // 鼠标移入移出事件
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});
    
// 事件类型修正
var liveMap = {
	focus: "focusin",
	blur: "focusout",
	mouseenter: "mouseover",
	mouseleave: "mouseout"
};

// 添加live（事件委托）和die（取消事件委托）方法
// die 移除用live附加的一个或全部事件处理函数  
// 对应关系：bind-unbind, live-die, delegate-undelegate  
/** 
 * live 在匹配当前选择器的元素上绑定一个事件处理函数，包括已经存在的，和未来添加的，即任何添加的元素只要匹配当前选择器就会被绑定事件处理函数 
 * .live( eventType, handler ) 在匹配当前选择器的元素上绑定一个指定类型的事件处理函数 
 * .live( eventType, eventData, handler ) eventData可以传递给事件处理函数 
 * .live( events ) 绑定多个事件 
 *  
 *  
 * 参考文档： 
 * http://api.jquery.com/live 
 * http://www.codesky.net/article/doc/201004/20100417042278.htm 
 * http://hi.baidu.com/silveringsea/blog/item/55cd25016ecde30c1c958341.html 
 *  
 * 如何使用 
 * 示例 
 * 局限 
 * 修正 
 *  
 * live被翻译为鲜活绑定、延迟绑定（更准确些） 
 * live通过委派，而不是在匹配元素上直接绑定事件来实现 
 *  
 * 官方文档翻译：事件代理 
 * .live()方法能对尚未添加到DOM文档中的元素生效。 
 * .live()方法永远不会将事件绑定到匹配的元素上，而是将事件绑定到祖先元素（document或context），由该祖先元素代理子元素的事件。  *  
 * 以 $('.clickme').live('click', function() { … } ) 为例，当在新添加的元素上点击时，执行过程如下：                     
 * 1. click事件被生成，并传递给<div>，待<div>处理 
 * 2. 因为<div>没有直接绑定click事件，因此事件沿着DOM树进行冒泡传递 
 * 3. 事件冒泡传递直到到达DOM树的根节点，在根节点上绑定了.live()指定的原始事件处理函数（在1.4以后的版本中，.live()绑定事件到上下文context，以提升性能） 
 * 4. 执行.live()指定的事件处理函数 
 * 5. 原始事件处理函数检查event的target属性以确定是否继续执行，检查的方式是 $(event.target).closest(".clickme") 
 * 6. 如果匹配，则原始事件处理函数执行，上下位被设置为找到的元素 
 *  
 * 因为第5步的检查是在执行原始事件处理函数之前，因此元素可以在任何时候添加，并且事件可以生效 
 */
jQuery.each(["live", "die"], function( i, name ) {
    // @param{String}       types       事件类型名称（集）
    // @param{object}       data        需要传入的参数
    // @param{Function}     fn          事件处理函数
    // @param{}             origSelector    仅jquery内部使用
	jQuery.fn[ name ] = function( types, data, fn, origSelector /* Internal Use Only */ ) {
		var type, i = 0, match, namespaces, preType,
            // 很巧妙，如果没有origSelector，那么采用当前jQuery对象的选择器，、  
            // 可是，如果origSelector为true，后边的处理对象就变成了以origSelector为选择器的jQuery对象  
			selector = origSelector || this.selector,    // 选择器字符串
            
            // 这里也是，如果没有origSelector，那么上下文就变成当前jQuery对象的上下文  
            // 可是，如果origSelector为true（类型转换），当前jQuery对象就变成上下文了  
            // 就是在这里，通过一个内部变量，改变了选择器表达式和上下分，区分开了live/die和delegate/undelegate，用同样的代码实现了两种接口
			context = origSelector ? this : jQuery( this.context );  // 绑定的上下文
        
        // 处理types为对象时，即$(elem).live({'click', function(){}, 'keyup': function(){}})
		if ( typeof types === "object" && !types.preventDefault ) {
			for ( var key in types ) {
				context[ name ]( key, data, types[key], selector );
			}

			return this;
		}

        // 为die，取消事件绑定
        // 如果是die，移除origSelector匹配元素上的所有通过live绑定的事件  
        // 没有指定事件类型 + origSelector + origSelector是CSS选择器 
		if ( name === "die" && !types &&
					origSelector && origSelector.charAt(0) === "." ) {

			context.unbind( origSelector );

			return this;
		}

        // 修正事件处理函数；
        // 完整：types, data, fn, origSelector  
        // types, false, fn, origSelector  
        // 或 types, fn, origSelector 
        // $(elem).live('click', function(){})
		if ( data === false || jQuery.isFunction( data ) ) {
            // 如果data不存在则定义为returnFalse，否则为事件处理函数
			fn = data || returnFalse;
			data = undefined;
		}

        // 将多个事件类型名称独立出来，以空格区分
		types = (types || "").split(" ");

		while ( (type = types[ i++ ]) != null ) {
            // /\.(.*)$/.exec(type)
            // /\.(.*)$/.exec('click.my_event')  => ['.my_event', 'my_event'];
			match = rnamespaces.exec( type );    // 取出第一个.后的命名空间
			namespaces = "";

            // 如果存在命名空间
			if ( match )  {
				namespaces = match[0];  // 取得.+命名空间
                // 从命名空间中取出具体的事件类型名称
                // 也可以直接使用字符串截取+indexOf来实现效果的效果
                // type.slice(0, type.indexOf('.'))
				type = type.replace( rnamespaces, "" );
			}

            // 如果是hover事件，需要特殊处理，因为它中间包括了两个事件
			if ( type === "hover" ) {
                // 所以需要向types集中插入它需要包含的两个事件，一个为mouseenter，一个是mouseleave
                // 这个插入时如果存在命名空间，则加入
				types.push( "mouseenter" + namespaces, "mouseleave" + namespaces );
				continue;
			}

			preType = type;

            // 如果事件类型名称是需要进行修正的，则需要修正处理
//            var liveMap = {
//                focus: "focusin",
//                blur: "focusout",
//                mouseenter: "mouseover",
//                mouseleave: "mouseout"
//            };
            // type = focus，是会绑定二次？
			if ( liveMap[ type ] ) {
                // 将修正后的事件类型入队，因为用了while循环，所有不必担心遍历动态数组的问题  
                // types['focusin.my_event']
				types.push( liveMap[ type ] + namespaces ); 
                
                // 再恢复type，包含了命名空间，这不是蛋疼么，把命名空间去掉只为了检测hover和是否需要修正？  
                // type = focus.my_event 
				type = type + namespaces;

			} else {
				type = (liveMap[ type ] || type) + namespaces;
			}

			if ( name === "live" ) {
				// bind live handler
				for ( var j = 0, l = context.length; j < l; j++ ) {
                    // 绑定到上下文，事件类型经过liveConvert后变为 live.type.selector  
                    // 前边做了那么多铺垫，这行才是关键！  
                    // add: function( elem, types, handler, data ) {  
                    // context[j] 如果有origSelector则是当前jQuery对象，如果没有则是当前jQuery对象的上下文  
                    // live事件的格式比较特殊，应该trigger里会有live的特殊处理，live的处理在特例special里  
                    // data：数据
                    // selector：选择器字符串
                    // handler：绑定时的事件处理函数
                    // orginType：如果存在命名空间就是带有命名空间的事件类型字符串，否则直接是事件类型名称
                    // origHandler：与handler一样
                    // preType：实际的事件类型名称，与命名空间无关
					jQuery.event.add( context[j], "live." + liveConvert( type, selector ),
						{ data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType } );
				}

			} else {
				// unbind live handler
                // 删除live绑定的事件句柄  
				context.unbind( "live." + liveConvert( type, selector ), fn );
			}
		}

		return this;
	};
});

/**
 * 事件委任（live）事件处理回调
 *
 */
function liveHandler( event ) {
	var stop, maxLevel, related, match, handleObj, elem, j, i, l, data, close, namespace, ret,
		elems = [],
		selectors = [],
		events = jQuery._data( this, "events" );

	// Make sure we avoid non-left-click bubbling in Firefox (#3861) and disabled elements in IE (#6911)
	if ( event.liveFired === this || !events || !events.live || event.target.disabled || event.button && event.type === "click" ) {
		return;
	}

	if ( event.namespace ) {
		namespace = new RegExp("(^|\\.)" + event.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
	}

	event.liveFired = this;

	var live = events.live.slice(0);

	for ( j = 0; j < live.length; j++ ) {
		handleObj = live[j];

		if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
			selectors.push( handleObj.selector );

		} else {
			live.splice( j--, 1 );
		}
	}

	match = jQuery( event.target ).closest( selectors, event.currentTarget );

	for ( i = 0, l = match.length; i < l; i++ ) {
		close = match[i];

		for ( j = 0; j < live.length; j++ ) {
			handleObj = live[j];

			if ( close.selector === handleObj.selector && (!namespace || namespace.test( handleObj.namespace )) && !close.elem.disabled ) {
				elem = close.elem;
				related = null;

				// Those two events require additional checking
				if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
					event.type = handleObj.preType;
					related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];

					// Make sure not to accidentally match a child element with the same selector
					if ( related && jQuery.contains( elem, related ) ) {
						related = elem;
					}
				}

				if ( !related || related !== elem ) {
					elems.push({ elem: elem, handleObj: handleObj, level: close.level });
				}
			}
		}
	}

	for ( i = 0, l = elems.length; i < l; i++ ) {
		match = elems[i];

		if ( maxLevel && match.level > maxLevel ) {
			break;
		}

		event.currentTarget = match.elem;
		event.data = match.handleObj.data;
		event.handleObj = match.handleObj;

		ret = match.handleObj.origHandler.apply( match.elem, arguments );

		if ( ret === false || event.isPropagationStopped() ) {
			maxLevel = match.level;

			if ( ret === false ) {
				stop = false;
			}
			if ( event.isImmediatePropagationStopped() ) {
				break;
			}
		}
	}

	return stop;
}

// 在live事件类型type后增加上selector，作为命名空间 
function liveConvert( type, selector ) {  
    // . > `  
    // 空格 > &  
    // 在type后增加上selector，作为命名空间 
	return (type && type !== "*" ? type + "." : "") + selector.replace(rperiod, "`").replace(rspaces, "&");
}

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.bind( name, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

/**
 * 分解chunker
 * \((?:\([^()]+\)|[^()]+)+\)           // 匹配：(div)或((div))
 * \[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]      // 属性过滤块，匹配[a]或[ab=123]或[abc='bb']                  
 * \\.                      // 点转义
 * [^ >+~,(\[\\]+)+         // 伪类块：匹配'#aba'，'.back'，':aba'
 * [>+~]                    // 关系块：'>'，'+'，'~'
 * (\s*,\s*)?((?:.|\r|\n)*) // 前段为,并列表达式分隔符，后段为其他并列表达式
 * 具体分解参考：http://images.cnblogs.com/cnblogs_com/nuysoft/201111/20111123235454458.png
 * 
 */
var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,  // 是否有副本
	baseHasDuplicate = true,   // 基础副本
	rBackslash = /\\/g,    // 匹配转义的\
	rNonWord = /\W/;       // 非单词字符

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
// 检查JavaScript引擎在排序时是否会进行优化。在早期的Chrome浏览器中，排序时如果遇到相等的元素，不会调用比较函数，新版本中已经取消了这一优化。
// 如果遇到相等元素便不调用比较函数，此时变量baseHasDuplicate默认为true，即只能假设数组中含有重复元素；
// 如果遇到相等元素时仍然会调用比较函数，则变量baseHasDuplicate将被设置为false，这种情况下需要在比较函数中判断是否含有重复元素。
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

    
/**
 * 选择器表达式： "div > p" 
 * 块表达式： "div" "p" 
 * 并列选择器表达式： "div, p" 
 * 块分割器： Sizzle中的chunker正则，对选择器表达式从左向右分割出一个个块表达式   
 * 查找器： 对块表达式进行查找，找到的DOM元素数组叫候选集   
 * 过滤器： 对块表达式和候选集进行过滤   
 * 关系过滤器： 对块表达式之间的关系进行过滤，共有四种关系："+" 紧挨着的兄弟关系；">" 父子关系；"" 祖先关系；"~" 之后的所有兄弟关系   
 * 候选集： 查找器的结果，待过滤器进行过滤   
 * 映射集： 候选集的副本，过滤器和关系过滤器对映射集进行过滤  
 */
    
/**
 * Sizzle构造函数
 * @param{String}           selector        选择器
 * @param{Object}           context         上下文
 * @param{Array}            results         结果集
 * @param{String}           seed            
 * 
 *
 *
 */
var Sizzle = function( selector, context, results, seed ) {
    // 初始化
	results = results || [];   // 默认给它定义[]
	context = context || document;     // 默认指向document

	var origContext = context;

    /********* 参数合法性检测 ************/
    /** nodeType常用类型如下：
     * 元素element ==> 1
     * 属性attr ==> 2
     * 文本text ==> 3
     * 注释comments ==> 8
     * 文档document ==> 9
     */
    // 只有元素和document才能做context，其他node类型都不行，如果出现，则返回[]
	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
    // 如果selector不存在或者selector不是一个字符串，Sizzle本身就是操作selector，它都不存在或不合法，那么直接退出，并返回results，也就是[]
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

    /********* 参数无问题，继续 ************/
    // set: 种子集  
    // checkSet: 种子集的副本  
    // extra: 保存剩余的并联表达式，注意是并联表达式  
    // ret: 初步返回的结果，数据类型为json，包含set与expr属性，set为种子集,expr为剩余的块表达式  
    // cur: 块表达式关系符如：+ > ~ ，如果没有则默认为空格 " "  
    // pop:弹出数组的最后一个变量  
    // parts: 存储当前被分割的块表达式数组 
	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
    // 分割快表达式，对于碰到并联表达式，则暂时结束，将余下的并联表达式保存在extra中  
    // 如#info .p,div.red > a  
	do {
        /**
         * 关于exec：
         * 1、找到了匹配的文本，则返回一个结果数组，没有则返回null
         *    数组的第0个元素是与正则表达式相匹配的文本，第1个元素是第 1 个子表达式（也就是()中匹配的内容）相匹配的文本（如果有的话），第2、3……依此类推，根据()个数来
         * 2、它返回两个属性
         *    a: index 属性声明的是匹配文本的第一个字符的位置。
         *    b: lastIndex 属性指定的字符处开始检索字符串 string
                 当 exec() 找到了与表达式相匹配的文本时，在匹配后，它将把 RegExpObject 的 lastIndex 属性设置为匹配文本的最后一个字符的下一个位置。
                 这就是说，您可以通过反复调用 exec() 方法来遍历字符串中的所有匹配文本。当 exec() 再也找不到匹配的文本时，它将返回 null，并把 lastIndex 属性重置为 0。
         * 注：如果在一个字符串中完成了一次模式匹配之后要开始检索新的字符串，就必须手动地把 lastIndex 属性重置为 0。
         * 
         * 同样返回结果为数组的match：
         * 1、它的匹配行为与是不全局匹配（g标示），如果没有，则只执行一次匹配，匹配成功返回一个数组，否则返回null
         *    该数组的第 0 个元素存放的是匹配文本，而其余的元素存放的是与正则表达式的子表达式匹配的文本，与exec一样
         * 2、它返回两个属性
         *    a：index 属性声明的是匹配文本的起始字符在 stringObject 中的位置
         *    b：input 属性声明的是对 stringObject 的引用
         * 如果 regexp 具有标志 g，则 match() 方法将执行全局检索，找到 stringObject 中的所有匹配子字符串
         * 注：全局匹配返回的数组的内容与非全局大不相同，它的数组元素中存放的是 stringObject 中所有的匹配子串，即数组中就只有一个元素，而且也没有 index 属性或 input 属性
         *
         * 两者区别：
         * 1、exec使用在循环中，而match则使用普通的一次匹配中
         * 2、返回的属性有区别，exec有lastIndex属性没有input属性，match有input属性没有lastIndex属性
         */
        
        
        // 还原操作，因为是循环匹配，每一次匹配结束后，exec会记录下一次的匹配起始位置，也就是lastIndex属性，为了使每一次的匹配都从0开始，则需要手动将lastIndex还原为0
        // lastIndex为exec特性，如上 
        
		chunker.exec( "" );
        
        // $('div,p') => ["div,p", "div", ",", "p"]
        // $('div[name="bb"]') => ["div[name="bb"]", "div[name="bb"]", undefined, ""]
        // $('idv > p') => ["div > p", "div", undefined, " > p"]
		m = chunker.exec( soFar );

        // 存在匹配，则继续
		if ( m ) {
            // 记住下一次匹配字符串
			soFar = m[3];
		   
			parts.push( m[1] );
            
		    // 根据上面的chunker正则，如果存在并联表达式('div,p')，那么exec之后，m[2]的值为 "," 
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

    // parts为分隔后的块表达式组
    // $('div,p')
    // parts = ['div'],extra = 'p'
    // 判断是否存在位置伪类 origPOS,如 :frist,:last 等，如果存在位置伪类，则采取自左向右搜索
    // origPos.exec('div:frist') => [":first", "first", undefined]
    // origPos.exec('div:eq(1)') => [":eq(1)", "eq", "1"]
	if ( parts.length > 1 && origPOS.exec( selector ) ) {

        // 这个条件如果成立，那么输入只能是关系表达式
        // $('>div') => ['>','div']
        // $('>div:eq(1)') => ['>','div:eq(1)']，又因为这里处理的是伪类，所以可能情况只有它
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
            // 返回过滤后的集合
			set = posProcess( parts[0] + parts[1], context );

		} else {
            // 判断第一个匹配的结果是否为关系符号，'',>,~,+
            // 如果是则set = [document]
            // 否则parts的第一个元素还不是关系表达，继续回调
            // eg：$('div>p:first')  => parts = ["div", ">", "p:first"]
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
        // 这里主要修改context,如果表达式的开头为ID类型，且最后一个表达式非ID类型  
        // 所有的查询，使用到sizzle.selector.find的，只有最后一个节点，其它的节点都可以采用关系来决定  
        // 之所以只有第一个为id的时候可以修改context,且最后一个不能为ID，因为getElementById只在document中存在  
        // 在element中不存在该方法，如最后一个元素为ID,那么直接就会报错  
        // 那么将context修改为ID所在节点，用来提高效率 
        // 如：$("#info .p"); 那么自动修改为如下： $(".p",$("#info"));  
        
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

            // 调用find方法，查询parts中的第一个元素，返回临时结果  
            // 如以上的#info .p 那么会直接查询#info ,返回结果 
			ret = Sizzle.find( parts.shift(), context, contextXML );
            
            // 然后修改context  
            // 继续向后查找
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
            // 因为是采用自右向左的方式搜索，那么先获取出数组的最后一个元素,调用parts.pop();  
            // 再调用find方法查询  
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

            // 如果expr还有内容，表示需要进行再一次过滤
			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set ); 

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

// 去重，排序
Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

/**
 * 查找
 * @param{String}            expr               表达式
 * @param{DOM}               context            上下文
 * @param{Boolean}           isXML              是否XML
 * @return{Object}           { set: set, expr: expr }              set:查找到的结果集，是一个数组；expr:剩余表达式
 
 */
Sizzle.find = function( expr, context, isXML ) {
	var set;

    // 如果表达式不存在，返回[]
	if ( !expr ) {
		return [];
	}

    // 遍历["ID", "NAME", "TAG"]
	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];    // 获得类型
		
        // match为修正后的表达式匹配结果
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
            // match第一个元素为匹配到的字符串，
            // 第二个元素为具体串名
            // e.g $('#div') => ['#div', 'div']
            
			var left = match[1];
            // 从match中删除left
			match.splice( 1, 1 );

            // 知识点：substr
            // substr方法可在字符串中抽取从 start 下标开始的指定数目的字符。可以传二个参数，第一个为start，第二个为length，即取到的字符个数，二个参考都必须是数值。
            // start如果是负数，那么该参数声明从字符串的尾部开始算起的位置。也就是说，-1 指字符串中最后一个字符，-2 指倒数第二个字符，以此类推。
            
			if ( left.substr( left.length - 1 ) !== "\\" ) {
                // 对match[1] 中的进行再次转换,如 \: 转义为 : ，\. 转为 .  
				match[1] = (match[1] || "").replace( rBackslash, "" );
                
                // 针对不同的type调用不同的find方法,返回查询结果，对应的元素集合  
				set = Expr.find[ type ]( match, context, isXML );

                // 查询结果不为空，那么删除掉已经查询过的表达式 
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

    // 如果结果为空，那么采用如下方式寻找 
    // 为空的情况分析：
    // 1、查找的字符串不存在
    // 2、通过getElementsByTagName查找的非表单元素，这个问题主要出现在IE下，因为IE9及以下只支持表单元素
	if ( !set ) {
        // 所以这个地方判断的是浏览器是否支持getElementsByTagName
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}
    
    // 返回临时结果
	return { set: set, expr: expr };
};
    
/**
 * 过滤，从find结果集中进行过滤
 * @param{String}            expr               表达式
 * @param{Array}             set                找到的元素集
 * @param{Boolean}           inplace            
 * @param{Boolean}           not                
 
 */
Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
        // Expr.filter => ['PSEUDO','CHILD','ID','TAG','CLASS','ATTR','POS']
		for ( var type in Expr.filter ) {
            // leftMatch = /(^(?:.|\r|\n)*?)\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?![^\[]*\])(?![^\(]*\))/以CLASS正则为例
            // leftMatch => $('div.test') => ['div.test','div','test']
            // 判断表达式右边是否存在
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ], // 通过type找过滤的回调函数
					left = match[1];   // 表达式左边

				anyFound = false;

                // 从match中去除到左边匹配内容
                // ['div.test','div','test'] => ['div.test','test']
				match.splice(1,1);

                // 不知道什么情况下string的长度最后一个字符会出现下面的情况
				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

                // 重置result
				if ( curLoop === result ) {
					result = [];
				}

                // 过滤前格式化参数，使之合法
				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
                            // 过滤元素，返回true/false
							found = filter( item, match, i, curLoop );
                            // 是否pass掉
							var pass = not ^ !!found;

                            // 判断是否在原有结果集中过滤还是生成新结果集（inplace）
							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
                                // 保存pass掉的，并生成新结果集，此结果集为过渡后的
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

// Sizzle错误规则
Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

    
/**
* 4.3.1 块内查找
* 在查找环节，通过Sizzle.find来实现，主要逻辑如下：

* 依据DOM API性能决定查找依据： ID > Class> Name> Tag, 其中要考虑浏览器是否支持getElementsByClassName
* Expr.leftMatch：确定块表达式类型
* Expr.find：具体的查找实现
* 结果： {set: 结果集合, expr: 块表达式剩余的部分，用于下一步的块内过滤}
*/

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],    // 原生支持的、可直接获取元素的规则，因为需要支持IE低版本，所以对于EC5中直接获取class属性没有放入其中

    // 匹配正则
    /**
     * 相关知识点：
     * [\w\u00c0-\uFFFF\-]，这个正则匹配字母，数字，连字符，下划线和大部分可打印的unicode字符
     * ?: 非捕获性分组；带个前缀表示匹配时()中的内容不会被match或exec分组所记录，只是参与分组但不生成单独的分组数据；比如：'javascript'.match(/java(?:script)/) ==> ["javascript"];
     * 'javascript'.match(/java(script)/) ==> ["javascript","script"] 
     * ?= 匹配exp前面的位置，带这个前缀表示必要匹配条件；比如：reg = /java(?=script)/; reg.test('java') ==> false;reg.test('javajlfs') ==> false; reg.test('javascript') ==> true
     * ?! 匹配后面不是exp的位置，也就是?=反义，即表示带这个前缀说明匹配中不能出现相关条件；比如reg = /java(?!script)/; reg.test('java') ==> true;reg.test('javajlfs') ==> true; reg.test('javascript') ==> false
     */
	match: {
        // id
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
        // class
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
        // name
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
        // 属性
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
        // 标签
        // $('span')
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
        // 孩子节点
        // $('div:firsh-child')
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/, 
        // 基本伪类匹配
        // $('div:first')
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
        // 伪类，除了child和POS之外的其他伪类
        // 比如:hidden,:checked等
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

    // 确定块表达式类型
	leftMatch: {},

    // 属性修正
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

    // 属性处理
	attrHandle: {
        // 返回href
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
        // 返回type
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

    // 关系
	relative: {
        // 兄弟关系
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

        // 父子关系
		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

        // 祖先后代关系 
		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

        // 之后的所有兄弟元素
		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

    // 查找
    // 快速查找，通过原生属性
	find: {
        // 通过ID
		ID: function( match, context, isXML ) {
            // 通过ID查找元素，具体实现，通过getElementById
            // getElementById必须通过document来获取，否则无法使用
            // 所以这里会需要进行检测
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
                // 找到则返回，为了保持数据一致性，这里返回[]
				return m && m.parentNode ? [m] : [];
			}
		},

        // 通过name
		NAME: function( match, context ) {
            // context检测，必须为一个节点
            // 另外，在IE9以下版本中，getElementsByName只能获取到表单元素
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

                // 为什么还要进一次过滤？
				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

                // 如果找到则返回，否则返回null
				return ret.length === 0 ? null : ret;
			}
		},

        // 通过标签
		TAG: function( match, context ) {
            // 如果getElementsByTagName('*')查找所有元素时，在IE9以下会包含注释节点
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
    
   /**
    * 4.3.2块内过滤
    * 该过程通过Sizzle.filter来进行，该API不仅可以进行块内过滤，还可以进行块间过滤，通过inplace参数来确定。主要逻辑如下：

    * Expr.filter： {PSEUDO, CHILD, ID, TAG, CLASS, ATTR, POS} ， 选则器表达式的类型
    * Expr.preFilter： 过滤前预处理，保证格式的规范化
    * Expr.filter： 过滤的具体实现对象
    * 内过滤、块间从左到后: inplace=false,返回新对象；块间从右到左: inplace=true, 原来的元素集合上过滤
    */
    
    // 过滤前预处理，保证格式的规范化
    // 返回选择器字符串
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
            // 过滤表达式(match)，拿到左边字符串，更新match
			match = " " + match[1].replace( rBackslash, "" ) + " ";

            // 是xml，直接返回这个串
			if ( isXML ) {
				return match;
			}

            // 遍历结果集curLoop
            // elem指向结果集中的每一个元素
			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
                    // 按位异或，二进制比较
                    // 1 ^ 0 ==> 1
                    // 1 ^ 1 ==> 0
                    // not 排除操作
                    // elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0 判断元素className是否是要找的(match)，返回true/false
                    // not ^ 1
                    // not ^ 0
                    // 如果not 为true，则表示排除className == match
                    // 如果not 为false，则表示排除className != match
                    // 过滤操作
                    // 如果inplace为false，则返回新过滤后的结果集，如果为true，则在原集合中进行修改，修改的方式为，将原有的数据替换为false
                    
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
            // TAG需要将它们统一成小写
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
    // 过滤的具体实现对象
    // 返回true/false
	filters: {
        // 判断elem没有被禁用
		enabled: function( elem ) {
            // 排除hidden表单
			return elem.disabled === false && elem.type !== "hidden";
		},

        // 判断elem有被禁用
		disabled: function( elem ) {
			return elem.disabled === true;
		},

        // 单选radio，复选checkbox被选中
		checked: function( elem ) {
			return elem.checked === true;
		},
		
        // 选择select，被选中
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
            // 
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

        // 父节点
		parent: function( elem ) {
            // !!类型转换，返回true/false
			return !!elem.firstChild;
		},

        // elem下面为空，没有任何元素
		empty: function( elem ) {
			return !elem.firstChild;
		},

        // 判断elem是否存在
		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

        // elem是否为h1,h2……
		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

        /******以下主要判断是否为各类表单元素******/
        // elem为文本框
		text: function( elem ) {
            // 通过html属性获取非HTML5新增表单特性，比如search之类的，在IE8以下版本中type获取会出现问题
            // elem.type获取search表单时，返回的是'text'
            // 通过DOM方式访问的话才能获得正确type
            // 所以这里为了兼容，写出了二种方法
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

        // elem为单选
		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

        // elem为多选
		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

        // elem为文件选择框 
		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

        // elem为password
		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

        // elem为提交按钮
		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

        // elem为image
		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

        // elem为重置按钮
		reset: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "reset" === elem.type;
		},

        // elem为普通按钮
		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

        // elem为表单元素
		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

        // elem为当前页面上的活动元素，也就是光标在elem上，默认为body
		focus: function( elem ) {
            // elem.ownerDocument表示元素指向的当前document
			return elem === elem.ownerDocument.activeElement;
		}
	},
    
    // 设置伪类过滤
    // 返回true/false
	setFilters: {
        // 判断是否为第一个元素
		first: function( elem, i ) {
			return i === 0;
		},

        // 判断是否为最后一个元素
		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

        // 判断元素列表中，为偶数的
		even: function( elem, i ) {
			return i % 2 === 0;
		},
        
        // 判断元素列表中，为奇数的
		odd: function( elem, i ) {
			return i % 2 === 1;
		},

        // 大于
		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

        // 小于
		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

        // 第几个
		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

        // 第几个
		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
    // 选则器表达式的类型
    // 返回true/false
	filter: {
        // 伪类处理
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
                // 具体过滤的类型
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
                // 获取的内容是否匹配
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
                // pass掉not
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

        // 孩子结点处理
		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
                // 唯一子节点和第一个子节点
                // 判断方式就是遍历当前节点是否有相邻的上一级节点，如果有则表示当前元素不止一个子节点，所以返回false，否则为true
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

                // 判断是否为最后一个节点
                // 方法与first相反，遍历当前节点，判断是否有相邻的下一级节点，如果有则表示不为最后节点，返回false，否则返回true
				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

                // 匹配元素具体项
                // e.g $('div:nth-child(2n)') => ["div:nth-child(2n)", "div", "nth", "2n"]
				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

        // id
		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

        // 标签
		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		
        // 样式
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

        // 属性
		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

        // 伪类判断
        // 返回true/false
		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

// origPOS：伪类reg
var origPOS = Expr.match.POS,
	fescape = function(all, num){
        // 小技巧，num - 0 类型转换，保证+之前是纯数字，否则+可能变成字符拼接
		return "\\" + (num - 0 + 1);
	};

// 动态生成type正则
for ( var type in Expr.match ) {
    // 第一、每个字符串后面都增加了一个判断，用来确保匹配结果，末尾不包含]或者)
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
    // 同时Sizzle会检测转义字符，因此各部分头部都增加了一个捕获组用来保存目标字符串前面的部分，
    // 在这一步的时候，由于在头部增加了一分组，因此原正则字符串中的\3等符号必须顺次后移
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

// 合并结果数组
var makeArray = function( array, results ) {
    // 解除数组引用，产生新的数组
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
        // 将array中的结果追加到results中
        // 简写追加数组
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
    // 合并数组
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

        // toString = Object.prototype.toString;
        // 因为通过其他方式来进行类型判断，是无法判断一个数是否为数组
        // typeof 只能判断出基本数据类型，而在JS中，基本数据类型为：undefined,number,boolean,string,object,function
        // 上面列出来的基本类型中，前四种为值类型，后面二种类引用类型
        // 由数组特性决定了它只能是引用类型，因为它是包含有构造器，所以它会属于object
        // 可以通过instanceof对对象进行判断，[] instanceof Array   ===> true
        // 也可以通过toString来进行判断
		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
            // 能有length属性的只有二种情况，一个是数组，一个是字符串
            // 这里就是对字符串进行处理
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
                // 其他
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

        // 返回合并后的结果集
		return ret;
	};
}

var sortOrder, siblingCheck;

// compareDocumentPosition：比较当前节点与任意文档中的另一个节点的位置关系
// 参考：https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
// node.compareDocumentPosition( otherNode ) 
// node是要和otherNode比较位置的节点
// otherNode是被和node比较位置的节点
// 返回值是otherNode节点和node节点的位置关系
//     常量名	十进制值	含义
// DOCUMENT_POSITION_DISCONNECTED	                 1	   不在同一文档中
// DOCUMENT_POSITION_PRECEDING	                     2	   otherNode在node之前
// DOCUMENT_POSITION_FOLLOWING	                     4	   otherNode在node之后
// DOCUMENT_POSITION_CONTAINS	                     8	   otherNode包含node
// DOCUMENT_POSITION_CONTAINED_BY	                 16	   otherNode被node包含
// DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC	     32	   待定

// 节点顺序，相邻的还是相等的
if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
        // 二个节点相等
		if ( a === b ) {
            // 是否重复
            // 因为相等，所以重复hasDuplicate=true
			hasDuplicate = true;
			return 0;
		}

        // 因为是通过特性来进行节点位置判断，所以需要检测兼容性
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

        // 没有问题之后，判断b相对a的位置，具体返回参数，如上头说明 
		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
    // 非特性处理
	sortOrder = function( a, b ) {
		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// The nodes are identical, we can exit early
        // 相等
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// If the nodes are siblings (or identical) we can do a quick check
        // 都指向相同的父节点，表示是a,b相邻，进行快速检测
		} else if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
        // 如果a没有父节点，则节点之间没有关系存在
		} else if ( !aup ) {
			return -1;

        // b同理
		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
        // 否则他们是树中的其他地方所以我们需要建立一个完整列表parentNodes的比较
		while ( cur ) {
            // 向数组头部插入数据
			ap.unshift( cur );
			cur = cur.parentNode;
		}

        // 切换到b
		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

        // 获取父节点个数
		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
        // 以长度最小的那个为遍历条件，进行对比，寻找差异
        // 这个对于二个数组比较的长度判断写法给力i < al && i < bl;用&&
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
        // 相等直接返回
		if ( a === b ) {
			return ret;
		}

        // 拿到其他一个节点的相邻节点
		var cur = a.nextSibling;

        // 遍历
		while ( cur ) {
            // 如果二个节点相等，则返回-1
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

        // 否则返回1
		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
// 获取文本节点和CDATA节点值
Sizzle.getText = function( elems ) {
	var ret = "", elem;

    // 遍历
    // 赞写法
	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
        // 从文本节点和CDATA节点中获取
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
        // 遍历其他，除了注释节点
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

    // 返回获取的文本内容
	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
// 检查浏览器返回元素的名字的时候，看是否能通过getElementById查找(提供解决方案)
(function(){
	// We're going to inject a fake input element with a specified name
    // 创建一个div，设置一个id，用于查找
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

    // 在创建的div中插入name名称，并用ID来命名
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
    // 根元素注入它,检查它的状态,快速删除它
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
    // 移除，防止IE内存泄漏
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")
    // 当使用getElementsByTagName("*")时，查看浏览器是否只返回一个元素
    
	// Create a fake element
    // 创建一个假的元素
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
    // 确认没有找到comments
    // 如果comments被找到，则需要过滤它
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
            // 过滤注释节点，当获取是的页面上所有节点时（*）
			if ( match[1] === "*" ) {
				var tmp = [];

                // 遍历所有节点
				for ( var i = 0; results[i]; i++ ) {
                    // 只保留元素节点，元素节点类型值为1
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

            // 返回过滤后的结果，即为纯元素集合
			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
    // 查看属性返回的是否为规范的href属性
	div.innerHTML = "<a href='#'></a>";

    // 在所有浏览器如果查找的是a标签，那么返回的则会是A标签href中的内容，即当前页面相对路径
    // 在IE8以下浏览器中，如果通过getAttribute来获取href属性，返回是一个页面路径，而IE7以上版本的主流浏览器则返回的属性设置的值
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

// ES5新特性检查，看是否支持选择器查找，IE8及以上主流浏览器都支持
// e.g document.querySelector("div.test>p:first-child");
//     document.querySelector("#div");
//     document.querySelector("div");

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
        // Safari 在怪异模式不能处理大写或者unicode字符。
        // 但这个应该是针对老版本的Safari，因为测试版本是5.1.7，它不存在这个问题
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
            // 仅能在非XML documents中使用querySelectorAll（ID选择器无法在非HTML中使用）
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
                // 通过选择器加速
                // 正则匹配，元素名称、className和ID
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
                    // 标签名称加速
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
                    // class加速
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
                    // body元素只存在一次，优先找到它
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

/**
 * document.documentElement.contains
 * 返回一个布尔值来表示是否传入的节点是，该节点的子节点。
 * node.contains( otherNode ) 
 * node 是否包含otherNode节点.
 * otherNode 是否是node的后代节点.
 * 如果 otherNode 是 node 的后代节点或是 node 节点本身.则返回true , 否则返回 false.
 * 参考：https://developer.mozilla.org/zh-CN/docs/Web/API/Node/contains
 */
if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// 从左到右时，位置伪类处理方法    
// selector         选择器字符串          
// context          上下文
var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;    // 如果context存在nodeType，则表示context为元素，否则为window对象

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
    // 先剔除位置伪类，保存在later里面
    // Expr.match.PSEUDO.exec( '>div:hidden' ) => [":hidden", "hidden", undefined, undefined]
    // Expr.match.PSEUDO.exec( '>div:eq(1)' ) => [":eq(1)", "eq", "", "1"]
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
        // later中保存伪类
		later += match[0];
        // 删除伪类，保留选择器
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

    // 如果selector为'',>,+,~，则需要进行全局查找，所以selector + "*"
    // 否则不需要全局，直接selector，这时，能确定selector肯定不是关系选择器
	selector = Expr.relative[selector] ? selector + "*" : selector;
    
    // 在不存在位置伪类的情况下，进行查找
	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}
    
    // 以位置伪类为条件，对结果集合进行过滤
	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var self = this,
			i, l;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		var ret = this.pushStack( "", "find", selector ),
			length, n, r;

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && ( typeof selector === "string" ?
			jQuery.filter( selector, this ).length > 0 :
			this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];
		
		// Array
		if ( jQuery.isArray( selectors ) ) {
			var match, selector,
				matches = {},
				level = 1;

			if ( cur && selectors.length ) {
				for ( i = 0, l = selectors.length; i < l; i++ ) {
					selector = selectors[i];

					if ( !matches[ selector ] ) {
						matches[ selector ] = POS.test( selector ) ?
							jQuery( selector, context || this.context ) :
							selector;
					}
				}

				while ( cur && cur.ownerDocument && cur !== context ) {
					for ( selector in matches ) {
						match = matches[ selector ];

						if ( match.jquery ? match.index( cur ) > -1 : jQuery( cur ).is( match ) ) {
							ret.push({ selector: selector, elem: cur, level: level });
						}
					}

					cur = cur.parentNode;
					level++;
				}
			}

			return ret;
		}

		// String
		var pos = POS.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {
		if ( !elem || typeof elem === "string" ) {
			return jQuery.inArray( this[0],
				// If it receives a string, the selector is used
				// If it receives nothing, the siblings are used
				elem ? jQuery( elem ) : this.parent().children() );
		}
		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
    // 获取指定elem内容
	contents: function( elem ) {
        // 如果elem是一个iframe，那么返回iframe中的内容
        // 否则返回elem的所有子节点，并合并成一个集合
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until ),
			// The variable 'args' was introduced in
			// https://github.com/jquery/jquery/commit/52a0238
			// to work around a bug in Chrome 10 (Dev) and should be removed when the bug is fixed.
			// http://code.google.com/p/v8/issues/detail?id=1050
			args = slice.call(arguments);

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, args.join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return (elem === qualifier) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
	});
}




var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g, // 内联jq
    // 开始空白字符
	rleadingWhitespace = /^\s+/,
    // XHTML标签，只匹配<div />，但排除表达式中的
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    // 标签名称
	rtagName = /<([\w:]+)/,
    // tbody
	rtbody = /<tbody/i,
    // html字符
	rhtml = /<|&#?\w+;/,
    // 不能缓存数据标签
	rnocache = /<(?:script|object|embed|option|style)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	};

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

/**
 * HTML 文档操作
 */
jQuery.fn.extend({
    /**
     * 获取文本内容
     * @param {String|function}         text        字符串或回调函数，也可以不传值
     * 当不传参数时，表示获取匹配节点的文本内容，当传参数时，表示设置内容或对内容进行操作（function）
     */
	text: function( text ) {
        // 如果text是一个函数
		if ( jQuery.isFunction(text) ) {
            // 这里的this指向的是当前匹配的元素
            // 每个元素，逐一回调
			return this.each(function(i) {
				var self = jQuery( this );

                // 执行回调时，可获得二个参数，一个是当前是第几个元素，另外是当前元素的文本值
				self.text( text.call(this, i, self.text()) );
			});
		}

        // text不为空，并且不是一个对象，表示是设置文本内容
		if ( typeof text !== "object" && text !== undefined ) {
            // 先清除原有的内容，然后再生成新的
            // 因为是对DOM操作，不能直接插入，必须要生成才个节点才行，所以这个会创建一个文本节点，然后再将其插入
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

        // 没传参数时
		return jQuery.text( this );
	},

    /**
     * 将所有匹配的元素用单个元素包裹起来，即为所有匹配的元素添加父节点
     * @param {String|function}         text        字符串或回调函数，也可以不传值
     * 参数可传可不传，传时对匹配的元素进行操作，不传则返回当前匹配元素
     */
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

        // 拿到第一个匹配元素
		if ( this[0] ) {
			// The elements to wrap the target around
            // 做为匹配元素的父节点内容来源
            // 逻辑：从document中找html的第一个匹配元素，然后拷贝它
            // 所以，html变成要拷贝的元素，它可以是一个新创建的，那么可以直接传入<div>或自己手动创建document.createElement('div')
            // 如果是现在的，那么直接传入对应需要copy的元素匹配表达式即可，比如$(elem).wrapAll('div')，那么它将会把文档中第一个DIV作为elem的父节点
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

            
            // 原节点父节点判断，主要是针对body，因为不能再给body添加父节点
			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

            // 因为wrap是深度拷贝，所以如果它还有其他子节点的话，也同时会被copy，因为不是单一的，所以就需要拿其中的一个做为插入对象。
            // 这里拿到的就是wrap中的第一个子节点，然后把所有匹配的元素一次性插入到其中，作为它的子节点，完成wrapAll操作
			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
            // 具体追加操作，查看append
			}).append( this );
		}

		return this;
	},

    // 将每一个匹配的元素的子内容(包括文本节点)用一个HTML结构包裹起来
	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
                // 获取匹配元素的子节点
				contents = self.contents();

            // 通过长度来判断子节点的个数，以便批量操作
			if ( contents.length ) {
				contents.wrapAll( html );

            // 否则，直接插入即可
			} else {
				self.append( html );
			}
		});
	},

    // 功能与wrap一样，都是添加匹配元素的父节点
    // 区别：
    // wrapAll是先将所有匹配的元素合并到一起，然后再为它们添加父节点
    // wrap则不进行合并，匹配多个元素就为匹配的元素添加父节点
	wrap: function( html ) {
		return this.each(function() {
			jQuery( this ).wrapAll( html );
		});
	},
    
    // 将移出元素的父元素。这能快速取消 .wrap()方法的效果
	unwrap: function() {
		return this.parent().each(function() {
            // 移除时，需要排除body
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

    // 向每个匹配的元素内部追加内容
	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

    // 向每个匹配的元素内部前置内容
	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

    // 在每个匹配的元素之前插入内容。
	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery(arguments[0]);
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

    // 在每个匹配的元素之后插入内容。
	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery(arguments[0]).toArray() );
			return set;
		}
	},

	// keepData is for internal use only--do not document
    // 从DOM中删除匹配的元素
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
            // 清除缓存数据，防止内存泄漏，只保存keepData为true的
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
                    // 先处理elem所有子节点
					jQuery.cleanData( elem.getElementsByTagName("*") );
                    // 然后再是自身
					jQuery.cleanData( [ elem ] );
				}

                // 该清除的已经处理完成，那么就可以直接移除
				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

    /**
     * 删除匹配的元素集合中所有的子节点。
     * 
     */
	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
            // 移除元素节点和防止内存泄漏
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
            // 移除所有子节点
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},
    
    // 克隆匹配的DOM元素并且选中这些克隆的副本。
	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

    // 取得第一个匹配元素的html内容。
	html: function( value ) {
        // value为空时
        // 获取内容
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
                // 过滤掉jquery有关的信息
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
        // value为HTML字符串
        // 判断条件：字符串 + 不是script|object|embed|option|style中的一个 + 最开始位置不是空格 + 不是wrapMap中的需要特殊处理的标签
		} else if ( typeof value === "string" && !rnocache.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

            // 修正标签闭合
			value = value.replace(rxhtmlTag, "<$1></$2>");

			try {
                // 批处理
                // 这里没有直接使用empty的原因，应该是从性能上的考虑，因为使用append还需要更多的处理操作，还不如使用innerHTML更便捷性能更高
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
                    // 因为html操作会替换原有内容，所以在添加时，需要移除原有内容。
                    // 所有移除操作之前都需要对缓存进行清除，防止内存泄漏
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
            // 如果使用innerHTML报错，则使用empty方法
			} catch(e) {
				this.empty().append( value );
			}

        // value为函数
		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );
			});

        // 除了以上，直接插入
		} else {
			this.empty().append( value );
		}

		return this;
	},

    // 将所有匹配的元素替换成指定的HTML或DOM元素。
	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

            // value非字符串，可能是一个元素
			if ( typeof value !== "string" ) {
                // 所以通过jquery来查找
				value = jQuery( value ).detach();
			}

			return this.each(function() {
                // 替换时，需要弄清关系，因为替换就有删除和插入操作，这些操作都需要有参考对象来判断插入位置
				var next = this.nextSibling, // 下一个相邻节点
					parent = this.parentNode; // 父节点

                // 删除自己
				jQuery( this ).remove();

                // 如果存在相邻节点
				if ( next ) {
                    // 则在它的前面位置插入代替的内容
					jQuery(next).before( value );
				} else {
                    // 否则视为直接追加，所以需要父节点
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.length ?
				this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
				this;
		}
	},

    // 从DOM中删除所有匹配的元素。
    // 删除时，会保留jquery内部使用的缓存数据
	detach: function( selector ) {
		return this.remove( selector, true );
	},

    /**
     * 主要做三方面的操作
     * 1. 将args转换为DOM元素，并放在一个文档碎片中，调用jQuery.buildFragment和jQuery.clean实现
     * 2. 执行callback，将DOM元素作为参数传入，由callback执行实际的插入操作
     * 3. 插入script脚本时，对其进行解析，并执行。如果添加的是外部脚本，那么通过ajax异步加载。如果行内代码，则直接执行
     * 参考：http://www.cnblogs.com/nuysoft/archive/2012/01/10/2318204.html
     *
     * @param{object}        args       待插入的DOM元素或HTML代码     
     * @param{Boolean}       table      是否需要修正tbody，这个变量是优化的结果     
     * @param{function}      callback   回调函数，执行格式为callback.call( 目标元素即上下文, 待插入文档碎片/单个DOM元素 )    
     */
	domManip: function( args, table, callback ) {
		var results, first, fragment, parent,
			value = args[0], // 是第一个元素，后边只针对args[0]进行检测，意味着args中的元素必须是统一类型；
			scripts = []; // 在jQuery.buildFragment中会用到，脚本的执行在.domManip()的最后一行代码；jQuery.buildFragment中调用jQuery.clean时将scripts作为参数传入；jQuery.clean如果遇到script标签，则将script放入scripts，条件是：标签名为script 并且 未指定type或type为text/javascript；即支持插入script标签并执行；外联脚本通过jQuery.ajax以同步阻塞的方式请求然后执行，内联脚本通过jQuery.globalEval执行

		// We can't cloneNode fragments that contain checked, in WebKit
        // 规避webkit部分内核浏览器不能克隆包含了已选中多选按钮的文档碎片
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

        // 函数的话不能直接当DOM插入，需要执行它，从中拿到需要的DOM节点
        // 传入的是一个函数，那么直接执行它，执行时会传入两个参数，第一个为元素位置，第二个参数为如果是table，则传入当前元素的innerHTML用来修正tbody，否则传入undefined
        // 执行后的结果重新覆盖原args[0]，然后再回调domManip，
        // 注：如果同时插入的是一个函数数组，那么只有第一个函数会被执行。因为value永远读取的都是args集合中的第一个元素
		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}
        
        // 读取匹配元素中的第一个，主要是用来进行判断
        if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
            // 如果父节点本身就是一个文档碎片DocumentFragment（nodeType === 11 ），那么就不需要再新建，直接使用现成的，否则将通过buildFragment，创建一个新的
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
                // 将代插入的元素(args)给buildFragment，用来生成一个碎片文档
				results = jQuery.buildFragment( args, this, scripts );
			}

            // 从结果中拿到碎片文档
			fragment = results.fragment;

            // 判断碎片中子节点的长度，如果里面只有一个子节点，那么就直接插入节点而不需要使用文档碎片方式，因为这样执行效率会更高
            // 这也是我们在创建一个动态元素时，直接使用innerHTML填充内容，而不使用frament原因之一
			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

            // 前头都是前戏，做一些插入的准备工作
            // 接下来的操作就是插入
			if ( first ) {
                // tr的父元素是tbody，table指示是否需要修正tbody
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
                    // 实际回调插入操作，传入两个参数，一个是目标元素即上下文，另一个参数即需要插入的DOM元素或碎片文件
					callback.call(
                        // 如果table为true，则进行tbody修正
						table ?
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
                        // 当无意中丢弃原始文档碎片(碎片上可能已附加数据)而不是使用它时，确保不会泄漏内存；
                        // 此外,对最后一个元素使用原始文档碎片,而不是第一个,因为它在某些情况下会被错误的清空。
                        // 使用文档碎片时，如果是 可缓存的 或 缓存命中（指从缓存中取到文档碎片），则总是克隆。
                        
						results.cacheable || (l > 1 && i < lastIndex) ?
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

            // 判断script的长度
			if ( scripts.length ) {
                // 遍历执行
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
    // 如果elem是table，则在elem判断，elem是否存在tbody，如果存在则不需要再创建，直接返回，如果没有则创建一个
    // 否则直接返回elem。因为elem不是table，无须修正tbody
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

/**
 * 克隆事件
 * 克隆事件是相对困难的事情，因为只有HTML事件是可以直接拷贝的，但非HTML事件则会出现兼容性问题
 * 在IE中，2级DOM事件是可以拷贝的，但在标准浏览器中，事件是无法拷贝的
 * 为了能够进行事件拷贝，使用JQ的方法是最好的解决方案，即将原元素事件先进行缓存，而非直接绑定
 * 然后如果需要拷贝，只需要在原元素中找到缓存区的事件，然后将其拷贝到clone元素上即可！
 */
function cloneCopyEvent( src, dest ) {

    // 如果不是元素或者没有缓存数据，那么直接返回，因为非元素无法绑定事件，没缓存则表示元素没有任何事件操作，JQ是将事件缓存到data中
	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

    // 生成缓存key，因为要将其引向新克隆的元素上，新的元素也会按照原有的事件缓存处理逻辑进行操作
	var internalKey = jQuery.expando,
		oldData = jQuery.data( src ),
		curData = jQuery.data( dest, oldData );

	// Switch to use the internal data object, if it exists, for the next
	// stage of data copying
	if ( (oldData = oldData[ internalKey ]) ) {
		var events = oldData.events;
            curData = curData[ internalKey ] = jQuery.extend({}, oldData);

		if ( events ) {
			delete curData.handle;
			curData.events = {};

			for ( var type in events ) {
				for ( var i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
				}
			}
		}
	}
}

/**
 * 克隆固定属性，确保不会出现事件，同时保证copy后的元素能正确
 * 知识点：
 * clearAttributes方法和mergeAttributes方法，这二个方法只有IE支持，是非标准属性
 * clearAttributes：该方法用来清除所有用户定义的属性，包括通过attachEvent绑定的事件句柄在IE9以下版本中也会一并清除，但通过一级DOM事件绑定的事件，不分版本，都不会被清除
 * mergeAttributes：该方法用来把指定元素的所有属于拷贝到自己身上，包括attributes、events、styles。input标签不能拷贝value值，部分属性拷贝之后也不生效，比如placeholder属性
 * 在不设置mergeAttributes的第二个参数时，id/name属性不会被拷贝，但只要将其参数指定为false，就可以拷贝id/name了
 */
function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
    // 非元素不需要处理
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
    // 不希望clearAttributes移除所有自定义属性，但它能移除attachEvent事件
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
    // 相比之下,mergeAttributes只有合并回原始属性，而不是事件（这个事件应该是非HTML事件），否则同样会被拷贝
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
    // 特殊元素处理
    // 1、object元素不能克隆它的孩子节点，只能使用专有classid属性值（而不是type属性）来识别内容显示
	if ( nodeName === "object" ) {
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
        // 2、checkbox和radio
        // IE6-8中不能持续克隆checked选中状态或单选按钮。更糟糕的是，IE6-7，克隆的是元素外观，连defaultChecked值也不是
		if ( src.checked ) {
            // 修正defaultChecked
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
        // 在IE6-7中checkbox/radio未做任何选择时，默认值为'on'；
        // 但是IE6-7最终设置一个克隆的值为复选框或单选按钮一个空字符串,而不是“on”
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
    // 当克隆options时，IE6-8未能返回选择的选择项，使用默认选中状态
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
    
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
    // 事件数据被引用，如果expando也被拷贝，那么将它移除
	dest.removeAttribute( jQuery.expando );
}

/**
 * 创建文档碎片
 * 实现的目标：
 * 1、创建碎片
 * 2、缓存
 *
 * 相关知识点：
 * 1、使用文档碎片与直接DOM操作性能：http://ejohn.org/blog/dom-documentfragments/
 *
 * @param{Array}             args           待插入的DOM元素或HTML代码
 * @param{Object}            nodes          JQuery对象，从其中获取Document对象，doc = nodes[0].ownerDocument || nodes[0]
 * @param{Array}             scripts        脚本数组，依次传递：.domManip() > jQuery.buildFragment() > jQuery.clean()
 */
jQuery.buildFragment = function( args, nodes, scripts ) {
	var fragment, cacheable, cacheresults,
		doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document); // 将doc指向document，因为createDocumentFragment时需要

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
    // 只在主document中缓存1/2KB的HTML（length < 512）；
    // 复制options会丢失选中状态，不处理（IE6-8）；
    // 在IE6中，如果在fragment中添加<object> <embed>，不能正常工作，不处理；
    // 在WebKit中，复制节点时无法复制checked属性，不处理（webkit早期版本）；
    // 最后，IE6/7/8不能正确的复用缓存的文档碎片，如果碎片是通过未知元素创建的。
    
    // if：args长度等于1 + 第一个元素为字符串 + 第一个元素长度不超过512 + 主文档对象 + 第一个元素第一个字符“<” + 支持缓存的标签（除了/<(?:script|object|embed|option|style)/i）+ （要么支持正确的checked属性赋值 要么没有checked属性）+ 要么可以正确拷贝HTML5元素 要么不是HTML5标签（在nodeNames中定义）
	if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
		args[0].charAt(0) === "<" && !rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {
        // 满足缓存条件
		cacheable = true; // 设置为true

		cacheresults = jQuery.fragments[ args[0] ]; // 从缓存jQuery.fragments中查找缓存结果，jQuery.fragments是全局的文档碎片缓存对象
		if ( cacheresults && cacheresults !== 1 ) { // 缓存找到并且不为1
			fragment = cacheresults;
		}
	}

    // 如果文档碎片不存在，则创建它
    // 碎片不存在的原因：
    // 1、不能符合缓存条件
    // 2、符合条件 但是第一次调用jQuery.buildFragment，此时jQuery.fragments还没有
    // 3、符合条件 但是第二次调用jQuery.buildFragment，此时jQuery.fragments存在，但此时缓存中是1
	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

    // 缓存成功
	if ( cacheable ) {
        // 缓存值
        // 1、cacheresults为空，第一次调用jQuery.buildFragment
        // 2、cacheresults为1
		jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1; 
	}    
    
    // 返回文档碎片和缓存状态
	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {}; // 全局的文档碎片缓存对象

jQuery.each({
    // 追加到elem
	appendTo: "append",
    // 注入到elem
	prependTo: "prepend",
    // 插入elem之前
	insertBefore: "before",
    // 插入elem之后
	insertAfter: "after",
    // 替换所有elem
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [],
            // 插入目标
			insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;

        // 父节点是frament文档碎片，且只有一个子节点
		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
            // 因为只有一个子节点，那无需多次遍历操作，直接调用已经方法即可
			insert[ original ]( this[0] );
            
			return this;
		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
                // this为待插入到目标元素
				var elems = (i > 0 ? this.clone(true) : this).get();
                // 执行相关方法
				jQuery( insert[i] )[ original ]( elems );
                
                // 合并匹配元素
				ret = ret.concat( elems );
			}
            
            // 返回插入的元素
			return this.pushStack( ret, name, insert.selector );
		}
	};
});

// 获取所有节点
function getAll( elem ) {
    // 首先判断元素是否存在getElementsByTagName方法
	if ( "getElementsByTagName" in elem ) {
		return elem.getElementsByTagName( "*" );
	
    // 如果不存在，那么使用ES5中的querySelectorAll再来试一试
	} else if ( "querySelectorAll" in elem ) {
		return elem.querySelectorAll( "*" );

    // 都不成，则返回[]
	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
// 在clean中使用，修复defaultChecked属性
function fixDefaultChecked( elem ) {
	if ( elem.type === "checkbox" || elem.type === "radio" ) {
		elem.defaultChecked = elem.checked;
	}
}
// Finds all inputs and passes them to fixDefaultChecked
// 找到所有input并它们传给fixDefaultChecked
function findInputs( elem ) {
	if ( jQuery.nodeName( elem, "input" ) ) {
		fixDefaultChecked( elem );
	} else if ( elem.getElementsByTagName ) {
		jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
	}
}

jQuery.extend({
    // 克隆
    /**
     * @param       elem                    元素
     * @param       dataAndEvents           
     * @param       deepDataAndEvents 
     */
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var clone = elem.cloneNode(true),
				srcElements,
				destElements,
				i;
        
        // 只克隆HTML元素，且不克隆事件或checked状态
		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

            // 拷贝前对属性进行修正操作，以保证IE下的兼容性
			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName
			// instead
            // 获取元素下所有子元素，这个不用Sizzle，因为它太慢了，所以直接使用getElementsByTagName
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
            // 因为默认为深度拷贝，所以需要将元素下的所有子元素做属性修正操作
			for ( i = 0; srcElements[i]; ++i ) {
				cloneFixAttributes( srcElements[i], destElements[i] );
			}
		}

		// Copy the events from the original to the clone
        // 从原元素拷贝事件
		if ( dataAndEvents ) {
            // 拷贝当前元素事件
			cloneCopyEvent( elem, clone );

            // 深度拷贝事件
			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		// Return the cloned set
        // 返回clone的元素
		return clone;
	},
    
    // 把HTML代码转换为DOM元素
    // elems：       待转换HTML代码数组
    // context：     文档对象（document），会调用context的createTextNode方法和createElement方法
    // fragment：    文档碎片，在其上插入div，在div上设置innerHTML，使用frament来提高DOM插入操作性能
    // scripts：     脚本数组，绝对的变量复用，数组引用类型的特性体现淋漓尽致，超赞。
	clean: function( elems, context, fragment, scripts ) {
		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
        // context.createElement创建失败，在IE中会报错，但返回是一个object
        // 因为后继需要使用调context的createTextNode方法和createElement方法，而有此方法的只有document，所以对context进行修正，将它指向document
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [];
        
        // 遍历elems
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}
            
            // 排除不存在的
			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
            // html字符串转换成DOM节点
			if ( typeof elem === "string" ) {
                // 如果elem是纯字符串不包含特殊符号，则将它通过createTextNode创建成一个文本节点
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Fix "XHTML"-style tags in all browsers
                    // 修正XHTML样式标签为标准HTML，<div/> => <div></div>
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Trim whitespace, otherwise indexOf won't work as expected
                    // 清除空字符，
                    // tag为标签名称，并转成小字
                    // wrap为wrapMap中的特定标签，是一个数组，有三个元素，第一个：深度，第二个为开始标签，第三个为结束标签
                    // depth为深度，包裹了几层
                    // div作为HTML内容载体
					var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Go to html and back, then peel off extra wrappers
                    // 将拼接HTML，然后填充到新创建 的div中
                    // wrap[1]为开始标签，wrap[2]为结束标签
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
                    // 移到合适的深度
					while ( depth-- ) {
                        // div更替为原内容的最后一个节点
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
                    // 从table文档碎片中移除IE自动插入的空<tbody>
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
                        // hasBody：判断elem中是否包含tbody
                        // tbody判断规则：
                        // 1、tag显示，elem是table元素
                        // 2、elem中不存在tbody标签
                        // 以上二点都成立，那么tbody存放的就是elem，否则返回[]
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

                        // 遍历tbody中的所有元素，看看有没有存在tbody，如果存在就需要移除它
						for ( var j = tbody.length - 1; j >= 0 ; --j ) {
                            // 判断依据：元素名称是tbody并且tbody中没有任何子节点
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
                    // innerHTML填充时，最前端空格修正为文本节点
                    // 判断一下通过innerHTML填充时，最前端的空格是否会生成文本节点，在IE9以下版本是不会，如果不支持，就判断elem是否以空格开头
                    // 二个条件都为true，就需要将elem中的空格转成文本节点使之与其他浏览器同兼容
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
            // 修正IE6/7下 任何radio和checkbox的defaultChecked
            // 通过动态添加元素状态（radio，checkbox），在IE6/7是，这个状态是无法保存的，这里要做的就是修正它，使之能保存状态
			var len;
			if ( !jQuery.support.appendChecked ) {
                // 如果存在多个
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( i = 0; i < len; i++ ) {
						findInputs( elem[i] );
					}
                // 单个
				} else {
					findInputs( elem );
				}
			}

            // 拿到修正好的elem后，存在到ret集合中
			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
                // 多个就合并
				ret = jQuery.merge( ret, elem );
			}
		}

        // 从elem中找出script，因为需要执行它
		if ( fragment ) {
            // 判断是否为脚本类型
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
            // 从ret中遍历查找script
			for ( i = 0; ret[i]; i++ ) {
                // 条件
                // 1、scripts存在，因为需要它来存放查找到的script
                // 2、元素名称必须是script
                // 3、且script类型为text/javascript
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
                    // scripts保存的就是script元素
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
                    // 当ret元素一开始不是script标签时或者是script但未指明script type
					if ( ret[i].nodeType === 1 ) {
                        // 需要在ret元素中查找script标签，然后通过grep进行过滤，只保留script节点
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

                        // 然后将结果追加到ret中
                        // splice：数组方法从数组中添加/删除项目，然后返回被删除的项目
                        // 它有二个参数，一个参数为整数，规定添加/删除项目的位置，使用负数可从数组结尾处规定位置。
                        // 二个参数要删除的项目数量。如果设置为 0，则不会删除项目，反是添加。
                        // 添加完成后，再次遍历时，就可以拿到script元素了
						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
					}
                    
                    // 最后将分离后的数数据存入到frament中，等待一次性插入到DOM中
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},

    /**
     * 清除缓存数据
     * 清除元素上缓存的所有数据，包括事件
     */
	cleanData: function( elems ) {
		var data, id, cache = jQuery.cache, internalKey = jQuery.expando, special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
            // 过滤没有缓存Data的元素
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

            // 缓存KEY
			id = elem[ jQuery.expando ];

            // 如果存在KEY，表示有缓存
			if ( id ) {
                // 拿到缓存数据
				data = cache[ id ] && cache[ id ][ internalKey ];

                // 移除事件和事件句柄
				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
                    // 为了防止IE6/7/8下DOM 引用导致的内存泄漏，所以将它置于null
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

                // 从elem中删除缓存属性
				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

                // 从全局缓存中删除相对应的KEY
				delete cache[ id ];
			}
		}
	}
});

// 脚本立即执行
// 因为一般是在each中使用，所以会有二个参数
function evalScript( i, elem ) {
    // 如果script是引用的js文件，那么通过ajax加载它
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
        // 通过eval运行代码
		jQuery.globalEval( elem.text || elem.textContent || elem.innerHTML || "" );
	}

    // 执行完成，该加载的已经加载，该执行的已经执行，则将其从DOM移除
	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}



/******************************************************************************************/
/**
 * css样式操作
 * 涉及知识点：
 * 1、css浏览器兼容性
 * 2、
 * 3、
 */
/******************************************************************************************/
var ralpha = /alpha\([^)]*\)/i, // 匹配IE下滤镜filter:Alpha(Opacity="0",FinishOpacity="75",2)
	ropacity = /opacity=([^)]*)/,  // 匹配标准浏览器下opacity=.5，并分离出后面的数
	rdashAlpha = /-([a-z])/ig,     // 匹配line-height中的-h，用它来配合camelCase方法来对属性名驼峰化
	// fixed for IE9, see #8346
	rupper = /([A-Z]|^ms)/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,    // 匹配正负整数
	rrelNum = /^[+\-]=/,
	rrelNumFilter = /[^+\-\.\de]+/g,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle,

    // 驼峰命名转换成大写
	fcamelCase = function( all, letter ) {
        // 转换成大写
		return letter.toUpperCase();
	};

jQuery.fn.css = function( name, value ) {
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) {
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) {
		return value !== undefined ?
			jQuery.style( elem, name, value ) :
			jQuery.css( elem, name );
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
    // style 属性钩子，用于需要进行特殊处理的属性
	cssHooks: {
        // 滤镜
		opacity: {
            // 获取滤镜值
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
                    // 通过opacity获取值，返回一个数字
					var ret = curCSS( elem, "opacity", "opacity" );
                    
                    // 如果没有获取到，则返回1，否则返回获取的值
					return ret === "" ? "1" : ret;

				} else {
                    // 直接从元素上获取
					return elem.style.opacity;
				}
			}
		}
	},

	// Exclude the following css properties to add px
    // 排除跟随css属性添加px的属性，也就是下面的这些不需要带px
	cssNumber: {
		"zIndex": true,
		"fontWeight": true,
		"opacity": true,
		"zoom": true,
		"lineHeight": true,
		"widows": true,
		"orphans": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
    // float修正
	cssProps: {
		// normalize float css property
        // ie9以下版本使用的styleFloat来获取或设置float值，而非cssFloat
        // 标准浏览器使用cssFloat
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
    // 从DOM节点中获取或设置style属性
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
        // 排除不能设置style的文本节点和注释节点
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
        // 确认使用的是正确的属性名
        // 因为需要对使用-分隔的属性名，修正成驼峰形式浏览器才支持。例：line-height => lineHeight
		var ret, type, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

        // float特殊照顾
		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
        // 设置属性值
		if ( value !== undefined ) {
			type = typeof value;

			// Make sure that NaN and null values aren't set. See: #7116
            // 排除当value为一个数且是NaN时，或者value为空
            // 因为在IE浏览器给一个元素设置width或height时，如果设置的值为nullpx或NaNpx会报错
			if ( type === "number" && isNaN( value ) || value == null ) {
				return;
			}

			// convert relative number strings (+= or -=) to relative numbers. #7345
            // value为字符串，并且是+=10px或-=10px这种形式的情况
			if ( type === "string" && rrelNum.test( value ) ) {
                // 需要将其中的字符过滤掉
                // 并将其转换成数字与元素原始属性对应的值进行相加处理
				value = +value.replace( rrelNumFilter, "" ) + parseFloat( jQuery.css( elem, name ) );
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
            // value为一个数字且不是cssNumber（不需要加px）中提到的属性，那么需要在数字后面加上px
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
            // 如果是hook中存在的属性，则使用value，否则只是设置一个指定的值
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
                // 通过try包装，以防止IE使用了无效值后报错
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
            // 获取值
			// If a hook was provided get the non-computed value from there
            // 是不是特殊（hook中的）处理属性，如果是则使用hook中提供的方法来获取值
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
            // 否则直接属性名获取
			return style[ name ];
		}
	},

	css: function( elem, name, extra ) {
		var ret, hooks;

		// Make sure that we're working with the right name
        // 属性名修正
        // 钩子属性
        // float照顾
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
        // cssFloat特殊处理
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
        // 如果是hooks中的方法且方法带有get方法，那么就通过它来获取值
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
        // 否则，通过getComputedStyle或currentStyle方式来获取计算后存在的值，然后使用它
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
    // 通过交换CSS属性来获取正确的计算
    // 这个功能主要是解决一些属性的兼容性问题
    // 比如webkit中maring-right通过getComputedStyle不能获取到正确的值，需要将元素设置成inline-block才能正确获取
    // 主要用来处理callback
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
        // 因为是进行属性交换，交换是暂时的，只是做一次修正操作，所以操作完成后，还得将原来的属性设置回来
        // 所以，必须先保存原始属性
        // 然后再设置新属性
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

        // 属性交换成功后，执行回调操作，回调操作主要用途就是获取元素属性修改后的操作，这也就这个方法的核心
		callback.call( elem );

		// Revert the old values
        // 回调完成后，表示操作已经完成，然后将旧值还原
        // 完成整个的修正操作
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	},

    // 驼峰命名处理
	camelCase: function( string ) {
		return string.replace( rdashAlpha, fcamelCase );
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			var val;

            // 是否获取计算后的值
			if ( computed ) {
                // offset值不为0，表示元素是占页面空间，而非设置了display:none
				if ( elem.offsetWidth !== 0 ) {
                    // 直接去获取
					val = getWH( elem, name, extra );

				} else {
                    // 否则看是否为这些属性：position: "absolute", visibility: "hidden", display: "block"
					jQuery.swap( elem, cssShow, function() {
						val = getWH( elem, name, extra );
					});
				}

                // 正常情况下，val是不应该出现负值的
                // 如果出现，则需要进行修正
				if ( val <= 0 ) {
                    // 重新从curCSS中获取属性值
					val = curCSS( elem, name, name );

                    // IE可能需要再次修正
					if ( val === "0px" && currentStyle ) {
						val = currentStyle( elem, name, name );
					}

					if ( val != null ) {
						// Should return "auto" instead of 0, use 0 for
						// temporary backwards-compat
                        // 修正val为空或为auto时，将其设置成0px
						return val === "" || val === "auto" ? "0px" : val;
					}
				}

                // val为负数或为null
				if ( val < 0 || val == null ) {
                    // 则从元素style上直接获取属性值，因为很可能是内联样式
					val = elem.style[ name ];

					// Should return "auto" instead of 0, use 0 for
					// temporary backwards-compat
                    // 道理与上面一样，修正val值
					return val === "" || val === "auto" ? "0px" : val;
				}

                // 修正值，如果val为非字符串，则不需要加入单位'px'
				return typeof val === "string" ? val : val + "px";
			}
		},

		set: function( elem, value ) {
			if ( rnumpx.test( value ) ) {
				// ignore negative width and height values #1599
                // 忽略为负的width和height值，因为在IE8及以下版本中，设置负值会报脚本错误
				value = parseFloat(value);

				if ( value >= 0 ) {
					return value + "px";
				}

			} else {
				return value;
			}
		}
	};
});

/**
 * 处理IE不支持opacity透明属性
 * IE使用透明效果需要用到IE滤镜：filter: alpha(opacity=60)
 * 而且IE滤镜opacity的取值范围与标准opacity有区别
 * IE取值范围在0-100之间，而标准在0-1之间
 */
if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
        // 获取opacity值，IE通过style filter中的opacity获取，并将取到的数值转换成标准形式，即0-1之间
		get: function( elem, computed ) {
			// IE uses filters for opacity
            // 如果取到，则返回修正后的值，没取到则返回''
            // 这里有个关于正则的细节处理，即RegExp.$1
            // RegExp正则表达式对象
            // RegExp.$1为获取当前正则表达式执行后的分组数据
            // 因为这个地方用了test进行匹配，返回结果为true/false，不能与match或exec相比，可以直接获取匹配的分组信息，
            // 这里拿不到正则中的分组数据，那么在不用match或exec的情况，如何做得到？
            // 那么就可以使用RegExp对象本身提供的属性来获取当前执行的正则结果，所以这个地方就用RegExp.$1来获取匹配的第一个分组数据。赞！！！！！！！！
            // 与RegExp有关的正则属性和方法参考：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/n
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( parseFloat( RegExp.$1 ) / 100 ) + "" :
				computed ? "1" : "";
		},

        // 设置opacity值
		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle;

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
            // 修正IE bug，通过设置zoom属性触发ie的hasLayout属性
            // 参考：http://www.cnblogs.com/yupeng/archive/2011/04/11/2012996.html
			style.zoom = 1;

			// Set the alpha filter to set the opacity
            // 设置值，过滤掉非法值
            // 因为是以标准opacity（0-1）来设置IE opacity（0-100），所以需要将其修正
			var opacity = jQuery.isNaN( value ) ?
				"" :
				"alpha(opacity=" + value * 100 + ")",
                // 获取当前元素style中的filter
				filter = currentStyle && currentStyle.filter || style.filter || "";

            // 然后设置
            // 设置时，先判断元素是否之前已经设置过filter，如果有则进行替换，如果没有则添加
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery(function() {
	// This hook cannot be added until DOM ready because the support test
	// for it is not run until after DOM ready
    // 修正webkit中getComputedStyle不能正确获取margin-right值
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
                // 通过getComputedStyle获取margin-right返回错误值，暂时设置元素为inline-block来获取正确值
				var ret;
                
                // 通过调用swap方法，来暂时性重置elem display属性，将其改成inline-block之后，再获取margin-right值
				jQuery.swap( elem, { "display": "inline-block" }, function() {
                    // 计算后的值
					if ( computed ) {
						ret = curCSS( elem, "margin-right", "marginRight" );
					} else {
                        // 直接获取style值
						ret = elem.style.marginRight;
					}
				});
				return ret;
			}
		};
	}
});

/**
 * document.defaultView     只读
 * 在浏览器中，该属性返回当前 document 对象所关联的 window 对象，如果没有，会返回 null。
 * IE9以下版本不支持
 *
 * 参考资料：https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getComputedStyle
 * document.defaultView.getComputedStyle
 * 得出所有在应用有效的样式和分解任何可能会包含值的基础计算后的元素的CSS属性值。
 * (element[, pseudoElt])二个参数
 * element：用于计算样式的元素
 * pseudoElt：指定一个伪元素进行匹配。对于常规的元素来说可省略。
 * 返回的样式是一个CSSStyleDeclaration 对象。即CSS键值对的集合。参考：https://developer.mozilla.org/zh-CN/docs/Web/API/CSSStyleDeclaration
 *
 * 关于document.defaultView.getComputedStyle 与 window.getComputedStyle
 * 看上面说明其实就是一个东西，只是为了避免兼容性问题，jquery没有使用window来直接使用，
 * 因为在firefox3.6上访问子框架内的样式 (iframe)，不能使用window，而只能使用document.defaultView，参考资料最后有说明
 */
if ( document.defaultView && document.defaultView.getComputedStyle ) {
	getComputedStyle = function( elem, name ) {
		var ret, defaultView, computedStyle;

        // 还原驼峰命名，如lineHeight => line-height
        // 因为通过getComputedStyle获取的属性都不是驼峰命名方式，只有通过js来访问DOM style属性时才需要转换成驼峰方式
		name = name.replace( rupper, "-$1" ).toLowerCase();

		if ( !(defaultView = elem.ownerDocument.defaultView) ) {
			return undefined;
		}

        // 获取elem style属性集
		if ( (computedStyle = defaultView.getComputedStyle( elem, null )) ) {
            // 通过getPropertyValue来获取name值
			ret = computedStyle.getPropertyValue( name );
            
            // 没有找到name值并且elem不是当前文档的子节点
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
				ret = jQuery.style( elem, name );
			}
		}

		return ret;
	};
}

/**
 * document.documentElement.currentStyle
 * 与getComputedStyle功能一样
 * 只有 IE 和 Opera 支持使用 currentStyle 获取 HTMLElement 的计算后的样式，IE针对IE9以下
 * 参考：http://w3help.org/zh-cn/causes/BT9008
 * https://msdn.microsoft.com/en-us/library/ms535231(v=vs.85).aspx
 *
 *
 */
if ( document.documentElement.currentStyle ) {
	currentStyle = function( elem, name ) {
		var left,
            // currentStyle方法获取当前样式（初始化）
			ret = elem.currentStyle && elem.currentStyle[ name ],
            // runtimeStyle方法获取修改后的样式
			rsLeft = elem.runtimeStyle && elem.runtimeStyle[ name ],
			style = elem.style;

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
			// Remember the original values
			left = style.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : (ret || 0);
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

curCSS = getComputedStyle || currentStyle;

/**
 *
 * offsetWidth|Height = width|height + padding + border
 */
function getWH( elem, name, extra ) {
    // cssWidth = [ "Left", "Right" ],
	// cssHeight = [ "Top", "Bottom" ],
	var which = name === "width" ? cssWidth : cssHeight,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight;

	if ( extra === "border" ) {
		return val;
	}

	jQuery.each( which, function() {
		if ( !extra ) {
			val -= parseFloat(jQuery.css( elem, "padding" + this )) || 0;
		}

		if ( extra === "margin" ) {
			val += parseFloat(jQuery.css( elem, "margin" + this )) || 0;

		} else {
			val -= parseFloat(jQuery.css( elem, "border" + this + "Width" )) || 0;
		}
	});

	return val;
}

/**
 * 对于hidden隐藏的元素与visible隐藏的元素做处理
 * 对于hidden，即display:none时，元素是不会占有任何页面空间的，所有通过offsetWidth/offsetHeight来获取的宽/高会为0
 * 对于visible，即visibility: hidden时，元素会保持原在页面所占空间，所以通过offsetWidth/offsetHeight是可以正确获取到值的
 *
 */
if ( jQuery.expr && jQuery.expr.filters ) {
    // 对hidden的元素
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

        // 如果是hidden，但width|height不为0，那就可能是浏览器兼容性问题，需要更一步处理
        // 即判断浏览器在元素设置为display:none时，可否通过offset来获取值，如果不能，就只能去读取元素样式的display属性来进行判断，元素是否设置了display:none
		return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Document location
	ajaxLocation,

	// Document location segments
	ajaxLocParts;

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for(; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for(; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.bind( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function ( target, settings ) {
		if ( !settings ) {
			// Only one parameter, we extend ajaxSettings
			settings = target;
			target = jQuery.extend( true, jQuery.ajaxSettings, settings );
		} else {
			// target was provided, we extend into it
			jQuery.extend( true, target, jQuery.ajaxSettings, settings );
		}
		// Flatten fields we don't want deep extended
		for( var field in { context: 1, url: 1 } ) {
			if ( field in settings ) {
				target[ field ] = settings[ field ];
			} else if( field in jQuery.ajaxSettings ) {
				target[ field ] = jQuery.ajaxSettings[ field ];
			}
		}
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": "*/*"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery._Deferred(),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, statusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status ? 4 : 0;

			var isSuccess,
				success,
				error,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = statusText;

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.resolveWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.done;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( (ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", */*; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( status < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					jQuery.error( e );
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// Serialize object item.
		for ( var name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for( key in s.converters ) {
				if( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
		( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				inspectData && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2";

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( inspectData ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Clean-up function
		jqXHR.always(function() {
			// Set callback back to previous value
			window[ jsonpCallback ] = previous;
			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( previous ) ) {
				window[ jsonpCallback ]( responseContainer[ 0 ] );
			}
		});

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0,
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	iframe, iframeDoc,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	],
	fxNow,
	requestAnimationFrame = window.webkitRequestAnimationFrame ||
	    window.mozRequestAnimationFrame ||
	    window.oRequestAnimationFrame;

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback);

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[i];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && jQuery.css( elem, "display" ) === "none" ) {
						jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[i];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = jQuery._data(elem, "olddisplay") || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				if ( this[i].style ) {
					var display = jQuery.css( this[i], "display" );

					if ( display !== "none" && !jQuery._data( this[i], "olddisplay" ) ) {
						jQuery._data( this[i], "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this[i].style ) {
					this[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed(speed, easing, callback);

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete, [ false ] );
		}

		return this[ optall.queue === false ? "each" : "queue" ](function() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			if ( optall.queue === false ) {
				jQuery._mark( this );
			}

			var opt = jQuery.extend({}, optall),
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				name, val, p,
				display, e,
				parts, start, end, unit;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {

				// property name normalization
				name = jQuery.camelCase( p );
				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
				}

				val = prop[name];

				if ( val === "hide" && hidden || val === "show" && !hidden ) {
					return opt.complete.call(this);
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height
					// animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {
						if ( !jQuery.support.inlineBlockNeedsLayout ) {
							this.style.display = "inline-block";

						} else {
							display = defaultDisplay(this.nodeName);

							// inline-level elements accept inline-block;
							// block-level elements need to be inline with layout
							if ( display === "inline" ) {
								this.style.display = "inline-block";

							} else {
								this.style.display = "inline";
								this.style.zoom = 1;
							}
						}
					}
				}

				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				opt.animatedProperties[name] = jQuery.isArray( val ) ?
					val[1]:
					opt.specialEasing && opt.specialEasing[name] || opt.easing || 'swing';
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {
				e = new jQuery.fx( this, opt, p );

				val = prop[p];

				if ( rfxtypes.test(val) ) {
					e[ val === "toggle" ? hidden ? "show" : "hide" : val ]();

				} else {
					parts = rfxnum.exec(val);
					start = e.cur();

					if ( parts ) {
						end = parseFloat( parts[2] );
						unit = parts[3] || ( jQuery.cssNumber[ name ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( this, p, (end || 1) + unit);
							start = ((end || 1) / e.cur()) * start;
							jQuery.style( this, p, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			}

			// For JS strict compliance
			return true;
		});
	},

	stop: function( clearQueue, gotoEnd ) {
		if ( clearQueue ) {
			this.queue([]);
		}

		this.each(function() {
			var timers = jQuery.timers,
				i = timers.length;
			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				jQuery._unmark( true, this );
			}
			// go in reverse order so anything added to the queue during the loop is ignored
			while ( i-- ) {
				if ( timers[i].elem === this ) {
					if (gotoEnd) {
						// force the next step to be the last
						timers[i](true);
					}

					timers.splice(i, 1);
				}
			}
		});

		// start the next in the queue if the last step wasn't forced
		if ( !gotoEnd ) {
			this.dequeue();
		}

		return this;
	}

});

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = jQuery.now() );
}

function clearFxNow() {
	fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show", 1),
	slideUp: genFx("hide", 1),
	slideToggle: genFx("toggle", 1),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

		// Queueing
		opt.old = opt.complete;
		opt.complete = function( noUnmark ) {
			if ( opt.queue !== false ) {
				jQuery.dequeue( this );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}

			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		(jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx,
			raf;

		this.startTime = fxNow || createFxNow();
		this.start = from;
		this.end = to;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );
		this.now = this.start;
		this.pos = this.state = 0;

		function t( gotoEnd ) {
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			// Use requestAnimationFrame instead of setInterval if available
			if ( requestAnimationFrame ) {
				timerId = 1;
				raf = function() {
					// When timerId gets set to null at any point, this stops
					if ( timerId ) {
						requestAnimationFrame( raf );
						fx.tick();
					}
				};
				requestAnimationFrame( raf );
			} else {
				timerId = setInterval( fx.tick, fx.interval );
			}
		}
	},

	// Simple 'show' function
	show: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any
		// flash of content
		this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom(this.cur(), 0);
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var t = fxNow || createFxNow(),
			done = true,
			elem = this.elem,
			options = this.options,
			i, n;

		if ( gotoEnd || t >= options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			options.animatedProperties[ this.prop ] = true;

			for ( i in options.animatedProperties ) {
				if ( options.animatedProperties[i] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

					jQuery.each( [ "", "X", "Y" ], function (index, value) {
						elem.style[ "overflow" + value ] = options.overflow[index];
					});
				}

				// Hide the element if the "hide" operation was done
				if ( options.hide ) {
					jQuery(elem).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( options.hide || options.show ) {
					for ( var p in options.animatedProperties ) {
						jQuery.style( elem, p, options.orig[p] );
					}
				}

				// Execute the complete function
				options.complete.call( elem );
			}

			return false;

		} else {
			// classical easing cannot be used with an Infinity duration
			if ( options.duration == Infinity ) {
				this.now = t;
			} else {
				n = t - this.startTime;

				this.state = n / options.duration;
				// Perform the easing function, defaults to swing
				this.pos = jQuery.easing[options.animatedProperties[this.prop]](this.state, n, 0, 1, options.duration);
				this.now = this.start + ((this.end - this.start) * this.pos);
			}
			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		var timers = jQuery.timers,
			i = timers.length;
		while ( i-- ) {
			if ( !timers[i]() ) {
				timers.splice(i, 1);
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var elem = jQuery( "<" + nodeName + ">" ).appendTo( "body" ),
			display = elem.css( "display" );

		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			document.body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake html
			// document to it, Webkit & Firefox won't allow reusing the iframe document
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( "<!doctype><html><body></body></html>" );
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = jQuery.css( elem, "display" );

			document.body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0], box;

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		try {
			box = elem.getBoundingClientRect();
		} catch(e) {}

		var doc = elem.ownerDocument,
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) {
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		}

		var body = doc.body,
			win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
			scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
			top  = box.top  + scrollTop  - clientTop,
			left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		jQuery.offset.initialize();

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {
	initialize: function() {
		var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( jQuery.css(body, "marginTop") ) || 0,
			html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

		jQuery.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

		container.innerHTML = html;
		body.insertBefore( container, body.firstChild );
		innerDiv = container.firstChild;
		checkDiv = innerDiv.firstChild;
		td = innerDiv.nextSibling.firstChild.firstChild;

		this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
		this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

		checkDiv.style.position = "fixed";
		checkDiv.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
		checkDiv.style.position = checkDiv.style.top = "";

		innerDiv.style.overflow = "hidden";
		innerDiv.style.position = "relative";

		this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

		this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

		body.removeChild( container );
		jQuery.offset.initialize = jQuery.noop;
	},

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		jQuery.offset.initialize();

		if ( jQuery.offset.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if (options.top != null) {
			props.top = (options.top - curOffset.top) + curTop;
		}
		if (options.left != null) {
			props.left = (options.left - curOffset.left) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({
	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) {
			elem = this[ 0 ];

			if ( !elem ) {
				return null;
			}

			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}

		// Set the scroll offset
		return this.each(function() {
			win = getWindow( this );

			if ( win ) {
				win.scrollTo(
					!i ? val : jQuery( win ).scrollLeft(),
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val;
			}
		});
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn["inner" + name] = function() {
		return this[0] ?
			parseFloat( jQuery.css( this[0], type, "padding" ) ) :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn["outer" + name] = function( margin ) {
		return this[0] ?
			parseFloat( jQuery.css( this[0], type, margin ? "margin" : "border" ) ) :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ];
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				elem.document.body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			var orig = jQuery.css( elem, type ),
				ret = parseFloat( orig );

			return jQuery.isNaN( ret ) ? orig : ret;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});


window.jQuery = window.$ = jQuery;
})(window);