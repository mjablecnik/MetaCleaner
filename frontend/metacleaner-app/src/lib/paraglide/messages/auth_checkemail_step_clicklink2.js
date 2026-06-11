/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Step_Clicklink2Inputs */

const en_auth_checkemail_step_clicklink2 = /** @type {(inputs: Auth_Checkemail_Step_Clicklink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Click the link in the email`)
};

const cs_auth_checkemail_step_clicklink2 = /** @type {(inputs: Auth_Checkemail_Step_Clicklink2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Klikněte na odkaz v e-mailu`)
};

/**
* | output |
* | --- |
* | "Click the link in the email" |
*
* @param {Auth_Checkemail_Step_Clicklink2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_clicklink2 = /** @type {((inputs?: Auth_Checkemail_Step_Clicklink2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Clicklink2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_step_clicklink2(inputs)
	return cs_auth_checkemail_step_clicklink2(inputs)
});
export { auth_checkemail_step_clicklink2 as "auth.checkEmail.step.clickLink" }