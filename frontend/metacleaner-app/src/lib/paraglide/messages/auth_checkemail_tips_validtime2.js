/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Tips_Validtime2Inputs */

const en_auth_checkemail_tips_validtime2 = /** @type {(inputs: Auth_Checkemail_Tips_Validtime2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`24 hours`)
};

const cs_auth_checkemail_tips_validtime2 = /** @type {(inputs: Auth_Checkemail_Tips_Validtime2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`24 hodin`)
};

/**
* | output |
* | --- |
* | "24 hours" |
*
* @param {Auth_Checkemail_Tips_Validtime2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_validtime2 = /** @type {((inputs?: Auth_Checkemail_Tips_Validtime2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Validtime2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_tips_validtime2(inputs)
	return cs_auth_checkemail_tips_validtime2(inputs)
});
export { auth_checkemail_tips_validtime2 as "auth.checkEmail.tips.validTime" }