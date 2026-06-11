/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Otp_Expiresin2Inputs */

const en_auth_forgotpassword_otp_expiresin2 = /** @type {(inputs: Auth_Forgotpassword_Otp_Expiresin2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expires in`)
};

const cs_auth_forgotpassword_otp_expiresin2 = /** @type {(inputs: Auth_Forgotpassword_Otp_Expiresin2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vyprší za`)
};

/**
* | output |
* | --- |
* | "Expires in" |
*
* @param {Auth_Forgotpassword_Otp_Expiresin2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_otp_expiresin2 = /** @type {((inputs?: Auth_Forgotpassword_Otp_Expiresin2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Otp_Expiresin2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_otp_expiresin2(inputs)
	return cs_auth_forgotpassword_otp_expiresin2(inputs)
});
export { auth_forgotpassword_otp_expiresin2 as "auth.forgotPassword.otp.expiresIn" }