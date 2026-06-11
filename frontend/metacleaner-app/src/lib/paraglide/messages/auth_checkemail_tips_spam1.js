/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Tips_Spam1Inputs */

const en_auth_checkemail_tips_spam1 = /** @type {(inputs: Auth_Checkemail_Tips_Spam1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Spam`)
};

const cs_auth_checkemail_tips_spam1 = /** @type {(inputs: Auth_Checkemail_Tips_Spam1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Spam`)
};

/**
* | output |
* | --- |
* | "Spam" |
*
* @param {Auth_Checkemail_Tips_Spam1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_spam1 = /** @type {((inputs?: Auth_Checkemail_Tips_Spam1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Spam1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_tips_spam1(inputs)
	return cs_auth_checkemail_tips_spam1(inputs)
});
export { auth_checkemail_tips_spam1 as "auth.checkEmail.tips.spam" }