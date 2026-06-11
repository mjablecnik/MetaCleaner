/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Trust_Sslshort1Inputs */

const en_auth_common_trust_sslshort1 = /** @type {(inputs: Auth_Common_Trust_Sslshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSL`)
};

const cs_auth_common_trust_sslshort1 = /** @type {(inputs: Auth_Common_Trust_Sslshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSL`)
};

/**
* | output |
* | --- |
* | "SSL" |
*
* @param {Auth_Common_Trust_Sslshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_sslshort1 = /** @type {((inputs?: Auth_Common_Trust_Sslshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_Sslshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_trust_sslshort1(inputs)
	return cs_auth_common_trust_sslshort1(inputs)
});
export { auth_common_trust_sslshort1 as "auth.common.trust.sslShort" }