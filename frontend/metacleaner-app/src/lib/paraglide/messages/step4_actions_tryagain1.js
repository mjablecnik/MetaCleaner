/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Actions_Tryagain1Inputs */

const en_step4_actions_tryagain1 = /** @type {(inputs: Step4_Actions_Tryagain1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Try again`)
};

const cs_step4_actions_tryagain1 = /** @type {(inputs: Step4_Actions_Tryagain1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zkusit znovu`)
};

/**
* | output |
* | --- |
* | "Try again" |
*
* @param {Step4_Actions_Tryagain1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_actions_tryagain1 = /** @type {((inputs?: Step4_Actions_Tryagain1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Actions_Tryagain1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_actions_tryagain1(inputs)
	return cs_step4_actions_tryagain1(inputs)
});
export { step4_actions_tryagain1 as "step4.actions.tryAgain" }