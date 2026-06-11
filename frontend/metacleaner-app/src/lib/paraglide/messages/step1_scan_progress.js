/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ scanned: NonNullable<unknown>, total: NonNullable<unknown> }} Step1_Scan_ProgressInputs */

const en_step1_scan_progress = /** @type {(inputs: Step1_Scan_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Scanning ${i?.scanned}/${i?.total} files...`)
};

const cs_step1_scan_progress = /** @type {(inputs: Step1_Scan_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Skenování ${i?.scanned}/${i?.total} souborů...`)
};

/**
* | output |
* | --- |
* | "Scanning {scanned}/{total} files..." |
*
* @param {Step1_Scan_ProgressInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_scan_progress = /** @type {((inputs: Step1_Scan_ProgressInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Scan_ProgressInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_scan_progress(inputs)
	return cs_step1_scan_progress(inputs)
});
export { step1_scan_progress as "step1.scan.progress" }