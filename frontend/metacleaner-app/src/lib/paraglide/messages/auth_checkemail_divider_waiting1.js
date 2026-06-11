/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Divider_Waiting1Inputs */

const en_auth_checkemail_divider_waiting1 = /** @type {(inputs: Auth_Checkemail_Divider_Waiting1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`waiting for verification`)
};

const cs_auth_checkemail_divider_waiting1 = /** @type {(inputs: Auth_Checkemail_Divider_Waiting1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`čekáme na ověření`)
};

/**
* | output |
* | --- |
* | "waiting for verification" |
*
* @param {Auth_Checkemail_Divider_Waiting1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_divider_waiting1 = /** @type {((inputs?: Auth_Checkemail_Divider_Waiting1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Divider_Waiting1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_divider_waiting1(inputs)
	return cs_auth_checkemail_divider_waiting1(inputs)
});
export { auth_checkemail_divider_waiting1 as "auth.checkEmail.divider.waiting" }