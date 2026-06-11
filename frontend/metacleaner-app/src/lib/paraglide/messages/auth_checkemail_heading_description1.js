/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Heading_Description1Inputs */

const en_auth_checkemail_heading_description1 = /** @type {(inputs: Auth_Checkemail_Heading_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We sent you a verification link...`)
};

const cs_auth_checkemail_heading_description1 = /** @type {(inputs: Auth_Checkemail_Heading_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Poslali jsme vám ověřovací odkaz...`)
};

/**
* | output |
* | --- |
* | "We sent you a verification link..." |
*
* @param {Auth_Checkemail_Heading_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_heading_description1 = /** @type {((inputs?: Auth_Checkemail_Heading_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Heading_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_heading_description1(inputs)
	return cs_auth_checkemail_heading_description1(inputs)
});
export { auth_checkemail_heading_description1 as "auth.checkEmail.heading.description" }