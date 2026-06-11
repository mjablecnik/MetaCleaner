/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Badge_Inprogressmobile2Inputs */

const en_step3_badge_inprogressmobile2 = /** @type {(inputs: Step3_Badge_Inprogressmobile2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`In progress...`)
};

const cs_step3_badge_inprogressmobile2 = /** @type {(inputs: Step3_Badge_Inprogressmobile2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Probíhá...`)
};

/**
* | output |
* | --- |
* | "In progress..." |
*
* @param {Step3_Badge_Inprogressmobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_badge_inprogressmobile2 = /** @type {((inputs?: Step3_Badge_Inprogressmobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Badge_Inprogressmobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_badge_inprogressmobile2(inputs)
	return cs_step3_badge_inprogressmobile2(inputs)
});
export { step3_badge_inprogressmobile2 as "step3.badge.inProgressMobile" }