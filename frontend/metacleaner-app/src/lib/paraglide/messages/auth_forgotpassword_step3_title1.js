/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Step3_Title1Inputs */

const en_auth_forgotpassword_step3_title1 = /** @type {(inputs: Auth_Forgotpassword_Step3_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set new password`)
};

const cs_auth_forgotpassword_step3_title1 = /** @type {(inputs: Auth_Forgotpassword_Step3_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nastavte nové heslo`)
};

/**
* | output |
* | --- |
* | "Set new password" |
*
* @param {Auth_Forgotpassword_Step3_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_step3_title1 = /** @type {((inputs?: Auth_Forgotpassword_Step3_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Step3_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_step3_title1(inputs)
	return cs_auth_forgotpassword_step3_title1(inputs)
});
export { auth_forgotpassword_step3_title1 as "auth.forgotPassword.step3.title" }