/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Footer_LoginInputs */

const en_auth_register_footer_login = /** @type {(inputs: Auth_Register_Footer_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in`)
};

const cs_auth_register_footer_login = /** @type {(inputs: Auth_Register_Footer_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přihlásit se`)
};

/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Register_Footer_LoginInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_footer_login = /** @type {((inputs?: Auth_Register_Footer_LoginInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Footer_LoginInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_footer_login(inputs)
	return cs_auth_register_footer_login(inputs)
});
export { auth_register_footer_login as "auth.register.footer.login" }