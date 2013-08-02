/**
 * jQuery.flipsnap
 * 必須JS : jQuery / flipsnap.js
 * @version 0.2 : 作り始め
 * @author Yusuke.T
 * TODO : ●○○
 */
(function($) {

	$.flipsnap = function(element, options) {

		var defaults = {
			isIframe             : false,
			isNeededController   : false,
			pointer              : false,
			viewportClass 	     : '.viewport', //見えてる部分
			containerClass 	     : '.flipsnap', //横長になってる部分
			itemClass		     : '.item', //フリックするコンテンツ
			controllerClass      : '.controller', //コントローラー
			pointerClass         : '.pointer', //コントローラー
			displayingItemLength : 1,// 一度に表示するアイテム数
			moveDistance 	     : 1,// 一度に移動するアイテム数の数
			leadingIndex		 : 0, // 最初に移動する
			autoSlide            : false,
			slideInterval        : 3000,
			transitionDuration   : 500
		};

		var plugin = this;

		plugin.settings = $.extend({}, defaults, options);

		var $element = $(element),
			element = element;




		var isAndroid = (navigator.userAgent.indexOf('Android') != -1);
		var isAndroid2 = (navigator.userAgent.indexOf('Android 2') != -1);

		//element
		var $viewport 	= $element.find(plugin.settings.viewportClass);
		var $container	= $viewport.find(plugin.settings.containerClass);
		var $items      = $container.find(plugin.settings.itemClass);

		var itemLength  = $items.length; // アイテムの数


		plugin.init = function() {
			var windowWidth = $(window).width();
			var slideViewSize =	( windowWidth > $element.width() ) ? $element.width() : windowWidth;

			$viewport.width(slideViewSize);

			var itemMargin = (function (){
				var $item = $element.find(plugin.settings.itemClass);
				var marginLeft = parseInt( $item.css('margin-left').replace('px','') );
				var marginRight = parseInt( $item.css('margin-right').replace('px','') );
				return marginLeft + marginRight;
			})();

			// カスタマイズ不可
			this.sliderOptions = {
				distance: slideViewSize,
				disable3d : (isAndroid)
			};

			var itemWidth =  Math.round(
				(slideViewSize) / plugin.settings.displayingItemLength - itemMargin
			);


			// change DOM status
			$items.css({
				float: "left",
				width: itemWidth
			});

			$container.css({
				"width": itemWidth * itemLength + itemMargin * itemLength
			});

			plugin.needFlickUI = (itemLength > plugin.settings.displayingItemLength); //アイテム数が画面に表示予定のアイテム数より多いとUIが必要
			if(!plugin.needFlickUI){
				return;
			}

			var distance 	= Math.round( plugin.settings.moveDistance * (itemWidth + itemMargin) );

			var maxPoint 	= (function() {
				var i = itemLength;
				var d = plugin.settings.displayingItemLength;
				var m = plugin.settings.moveDistance;
				return Math.ceil( (i-d)/m );
			})();// 移動する回数

			plugin.flipSnapOptions = $.extend({},plugin.sliderOptions,{
				distance: distance,
				maxPoint: maxPoint,
				transitionDuration: plugin.settings.transitionDuration
			});
		};
		var hasController = false;

		plugin.makeController = function(){
			if(!hasController){
				$viewport.append(
					'<div class="'+ plugin.settings.controllerClass.replace('.','') +'">' +
						'<button class="prev">&laquo; 前へ</button>' +
						'<button class="next">次へ &raquo;</button>' +
					'</div>'
				);
				hasController = true;
			}

			var $next = $element.find('.next');
			var $prev = $element.find('.prev');

			function setControllerAbility(){
				$next.attr( 'disabled', !plugin.flipsnap.hasNext() );
				$prev.attr( 'disabled', !plugin.flipsnap.hasPrev() );
			}
			setControllerAbility();

			if(hasController){
				return;
			}

			var clickEventType = ( (document.ontouchstart!==null) ? 'click' : 'touchstart' );
			$next.on(clickEventType, function(){
				plugin.flipsnap.toNext();
			});

			$prev.on(clickEventType, function(){
				plugin.flipsnap.toPrev();
			});


			plugin.flipsnap.element.addEventListener('fspointmove', function() {
				setControllerAbility();
			}, false);

		};

		var hasPointer = false;

		plugin.makePointer = function(){
			if(!hasPointer){
				var $pointer = $('<div class="pointer" />');
				$pointer.html('<span></span>');

				$viewport.append($pointer);
				hasPointer = true;
			}
		};

		plugin.makeUI = function(options) {
			if(!plugin.needFlickUI){
				return;
			}

			if(plugin.flipsnap){
				plugin.flipsnap.init(
					$container.get(0),
					options
				);
			}else{
				plugin.flipsnap = new Flipsnap(
					$container.get(0),
					options
				);
			}
			if(plugin.settings.isNeededController){
				plugin.makeController();
			}


			function makePointerIfNeeded(){
				if(!plugin.settings.pointer){
					return;
				}


			}
			makePointerIfNeeded();

			plugin.flipsnap.moveToPoint(plugin.settings.leadingIndex);
		};

		plugin.init();
		plugin.makeUI(plugin.flipSnapOptions);


		(function triggerWindowWidthChange (){
			if(isAndroid2){return;}

			var windowSize = $(window).width();

			$(window).resize(function(){
				setTimeout( function(){
					if($(window).width() !== windowSize){
						windowSize = $(window).width();
						$element.trigger('widthChange');
					}
				}, 1000);
			});
		})();


		/**
		 * 自動スライド機能
		 * @param time {number} 自動スライドする待ち時間
		 */

		plugin.autoSlide = function(time){
			if(!plugin.settings.autoSlide){return}

			var $flipsnap = $(plugin.flipsnap.element); //$container かも

			var timerId;
			function setSlideTimer(){

				if( plugin.flipsnap.hasNext() ){
					plugin.flipsnap.toNext();
				} else {
					plugin.flipsnap.moveToPoint(0);
				}

				timerId = setTimeout( function(){
					setSlideTimer()
				}, time);


			}
			setSlideTimer();

			var reTimerId = setTimeout(function(){},0);
			$(window).on('scroll', function(){
				clearTimeout(timerId);
				clearTimeout(reTimerId);
				console.log('set reTimerId')
				reTimerId = setTimeout( function(){
					console.log('set timerId')
					timerId = setTimeout( function(){
						setSlideTimer()
					}, time);
				},200);
			});

			$flipsnap.on('fstouchstart', function(e){
				console.log('clearTimer')
				clearInterval(timer);
			});

			$flipsnap.on('fstouchend', function(e){
				setSlideTimer();
			});

		};
		plugin.autoSlide(plugin.settings.slideInterval);

		$element.on('widthChange', function(){
			console.log('rebuild');
			plugin.init();
			plugin.makeUI(plugin.flipSnapOptions);
		});


	};

	$.fn.flipsnap = function(options) {
		return this.each(function() {
			if (undefined == $(this).data('flipsnap')) {
				var plugin = new $.flipsnap(this, options);
				$(this).data('flipsnap', plugin);
			}
		});
	};

})(jQuery);
