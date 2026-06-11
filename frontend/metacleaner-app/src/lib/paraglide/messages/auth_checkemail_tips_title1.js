/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Tips_Title1Inputs */

const en_auth_checkemail_tips_title1 = /** @type {(inputs: Auth_Checkemail_Tips_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Can't find the email?`)
};

const cs_auth_checkemail_tips_title1 = /** @type {(inputs: Auth_Checkemail_Tips_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nenašli jste e-mail?`)
};

/**
* | output |
* | --- |
* | "Can't find the email?" |
*
* @param {Auth_Checkemail_Tips_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_title1 = /** @type {((inputs?: Auth_Checkemail_Tips_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_tips_title1(inputs)
	return cs_auth_checkemail_tips_title1(inputs)
});
export { auth_checkemail_tips_title1 as "auth.checkEmail.tips.title" }