/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Otp_Sentto2Inputs */

const en_auth_forgotpassword_otp_sentto2 = /** @type {(inputs: Auth_Forgotpassword_Otp_Sentto2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the 6-digit code sent to`)
};

const cs_auth_forgotpassword_otp_sentto2 = /** @type {(inputs: Auth_Forgotpassword_Otp_Sentto2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zadejte 6místný kód odeslaný na`)
};

/**
* | output |
* | --- |
* | "Enter the 6-digit code sent to" |
*
* @param {Auth_Forgotpassword_Otp_Sentto2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_otp_sentto2 = /** @type {((inputs?: Auth_Forgotpassword_Otp_Sentto2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Otp_Sentto2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_otp_sentto2(inputs)
	return cs_auth_forgotpassword_otp_sentto2(inputs)
});
export { auth_forgotpassword_otp_sentto2 as "auth.forgotPassword.otp.sentTo" }