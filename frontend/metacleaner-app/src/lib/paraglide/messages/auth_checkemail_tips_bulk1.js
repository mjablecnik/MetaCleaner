/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Tips_Bulk1Inputs */

const en_auth_checkemail_tips_bulk1 = /** @type {(inputs: Auth_Checkemail_Tips_Bulk1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bulk email`)
};

const cs_auth_checkemail_tips_bulk1 = /** @type {(inputs: Auth_Checkemail_Tips_Bulk1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hromadné e-maily`)
};

/**
* | output |
* | --- |
* | "Bulk email" |
*
* @param {Auth_Checkemail_Tips_Bulk1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_bulk1 = /** @type {((inputs?: Auth_Checkemail_Tips_Bulk1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Bulk1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_tips_bulk1(inputs)
	return cs_auth_checkemail_tips_bulk1(inputs)
});
export { auth_checkemail_tips_bulk1 as "auth.checkEmail.tips.bulk" }