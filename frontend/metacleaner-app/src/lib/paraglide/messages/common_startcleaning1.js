/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Startcleaning1Inputs */

const en_common_startcleaning1 = /** @type {(inputs: Common_Startcleaning1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Start cleaning`)
};

const cs_common_startcleaning1 = /** @type {(inputs: Common_Startcleaning1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Spustit čištění`)
};

/**
* | output |
* | --- |
* | "Start cleaning" |
*
* @param {Common_Startcleaning1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_startcleaning1 = /** @type {((inputs?: Common_Startcleaning1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Startcleaning1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_startcleaning1(inputs)
	return cs_common_startcleaning1(inputs)
});
export { common_startcleaning1 as "common.startCleaning" }