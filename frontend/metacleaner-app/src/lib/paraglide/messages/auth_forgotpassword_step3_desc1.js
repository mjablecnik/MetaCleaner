/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Step3_Desc1Inputs */

const en_auth_forgotpassword_step3_desc1 = /** @type {(inputs: Auth_Forgotpassword_Step3_Desc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose a strong password and sign in.`)
};

const cs_auth_forgotpassword_step3_desc1 = /** @type {(inputs: Auth_Forgotpassword_Step3_Desc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zvolte silné heslo a přihlaste se.`)
};

/**
* | output |
* | --- |
* | "Choose a strong password and sign in." |
*
* @param {Auth_Forgotpassword_Step3_Desc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_step3_desc1 = /** @type {((inputs?: Auth_Forgotpassword_Step3_Desc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Step3_Desc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_step3_desc1(inputs)
	return cs_auth_forgotpassword_step3_desc1(inputs)
});
export { auth_forgotpassword_step3_desc1 as "auth.forgotPassword.step3.desc" }