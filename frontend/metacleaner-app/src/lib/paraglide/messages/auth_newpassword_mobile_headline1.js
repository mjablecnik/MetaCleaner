/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Newpassword_Mobile_Headline1Inputs */

const en_auth_newpassword_mobile_headline1 = /** @type {(inputs: Auth_Newpassword_Mobile_Headline1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set new password`)
};

const cs_auth_newpassword_mobile_headline1 = /** @type {(inputs: Auth_Newpassword_Mobile_Headline1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nové heslo nastavte`)
};

/**
* | output |
* | --- |
* | "Set new password" |
*
* @param {Auth_Newpassword_Mobile_Headline1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_mobile_headline1 = /** @type {((inputs?: Auth_Newpassword_Mobile_Headline1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Mobile_Headline1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_newpassword_mobile_headline1(inputs)
	return cs_auth_newpassword_mobile_headline1(inputs)
});
export { auth_newpassword_mobile_headline1 as "auth.newPassword.mobile.headline" }