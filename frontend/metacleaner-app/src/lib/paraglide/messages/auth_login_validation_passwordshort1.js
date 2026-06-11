/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Validation_Passwordshort1Inputs */

const en_auth_login_validation_passwordshort1 = /** @type {(inputs: Auth_Login_Validation_Passwordshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password must be at least 6 characters.`)
};

const cs_auth_login_validation_passwordshort1 = /** @type {(inputs: Auth_Login_Validation_Passwordshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Heslo musí mít alespoň 6 znaků.`)
};

/**
* | output |
* | --- |
* | "Password must be at least 6 characters." |
*
* @param {Auth_Login_Validation_Passwordshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_validation_passwordshort1 = /** @type {((inputs?: Auth_Login_Validation_Passwordshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Validation_Passwordshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_validation_passwordshort1(inputs)
	return cs_auth_login_validation_passwordshort1(inputs)
});
export { auth_login_validation_passwordshort1 as "auth.login.validation.passwordShort" }