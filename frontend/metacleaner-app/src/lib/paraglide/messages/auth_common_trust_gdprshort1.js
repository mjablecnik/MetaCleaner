/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Trust_Gdprshort1Inputs */

const en_auth_common_trust_gdprshort1 = /** @type {(inputs: Auth_Common_Trust_Gdprshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GDPR`)
};

const cs_auth_common_trust_gdprshort1 = /** @type {(inputs: Auth_Common_Trust_Gdprshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GDPR`)
};

/**
* | output |
* | --- |
* | "GDPR" |
*
* @param {Auth_Common_Trust_Gdprshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_gdprshort1 = /** @type {((inputs?: Auth_Common_Trust_Gdprshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_Gdprshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_trust_gdprshort1(inputs)
	return cs_auth_common_trust_gdprshort1(inputs)
});
export { auth_common_trust_gdprshort1 as "auth.common.trust.gdprShort" }