/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Stats_Filescleanedlabel2Inputs */

const en_auth_common_stats_filescleanedlabel2 = /** @type {(inputs: Auth_Common_Stats_Filescleanedlabel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files cleaned`)
};

const cs_auth_common_stats_filescleanedlabel2 = /** @type {(inputs: Auth_Common_Stats_Filescleanedlabel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Souborů vyčištěno`)
};

/**
* | output |
* | --- |
* | "Files cleaned" |
*
* @param {Auth_Common_Stats_Filescleanedlabel2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_stats_filescleanedlabel2 = /** @type {((inputs?: Auth_Common_Stats_Filescleanedlabel2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Stats_Filescleanedlabel2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_stats_filescleanedlabel2(inputs)
	return cs_auth_common_stats_filescleanedlabel2(inputs)
});
export { auth_common_stats_filescleanedlabel2 as "auth.common.stats.filesCleanedLabel" }