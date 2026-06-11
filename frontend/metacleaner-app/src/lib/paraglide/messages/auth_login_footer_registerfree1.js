/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Footer_Registerfree1Inputs */

const en_auth_login_footer_registerfree1 = /** @type {(inputs: Auth_Login_Footer_Registerfree1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign up for free`)
};

const cs_auth_login_footer_registerfree1 = /** @type {(inputs: Auth_Login_Footer_Registerfree1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zaregistrujte se zdarma`)
};

/**
* | output |
* | --- |
* | "Sign up for free" |
*
* @param {Auth_Login_Footer_Registerfree1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_footer_registerfree1 = /** @type {((inputs?: Auth_Login_Footer_Registerfree1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Footer_Registerfree1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_footer_registerfree1(inputs)
	return cs_auth_login_footer_registerfree1(inputs)
});
export { auth_login_footer_registerfree1 as "auth.login.footer.registerFree" }