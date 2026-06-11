/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Mobile_Stepcreated2Inputs */

const en_auth_checkemail_mobile_stepcreated2 = /** @type {(inputs: Auth_Checkemail_Mobile_Stepcreated2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account created`)
};

const cs_auth_checkemail_mobile_stepcreated2 = /** @type {(inputs: Auth_Checkemail_Mobile_Stepcreated2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Účet vytvořen`)
};

/**
* | output |
* | --- |
* | "Account created" |
*
* @param {Auth_Checkemail_Mobile_Stepcreated2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_mobile_stepcreated2 = /** @type {((inputs?: Auth_Checkemail_Mobile_Stepcreated2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Mobile_Stepcreated2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_mobile_stepcreated2(inputs)
	return cs_auth_checkemail_mobile_stepcreated2(inputs)
});
export { auth_checkemail_mobile_stepcreated2 as "auth.checkEmail.mobile.stepCreated" }