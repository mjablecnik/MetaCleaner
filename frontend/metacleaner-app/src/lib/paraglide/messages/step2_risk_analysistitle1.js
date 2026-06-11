/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_Analysistitle1Inputs */

const en_step2_risk_analysistitle1 = /** @type {(inputs: Step2_Risk_Analysistitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Risk analysis`)
};

const cs_step2_risk_analysistitle1 = /** @type {(inputs: Step2_Risk_Analysistitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Analýza rizik`)
};

/**
* | output |
* | --- |
* | "Risk analysis" |
*
* @param {Step2_Risk_Analysistitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_analysistitle1 = /** @type {((inputs?: Step2_Risk_Analysistitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Analysistitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_analysistitle1(inputs)
	return cs_step2_risk_analysistitle1(inputs)
});
export { step2_risk_analysistitle1 as "step2.risk.analysisTitle" }