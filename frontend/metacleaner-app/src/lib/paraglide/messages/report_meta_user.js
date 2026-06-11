/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Meta_UserInputs */

const en_report_meta_user = /** @type {(inputs: Report_Meta_UserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`User`)
};

const cs_report_meta_user = /** @type {(inputs: Report_Meta_UserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Uživatel`)
};

/**
* | output |
* | --- |
* | "User" |
*
* @param {Report_Meta_UserInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_user = /** @type {((inputs?: Report_Meta_UserInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_UserInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_meta_user(inputs)
	return cs_report_meta_user(inputs)
});
export { report_meta_user as "report.meta.user" }