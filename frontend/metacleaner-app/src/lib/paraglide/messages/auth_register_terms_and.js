/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Terms_AndInputs */

const en_auth_register_terms_and = /** @type {(inputs: Auth_Register_Terms_AndInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`and`)
};

const cs_auth_register_terms_and = /** @type {(inputs: Auth_Register_Terms_AndInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`a`)
};

/**
* | output |
* | --- |
* | "and" |
*
* @param {Auth_Register_Terms_AndInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_terms_and = /** @type {((inputs?: Auth_Register_Terms_AndInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Terms_AndInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_terms_and(inputs)
	return cs_auth_register_terms_and(inputs)
});
export { auth_register_terms_and as "auth.register.terms.and" }