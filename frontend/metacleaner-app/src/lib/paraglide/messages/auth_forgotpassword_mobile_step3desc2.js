/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Mobile_Step3desc2Inputs */

const en_auth_forgotpassword_mobile_step3desc2 = /** @type {(inputs: Auth_Forgotpassword_Mobile_Step3desc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose a strong password`)
};

const cs_auth_forgotpassword_mobile_step3desc2 = /** @type {(inputs: Auth_Forgotpassword_Mobile_Step3desc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zvolte silné heslo`)
};

/**
* | output |
* | --- |
* | "Choose a strong password" |
*
* @param {Auth_Forgotpassword_Mobile_Step3desc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_mobile_step3desc2 = /** @type {((inputs?: Auth_Forgotpassword_Mobile_Step3desc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Mobile_Step3desc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_mobile_step3desc2(inputs)
	return cs_auth_forgotpassword_mobile_step3desc2(inputs)
});
export { auth_forgotpassword_mobile_step3desc2 as "auth.forgotPassword.mobile.step3Desc" }