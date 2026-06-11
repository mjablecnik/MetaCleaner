/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Newpassword_Mobile_Tip1Inputs */

const en_auth_newpassword_mobile_tip1 = /** @type {(inputs: Auth_Newpassword_Mobile_Tip1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use 12+ characters, uppercase and lowercase letters, numbers and !@#$% characters`)
};

const cs_auth_newpassword_mobile_tip1 = /** @type {(inputs: Auth_Newpassword_Mobile_Tip1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Použijte 12+ znaků, velká i malá písmena, čísla a znaky !@#$%`)
};

/**
* | output |
* | --- |
* | "Use 12+ characters, uppercase and lowercase letters, numbers and !@#$% characters" |
*
* @param {Auth_Newpassword_Mobile_Tip1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_mobile_tip1 = /** @type {((inputs?: Auth_Newpassword_Mobile_Tip1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Mobile_Tip1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_newpassword_mobile_tip1(inputs)
	return cs_auth_newpassword_mobile_tip1(inputs)
});
export { auth_newpassword_mobile_tip1 as "auth.newPassword.mobile.tip" }