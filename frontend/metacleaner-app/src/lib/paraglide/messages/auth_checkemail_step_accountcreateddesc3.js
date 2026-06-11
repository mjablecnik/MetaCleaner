/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Step_Accountcreateddesc3Inputs */

const en_auth_checkemail_step_accountcreateddesc3 = /** @type {(inputs: Auth_Checkemail_Step_Accountcreateddesc3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your details were securely saved`)
};

const cs_auth_checkemail_step_accountcreateddesc3 = /** @type {(inputs: Auth_Checkemail_Step_Accountcreateddesc3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vaše údaje byly bezpečně uloženy`)
};

/**
* | output |
* | --- |
* | "Your details were securely saved" |
*
* @param {Auth_Checkemail_Step_Accountcreateddesc3Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_accountcreateddesc3 = /** @type {((inputs?: Auth_Checkemail_Step_Accountcreateddesc3Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Accountcreateddesc3Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_step_accountcreateddesc3(inputs)
	return cs_auth_checkemail_step_accountcreateddesc3(inputs)
});
export { auth_checkemail_step_accountcreateddesc3 as "auth.checkEmail.step.accountCreatedDesc" }