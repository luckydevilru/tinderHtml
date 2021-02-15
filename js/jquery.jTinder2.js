(function ($, window, document, undefined) {
	var pluginName = "jTinder",
		defaults = {
			onDislike: null,
			onLike: null,
			onSuperLike: null,
			destroy: false,
			animationRevertSpeed: 200,
			animationSpeed: 400,
			threshold: 1,
			likeSelector: '.like',
			dislikeSelector: '.dislike',
			superlikeSelector: '.superlike'
		};

	var container = null;
	var panes = null;
	var $that = null;
	var xStart = 0;
	var yStart = 0;
	var touchStart = false;
	var posX = 0, posY = 0, lastPosX = 0, lastPosY = 0, pane_width = 0, pane_count = 0, current_pane = 0;
	
	var vklvikl = defaults['destroy'];


	// return vklvikl;

	function Plugin(element, options) {

		console.log('plugin');
		this.element = element;
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init(element);	

	}



	Plugin.prototype = {


		init: function (element,destroy,state) {

			container = $(">ul", element);
			panes = $(">ul>li", element);
			pane_width = container.width();
			pane_height = container.height();
			pane_count = panes.length;
			current_pane = panes.length - 1;
			$that = this;

			var ws = destroy;

			$(element).bind('touchstart mousedown', this.handler, ws);
			$(element).bind('touchmove mousemove', this.handler, ws);
			$(element).bind('touchend mouseup', this.handler, ws);
			console.log('destroy state:'+ws);
		     
		},

		showPane: function (index) {
			panes.eq(current_pane).hide();
			current_pane = index;
		},

		next: function () {
			return this.showPane(current_pane);
		},

		dislike: function() {
			panes.eq(current_pane).animate({"transform": "translate(-" + (pane_width*2) + "px," + (pane_width/6) + "px) rotate(-60deg)"}, $that.settings.animationSpeed, function () {
				if($that.settings.onDislike) {
					$that.settings.onDislike(panes.eq(current_pane));
				}
				$that.next();
			});
		},

		like: function() {
			panes.eq(current_pane).animate({"transform": "translate(" + (pane_width*2) + "px," + (pane_width/6) + "px) rotate(60deg)"}, $that.settings.animationSpeed, function () {
				if($that.settings.onLike) {
					$that.settings.onLike(panes.eq(current_pane));
				}
				$that.next();
			});
		},

		destroy: function(element) {

		},

		rebuild: function() {
			console.log('rebuild-plugin')
			// $('#id2').trigger('click');
		},

		superlike: function() {
			panes.eq(current_pane).animate({"transform": "translate(0px," + (-pane_width*2) + "px, 0px) rotate(0deg)"}, $that.settings.animationSpeed, function () {
				if($that.settings.onSuperLike) {
					$that.settings.onSuperLike(panes.eq(current_pane));
				}
				$that.next();
			});
		},

		handler: function (ev) {
			ev.preventDefault();
			
 				switch (ev.type) {
				case 'touchstart':
					if(touchStart === false) {
						touchStart = true;
						xStart = ev.originalEvent.touches[0].pageX;
						yStart = ev.originalEvent.touches[0].pageY;

					}
				case 'mousedown':
					if(touchStart === false) {
						touchStart = true;
						xStart = ev.pageX;
						yStart = ev.pageY;
					}
				case 'mousemove':
				case 'touchmove':
					if(touchStart === true) {
						var pageX = typeof ev.pageX == 'undefined' ? ev.originalEvent.touches[0].pageX : ev.pageX;
						var pageY = typeof ev.pageY == 'undefined' ? ev.originalEvent.touches[0].pageY : ev.pageY;
						var deltaX = parseInt(pageX) - parseInt(xStart);
						var deltaY = parseInt(pageY) - parseInt(yStart);
						var percent = ((100 / pane_width) * deltaX) / pane_count;
						posX = deltaX + lastPosX;
						posY = deltaY + lastPosY;

						panes.eq(current_pane).css("transform", "translate(" + posX + "px," + posY + "px) rotate(" + (percent / 2) + "deg)");

						var opa = (Math.abs(deltaX) / $that.settings.threshold) / 100 + 0.2;
						var opa2 = (Math.abs(deltaY) / $that.settings.threshold) / 100 + 0.2;

						if(opa > 1.0) {
							opa = 1.0;
						}
						if(opa2 > 1.0) {
							opa2 = 1.0;
						}
						if (posX >= 50) {
							panes.eq(current_pane).find($that.settings.likeSelector).css('opacity', opa);
							panes.eq(current_pane).find($that.settings.dislikeSelector).css('opacity', 0);
							panes.eq(current_pane).find($that.settings.superlikeSelector).css('opacity', 0);
						} else if (posX < -50) {

							panes.eq(current_pane).find($that.settings.dislikeSelector).css('opacity', opa);
							panes.eq(current_pane).find($that.settings.likeSelector).css('opacity', 0);
							panes.eq(current_pane).find($that.settings.superlikeSelector).css('opacity', 0);
						}
						if (deltaY < -150) { //for superlike 
							panes.eq(current_pane).find($that.settings.superlikeSelector).css('opacity', opa2);
							panes.eq(current_pane).find($that.settings.dislikeSelector).css('opacity', 0);
							panes.eq(current_pane).find($that.settings.likeSelector).css('opacity', 0);
						}
					}
					break;
				case 'mouseup':
				case 'touchend':
					touchStart = false;
					var pageX = (typeof ev.pageX == 'undefined') ? ev.originalEvent.changedTouches[0].pageX : ev.pageX;
					var pageY = (typeof ev.pageY == 'undefined') ? ev.originalEvent.changedTouches[0].pageY : ev.pageY;
					var deltaX = parseInt(pageX) - parseInt(xStart);
					var deltaY = parseInt(pageY) - parseInt(yStart);
					var percent = ((100 / pane_width) * deltaX) / pane_count;

					posX = deltaX + lastPosX;
					posY = deltaY + lastPosY;
					var opa = Math.abs((Math.abs(deltaX) / $that.settings.threshold) / 100 + 0.2);
					var opa2 = Math.abs((Math.abs(deltaY) / $that.settings.threshold) / 100 + 0.2);
					 
					if (opa2 >= 1) { // superlike next slide
						if (posY < -150) {
							panes.eq(current_pane).animate({"transform": "translate(0px," - (2*(posY + pane_height)) + "px) rotate(0deg)"}, $that.settings.animationSpeed, function () {
							
								if($that.settings.onSuperLike) {
									$that.settings.onSuperLike(panes.eq(current_pane));
								}
								$that.next();
							});
						}
					} else {
						lastPosX = 0;
						lastPosY = 0;
						if (posY > 150 ) {panes.eq(current_pane).animate({"transform": "translate3d(0px,0px,0px) rotate(0deg)"}, $that.settings.animationRevertSpeed);}
						panes.eq(current_pane).find($that.settings.likeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
						panes.eq(current_pane).find($that.settings.dislikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
						panes.eq(current_pane).find($that.settings.superlikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
					}

					if (opa >= 1) {
						if (posX > 50) {
							panes.eq(current_pane).animate({"transform": "translate(" + (pane_width*2) + "px," + (posY) + "px) rotate(60deg)"}, $that.settings.animationSpeed, function () {
								if($that.settings.onLike) {
									$that.settings.onLike(panes.eq(current_pane));
								}
								console.log('в поисках слайда:'+$that.next());
								$that.next();
							});
						} else {
							panes.eq(current_pane).animate({"transform": "translate(-" + (pane_width*2) + "px," + (posY) + "px) rotate(-60deg)"}, $that.settings.animationSpeed, function () {
								if($that.settings.onDislike) {
									$that.settings.onDislike(panes.eq(current_pane));
								}
								$that.next();
							});
						}
					} else {
						lastPosX = 0;
						lastPosY = 0;
						
						if (posX < 50) {panes.eq(current_pane).animate({"transform": "translate3d(0px,0px,0px) rotate(0deg)"}, $that.settings.animationRevertSpeed);}
						panes.eq(current_pane).find($that.settings.likeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
						panes.eq(current_pane).find($that.settings.dislikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
						panes.eq(current_pane).find($that.settings.superlikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
					}

					break;
			}
		}
	};

	console.log('destroy:'+defaults['destroy']);
 
	$.fn[ pluginName ] = function (options) {
		this.each(function () { 
			if (!$.data(this, "plugin_" + pluginName)) {
			
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			
			}else if (defaults['destroy']==true) {

				$.data(this, "plugin_" + pluginName, new Plugin(this, options));				

			}else if ($.isFunction(Plugin.prototype[options])) {

				$.data(this, 'plugin_' + pluginName)[options]();

		    }
		});

		return this;
	};
})(jQuery, window, document);
