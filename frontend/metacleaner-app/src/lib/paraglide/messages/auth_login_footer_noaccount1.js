/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Footer_Noaccount1Inputs */

const en_auth_login_footer_noaccount1 = /** @type {(inputs: Auth_Login_Footer_Noaccount1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Don't have an account?`)
};

const cs_auth_login_footer_noaccount1 = /** @type {(inputs: Auth_Login_Footer_Noaccount1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nemáte účet?`)
};

/**
* | output |
* | --- |
* | "Don't have an account?" |
*
* @param {Auth_Login_Footer_Noaccount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_footer_noaccount1 = /** @type {((inputs?: Auth_Login_Footer_Noaccount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Footer_Noaccount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_footer_noaccount1(inputs)
	return cs_auth_login_footer_noaccount1(inputs)
});
export { auth_login_footer_noaccount1 as "auth.login.footer.noAccount" }