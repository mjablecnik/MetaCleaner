/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Newpassword_Step2_Donedesc2Inputs */

const en_auth_newpassword_step2_donedesc2 = /** @type {(inputs: Auth_Newpassword_Step2_Donedesc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`6-digit code successfully verified.`)
};

const cs_auth_newpassword_step2_donedesc2 = /** @type {(inputs: Auth_Newpassword_Step2_Donedesc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`6místný kód byl úspěšně ověřen.`)
};

/**
* | output |
* | --- |
* | "6-digit code successfully verified." |
*
* @param {Auth_Newpassword_Step2_Donedesc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_step2_donedesc2 = /** @type {((inputs?: Auth_Newpassword_Step2_Donedesc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Step2_Donedesc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_newpassword_step2_donedesc2(inputs)
	return cs_auth_newpassword_step2_donedesc2(inputs)
});
export { auth_newpassword_step2_donedesc2 as "auth.newPassword.step2.doneDesc" }