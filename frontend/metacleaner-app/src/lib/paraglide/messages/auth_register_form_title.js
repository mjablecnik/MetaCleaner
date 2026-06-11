/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Form_TitleInputs */

const en_auth_register_form_title = /** @type {(inputs: Auth_Register_Form_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create account`)
};

const cs_auth_register_form_title = /** @type {(inputs: Auth_Register_Form_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vytvořit účet`)
};

/**
* | output |
* | --- |
* | "Create account" |
*
* @param {Auth_Register_Form_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_form_title = /** @type {((inputs?: Auth_Register_Form_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Form_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_form_title(inputs)
	return cs_auth_register_form_title(inputs)
});
export { auth_register_form_title as "auth.register.form.title" }