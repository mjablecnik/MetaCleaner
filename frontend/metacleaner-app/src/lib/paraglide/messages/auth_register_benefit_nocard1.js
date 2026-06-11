/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Benefit_Nocard1Inputs */

const en_auth_register_benefit_nocard1 = /** @type {(inputs: Auth_Register_Benefit_Nocard1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No credit card required`)
};

const cs_auth_register_benefit_nocard1 = /** @type {(inputs: Auth_Register_Benefit_Nocard1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Žádná kreditní karta není vyžadována`)
};

/**
* | output |
* | --- |
* | "No credit card required" |
*
* @param {Auth_Register_Benefit_Nocard1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_benefit_nocard1 = /** @type {((inputs?: Auth_Register_Benefit_Nocard1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Benefit_Nocard1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_benefit_nocard1(inputs)
	return cs_auth_register_benefit_nocard1(inputs)
});
export { auth_register_benefit_nocard1 as "auth.register.benefit.noCard" }