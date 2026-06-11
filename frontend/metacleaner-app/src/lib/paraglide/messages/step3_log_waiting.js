/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Log_WaitingInputs */

const en_step3_log_waiting = /** @type {(inputs: Step3_Log_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`waiting in queue`)
};

const cs_step3_log_waiting = /** @type {(inputs: Step3_Log_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`čeká ve frontě`)
};

/**
* | output |
* | --- |
* | "waiting in queue" |
*
* @param {Step3_Log_WaitingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_log_waiting = /** @type {((inputs?: Step3_Log_WaitingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Log_WaitingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_log_waiting(inputs)
	return cs_step3_log_waiting(inputs)
});
export { step3_log_waiting as "step3.log.waiting" }