/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Scan_PendingInputs */

const en_step1_scan_pending = /** @type {(inputs: Step1_Scan_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pending`)
};

const cs_step1_scan_pending = /** @type {(inputs: Step1_Scan_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Čeká na sken`)
};

/**
* | output |
* | --- |
* | "Pending" |
*
* @param {Step1_Scan_PendingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_scan_pending = /** @type {((inputs?: Step1_Scan_PendingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Scan_PendingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_scan_pending(inputs)
	return cs_step1_scan_pending(inputs)
});
export { step1_scan_pending as "step1.scan.pending" }