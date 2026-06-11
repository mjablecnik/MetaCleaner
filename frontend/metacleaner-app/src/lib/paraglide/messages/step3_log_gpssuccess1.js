/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step3_Log_Gpssuccess1Inputs */

const en_step3_log_gpssuccess1 = /** @type {(inputs: Step3_Log_Gpssuccess1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`GPS coordinates + ${i?.count} fields removed`)
};

const cs_step3_log_gpssuccess1 = /** @type {(inputs: Step3_Log_Gpssuccess1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`GPS souřadnice + ${i?.count} polí odstraněno`)
};

/**
* | output |
* | --- |
* | "GPS coordinates + {count} fields removed" |
*
* @param {Step3_Log_Gpssuccess1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_log_gpssuccess1 = /** @type {((inputs: Step3_Log_Gpssuccess1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Log_Gpssuccess1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_log_gpssuccess1(inputs)
	return cs_step3_log_gpssuccess1(inputs)
});
export { step3_log_gpssuccess1 as "step3.log.gpsSuccess" }