/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Branding_HeadlineInputs */

const en_auth_register_branding_headline = /** @type {(inputs: Auth_Register_Branding_HeadlineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Start protecting`)
};

const cs_auth_register_branding_headline = /** @type {(inputs: Auth_Register_Branding_HeadlineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Začněte chránit`)
};

/**
* | output |
* | --- |
* | "Start protecting" |
*
* @param {Auth_Register_Branding_HeadlineInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_branding_headline = /** @type {((inputs?: Auth_Register_Branding_HeadlineInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Branding_HeadlineInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_branding_headline(inputs)
	return cs_auth_register_branding_headline(inputs)
});
export { auth_register_branding_headline as "auth.register.branding.headline" }