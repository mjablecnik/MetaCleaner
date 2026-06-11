/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_Cleanscore1Inputs */

const en_step2_risk_cleanscore1 = /** @type {(inputs: Step2_Risk_Cleanscore1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clean Score`)
};

const cs_step2_risk_cleanscore1 = /** @type {(inputs: Step2_Risk_Cleanscore1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clean Score`)
};

/**
* | output |
* | --- |
* | "Clean Score" |
*
* @param {Step2_Risk_Cleanscore1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_cleanscore1 = /** @type {((inputs?: Step2_Risk_Cleanscore1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Cleanscore1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_cleanscore1(inputs)
	return cs_step2_risk_cleanscore1(inputs)
});
export { step2_risk_cleanscore1 as "step2.risk.cleanScore" }