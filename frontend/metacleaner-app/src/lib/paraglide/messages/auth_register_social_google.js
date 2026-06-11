/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Social_GoogleInputs */

const en_auth_register_social_google = /** @type {(inputs: Auth_Register_Social_GoogleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign up with Google`)
};

const cs_auth_register_social_google = /** @type {(inputs: Auth_Register_Social_GoogleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registrovat přes Google`)
};

/**
* | output |
* | --- |
* | "Sign up with Google" |
*
* @param {Auth_Register_Social_GoogleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_social_google = /** @type {((inputs?: Auth_Register_Social_GoogleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Social_GoogleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_social_google(inputs)
	return cs_auth_register_social_google(inputs)
});
export { auth_register_social_google as "auth.register.social.google" }