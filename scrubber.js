const fs = require('fs');

const d3 = require('d3');

class Scrubber {
	constructor() {
		this.rawData = d3.csvParse(
			fs.readFileSync('./shootings.csv').toString()
		);
	}
	get data() {
		let yearMap = {};
		this.rawData.forEach(d => {
			yearMap[d.year] = yearMap[d.year]
				? yearMap[d.year].concat([d])
				: [d];
		});
		const yearlyData = Object.keys(yearMap)
			.sort((a, b) => {
				return a > b ? 1 : -1;
			})
			.map(d => {
				return yearMap[d];
			});
		let countyMap = {};
		this.rawData.forEach(d => {
			countyMap[d.county_fips] = countyMap[d.county_fips]
				? countyMap[d.county_fips].concat([d])
				: [d];
		});
		const countyData = Object.keys(countyMap).map(d => {
			return countyMap[d];
		});
		return {
			county: countyData,
			countyMap: countyMap,
			rawData: this.rawData,
			yearly: yearlyData,
			yearMap: yearMap,
		};
	}
}

module.exports = Scrubber;
