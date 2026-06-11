/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Trust_Notracking1Inputs */

const en_auth_common_trust_notracking1 = /** @type {(inputs: Auth_Common_Trust_Notracking1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No tracking`)
};

const cs_auth_common_trust_notracking1 = /** @type {(inputs: Auth_Common_Trust_Notracking1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bez sledování`)
};

/**
* | output |
* | --- |
* | "No tracking" |
*
* @param {Auth_Common_Trust_Notracking1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_notracking1 = /** @type {((inputs?: Auth_Common_Trust_Notracking1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_Notracking1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_trust_notracking1(inputs)
	return cs_auth_common_trust_notracking1(inputs)
});
export { auth_common_trust_notracking1 as "auth.common.trust.noTracking" }