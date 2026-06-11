/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Resend_Idle1Inputs */

const en_auth_checkemail_resend_idle1 = /** @type {(inputs: Auth_Checkemail_Resend_Idle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resend email`)
};

const cs_auth_checkemail_resend_idle1 = /** @type {(inputs: Auth_Checkemail_Resend_Idle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Znovu odeslat e-mail`)
};

/**
* | output |
* | --- |
* | "Resend email" |
*
* @param {Auth_Checkemail_Resend_Idle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_resend_idle1 = /** @type {((inputs?: Auth_Checkemail_Resend_Idle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Resend_Idle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_resend_idle1(inputs)
	return cs_auth_checkemail_resend_idle1(inputs)
});
export { auth_checkemail_resend_idle1 as "auth.checkEmail.resend.idle" }