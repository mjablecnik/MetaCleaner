/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Benefit_GdprInputs */

const en_auth_register_benefit_gdpr = /** @type {(inputs: Auth_Register_Benefit_GdprInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GDPR compliant · We never share data`)
};

const cs_auth_register_benefit_gdpr = /** @type {(inputs: Auth_Register_Benefit_GdprInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GDPR soulad · Data nikdy nesdílíme`)
};

/**
* | output |
* | --- |
* | "GDPR compliant · We never share data" |
*
* @param {Auth_Register_Benefit_GdprInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_benefit_gdpr = /** @type {((inputs?: Auth_Register_Benefit_GdprInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Benefit_GdprInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_benefit_gdpr(inputs)
	return cs_auth_register_benefit_gdpr(inputs)
});
export { auth_register_benefit_gdpr as "auth.register.benefit.gdpr" }