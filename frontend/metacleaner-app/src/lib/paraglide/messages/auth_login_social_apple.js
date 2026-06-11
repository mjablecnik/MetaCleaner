/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Social_AppleInputs */

const en_auth_login_social_apple = /** @type {(inputs: Auth_Login_Social_AppleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continue with Apple`)
};

const cs_auth_login_social_apple = /** @type {(inputs: Auth_Login_Social_AppleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pokračovat s Apple`)
};

/**
* | output |
* | --- |
* | "Continue with Apple" |
*
* @param {Auth_Login_Social_AppleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_social_apple = /** @type {((inputs?: Auth_Login_Social_AppleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Social_AppleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_social_apple(inputs)
	return cs_auth_login_social_apple(inputs)
});
export { auth_login_social_apple as "auth.login.social.apple" }