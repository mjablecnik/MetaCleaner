/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Scan_ScanningInputs */

const en_step1_scan_scanning = /** @type {(inputs: Step1_Scan_ScanningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Scanning`)
};

const cs_step1_scan_scanning = /** @type {(inputs: Step1_Scan_ScanningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skenování`)
};

/**
* | output |
* | --- |
* | "Scanning" |
*
* @param {Step1_Scan_ScanningInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_scan_scanning = /** @type {((inputs?: Step1_Scan_ScanningInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Scan_ScanningInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_scan_scanning(inputs)
	return cs_step1_scan_scanning(inputs)
});
export { step1_scan_scanning as "step1.scan.scanning" }