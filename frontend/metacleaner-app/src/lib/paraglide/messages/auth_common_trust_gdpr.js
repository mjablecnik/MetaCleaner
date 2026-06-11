/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Trust_GdprInputs */

const en_auth_common_trust_gdpr = /** @type {(inputs: Auth_Common_Trust_GdprInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GDPR compliant`)
};

const cs_auth_common_trust_gdpr = /** @type {(inputs: Auth_Common_Trust_GdprInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GDPR soulad`)
};

/**
* | output |
* | --- |
* | "GDPR compliant" |
*
* @param {Auth_Common_Trust_GdprInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_gdpr = /** @type {((inputs?: Auth_Common_Trust_GdprInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_GdprInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_trust_gdpr(inputs)
	return cs_auth_common_trust_gdpr(inputs)
});
export { auth_common_trust_gdpr as "auth.common.trust.gdpr" }