/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_TimestampInputs */

const en_step2_risk_timestamp = /** @type {(inputs: Step2_Risk_TimestampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Timestamp`)
};

const cs_step2_risk_timestamp = /** @type {(inputs: Step2_Risk_TimestampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Časové razítko`)
};

/**
* | output |
* | --- |
* | "Timestamp" |
*
* @param {Step2_Risk_TimestampInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_timestamp = /** @type {((inputs?: Step2_Risk_TimestampInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_TimestampInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_timestamp(inputs)
	return cs_step2_risk_timestamp(inputs)
});
export { step2_risk_timestamp as "step2.risk.timestamp" }