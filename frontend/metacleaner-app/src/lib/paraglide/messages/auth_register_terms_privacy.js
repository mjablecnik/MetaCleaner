/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Terms_PrivacyInputs */

const en_auth_register_terms_privacy = /** @type {(inputs: Auth_Register_Terms_PrivacyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`privacy policy`)
};

const cs_auth_register_terms_privacy = /** @type {(inputs: Auth_Register_Terms_PrivacyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`zásadami ochrany soukromí`)
};

/**
* | output |
* | --- |
* | "privacy policy" |
*
* @param {Auth_Register_Terms_PrivacyInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_terms_privacy = /** @type {((inputs?: Auth_Register_Terms_PrivacyInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Terms_PrivacyInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_terms_privacy(inputs)
	return cs_auth_register_terms_privacy(inputs)
});
export { auth_register_terms_privacy as "auth.register.terms.privacy" }