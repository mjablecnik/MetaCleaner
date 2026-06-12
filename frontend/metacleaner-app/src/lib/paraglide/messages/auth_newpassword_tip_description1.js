/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Newpassword_Tip_Description1Inputs */

const en_auth_newpassword_tip_description1 = /** @type {(inputs: Auth_Newpassword_Tip_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use at least 12 characters, uppercase and lowercase letters, numbers and special characters like !@#$%`)
};

const cs_auth_newpassword_tip_description1 = /** @type {(inputs: Auth_Newpassword_Tip_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Použijte alespoň 12 znaků, velká i malá písmena, čísla a speciální znaky jako !@#$%`)
};

/**
* | output |
* | --- |
* | "Use at least 12 characters, uppercase and lowercase letters, numbers and special characters like !@#$%" |
*
* @param {Auth_Newpassword_Tip_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_tip_description1 = /** @type {((inputs?: Auth_Newpassword_Tip_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Tip_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_newpassword_tip_description1(inputs)
	return cs_auth_newpassword_tip_description1(inputs)
});
export { auth_newpassword_tip_description1 as "auth.newPassword.tip.description" }