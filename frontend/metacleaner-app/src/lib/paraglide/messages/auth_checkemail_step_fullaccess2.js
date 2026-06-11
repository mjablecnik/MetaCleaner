/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Step_Fullaccess2Inputs */

const en_auth_checkemail_step_fullaccess2 = /** @type {(inputs: Auth_Checkemail_Step_Fullaccess2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Full access to all features`)
};

const cs_auth_checkemail_step_fullaccess2 = /** @type {(inputs: Auth_Checkemail_Step_Fullaccess2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plný přístup ke všem funkcím`)
};

/**
* | output |
* | --- |
* | "Full access to all features" |
*
* @param {Auth_Checkemail_Step_Fullaccess2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_fullaccess2 = /** @type {((inputs?: Auth_Checkemail_Step_Fullaccess2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Fullaccess2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_step_fullaccess2(inputs)
	return cs_auth_checkemail_step_fullaccess2(inputs)
});
export { auth_checkemail_step_fullaccess2 as "auth.checkEmail.step.fullAccess" }