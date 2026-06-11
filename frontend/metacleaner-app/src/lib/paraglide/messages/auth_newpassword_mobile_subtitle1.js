/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Newpassword_Mobile_Subtitle1Inputs */

const en_auth_newpassword_mobile_subtitle1 = /** @type {(inputs: Auth_Newpassword_Mobile_Subtitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Step 3 of 3 · Choose a strong password`)
};

const cs_auth_newpassword_mobile_subtitle1 = /** @type {(inputs: Auth_Newpassword_Mobile_Subtitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Krok 3 ze 3 · Zvolte silné heslo`)
};

/**
* | output |
* | --- |
* | "Step 3 of 3 · Choose a strong password" |
*
* @param {Auth_Newpassword_Mobile_Subtitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_mobile_subtitle1 = /** @type {((inputs?: Auth_Newpassword_Mobile_Subtitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Mobile_Subtitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_newpassword_mobile_subtitle1(inputs)
	return cs_auth_newpassword_mobile_subtitle1(inputs)
});
export { auth_newpassword_mobile_subtitle1 as "auth.newPassword.mobile.subtitle" }