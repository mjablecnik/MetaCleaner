/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_CriticalInputs */

const en_step2_risk_critical = /** @type {(inputs: Step2_Risk_CriticalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Critical`)
};

const cs_step2_risk_critical = /** @type {(inputs: Step2_Risk_CriticalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Kritické`)
};

/**
* | output |
* | --- |
* | "Critical" |
*
* @param {Step2_Risk_CriticalInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_critical = /** @type {((inputs?: Step2_Risk_CriticalInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_CriticalInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_critical(inputs)
	return cs_step2_risk_critical(inputs)
});
export { step2_risk_critical as "step2.risk.critical" }