/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_HighInputs */

const en_step2_risk_high = /** @type {(inputs: Step2_Risk_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`High`)
};

const cs_step2_risk_high = /** @type {(inputs: Step2_Risk_HighInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vysoké`)
};

/**
* | output |
* | --- |
* | "High" |
*
* @param {Step2_Risk_HighInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_high = /** @type {((inputs?: Step2_Risk_HighInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_HighInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_high(inputs)
	return cs_step2_risk_high(inputs)
});
export { step2_risk_high as "step2.risk.high" }