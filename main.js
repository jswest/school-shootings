const fs = require('fs');

const Canvas = require('canvas');
const GIFEncoder = require('gifencoder');

const Renderer = require('./renderer');
const Scrubber = require('./scrubber');

const dataScrubber = new Scrubber();
const data = dataScrubber.data;

const width = 1000 * 2;
const height = 640 * 2;

const encoder = new GIFEncoder(width, height);
encoder.createReadStream().pipe(fs.createWriteStream('./school-shootings.gif'));
encoder.start();
encoder.setRepeat(0); // Repeat the GIF.
encoder.setDelay(1000); // Delay 1 second between slides.
encoder.setQuality(100); // Highest possible quality.

const createStartingFrame = () => {
	console.log(0);
	const canvas = new Canvas(width, height);
	const context = canvas.getContext('2d');
	const renderer = new Renderer(canvas, context, data, height, width);
	renderer.renderBackground();
	renderer.renderBlankCounties();
	renderer.renderBlankStates();
	renderer.renderHeaderText('SCHOOL SHOOTINGS');
	renderer.renderCreditText();
	renderer.renderLegend();
	encoder.addFrame(context);
};

const duplicateFinalFrame = () => {
	let yearData = [];
	for (let i = 0; i < data.yearly.length - 1; i++) {
		yearData = yearData.concat(data.yearly[i]);
	}
	for (let i = 0; i < 2; i++) {
		console.log(data.yearly.length + i + 1);
		const canvas = new Canvas(width, height);
		const context = canvas.getContext('2d');
		const renderer = new Renderer(canvas, context, data, height, width);
		renderer.renderBackground();
		renderer.renderBlankCounties();
		renderer.renderBlankStates();
		renderer.renderYearData(yearData);
		renderer.renderHeaderText(
			'SCHOOL SHOOTINGS FROM ' +
				Object.keys(data.yearMap)[0] +
				' TO ' +
				Object.keys(data.yearMap)[Object.keys(data.yearMap).length - 1]
		);
		renderer.renderCreditText();
		renderer.renderLegend();
		encoder.addFrame(context);
	}
};

createStartingFrame();
data.yearly.forEach((yearData, yearIndex) => {
	console.log(yearIndex + 1);
	for (let i = 0; i < yearIndex; i++) {
		yearData = yearData.concat(data.yearly[i]);
	}
	for (let i = 0; i < 2; i++) {
		const canvas = new Canvas(width, height);
		const context = canvas.getContext('2d');
		const renderer = new Renderer(canvas, context, data, height, width);
		renderer.renderBackground();
		renderer.renderBlankCounties();
		renderer.renderBlankStates();
		renderer.renderYearData(yearData);
		let text =
			yearIndex === 0
				? 'SCHOOL SHOOTINGS IN ' + Object.keys(data.yearMap)[yearIndex]
				: 'SCHOOL SHOOTINGS FROM ' +
					Object.keys(data.yearMap)[0] +
					' TO ' +
					Object.keys(data.yearMap)[yearIndex];
		renderer.renderHeaderText(text);
		renderer.renderCreditText();
		renderer.renderLegend();
		encoder.addFrame(context);
	}
});
duplicateFinalFrame();
encoder.finish();
