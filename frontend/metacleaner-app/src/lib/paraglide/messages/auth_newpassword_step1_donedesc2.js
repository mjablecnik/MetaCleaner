/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Newpassword_Step1_Donedesc2Inputs */

const en_auth_newpassword_step1_donedesc2 = /** @type {(inputs: Auth_Newpassword_Step1_Donedesc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We sent a verification code to your account.`)
};

const cs_auth_newpassword_step1_donedesc2 = /** @type {(inputs: Auth_Newpassword_Step1_Donedesc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Na váš účet jsme odeslali ověřovací kód.`)
};

/**
* | output |
* | --- |
* | "We sent a verification code to your account." |
*
* @param {Auth_Newpassword_Step1_Donedesc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_step1_donedesc2 = /** @type {((inputs?: Auth_Newpassword_Step1_Donedesc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Step1_Donedesc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_newpassword_step1_donedesc2(inputs)
	return cs_auth_newpassword_step1_donedesc2(inputs)
});
export { auth_newpassword_step1_donedesc2 as "auth.newPassword.step1.doneDesc" }