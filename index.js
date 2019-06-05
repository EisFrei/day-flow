const SunriseSunset = require('sunrise-sunset-js');

const TYPE = {
	SUNRISE: 0,
	SUNSET: 1
};

class DayFlow {
	constructor(lat, lon, date = new Date()) {
		if (typeof lat !== 'number' || typeof lon !== 'number') {
			throw new Error('lat and lon have to be numbers');
		}
		this.lat = lat;
		this.lon = lon;
		this.date = date;
		this._calculate();
	}

	_getDateCycleChanges(date) {
		return [{
			date: SunriseSunset.getSunrise(this.lat, this.lon, date),
			type: TYPE.SUNRISE
		}, {
			date: SunriseSunset.getSunset(this.lat, this.lon, date),
			type: TYPE.SUNSET
		}];
	}

	_getAllCycleChanges() {
		const changes = [];
		for (let i = -1; i <= 1; i++) {
			let date = new Date(this.date);
			date.setDate(date.getDate() + i);
			Array.prototype.push.apply(changes, this._getDateCycleChanges(date));
		}
		return changes;
	}

	_calculate() {
		const cycleChanges = this._getAllCycleChanges();
		let pastChange = null;
		let futureChange = null;

		cycleChanges.forEach((cycleChange)=>{
			if (cycleChange.date <= this.date){
				pastChange = cycleChange;
			}
			if (futureChange === null && cycleChange.date > this.date){
				futureChange = cycleChange;
			}
		});

		this.isDay = pastChange.type === TYPE.SUNRISE;
		this.isNight = pastChange.type === TYPE.SUNSET;

		if (pastChange.type === TYPE.SUNRISE) {
			this.sunrise = pastChange.date;
			this.sunset = futureChange.date;
		} else {
			this.sunrise = futureChange.date;
			this.sunset = pastChange.date;
		}

		this.msSinceChange = this.date - pastChange.date;
		this.msUntilChange = futureChange.date - this.date;
		this.msCycleLength = futureChange.date - pastChange.date;
		this.cyclePercentage = this.msSinceChange / this.msCycleLength * 100;
	}
}

module.exports = DayFlow;