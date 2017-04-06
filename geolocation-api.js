define(function(require,exports,module){    
    var jweixin = require("此处自定义weixinJSSDK");
    /**
     * 位置获取api，只是获取位置，不包含其他功能
     *
     * 优点：
     * 1、支持通过h5 geolocationApi 定位
     * 2、支持通过 微信 定位api 获取定位
     * 3、支持百度IP获取定位信息
     *
     * 当1、2都没有获取失败时，自动走ip定位
     *
     * 原理：
     * A：微信定位并获取坐标。A-：微信定位失败
     * B：H5定位并获取坐标。B-：H5定位失败
     * C：通过百度将坐标转换地址。C-：通过百度将坐标转换地址失败
     * D：通过百度IP坐标 D-：通过百度IP坐标失败
     *
     * A -> C -> success callback
     * A -> C- -> D success callback
     * A -> C- -> D- fail callback
     * 
     * A- -> D -> success callback
     * A- -> D- -> fail callback
     *
     * B -> C ->success callback
     * B -> C- -> D success callback
     * B -> C- -> D- fail callback
     * 
     * B- -> D -> success callback
     * B- -> D- -> fail callback
     *
     * 方法：
     * getCoords(resolve(coords, form), reject(error, form))     仅获取坐标。来源：h5或微信 
     * getLoaction(resolve(address, form), reject(error, form))   获取地址信息，将坐标通过百度api转换后的地址信息
     * 
     *
     * 依赖：
     * 百度坐标转换api
     * 百度坐标获取位置信息
     * 百度IP获取位置信息
     *
     * @author fengr@mysoft.com.cn
     * @param  {[type]} cfg [配置]
     * @return {[type]}     [description]
     */
    function geolocationApi(cfg) {
        'use strict';

        function isWXBrowser() {
            var ua = navigator.userAgent.toLowerCase();
            return ua.indexOf("micromessenger") != -1;
        }

        // 配置项
        var config = {
            timeout: 5000,                          // 获取过程中的超时时间，单位毫秒
            baiduAk: '',    // 百度ak
            weixinSDKSign: '',                      // 微信JSSDK Sign
            // isTransformBaiduCoords: true,           // 是否转换为百度坐标系。用于将微信或H5获取的坐标转换成百度坐标。可以不转，但位置偏差较大
            isAlwaysH5Api: false                    // 是否总是从h5 api获取。仅针对当微信获取失败时，是否再次启用h5 api获取位置
        }

        $.extend(config, cfg || {});

        var geolocationApi = {
            win: window,
            // 是否获取地址
            isLocation: false,
            // 成功
            resolve: function(coors, from) {
                console.log(coors)
            },
            // 失败
            reject: function(error, from) {
                console.log(error)
            },

            /**
             * @private
             * @param  {[type]} coords 通过设备获取的定位信息
             * @param  {[type]} from   api来源，可以是H5、weixin和baidu
             * @return {[type]}        [description]
             */
            _resolve: function(coords, from) {
                var me = this;

                // 是否获取的是地址
                if (me.isLocation) {
                    me.getFromBaidu(coords.latitude, coords.longitude);
                
                // 否则直接返回坐标
                } else {
                    me.resolve(coords, from);
                }
            },
            /**
             * @private
             * @param  {[type]} coords 通过设备获取的定位信息
             * @param  {[type]} from   api来源，可以是H5、weixin和baidu
             * @return {[type]}        [description]
             */
            _reject: function(error, from) {
                var me = this;

                // 如果来源是从微信，表示微信获取失败
                // 并且配置了isAlwaysH5Api，则再次从h5api获取位置
                if(from === 'weixin' && config.isAlwaysH5Api){
                    me.getFromH5();
                } else {
                    // 是否获取地址
                    // true 从ip获取
                    // false 失败回调
                    me.isLocation ? me.getFromBaiduIp() : me.reject(error, from);
                }                
            },
            /**
             * @private
             * @param  {[type]} resolve 成功回调
             * @param  {[type]} reject  失败回调
             * @return {[type]}        [description]
             */
            _getCoords: function(resolve, reject) {
                this.initParam(resolve, reject);

                if (isWXBrowser()) {
                    this.getFromWeixin();
                } else {
                    this.getFromH5();
                }
            },

            /**
             * 从h5 geolocation获取用户定位
             * 获取到的坐标为GPS
             * @return {[type]} [description]
             */
            getFromH5: function() {
                var api = this.win.navigator.geolocation,
                    me = this;
                if (!api) {
                    me._reject('geolocation is not supported in your broswer.', 'h5');
                    return;
                }

                api.getCurrentPosition(function(position) {
                    var coords = position.coords;

                    me._resolve(coords, 'h5');
                }, function(error) {
                    me._reject(error, 'h5');
                }, {
                    maximumAge: 120000, // 默认缓存时长为2分钟
                    timeout: config.timeout // 默认5s后超时
                });
            },

            /**
             * 从微信获取用户定位
             * 获取到的坐标为GPS
             * @return {[type]} [description]
             */
            getFromWeixin: function() {
                var me = this,
                    timeout,
                    initTimeout;

                if(config.weixinSDKSign && config.weixinSDKSign.appId) {
                    jweixin.init(config.weixinSDKSign, function (jweixin) {
                        clearTimeout(initTimeout);

                        jweixin.invoke("getLocation", {
                            success: function(res) {
                                me.isLocated = true;
                                me._resolve(res, 'weixin');
                            },
                            fail: function(res) {
                                clearTimeout(timeout);
                                me._reject(res, 'weixin');
                            },
                            cancel: function() {
                                clearTimeout(timeout);
                                me._reject('use cancel', 'weixin');
                            }
                        });

                        //5s接口还未返回，则定位失败
                        timeout = setTimeout(function() {
                            if (!me.isLocated) {
                                me._reject('timeout!', 'weixin');
                            }
                        }, config.timeout);
                    });

                    // 3s内如果weixinJSSDK授权信息没有问题，但初始化失败，那么直接触发错误回调
                    // 目的防止代码假死
                    initTimeout = setTimeout(function() {
                        me._reject('weixinJSSDK initialize fail!', 'weixin');
                    }, 3000);
                }else{                    
                    me._reject('weixin WxJSSDKSign get fail!', 'weixin');
                }
            },

            /**
             * 将GPS坐标转换成百度坐标
             * api: http://lbsyun.baidu.com/index.php?title=webapi/guide/changeposition#.E6.9C.8D.E5.8A.A1.E5.9C.B0.E5.9D.80
             * @param  {[type]}   longitude 经度
             * @param  {[type]}   latitude  纬度
             * @param  {Function} callback  获取到坐标后的回调
             * @return {[type]}             [description]
             */
            getTransformBaiduCoords: function(longitude, latitude, callback) {
                var me = this;
                var url = "//api.map.baidu.com/geoconv/v1/?ak=" + config.baiduAk +
                    "&coords=" + longitude + "," + latitude +
                    "&output=json";

                $.ajax({
                    type: "GET",
                    dataType: "jsonp",
                    url: url,
                    context: this,
                    timeout: config.timeout,
                    success: function(json) {
                        if (json && json.status * 1 === 0) {
                            var coords = json.result[0];

                            callback.call(me, coords.y, coords.x);
                        } else {
                            me._reject("转换失败", 'baidu');
                        }
                    },
                    error: function(xhr, textStatus) {
                        me._reject("转换失败" + textStatus, 'baidu');
                    }
                });
            },

            /**
             * 通过坐标，从百度获取具体位置
             * api: http://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-geocoding#.E9.80.86.E5.9C.B0.E7.90.86.E7.BC.96.E7.A0.81.E6.9C.8D.E5.8A.A1
             * @param  {[type]} latitude  纬度
             * @param  {[type]} longitude 经度
             * @return {[type]}           [description]
             */
            getFromBaidu: function(latitude, longitude) {
                var me = this;
                var url = "//api.map.baidu.com/geocoder/v2/?ak=" + config.baiduAk +
                    "&location=" + latitude + "," + longitude +
                    "&output=json" +
                    // 默认接收的是wgs84ll坐标(GPS)
                    "&coordtype=wgs84ll" +
                    "&pois=0";
                $.ajax({
                    type: "GET",
                    dataType: "jsonp",
                    url: url,
                    context: this,
                    timeout: config.timeout,
                    success: function(json) {
                        if (json && json.status * 1 === 0) {
                            me.resolve(json.result.addressComponent, 'baidu');
                        } else {
                            me._reject("定位失败", 'baidu');
                        }
                    },
                    error: function(xhr, textStatus) {
                        me._reject("定位失败：" + textStatus, 'baidu');
                    }
                });
            },


            /**
             * 通过百度IP位置api获取位置
             * api: http://lbsyun.baidu.com/index.php?title=webapi/ip-api
             * @return {[type]} [description]
             */
            getFromBaiduIp: function() {
                var me = this;
                var url = "//api.map.baidu.com/location/ip?ak=" + config.baiduAk +
                    "&coor=bd09ll";
                $.ajax({
                    type: "GET",
                    dataType: "jsonp",
                    url: url,
                    context: this,
                    timeout: config.timeout,
                    success: function(json) {
                        if (json && json.status * 1 === 0) {
                            me.resolve(json.content.address_detail, 'baidu');
                        } else {
                            me.reject("定位失败", 'baidu');
                        }
                    },
                    error: function(xhr, textStatus) {
                        me.reject("定位失败：" + textStatus, 'baidu');
                    }
                });
            },

            /**
             * 获取坐标
             * @param  {[type]} resolve 成功回调
             * @param  {[type]} reject  失败回调
             * @return {[type]}         [description]
             */
            getCoords: function(resolve, reject) {
                this.isLocation = false;
                this._getCoords(resolve, reject);
            },

            /**
             * 获取地址
             * 优先通过微信获取坐标，然后按顺序获取，只要有一个正确获取信息，则解决成功回调，否则，直到最后。没获取，则解决失败回调
             * 1、微信 -> baidu -> baiduIp
             * 2、h5 -> baidu -> baiduIp
             * @param  {[type]} resolve [description]
             * @param  {[type]} reject  [description]
             * @return {[type]}         [description]
             */
            getLocation: function(resolve, reject) {
                this.isLocation = true;
                this._getCoords(resolve, reject);
            },
            /**
             * 初始化回调参数
             * @param  {[type]} resolve 成功
             * @param  {[type]} reject  失败
             * @return {[type]}         [description]
             */
            initParam: function(resolve, reject) {
                if (typeof resolve === 'function') {
                    this.resolve = resolve;
                }

                if (typeof resolve === 'function') {
                    this.resolve = resolve;
                }
            }
        }

        return geolocationApi;
    }

    return {
        geolocationApi: geolocationApi
    }
})