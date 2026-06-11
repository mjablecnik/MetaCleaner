/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Form_SubtitleInputs */

const en_auth_login_form_subtitle = /** @type {(inputs: Auth_Login_Form_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Welcome back! Enter your credentials.`)
};

const cs_auth_login_form_subtitle = /** @type {(inputs: Auth_Login_Form_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vítejte zpět! Zadejte své přihlašovací údaje.`)
};

/**
* | output |
* | --- |
* | "Welcome back! Enter your credentials." |
*
* @param {Auth_Login_Form_SubtitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_form_subtitle = /** @type {((inputs?: Auth_Login_Form_SubtitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Form_SubtitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_form_subtitle(inputs)
	return cs_auth_login_form_subtitle(inputs)
});
export { auth_login_form_subtitle as "auth.login.form.subtitle" }