/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Social_GoogleInputs */

const en_auth_login_social_google = /** @type {(inputs: Auth_Login_Social_GoogleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continue with Google`)
};

const cs_auth_login_social_google = /** @type {(inputs: Auth_Login_Social_GoogleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pokračovat s Google`)
};

/**
* | output |
* | --- |
* | "Continue with Google" |
*
* @param {Auth_Login_Social_GoogleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_social_google = /** @type {((inputs?: Auth_Login_Social_GoogleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Social_GoogleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_social_google(inputs)
	return cs_auth_login_social_google(inputs)
});
export { auth_login_social_google as "auth.login.social.google" }