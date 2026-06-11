/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Stats_Securitylabel1Inputs */

const en_auth_common_stats_securitylabel1 = /** @type {(inputs: Auth_Common_Stats_Securitylabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Security`)
};

const cs_auth_common_stats_securitylabel1 = /** @type {(inputs: Auth_Common_Stats_Securitylabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bezpečnost`)
};

/**
* | output |
* | --- |
* | "Security" |
*
* @param {Auth_Common_Stats_Securitylabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_stats_securitylabel1 = /** @type {((inputs?: Auth_Common_Stats_Securitylabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Stats_Securitylabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_stats_securitylabel1(inputs)
	return cs_auth_common_stats_securitylabel1(inputs)
});
export { auth_common_stats_securitylabel1 as "auth.common.stats.securityLabel" }