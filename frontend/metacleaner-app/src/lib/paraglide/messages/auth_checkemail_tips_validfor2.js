/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Tips_Validfor2Inputs */

const en_auth_checkemail_tips_validfor2 = /** @type {(inputs: Auth_Checkemail_Tips_Validfor2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link is valid for`)
};

const cs_auth_checkemail_tips_validfor2 = /** @type {(inputs: Auth_Checkemail_Tips_Validfor2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Odkaz je platný`)
};

/**
* | output |
* | --- |
* | "Link is valid for" |
*
* @param {Auth_Checkemail_Tips_Validfor2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_validfor2 = /** @type {((inputs?: Auth_Checkemail_Tips_Validfor2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Validfor2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_tips_validfor2(inputs)
	return cs_auth_checkemail_tips_validfor2(inputs)
});
export { auth_checkemail_tips_validfor2 as "auth.checkEmail.tips.validFor" }