/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Trust_SslInputs */

const en_auth_common_trust_ssl = /** @type {(inputs: Auth_Common_Trust_SslInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSL encryption`)
};

const cs_auth_common_trust_ssl = /** @type {(inputs: Auth_Common_Trust_SslInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SSL šifrování`)
};

/**
* | output |
* | --- |
* | "SSL encryption" |
*
* @param {Auth_Common_Trust_SslInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_ssl = /** @type {((inputs?: Auth_Common_Trust_SslInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_SslInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_trust_ssl(inputs)
	return cs_auth_common_trust_ssl(inputs)
});
export { auth_common_trust_ssl as "auth.common.trust.ssl" }