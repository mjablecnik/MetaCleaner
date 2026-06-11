/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Resend_Loading1Inputs */

const en_auth_checkemail_resend_loading1 = /** @type {(inputs: Auth_Checkemail_Resend_Loading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sending...`)
};

const cs_auth_checkemail_resend_loading1 = /** @type {(inputs: Auth_Checkemail_Resend_Loading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Odesílám...`)
};

/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Auth_Checkemail_Resend_Loading1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_resend_loading1 = /** @type {((inputs?: Auth_Checkemail_Resend_Loading1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Resend_Loading1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_resend_loading1(inputs)
	return cs_auth_checkemail_resend_loading1(inputs)
});
export { auth_checkemail_resend_loading1 as "auth.checkEmail.resend.loading" }