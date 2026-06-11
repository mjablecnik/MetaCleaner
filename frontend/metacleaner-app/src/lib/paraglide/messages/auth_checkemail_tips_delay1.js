/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Tips_Delay1Inputs */

const en_auth_checkemail_tips_delay1 = /** @type {(inputs: Auth_Checkemail_Tips_Delay1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email may arrive in`)
};

const cs_auth_checkemail_tips_delay1 = /** @type {(inputs: Auth_Checkemail_Tips_Delay1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`E-mail může přijít až za`)
};

/**
* | output |
* | --- |
* | "Email may arrive in" |
*
* @param {Auth_Checkemail_Tips_Delay1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_delay1 = /** @type {((inputs?: Auth_Checkemail_Tips_Delay1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Delay1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_tips_delay1(inputs)
	return cs_auth_checkemail_tips_delay1(inputs)
});
export { auth_checkemail_tips_delay1 as "auth.checkEmail.tips.delay" }