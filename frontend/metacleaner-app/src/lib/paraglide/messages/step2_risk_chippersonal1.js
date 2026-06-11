/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_Chippersonal1Inputs */

const en_step2_risk_chippersonal1 = /** @type {(inputs: Step2_Risk_Chippersonal1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personal`)
};

const cs_step2_risk_chippersonal1 = /** @type {(inputs: Step2_Risk_Chippersonal1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Osobní`)
};

/**
* | output |
* | --- |
* | "Personal" |
*
* @param {Step2_Risk_Chippersonal1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_chippersonal1 = /** @type {((inputs?: Step2_Risk_Chippersonal1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Chippersonal1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_chippersonal1(inputs)
	return cs_step2_risk_chippersonal1(inputs)
});
export { step2_risk_chippersonal1 as "step2.risk.chipPersonal" }