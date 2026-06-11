/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Newpassword_Tip_Title1Inputs */

const en_auth_newpassword_tip_title1 = /** @type {(inputs: Auth_Newpassword_Tip_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tip for a secure password`)
};

const cs_auth_newpassword_tip_title1 = /** @type {(inputs: Auth_Newpassword_Tip_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tip pro bezpečné heslo`)
};

/**
* | output |
* | --- |
* | "Tip for a secure password" |
*
* @param {Auth_Newpassword_Tip_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_tip_title1 = /** @type {((inputs?: Auth_Newpassword_Tip_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Tip_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_newpassword_tip_title1(inputs)
	return cs_auth_newpassword_tip_title1(inputs)
});
export { auth_newpassword_tip_title1 as "auth.newPassword.tip.title" }