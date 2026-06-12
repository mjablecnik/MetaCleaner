/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Newpassword_Branding_Description1Inputs */

const en_auth_newpassword_branding_description1 = /** @type {(inputs: Auth_Newpassword_Branding_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You're almost done. Choose a strong password to protect your account. We recommend a combination of letters, numbers and symbols.`)
};

const cs_auth_newpassword_branding_description1 = /** @type {(inputs: Auth_Newpassword_Branding_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Jste skoro hotovi. Zvolte silné heslo, které bude chránit váš účet. Doporučujeme kombinaci písmen, číslic a symbolů.`)
};

/**
* | output |
* | --- |
* | "You're almost done. Choose a strong password to protect your account. We recommend a combination of letters, numbers and symbols." |
*
* @param {Auth_Newpassword_Branding_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_branding_description1 = /** @type {((inputs?: Auth_Newpassword_Branding_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Branding_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_newpassword_branding_description1(inputs)
	return cs_auth_newpassword_branding_description1(inputs)
});
export { auth_newpassword_branding_description1 as "auth.newPassword.branding.description" }