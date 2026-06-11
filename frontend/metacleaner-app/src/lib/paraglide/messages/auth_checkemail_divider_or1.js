/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Divider_Or1Inputs */

const en_auth_checkemail_divider_or1 = /** @type {(inputs: Auth_Checkemail_Divider_Or1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`or`)
};

const cs_auth_checkemail_divider_or1 = /** @type {(inputs: Auth_Checkemail_Divider_Or1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`nebo`)
};

/**
* | output |
* | --- |
* | "or" |
*
* @param {Auth_Checkemail_Divider_Or1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_divider_or1 = /** @type {((inputs?: Auth_Checkemail_Divider_Or1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Divider_Or1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_divider_or1(inputs)
	return cs_auth_checkemail_divider_or1(inputs)
});
export { auth_checkemail_divider_or1 as "auth.checkEmail.divider.or" }