/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_LowInputs */

const en_step2_risk_low = /** @type {(inputs: Step2_Risk_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Low`)
};

const cs_step2_risk_low = /** @type {(inputs: Step2_Risk_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nízké`)
};

/**
* | output |
* | --- |
* | "Low" |
*
* @param {Step2_Risk_LowInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_low = /** @type {((inputs?: Step2_Risk_LowInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_LowInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_low(inputs)
	return cs_step2_risk_low(inputs)
});
export { step2_risk_low as "step2.risk.low" }