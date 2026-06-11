/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_TitleInputs */

const en_step2_risk_title = /** @type {(inputs: Step2_Risk_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Risk Scanner`)
};

const cs_step2_risk_title = /** @type {(inputs: Step2_Risk_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Risk Scanner`)
};

/**
* | output |
* | --- |
* | "Risk Scanner" |
*
* @param {Step2_Risk_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_title = /** @type {((inputs?: Step2_Risk_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_title(inputs)
	return cs_step2_risk_title(inputs)
});
export { step2_risk_title as "step2.risk.title" }