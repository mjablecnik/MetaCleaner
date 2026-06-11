/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Form_SubtitleInputs */

const en_auth_register_form_subtitle = /** @type {(inputs: Auth_Register_Form_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign up for free in less than a minute.`)
};

const cs_auth_register_form_subtitle = /** @type {(inputs: Auth_Register_Form_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zaregistrujte se zdarma za méně než minutu.`)
};

/**
* | output |
* | --- |
* | "Sign up for free in less than a minute." |
*
* @param {Auth_Register_Form_SubtitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_form_subtitle = /** @type {((inputs?: Auth_Register_Form_SubtitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Form_SubtitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_form_subtitle(inputs)
	return cs_auth_register_form_subtitle(inputs)
});
export { auth_register_form_subtitle as "auth.register.form.subtitle" }