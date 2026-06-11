/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_Reducepre1Inputs */

const en_step2_risk_reducepre1 = /** @type {(inputs: Step2_Risk_Reducepre1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Start cleaning and`)
};

const cs_step2_risk_reducepre1 = /** @type {(inputs: Step2_Risk_Reducepre1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Spusťte čištění a`)
};

/**
* | output |
* | --- |
* | "Start cleaning and" |
*
* @param {Step2_Risk_Reducepre1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_reducepre1 = /** @type {((inputs?: Step2_Risk_Reducepre1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Reducepre1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_reducepre1(inputs)
	return cs_step2_risk_reducepre1(inputs)
});
export { step2_risk_reducepre1 as "step2.risk.reducePre" }