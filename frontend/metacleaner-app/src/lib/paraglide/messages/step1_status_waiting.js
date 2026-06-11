/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Status_WaitingInputs */

const en_step1_status_waiting = /** @type {(inputs: Step1_Status_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Waiting for files`)
};

const cs_step1_status_waiting = /** @type {(inputs: Step1_Status_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Čeká na soubory`)
};

/**
* | output |
* | --- |
* | "Waiting for files" |
*
* @param {Step1_Status_WaitingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_status_waiting = /** @type {((inputs?: Step1_Status_WaitingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Status_WaitingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_status_waiting(inputs)
	return cs_step1_status_waiting(inputs)
});
export { step1_status_waiting as "step1.status.waiting" }