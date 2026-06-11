/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Changeemail2Inputs */

const en_auth_checkemail_changeemail2 = /** @type {(inputs: Auth_Checkemail_Changeemail2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change email address`)
};

const cs_auth_checkemail_changeemail2 = /** @type {(inputs: Auth_Checkemail_Changeemail2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Změnit e-mailovou adresu`)
};

/**
* | output |
* | --- |
* | "Change email address" |
*
* @param {Auth_Checkemail_Changeemail2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_changeemail2 = /** @type {((inputs?: Auth_Checkemail_Changeemail2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Changeemail2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_changeemail2(inputs)
	return cs_auth_checkemail_changeemail2(inputs)
});
export { auth_checkemail_changeemail2 as "auth.checkEmail.changeEmail" }