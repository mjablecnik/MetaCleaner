/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Mobile_Stepstart2Inputs */

const en_auth_checkemail_mobile_stepstart2 = /** @type {(inputs: Auth_Checkemail_Mobile_Stepstart2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Start app`)
};

const cs_auth_checkemail_mobile_stepstart2 = /** @type {(inputs: Auth_Checkemail_Mobile_Stepstart2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Spustit app`)
};

/**
* | output |
* | --- |
* | "Start app" |
*
* @param {Auth_Checkemail_Mobile_Stepstart2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_mobile_stepstart2 = /** @type {((inputs?: Auth_Checkemail_Mobile_Stepstart2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Mobile_Stepstart2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_mobile_stepstart2(inputs)
	return cs_auth_checkemail_mobile_stepstart2(inputs)
});
export { auth_checkemail_mobile_stepstart2 as "auth.checkEmail.mobile.stepStart" }