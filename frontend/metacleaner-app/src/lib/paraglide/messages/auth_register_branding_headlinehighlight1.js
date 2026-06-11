/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Branding_Headlinehighlight1Inputs */

const en_auth_register_branding_headlinehighlight1 = /** @type {(inputs: Auth_Register_Branding_Headlinehighlight1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`privacy`)
};

const cs_auth_register_branding_headlinehighlight1 = /** @type {(inputs: Auth_Register_Branding_Headlinehighlight1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`soukromí`)
};

/**
* | output |
* | --- |
* | "privacy" |
*
* @param {Auth_Register_Branding_Headlinehighlight1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_branding_headlinehighlight1 = /** @type {((inputs?: Auth_Register_Branding_Headlinehighlight1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Branding_Headlinehighlight1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_branding_headlinehighlight1(inputs)
	return cs_auth_register_branding_headlinehighlight1(inputs)
});
export { auth_register_branding_headlinehighlight1 as "auth.register.branding.headlineHighlight" }