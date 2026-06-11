/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Branding_Description1Inputs */

const en_auth_forgotpassword_branding_description1 = /** @type {(inputs: Auth_Forgotpassword_Branding_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Forgot your password? No worries. We'll send you a secure code to your email and you'll be back in no time.`)
};

const cs_auth_forgotpassword_branding_description1 = /** @type {(inputs: Auth_Forgotpassword_Branding_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zapomenuté heslo? Nevadí. Pošleme vám bezpečný kód na váš e-mail a během chvíle budete zpět.`)
};

/**
* | output |
* | --- |
* | "Forgot your password? No worries. We'll send you a secure code to your email and you'll be back in no time." |
*
* @param {Auth_Forgotpassword_Branding_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_branding_description1 = /** @type {((inputs?: Auth_Forgotpassword_Branding_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Branding_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_branding_description1(inputs)
	return cs_auth_forgotpassword_branding_description1(inputs)
});
export { auth_forgotpassword_branding_description1 as "auth.forgotPassword.branding.description" }