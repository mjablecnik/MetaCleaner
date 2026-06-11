/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Results_Gpsremoved1Inputs */

const en_step5_results_gpsremoved1 = /** @type {(inputs: Step5_Results_Gpsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS removed`)
};

const cs_step5_results_gpsremoved1 = /** @type {(inputs: Step5_Results_Gpsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS odstraněno`)
};

/**
* | output |
* | --- |
* | "GPS removed" |
*
* @param {Step5_Results_Gpsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_results_gpsremoved1 = /** @type {((inputs?: Step5_Results_Gpsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Results_Gpsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_results_gpsremoved1(inputs)
	return cs_step5_results_gpsremoved1(inputs)
});
export { step5_results_gpsremoved1 as "step5.results.gpsRemoved" }