/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Success_Passwordchanged1Inputs */

const en_auth_common_success_passwordchanged1 = /** @type {(inputs: Auth_Common_Success_Passwordchanged1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password changed!`)
};

const cs_auth_common_success_passwordchanged1 = /** @type {(inputs: Auth_Common_Success_Passwordchanged1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Heslo změněno!`)
};

/**
* | output |
* | --- |
* | "Password changed!" |
*
* @param {Auth_Common_Success_Passwordchanged1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_success_passwordchanged1 = /** @type {((inputs?: Auth_Common_Success_Passwordchanged1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Success_Passwordchanged1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_success_passwordchanged1(inputs)
	return cs_auth_common_success_passwordchanged1(inputs)
});
export { auth_common_success_passwordchanged1 as "auth.common.success.passwordChanged" }