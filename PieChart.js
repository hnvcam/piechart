/**
 * Table Bar Chart jQuery plugin 1.0
 * 
 * Copyright (c) 2014, AIWSolutions
 * License: GPL2
 * Project Website: http://wiki.aiwsolutions.net/Snld9
 **/

// String.format
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		if (args[0] instanceof Array) {
			var array = args[0];
			return this.replace(/{(\d+)}/g, function(match, number) {
				return typeof array[number] != 'undefined' ? array[number] : match;
			});
		}
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match;
	    });
	};
}

jQuery.fn.pieChart = function(targetDiv) {
	var SVGNS = "http://www.w3.org/2000/svg";
	var MOVETO = 'M {0} {1} ';
	var LINETO = 'L {0} {1} ';
	var ARC = 'A {0} {1} {2} {3} {4} {5} {6} ';
	var source = $(this);
	var target = $(targetDiv);
	var svgWidth = target.width();
	var svgHeight = target.height();
	var raise = 10;
	var centerX = svgWidth / 2;
	var centerY = svgHeight / 2;
	var radius = svgWidth / 2 - raise;
	var data = [];
	var totalValue = 0;
	
	function setSVGAttribute(element, attribute, value) {
		if (element !== undefined && attribute !== undefined && value !== undefined) {
			element.setAttributeNS(null, attribute, value);
		}
	}
	
	function svgPath(command, className) {
		var path = document.createElementNS(SVGNS, 'path');
		setSVGAttribute(path, 'd', command);
		setSVGAttribute(path, 'class', className);
		return path;
	}
	
	function registerAnimation(anim) {
        var targets = getTargets(anim);
        var elAnimators = new Array();
        for(var i=0; i<targets.length ;i++) {
          var target = targets[i];
          var animator = new Animator(anim, target, i);
          animators.push(animator);
          elAnimators[i] = animator;
        }
        anim.animators = elAnimators;
        var id = anim.getAttribute("id");
        if (id)
          id2anim[id] = anim;
        for(var i=0; i<elAnimators.length ;i++)
          elAnimators[i].register();
	}
	
	function svgPieHighlight(pieElement, middleAngle) {
		var animate = document.createElementNS(SVGNS, 'animateMotion');
		setSVGAttribute(animate, 'path', MOVETO.format(0, 0) + 
			LINETO.format(getPositionAtAngle(0, 0, raise, middleAngle)));
		setSVGAttribute(animate, 'begin', '0s');
		setSVGAttribute(animate, 'dur', '200ms');
		setSVGAttribute(animate, 'fill', 'freeze');
		pieElement.appendChild(animate);
	}
	
	function readData() {
		source.find('.pieChart').each(function() {
			var self = $(this);
			var pie = {
				'cssClass': self.attr('class'),
				'value': self.attr('value')
			};
			data.push(pie);
			totalValue = totalValue + parseFloat(self.attr('value'));
		});
		$(data).each(function() {
			this.percentage = (this.value / totalValue) * 100;
		});
	}
	
	function getPositionAtAngle(x, y, radius, angle) {
		var radian = (angle - 90) * Math.PI / 180.0;
		var result = new Array();
		result.push(x + radius * Math.cos(radian));
		result.push(y + radius * Math.sin(radian));
		return result;
	}
	
	function getArcCMD(from, to) {
		var cmd = MOVETO.format(getPositionAtAngle(centerX, centerY, radius, from));
		var destination = getPositionAtAngle(centerX, centerY, radius, to);
		var largeArcFlag = (to - from) > 180 ? 1 : 0;
		cmd += ARC.format(radius, radius, 0, largeArcFlag, 1, destination[0], destination[1]);
		cmd += LINETO.format(centerX, centerY);
		cmd += 'Z';
		return cmd;
	}
	
	function render() {
		var chart = document.createElementNS(SVGNS, 'svg');
		setSVGAttribute(chart, 'width', svgWidth);
		setSVGAttribute(chart, 'height', svgHeight);
		target.append(chart);
		
		var count = 0;
		var startAngle = 0;
		$(data).each(function() {
			var angle = startAngle + 3.6 * this.percentage;
			var pie = svgPath(getArcCMD(startAngle, angle), this.cssClass + ' pie' + count);
			var middleAngle = startAngle + 1.8 * this.percentage;
			$(pie).mouseenter(function() {
				svgPieHighlight(pie, middleAngle);
			});
			$(pie).mouseleave(function() {
				$(this).empty();
			});
			chart.appendChild(pie);
			count++;
			startAngle = angle;
		});
	}
	
	readData();
	render();
	console.log(totalValue, data);
}