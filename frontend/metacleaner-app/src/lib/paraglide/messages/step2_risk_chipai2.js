/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_Chipai2Inputs */

const en_step2_risk_chipai2 = /** @type {(inputs: Step2_Risk_Chipai2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`AI`)
};

const cs_step2_risk_chipai2 = /** @type {(inputs: Step2_Risk_Chipai2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`AI`)
};

/**
* | output |
* | --- |
* | "AI" |
*
* @param {Step2_Risk_Chipai2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_chipai2 = /** @type {((inputs?: Step2_Risk_Chipai2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Chipai2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_chipai2(inputs)
	return cs_step2_risk_chipai2(inputs)
});
export { step2_risk_chipai2 as "step2.risk.chipAI" }