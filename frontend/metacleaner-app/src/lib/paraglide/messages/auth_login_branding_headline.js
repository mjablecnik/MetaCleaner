/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Branding_HeadlineInputs */

const en_auth_login_branding_headline = /** @type {(inputs: Auth_Login_Branding_HeadlineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Protect your`)
};

const cs_auth_login_branding_headline = /** @type {(inputs: Auth_Login_Branding_HeadlineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Chraňte své`)
};

/**
* | output |
* | --- |
* | "Protect your" |
*
* @param {Auth_Login_Branding_HeadlineInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_branding_headline = /** @type {((inputs?: Auth_Login_Branding_HeadlineInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Branding_HeadlineInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_branding_headline(inputs)
	return cs_auth_login_branding_headline(inputs)
});
export { auth_login_branding_headline as "auth.login.branding.headline" }