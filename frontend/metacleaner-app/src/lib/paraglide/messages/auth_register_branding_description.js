/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Branding_DescriptionInputs */

const en_auth_register_branding_description = /** @type {(inputs: Auth_Register_Branding_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create a free account and start removing metadata from photos and videos. No hidden fees, no tracking.`)
};

const cs_auth_register_branding_description = /** @type {(inputs: Auth_Register_Branding_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vytvořte si bezplatný účet a začněte odstraňovat metadata z fotek a videí. Žádné skryté poplatky, žádné sledování.`)
};

/**
* | output |
* | --- |
* | "Create a free account and start removing metadata from photos and videos. No hidden fees, no tracking." |
*
* @param {Auth_Register_Branding_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_branding_description = /** @type {((inputs?: Auth_Register_Branding_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Branding_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_branding_description(inputs)
	return cs_auth_register_branding_description(inputs)
});
export { auth_register_branding_description as "auth.register.branding.description" }