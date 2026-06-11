/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Heading_Verify1Inputs */

const en_auth_checkemail_heading_verify1 = /** @type {(inputs: Auth_Checkemail_Heading_Verify1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verify your`)
};

const cs_auth_checkemail_heading_verify1 = /** @type {(inputs: Auth_Checkemail_Heading_Verify1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ověřte svůj`)
};

/**
* | output |
* | --- |
* | "Verify your" |
*
* @param {Auth_Checkemail_Heading_Verify1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_heading_verify1 = /** @type {((inputs?: Auth_Checkemail_Heading_Verify1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Heading_Verify1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_heading_verify1(inputs)
	return cs_auth_checkemail_heading_verify1(inputs)
});
export { auth_checkemail_heading_verify1 as "auth.checkEmail.heading.verify" }