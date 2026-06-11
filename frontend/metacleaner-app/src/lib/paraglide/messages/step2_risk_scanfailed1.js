/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_Scanfailed1Inputs */

const en_step2_risk_scanfailed1 = /** @type {(inputs: Step2_Risk_Scanfailed1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Scanning failed`)
};

const cs_step2_risk_scanfailed1 = /** @type {(inputs: Step2_Risk_Scanfailed1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skenování selhalo`)
};

/**
* | output |
* | --- |
* | "Scanning failed" |
*
* @param {Step2_Risk_Scanfailed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_scanfailed1 = /** @type {((inputs?: Step2_Risk_Scanfailed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Scanfailed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_scanfailed1(inputs)
	return cs_step2_risk_scanfailed1(inputs)
});
export { step2_risk_scanfailed1 as "step2.risk.scanFailed" }