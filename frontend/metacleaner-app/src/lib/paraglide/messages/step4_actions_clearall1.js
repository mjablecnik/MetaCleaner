/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Actions_Clearall1Inputs */

const en_step4_actions_clearall1 = /** @type {(inputs: Step4_Actions_Clearall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear all`)
};

const cs_step4_actions_clearall1 = /** @type {(inputs: Step4_Actions_Clearall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vymazat vše`)
};

/**
* | output |
* | --- |
* | "Clear all" |
*
* @param {Step4_Actions_Clearall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_actions_clearall1 = /** @type {((inputs?: Step4_Actions_Clearall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Actions_Clearall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_actions_clearall1(inputs)
	return cs_step4_actions_clearall1(inputs)
});
export { step4_actions_clearall1 as "step4.actions.clearAll" }