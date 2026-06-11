/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Branding_Headlinehighlight2Inputs */

const en_auth_forgotpassword_branding_headlinehighlight2 = /** @type {(inputs: Auth_Forgotpassword_Branding_Headlinehighlight2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`access`)
};

const cs_auth_forgotpassword_branding_headlinehighlight2 = /** @type {(inputs: Auth_Forgotpassword_Branding_Headlinehighlight2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`přístupu`)
};

/**
* | output |
* | --- |
* | "access" |
*
* @param {Auth_Forgotpassword_Branding_Headlinehighlight2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_branding_headlinehighlight2 = /** @type {((inputs?: Auth_Forgotpassword_Branding_Headlinehighlight2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Branding_Headlinehighlight2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_branding_headlinehighlight2(inputs)
	return cs_auth_forgotpassword_branding_headlinehighlight2(inputs)
});
export { auth_forgotpassword_branding_headlinehighlight2 as "auth.forgotPassword.branding.headlineHighlight" }