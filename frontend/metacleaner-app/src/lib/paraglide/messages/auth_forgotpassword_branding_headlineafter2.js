/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Branding_Headlineafter2Inputs */

const en_auth_forgotpassword_branding_headlineafter2 = /** @type {(inputs: Auth_Forgotpassword_Branding_Headlineafter2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`to your account`)
};

const cs_auth_forgotpassword_branding_headlineafter2 = /** @type {(inputs: Auth_Forgotpassword_Branding_Headlineafter2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`k účtu`)
};

/**
* | output |
* | --- |
* | "to your account" |
*
* @param {Auth_Forgotpassword_Branding_Headlineafter2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_branding_headlineafter2 = /** @type {((inputs?: Auth_Forgotpassword_Branding_Headlineafter2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Branding_Headlineafter2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_branding_headlineafter2(inputs)
	return cs_auth_forgotpassword_branding_headlineafter2(inputs)
});
export { auth_forgotpassword_branding_headlineafter2 as "auth.forgotPassword.branding.headlineAfter" }