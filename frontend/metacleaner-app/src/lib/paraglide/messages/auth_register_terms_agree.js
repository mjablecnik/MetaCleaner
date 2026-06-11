/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Terms_AgreeInputs */

const en_auth_register_terms_agree = /** @type {(inputs: Auth_Register_Terms_AgreeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`I agree to the`)
};

const cs_auth_register_terms_agree = /** @type {(inputs: Auth_Register_Terms_AgreeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Souhlasím s`)
};

/**
* | output |
* | --- |
* | "I agree to the" |
*
* @param {Auth_Register_Terms_AgreeInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_terms_agree = /** @type {((inputs?: Auth_Register_Terms_AgreeInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Terms_AgreeInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_terms_agree(inputs)
	return cs_auth_register_terms_agree(inputs)
});
export { auth_register_terms_agree as "auth.register.terms.agree" }