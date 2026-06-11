/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_MediumInputs */

const en_step2_risk_medium = /** @type {(inputs: Step2_Risk_MediumInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Medium`)
};

const cs_step2_risk_medium = /** @type {(inputs: Step2_Risk_MediumInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Střední`)
};

/**
* | output |
* | --- |
* | "Medium" |
*
* @param {Step2_Risk_MediumInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_medium = /** @type {((inputs?: Step2_Risk_MediumInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_MediumInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_medium(inputs)
	return cs_step2_risk_medium(inputs)
});
export { step2_risk_medium as "step2.risk.medium" }