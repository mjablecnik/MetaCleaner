/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ pct: NonNullable<unknown> }} Step3_Log_Inprogress1Inputs */

const en_step3_log_inprogress1 = /** @type {(inputs: Step3_Log_Inprogress1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`processing (${i?.pct}%)...`)
};

const cs_step3_log_inprogress1 = /** @type {(inputs: Step3_Log_Inprogress1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`zpracovávám (${i?.pct}%)...`)
};

/**
* | output |
* | --- |
* | "processing ({pct}%)..." |
*
* @param {Step3_Log_Inprogress1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_log_inprogress1 = /** @type {((inputs: Step3_Log_Inprogress1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Log_Inprogress1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_log_inprogress1(inputs)
	return cs_step3_log_inprogress1(inputs)
});
export { step3_log_inprogress1 as "step3.log.inProgress" }