/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Stats_Userslabel1Inputs */

const en_auth_common_stats_userslabel1 = /** @type {(inputs: Auth_Common_Stats_Userslabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Users`)
};

const cs_auth_common_stats_userslabel1 = /** @type {(inputs: Auth_Common_Stats_Userslabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Uživatelů`)
};

/**
* | output |
* | --- |
* | "Users" |
*
* @param {Auth_Common_Stats_Userslabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_stats_userslabel1 = /** @type {((inputs?: Auth_Common_Stats_Userslabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Stats_Userslabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_stats_userslabel1(inputs)
	return cs_auth_common_stats_userslabel1(inputs)
});
export { auth_common_stats_userslabel1 as "auth.common.stats.usersLabel" }