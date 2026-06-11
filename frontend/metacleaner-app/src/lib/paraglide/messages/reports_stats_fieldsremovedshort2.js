/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Stats_Fieldsremovedshort2Inputs */

const en_reports_stats_fieldsremovedshort2 = /** @type {(inputs: Reports_Stats_Fieldsremovedshort2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadata fields`)
};

const cs_reports_stats_fieldsremovedshort2 = /** @type {(inputs: Reports_Stats_Fieldsremovedshort2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Polí metadat`)
};

/**
* | output |
* | --- |
* | "Metadata fields" |
*
* @param {Reports_Stats_Fieldsremovedshort2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_fieldsremovedshort2 = /** @type {((inputs?: Reports_Stats_Fieldsremovedshort2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Fieldsremovedshort2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_stats_fieldsremovedshort2(inputs)
	return cs_reports_stats_fieldsremovedshort2(inputs)
});
export { reports_stats_fieldsremovedshort2 as "reports.stats.fieldsRemovedShort" }