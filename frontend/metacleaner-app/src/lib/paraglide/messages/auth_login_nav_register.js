/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Nav_RegisterInputs */

const en_auth_login_nav_register = /** @type {(inputs: Auth_Login_Nav_RegisterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign up`)
};

const cs_auth_login_nav_register = /** @type {(inputs: Auth_Login_Nav_RegisterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registrovat se`)
};

/**
* | output |
* | --- |
* | "Sign up" |
*
* @param {Auth_Login_Nav_RegisterInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_nav_register = /** @type {((inputs?: Auth_Login_Nav_RegisterInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Nav_RegisterInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_nav_register(inputs)
	return cs_auth_login_nav_register(inputs)
});
export { auth_login_nav_register as "auth.login.nav.register" }