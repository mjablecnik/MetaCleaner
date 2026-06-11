/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Badge_Errordesktop1Inputs */

const en_step4_badge_errordesktop1 = /** @type {(inputs: Step4_Badge_Errordesktop1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Processing error`)
};

const cs_step4_badge_errordesktop1 = /** @type {(inputs: Step4_Badge_Errordesktop1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Chyba zpracování`)
};

/**
* | output |
* | --- |
* | "Processing error" |
*
* @param {Step4_Badge_Errordesktop1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_badge_errordesktop1 = /** @type {((inputs?: Step4_Badge_Errordesktop1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Badge_Errordesktop1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_badge_errordesktop1(inputs)
	return cs_step4_badge_errordesktop1(inputs)
});
export { step4_badge_errordesktop1 as "step4.badge.errorDesktop" }