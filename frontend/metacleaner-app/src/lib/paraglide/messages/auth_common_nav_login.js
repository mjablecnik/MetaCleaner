/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Nav_LoginInputs */

const en_auth_common_nav_login = /** @type {(inputs: Auth_Common_Nav_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in`)
};

const cs_auth_common_nav_login = /** @type {(inputs: Auth_Common_Nav_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přihlásit se`)
};

/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Common_Nav_LoginInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_login = /** @type {((inputs?: Auth_Common_Nav_LoginInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_LoginInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_nav_login(inputs)
	return cs_auth_common_nav_login(inputs)
});
export { auth_common_nav_login as "auth.common.nav.login" }