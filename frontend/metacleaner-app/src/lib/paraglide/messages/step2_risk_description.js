/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_DescriptionInputs */

const en_step2_risk_description = /** @type {(inputs: Step2_Risk_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your files contain sensitive metadata that may reveal your location, identity and device.`)
};

const cs_step2_risk_description = /** @type {(inputs: Step2_Risk_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vaše soubory obsahují citlivá metadata, která mohou odhalit vaši polohu, identitu a zařízení.`)
};

/**
* | output |
* | --- |
* | "Your files contain sensitive metadata that may reveal your location, identity and device." |
*
* @param {Step2_Risk_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_description = /** @type {((inputs?: Step2_Risk_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_description(inputs)
	return cs_step2_risk_description(inputs)
});
export { step2_risk_description as "step2.risk.description" }