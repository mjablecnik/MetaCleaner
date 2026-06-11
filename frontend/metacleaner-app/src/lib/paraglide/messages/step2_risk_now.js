/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_NowInputs */

const en_step2_risk_now = /** @type {(inputs: Step2_Risk_NowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Now`)
};

const cs_step2_risk_now = /** @type {(inputs: Step2_Risk_NowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nyní`)
};

/**
* | output |
* | --- |
* | "Now" |
*
* @param {Step2_Risk_NowInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_now = /** @type {((inputs?: Step2_Risk_NowInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_NowInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_now(inputs)
	return cs_step2_risk_now(inputs)
});
export { step2_risk_now as "step2.risk.now" }