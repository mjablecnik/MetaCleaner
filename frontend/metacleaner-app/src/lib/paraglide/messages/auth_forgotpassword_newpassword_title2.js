/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Newpassword_Title2Inputs */

const en_auth_forgotpassword_newpassword_title2 = /** @type {(inputs: Auth_Forgotpassword_Newpassword_Title2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New password`)
};

const cs_auth_forgotpassword_newpassword_title2 = /** @type {(inputs: Auth_Forgotpassword_Newpassword_Title2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nové heslo`)
};

/**
* | output |
* | --- |
* | "New password" |
*
* @param {Auth_Forgotpassword_Newpassword_Title2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_newpassword_title2 = /** @type {((inputs?: Auth_Forgotpassword_Newpassword_Title2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Newpassword_Title2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_newpassword_title2(inputs)
	return cs_auth_forgotpassword_newpassword_title2(inputs)
});
export { auth_forgotpassword_newpassword_title2 as "auth.forgotPassword.newPassword.title" }