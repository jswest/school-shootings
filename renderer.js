const d3 = require('d3');
const d3g = require('d3-geo');
const topojson = require('topojson-client');

const us = require('./node_modules/us-atlas/us/10m.json');

class Renderer {
	constructor(canvas, context, data, height, width) {
		this.canvas = canvas;
		this.context = context;
		this.data = data;
		this.height = height;
		this.width = width;
	}

	get creditText() {
		return 'Data from The Washington Post | visualization by John West | CC BY-NC-SA 4.0'.toUpperCase();
	}

	get colors() {
		return {
			black: 'rgb(50,40,30)',
			blue: 'rgb(0,0,200)',
			grey: 'rgb(100,90,80)',
			white: 'rgb(240,245,250)',
		};
	}

	get lineWidths() {
		return {
			county: 0.5,
			state: 1,
		};
	}

	get opacity() {
		return d3
			.scaleLinear()
			.domain(d3.extent(this.data.county, d => d.length))
			.range([0.1, 1]);
	}

	get path() {
		return d3g
			.geoPath()
			.projection(
				d3g
					.geoIdentity()
					.translate([this.sizes.padding, this.sizes.padding])
					.scale(2)
			)
			.context(this.context);
	}

	get sizes() {
		return {
			height: this.height,
			padding: 20 * 2,
			width: this.width,
		};
	}

	renderBackground() {
		this.context.fillStyle = this.colors.black;
		this.context.rect(0, 0, this.sizes.width, this.sizes.height);
		this.context.fill();
	}

	renderBlankCounties() {
		// Render the county areas.
		this.context.fillStyle = this.colors.grey;
		this.context.beginPath();
		this.path(topojson.feature(us, us.objects.counties));
		this.context.fill();
		// Render the county strokes.
		this.context.strokeStyle = this.colors.black;
		this.context.lineWidth = this.lineWidths.county;
		this.context.beginPath();
		this.path(topojson.mesh(us, us.objects.counties));
		this.context.stroke();
	}

	renderBlankStates() {
		this.context.strokeStyle = this.colors.black;
		this.context.lineWidth = this.lineWidths.state;
		this.context.beginPath();
		this.path(topojson.mesh(us, us.objects.states));
		this.context.stroke();
	}

	renderCreditText() {
		this.context.font = '20px Futura';
		this.context.fillStyle = this.colors.white;
		this.context.textAlign = 'right';
		this.context.fillText(
			this.creditText,
			this.sizes.width - 20,
			this.sizes.height - 20
		);
	}

	renderHeaderText(text) {
		this.context.font = '80px Futura';
		this.context.fillStyle = this.colors.white;
		this.context.textAlign = 'center';
		this.context.fillText(text, this.sizes.width / 2, 90);
	}

	renderLegend() {
		for (let i = 0; i < 5; i++) {
			let width = 200 / 5;
			let opacity = 0.1 + 0.9 / 5 * i;
			this.context.fillStyle = 'rgba(0,0,200,' + opacity + ')';
			this.context.fillRect(
				20 + width * i,
				this.sizes.height - 40,
				width,
				20
			);
		}
		this.context.font = '20px Futura';
		this.context.fillStyle = this.colors.white;
		this.context.textAlign = 'left';
		this.context.fillText('FEWER', 20, this.sizes.height - 45);
		this.context.textAlign = 'right';
		this.context.fillText('MORE', 220, this.sizes.height - 45);
	}

	renderYearData(data) {
		data.forEach(d => {
			this.context.fillStyle = this.colors.blue;
			this.context.beginPath();
			let geometries = us.objects.counties.geometries.filter(
				c => c.id === d.county_fips
			);
			let counties = Object.assign({}, us.objects.counties);
			counties.geometries = geometries;
			this.path(topojson.feature(us, counties));
			this.context.globalAlpha = this.opacity(
				data.filter(yd => yd.county_fips === d.county_fips).length
			);
			this.context.fill();
		});
		this.context.globalAlpha = 1;
	}
}

module.exports = Renderer;
