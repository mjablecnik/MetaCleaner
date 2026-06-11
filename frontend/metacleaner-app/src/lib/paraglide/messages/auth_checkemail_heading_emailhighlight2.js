/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Heading_Emailhighlight2Inputs */

const en_auth_checkemail_heading_emailhighlight2 = /** @type {(inputs: Auth_Checkemail_Heading_Emailhighlight2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`email`)
};

const cs_auth_checkemail_heading_emailhighlight2 = /** @type {(inputs: Auth_Checkemail_Heading_Emailhighlight2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`e-mail`)
};

/**
* | output |
* | --- |
* | "email" |
*
* @param {Auth_Checkemail_Heading_Emailhighlight2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_heading_emailhighlight2 = /** @type {((inputs?: Auth_Checkemail_Heading_Emailhighlight2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Heading_Emailhighlight2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_heading_emailhighlight2(inputs)
	return cs_auth_checkemail_heading_emailhighlight2(inputs)
});
export { auth_checkemail_heading_emailhighlight2 as "auth.checkEmail.heading.emailHighlight" }