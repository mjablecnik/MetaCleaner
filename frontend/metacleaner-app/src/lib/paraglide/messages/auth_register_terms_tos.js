/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Terms_TosInputs */

const en_auth_register_terms_tos = /** @type {(inputs: Auth_Register_Terms_TosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`terms of use`)
};

const cs_auth_register_terms_tos = /** @type {(inputs: Auth_Register_Terms_TosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`podmínkami použití`)
};

/**
* | output |
* | --- |
* | "terms of use" |
*
* @param {Auth_Register_Terms_TosInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_terms_tos = /** @type {((inputs?: Auth_Register_Terms_TosInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Terms_TosInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_terms_tos(inputs)
	return cs_auth_register_terms_tos(inputs)
});
export { auth_register_terms_tos as "auth.register.terms.tos" }