/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Step1_Desc1Inputs */

const en_auth_forgotpassword_step1_desc1 = /** @type {(inputs: Auth_Forgotpassword_Step1_Desc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We'll send a verification code to your account.`)
};

const cs_auth_forgotpassword_step1_desc1 = /** @type {(inputs: Auth_Forgotpassword_Step1_Desc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Na váš účet odešleme ověřovací kód.`)
};

/**
* | output |
* | --- |
* | "We'll send a verification code to your account." |
*
* @param {Auth_Forgotpassword_Step1_Desc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_step1_desc1 = /** @type {((inputs?: Auth_Forgotpassword_Step1_Desc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Step1_Desc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_step1_desc1(inputs)
	return cs_auth_forgotpassword_step1_desc1(inputs)
});
export { auth_forgotpassword_step1_desc1 as "auth.forgotPassword.step1.desc" }