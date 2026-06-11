/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Form_Subtitle1Inputs */

const en_auth_forgotpassword_form_subtitle1 = /** @type {(inputs: Auth_Forgotpassword_Form_Subtitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account access recovery`)
};

const cs_auth_forgotpassword_form_subtitle1 = /** @type {(inputs: Auth_Forgotpassword_Form_Subtitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Obnova přístupu k účtu`)
};

/**
* | output |
* | --- |
* | "Account access recovery" |
*
* @param {Auth_Forgotpassword_Form_Subtitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_form_subtitle1 = /** @type {((inputs?: Auth_Forgotpassword_Form_Subtitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Form_Subtitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_form_subtitle1(inputs)
	return cs_auth_forgotpassword_form_subtitle1(inputs)
});
export { auth_forgotpassword_form_subtitle1 as "auth.forgotPassword.form.subtitle" }