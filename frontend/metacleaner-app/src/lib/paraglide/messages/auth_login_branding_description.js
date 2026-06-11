/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Branding_DescriptionInputs */

const en_auth_login_branding_description = /** @type {(inputs: Auth_Login_Branding_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner removes hidden metadata from your photos and videos. Your files leave the device without sensitive information.`)
};

const cs_auth_login_branding_description = /** @type {(inputs: Auth_Login_Branding_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner odstraňuje skrytá metadata z vašich fotografií a videí. Vaše soubory opouštějí zařízení bez citlivých informací.`)
};

/**
* | output |
* | --- |
* | "MetaCleaner removes hidden metadata from your photos and videos. Your files leave the device without sensitive information." |
*
* @param {Auth_Login_Branding_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_branding_description = /** @type {((inputs?: Auth_Login_Branding_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Branding_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_branding_description(inputs)
	return cs_auth_login_branding_description(inputs)
});
export { auth_login_branding_description as "auth.login.branding.description" }