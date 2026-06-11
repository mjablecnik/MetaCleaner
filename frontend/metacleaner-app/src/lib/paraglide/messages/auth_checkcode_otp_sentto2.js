/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkcode_Otp_Sentto2Inputs */

const en_auth_checkcode_otp_sentto2 = /** @type {(inputs: Auth_Checkcode_Otp_Sentto2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the 6-digit code we sent to`)
};

const cs_auth_checkcode_otp_sentto2 = /** @type {(inputs: Auth_Checkcode_Otp_Sentto2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zadejte 6místný kód, který jsme odeslali na`)
};

/**
* | output |
* | --- |
* | "Enter the 6-digit code we sent to" |
*
* @param {Auth_Checkcode_Otp_Sentto2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_otp_sentto2 = /** @type {((inputs?: Auth_Checkcode_Otp_Sentto2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Otp_Sentto2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkcode_otp_sentto2(inputs)
	return cs_auth_checkcode_otp_sentto2(inputs)
});
export { auth_checkcode_otp_sentto2 as "auth.checkCode.otp.sentTo" }