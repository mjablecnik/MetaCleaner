/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Field_Forgotpassword1Inputs */

const en_auth_login_field_forgotpassword1 = /** @type {(inputs: Auth_Login_Field_Forgotpassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Forgot password?`)
};

const cs_auth_login_field_forgotpassword1 = /** @type {(inputs: Auth_Login_Field_Forgotpassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zapomenuté heslo?`)
};

/**
* | output |
* | --- |
* | "Forgot password?" |
*
* @param {Auth_Login_Field_Forgotpassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_field_forgotpassword1 = /** @type {((inputs?: Auth_Login_Field_Forgotpassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Field_Forgotpassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_field_forgotpassword1(inputs)
	return cs_auth_login_field_forgotpassword1(inputs)
});
export { auth_login_field_forgotpassword1 as "auth.login.field.forgotPassword" }