/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Social_AppleInputs */

const en_auth_register_social_apple = /** @type {(inputs: Auth_Register_Social_AppleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign up with Apple`)
};

const cs_auth_register_social_apple = /** @type {(inputs: Auth_Register_Social_AppleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registrovat přes Apple`)
};

/**
* | output |
* | --- |
* | "Sign up with Apple" |
*
* @param {Auth_Register_Social_AppleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_social_apple = /** @type {((inputs?: Auth_Register_Social_AppleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Social_AppleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_social_apple(inputs)
	return cs_auth_register_social_apple(inputs)
});
export { auth_register_social_apple as "auth.register.social.apple" }