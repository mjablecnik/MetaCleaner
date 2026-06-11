/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Stats_Cleanedlabel1Inputs */

const en_auth_register_stats_cleanedlabel1 = /** @type {(inputs: Auth_Register_Stats_Cleanedlabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cleaned`)
};

const cs_auth_register_stats_cleanedlabel1 = /** @type {(inputs: Auth_Register_Stats_Cleanedlabel1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vyčištěno`)
};

/**
* | output |
* | --- |
* | "Cleaned" |
*
* @param {Auth_Register_Stats_Cleanedlabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_stats_cleanedlabel1 = /** @type {((inputs?: Auth_Register_Stats_Cleanedlabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Stats_Cleanedlabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_stats_cleanedlabel1(inputs)
	return cs_auth_register_stats_cleanedlabel1(inputs)
});
export { auth_register_stats_cleanedlabel1 as "auth.register.stats.cleanedLabel" }