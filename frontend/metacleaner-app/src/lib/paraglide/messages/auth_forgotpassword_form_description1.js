/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Form_Description1Inputs */

const en_auth_forgotpassword_form_description1 = /** @type {(inputs: Auth_Forgotpassword_Form_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter your email and we'll send you a code to reset your password.`)
};

const cs_auth_forgotpassword_form_description1 = /** @type {(inputs: Auth_Forgotpassword_Form_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zadejte svůj e-mail a my vám pošleme kód pro obnovu hesla.`)
};

/**
* | output |
* | --- |
* | "Enter your email and we'll send you a code to reset your password." |
*
* @param {Auth_Forgotpassword_Form_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_form_description1 = /** @type {((inputs?: Auth_Forgotpassword_Form_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Form_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_form_description1(inputs)
	return cs_auth_forgotpassword_form_description1(inputs)
});
export { auth_forgotpassword_form_description1 as "auth.forgotPassword.form.description" }