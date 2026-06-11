/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Meta_TitleInputs */

const en_reports_meta_title = /** @type {(inputs: Reports_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Report History`)
};

const cs_reports_meta_title = /** @type {(inputs: Reports_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Historie reportů`)
};

/**
* | output |
* | --- |
* | "MetaCleaner — Report History" |
*
* @param {Reports_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_meta_title = /** @type {((inputs?: Reports_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_meta_title(inputs)
	return cs_reports_meta_title(inputs)
});
export { reports_meta_title as "reports.meta.title" }