/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Badge_Created1Inputs */

const en_auth_checkemail_badge_created1 = /** @type {(inputs: Auth_Checkemail_Badge_Created1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account created · Last step`)
};

const cs_auth_checkemail_badge_created1 = /** @type {(inputs: Auth_Checkemail_Badge_Created1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Účet byl vytvořen · Poslední krok`)
};

/**
* | output |
* | --- |
* | "Account created · Last step" |
*
* @param {Auth_Checkemail_Badge_Created1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_badge_created1 = /** @type {((inputs?: Auth_Checkemail_Badge_Created1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Badge_Created1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_badge_created1(inputs)
	return cs_auth_checkemail_badge_created1(inputs)
});
export { auth_checkemail_badge_created1 as "auth.checkEmail.badge.created" }