/**
 * Pie Chart jQuery plugin 1.0
 * 
 * Copyright (c) 2014, AIWSolutions
 * License: GPL2
 * Project Website: http://wiki.aiwsolutions.net/UKKd5
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

jQuery.fn.pieChart = function(targetDiv, title) {
	var SVGNS = "http://www.w3.org/2000/svg";
	var MOVETO = 'M {0} {1} ';
	var LINETO = 'L {0} {1} ';
	var ARC = 'A {0} {1} {2} {3} {4} {5} {6} ';
	var source = $(this);
	var target = $(targetDiv);
	var data = [];
	var totalValue = 0;
	var chart;
	var svgWidth;
	var svgHeight;
	var centerX;
	var centerY;
	var pieRadius;
	var raiseLevel = 10;	
	
	function setSVGAttribute(element, attribute, value) {
		if (element !== undefined && attribute !== undefined && value !== undefined) {
			element.setAttributeNS(null, attribute, value);
		}
	}
	
	function svgText(text, index, x, y, className) {
		var item = document.createElementNS(SVGNS, 'text');
		setSVGAttribute(item, 'index', index);
		setSVGAttribute(item, 'x', x);
		setSVGAttribute(item, 'y', y);
		setSVGAttribute(item, 'class', className);
		item.textContent = text;
		return item;
	}
	
	function svgPath(command, className) {
		var path = document.createElementNS(SVGNS, 'path');
		setSVGAttribute(path, 'd', command);
		setSVGAttribute(path, 'class', className);
		return path;
	}
	
	function svgPieHighlight(element, raisen) {
		var index = $(element).attr('index');
		var pieElement = $('path.pie' + index)[0];
		var textElement = $('text[index="' + index + '"]')[0];
		var newPos = raisen ? getPositionAtAngle(0, 0, raiseLevel, pieElement.getAttribute('middleAngle')) : [0, 0];
		pieElement.setAttribute('transform', 'translate(' + newPos[0] + ' ' + newPos[1] + ')');
		textElement.setAttribute('transform', 'translate(' + newPos[0] + ' ' + newPos[1] + ')');		
	}
	
	function readData() {
		source.find('.pieChart').each(function() {
			var self = $(this);
			var pie = {
				'cssClass': self.attr('class'),
				'value': self.attr('value'),
				'title': self.text()
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
	
	function getArcCMD(x, y, radius, from, to) {
		var cmd = MOVETO.format(getPositionAtAngle(x, y, radius, from));
		var destination = getPositionAtAngle(x, y, radius, to);
		var largeArcFlag = (to - from) > 180 ? 1 : 0;
		cmd += ARC.format(radius, radius, 0, largeArcFlag, 1, destination[0], destination[1]);
		cmd += LINETO.format(x, y);
		cmd += 'Z';
		return cmd;
	}
	
	function renderElements() {
		if (title) {
			target.append('<div class="caption">' + title + '</div>');
		}
		chart = document.createElementNS(SVGNS, 'svg');
		target.append(chart);
		
		var legend = $('<ul class="legend"></ul>');
		$(data).each(function(index) {
			var legendItem = $('<li index="' + index + '"><span class="icon pie' + index + '"></span>' + this.title + 
					'</li>');
			legendItem.mouseenter(function() {
				svgPieHighlight(this, true);
			}).mouseleave(function() {
				svgPieHighlight(this, false);
			});
			legend.append(legendItem);
		});
		target.append(legend);
	}
	
	function calculateSize() {
		svgWidth = target.width();
		svgHeight = target.height() - $('.legend').height() - $('.caption').height() - 20;
		setSVGAttribute(chart, 'width', svgWidth);
		setSVGAttribute(chart, 'height', svgHeight);
		
		centerX = svgWidth / 2;
		centerY = svgHeight / 2;
		pieRadius = (svgWidth > svgHeight ? svgHeight : svgWidth) / 2 - raiseLevel;
	}
	
	function renderChart() {
		var count = 0;
		var startAngle = 0;
		$(data).each(function() {
			var angle = startAngle + 3.6 * this.percentage;
			var pie = svgPath(getArcCMD(centerX, centerY, pieRadius, startAngle, angle), this.cssClass + ' pie' + count);
			var middleAngle = startAngle + 1.8 * this.percentage;
			setSVGAttribute(pie, 'value', this.value);
			setSVGAttribute(pie, 'middleAngle', middleAngle);
			setSVGAttribute(pie, 'index', count);
			$(pie).mouseenter(function() {
				svgPieHighlight(this, true);
			});
			$(pie).mouseleave(function() {
				svgPieHighlight(this, false);
			});
			chart.appendChild(pie);
			
			var textPosition = getPositionAtAngle(centerX, centerY, pieRadius / 2, middleAngle);
			chart.appendChild(svgText(Math.round(this.percentage * 100) / 100 + '%', count,
						textPosition[0] - 20, textPosition[1], 'percentage'));
						
			
			count++;
			startAngle = angle;
		});
	}
	
	function render() {
		readData();
		renderElements();
		calculateSize();
		renderChart();
	}
	
	render();
}