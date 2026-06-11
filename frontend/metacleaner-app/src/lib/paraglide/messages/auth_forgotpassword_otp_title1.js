/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Otp_Title1Inputs */

const en_auth_forgotpassword_otp_title1 = /** @type {(inputs: Auth_Forgotpassword_Otp_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verify code`)
};

const cs_auth_forgotpassword_otp_title1 = /** @type {(inputs: Auth_Forgotpassword_Otp_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ověřte kód`)
};

/**
* | output |
* | --- |
* | "Verify code" |
*
* @param {Auth_Forgotpassword_Otp_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_otp_title1 = /** @type {((inputs?: Auth_Forgotpassword_Otp_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Otp_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_otp_title1(inputs)
	return cs_auth_forgotpassword_otp_title1(inputs)
});
export { auth_forgotpassword_otp_title1 as "auth.forgotPassword.otp.title" }