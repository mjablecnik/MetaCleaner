/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Stats_FilesInputs */

const en_common_stats_files = /** @type {(inputs: Common_Stats_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files`)
};

const cs_common_stats_files = /** @type {(inputs: Common_Stats_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Souborů`)
};

/**
* | output |
* | --- |
* | "Files" |
*
* @param {Common_Stats_FilesInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_stats_files = /** @type {((inputs?: Common_Stats_FilesInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Stats_FilesInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_stats_files(inputs)
	return cs_common_stats_files(inputs)
});
export { common_stats_files as "common.stats.files" }