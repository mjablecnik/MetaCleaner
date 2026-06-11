/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Toast_Resent1Inputs */

const en_auth_checkemail_toast_resent1 = /** @type {(inputs: Auth_Checkemail_Toast_Resent1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email resent!`)
};

const cs_auth_checkemail_toast_resent1 = /** @type {(inputs: Auth_Checkemail_Toast_Resent1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`E-mail byl znovu odeslán!`)
};

/**
* | output |
* | --- |
* | "Email resent!" |
*
* @param {Auth_Checkemail_Toast_Resent1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_toast_resent1 = /** @type {((inputs?: Auth_Checkemail_Toast_Resent1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Toast_Resent1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_toast_resent1(inputs)
	return cs_auth_checkemail_toast_resent1(inputs)
});
export { auth_checkemail_toast_resent1 as "auth.checkEmail.toast.resent" }