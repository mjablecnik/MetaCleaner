/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Newpassword_Description2Inputs */

const en_auth_forgotpassword_newpassword_description2 = /** @type {(inputs: Auth_Forgotpassword_Newpassword_Description2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose a strong password for your account.`)
};

const cs_auth_forgotpassword_newpassword_description2 = /** @type {(inputs: Auth_Forgotpassword_Newpassword_Description2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zvolte silné heslo pro váš účet.`)
};

/**
* | output |
* | --- |
* | "Choose a strong password for your account." |
*
* @param {Auth_Forgotpassword_Newpassword_Description2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_newpassword_description2 = /** @type {((inputs?: Auth_Forgotpassword_Newpassword_Description2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Newpassword_Description2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_newpassword_description2(inputs)
	return cs_auth_forgotpassword_newpassword_description2(inputs)
});
export { auth_forgotpassword_newpassword_description2 as "auth.forgotPassword.newPassword.description" }