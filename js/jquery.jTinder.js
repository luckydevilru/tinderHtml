;(function tndr($, window, document, undefined) {
	var pluginName = "jTinder",
		defaults = {
			onDislike: null,
			onLike: null,
			onSuperLike: null,
			animationRevertSpeed: 300,
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

	// return vklvikl;

	function Plugin(element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init(element);		
	}



	Plugin.prototype = {


		init: function (element) {

			container = $(">ul", element);
			panes = $(">ul>li", element);
			pane_width = container.width();
			pane_height = container.height();
			pane_count = panes.length;
			get_count = $.cookie('current_pane');
			$that = this;

			if (get_count==undefined){
				current_pane = container.index(panes.find('.active'))+1;
			}else if (pane_count <= get_count) { // NO SLIDES
				current_pane = container.index(panes.find('.active'))+1;
			}else{
				current_pane = get_count;
			}

			$(element).bind('touchstart mousedown', this.handler);
			$(element).bind('touchmove mousemove', this.handler);
			$(element).bind('touchend mouseup', this.handler);

		},

		showPane: function (index) {
			panes.eq(current_pane).removeClass('active');
			panes.eq(current_pane).find('.like, .dislike, .superlike').css('opacity','0');
			current_pane = index;
			$.cookie('current_pane', current_pane);
			panes.eq(current_pane).addClass('active').attr('style','');
			if (pane_count < current_pane+1) { // LAST SLIDE. RESTART 
				return this.showPane('0');
			}
		},

		next: function () {
			return this.showPane(parseInt(current_pane) + parseInt(1));
		},

		dislike: function() {
			if ($.cookie('close_button')=="0") {
			panes.eq(current_pane).animate({"transform": "translate(-" + (pane_width*2) + "px," + (pane_width/6) + "px) rotate(-60deg)"}, $that.settings.animationSpeed, function () {
				if($that.settings.onDislike) {
					$that.settings.onDislike(panes.eq(current_pane));
				}

					panes.eq(current_pane).find('.superlike').css('opacity','1');
					$that.next();
					console.log('superlike');
			});
			}
		},

		like: function() {
				if ($.cookie('close_button')=="0") {
			panes.eq(current_pane).animate({"transform": "translate(" + (pane_width*2) + "px," + (pane_width/6) + "px) rotate(60deg)"}, $that.settings.animationSpeed, function () {
				if($that.settings.onLike) {
					$that.settings.onLike(panes.eq(current_pane));
				}

					panes.eq(current_pane).find('.like').css('opacity','1');
					$that.next();
					console.log('like');
			});
				}
		},

		superlike: function() {
				if ($.cookie('close_button')=="0") {
			panes.eq(current_pane).animate({"transform": "translate(0px," + (-pane_width*2) + "px, 0px) rotate(0deg)"}, $that.settings.animationSpeed, function () {
				if($that.settings.onSuperLike) {
					$that.settings.onSuperLike(panes.eq(current_pane));
				}

					panes.eq(current_pane).find('.superlike').css('opacity','1');
					$that.next();
					console.log('superlike');
			});
				}
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
 
						// console.log('opa2:'+opa2);
						opa = opa/2;
						opa2 = opa2/2;

						if(opa > 1.0) {
							opa = 1.0;
						}
						if(opa2 > 1.0) {
							opa2 = 1.0;
						}
							// console.log('posX:'+posX);
							// console.log('posY:'+posY);
							// console.log('deltaY:'+deltaY);
							// console.log('opa2:'+opa2);

						if (posY < -100) { //for superlike 

							panes.eq(current_pane).find($that.settings.superlikeSelector).css('opacity', opa2);
							panes.eq(current_pane).find($that.settings.dislikeSelector).css('opacity', 0);
							panes.eq(current_pane).find($that.settings.likeSelector).css('opacity', 0);

						}else if (posX >= 30) {

							panes.eq(current_pane).find($that.settings.likeSelector).css('opacity', opa);
							panes.eq(current_pane).find($that.settings.dislikeSelector).css('opacity', 0);
							panes.eq(current_pane).find($that.settings.superlikeSelector).css('opacity', 0);

						} else if (posX < -30) {

							panes.eq(current_pane).find($that.settings.dislikeSelector).css('opacity', opa);
							panes.eq(current_pane).find($that.settings.likeSelector).css('opacity', 0);
							panes.eq(current_pane).find($that.settings.superlikeSelector).css('opacity', 0);
						
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
					
					// console.log('opa2:'+opa2);
					// console.log('opa:'+opa);

					// console.log('posX:'+posX);
					// console.log('posY:'+posY);

					if (opa >= 1 || opa2 > 1.5 ) { 
						if (posY < -100) {
								if ($.cookie('close_button')=="0") {
							panes.eq(current_pane).animate({"transform": "translate(0px, -" + (2*(posY + pane_height)) + "px) rotate(0deg)"}, $that.settings.animationSpeed, function () {
							
								if($that.settings.onSuperLike) {
									$that.settings.onSuperLike(panes.eq(current_pane));
								}
									panes.eq(current_pane).find('.superlike').css('opacity','1');
									$that.next();
									console.log('superlike');
							});
								}
						}else if (posY > 0 && deltaX < 120 && deltaX > -120) {
							console.log('deltaX:'+deltaX);
					
							panes.eq(current_pane).animate({"transform": "translate3d(0px,0px,0px) rotate(0deg)"}, $that.settings.animationRevertSpeed);
							panes.eq(current_pane).find($that.settings.likeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
							panes.eq(current_pane).find($that.settings.dislikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
							panes.eq(current_pane).find($that.settings.superlikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
						
						}else if (posX > 30){

								if ($.cookie('close_button')=="0") {
							panes.eq(current_pane).animate({"transform": "translate(" + (pane_width*2) + "px," + (posY) + "px) rotate(60deg)"}, $that.settings.animationSpeed, function () {
								if($that.settings.onLike) {
									$that.settings.onLike(panes.eq(current_pane));
								}
									panes.eq(current_pane).find('.like').css('opacity','1');
									$that.next();
									console.log('like');
							});
								}
						} else {
								if ($.cookie('close_button')=="0") {
							panes.eq(current_pane).animate({"transform": "translate(-" + (pane_width*2) + "px," + (posY) + "px) rotate(-60deg)"}, $that.settings.animationSpeed, function () {
								if($that.settings.onDislike) {
									$that.settings.onDislike(panes.eq(current_pane));
								}
									panes.eq(current_pane).find('.dislike').css('opacity','1');
									$that.next();
									console.log('dislike');
							});
								}
						}
					} else {
						lastPosX = 0;
						lastPosY = 0;
						 
							panes.eq(current_pane).animate({"transform": "translate3d(0px,0px,0px) rotate(0deg)"}, $that.settings.animationRevertSpeed);
							panes.eq(current_pane).find($that.settings.likeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
							panes.eq(current_pane).find($that.settings.dislikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
							panes.eq(current_pane).find($that.settings.superlikeSelector).animate({"opacity": 0}, $that.settings.animationRevertSpeed);
						
					}

					break;
			}
		}
	};

 
	$.fn[ pluginName ] = function (options) {
		this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
			
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));

			
			}else if ($.isFunction(Plugin.prototype[options])) {

				$.data(this, 'plugin_' + pluginName)[options]();

		    }
		});

		return this;
	};


})(jQuery, window, document);
