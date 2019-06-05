const SunriseSunset = require('sunrise-sunset-js');

const TYPE = {
	SUNRISE: 0,
	SUNSET: 1
};

/**
 * Helps determine the flow of the day/night cycle
 *
 * @class DayFlow
 * @author martin.freisen@gmail.com
 * @param {number} lat The geolocation's latitude.
 * @param {number} lon The geolocation's longitude.
 * @param {Date} date The date that the day/night cycle will correspond to.
 * @throws Will throw an error, if the parameters have the wrong type.
 * 
 */
class DayFlow {
	constructor(lat, lon, date = new Date()) {
		if (typeof lat !== 'number' || typeof lon !== 'number') {
			throw new Error('lat and lon have to be numbers');
		}
		
		if (!(date instanceof Date)) {
			throw new Error('date is not a date');
		}		
		/** 
		 * The geolocation's latitude.
		 * @member {number}
		 */
		this.lat = lat;

		/** 
		 * The geolocation's longitude.
		 * @member {number}
		 */
		this.lon = lon;

		/** 
		 * The date that the day/night cycle will correspond to.
		 * @member {Date}
		 */
		this.date = date;

		/** 
		 * True if date is in the day part of the cycle.
		 * @member {boolean}
		 */
		this.isDay = null;

		/** 
		 * True if date is in the night part of the cycle.
		 * @member {boolean}
		 */
		this.isNight = null;

		/** 
		 * Time of the sunrise.
		 * @member {Date}
		 */
		this.sunrise = null;

		/** 
		 * Time of the sunset.
		 * @member {Date}
		 */
		this.sunset = null;

		/** 
		 * Milliseconds since the last sunrise/sunset.
		 * @member {number}
		 */
		this.msSinceChange = null;

		/** 
		 * Milliseconds until the next sunrise/sunset.
		 * @member {number}
		 */
		this.msUntilChange = null;

		/** 
		 * Length of the current day/night in milliseconds
		 * @member {number}
		 */
		this.msCycleLength = null;

		/** 
		 * Percentage of the current day/night that has already passed
		 * @member {number}
		 */
		this.cyclePercentage = null;
		this._calculate();
	}

	/** 
	 * Used Internally. Gets the sunrise and sunset of a specified date.
	 * @method
	 * @returns {Object}
	 */
	_getDateCycleChanges(date) {
		return [{
			date: SunriseSunset.getSunrise(this.lat, this.lon, date),
			type: TYPE.SUNRISE
		}, {
			date: SunriseSunset.getSunset(this.lat, this.lon, date),
			type: TYPE.SUNSET
		}];
	}

	/** 
	 * Used Internally. Gets a list of sunrises and sunsets of the set date and the neighboring dates.
	 * @method
	 * @returns {Array}
	 */
	_getAllCycleChanges() {
		const changes = [];
		for (let i = -1; i <= 1; i++) {
			let date = new Date(this.date);
			date.setDate(date.getDate() + i);
			Array.prototype.push.apply(changes, this._getDateCycleChanges(date));
		}
		return changes;
	}

	/** 
	 * Used internally. Calculates all of the member variables.
	 * @method
	 */
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

		if (this.isDay) {
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